import os
import pandas as pd
import pickle as pkl

from src.dataset.dataset import Dataset
from src.preprocessing.preprocessing import Preprocessing
from src.utils.feature_extractor import FeatureExtractor
from src.utils.training import train_SVM


filter_low = 8
filter_high = 30
sfreq_resample = 256
raw_path = 'temp/dataset.pkl'
preprocessed_path = 'temp/dataset_preprocessed.pkl'
features_out_path = 'temp/features_antropy.csv'

os.makedirs('temp', exist_ok=True)

# Raw Data Loading/Generation
if not os.path.exists(raw_path):
    dataset = Dataset()
    dataset.load_user_path(path_in='dataset_mi_emotive')
    dataset.load_emotive_raw_data_edf(
        channels=["AF3", "F7", "F3", "FC5", "T7", "P7", "O1", "O2", "P8", "T8", "FC6", "F4", "F8", "AF4", 'MarkerValueInt'],
        plot=False,
        resample=True,
        sfreq_Resample=sfreq_resample)
    dataset.save_pkl_data(path_out=raw_path, data=dataset.dataset)
else:
    print(f"Raw dataset already exists at {raw_path}. Skipping generation.")

# Preprocessing 
if not os.path.exists(preprocessed_path):
    eeg_preprocessing = Preprocessing()
    
    eeg_preprocessing.load_dataframe(path_in=raw_path)
    eeg_preprocessing.basic_preprocessing(
        plot=False,
        LOW_FREQUENCY=filter_low, 
        HIGH_FREQUENCY=filter_high,
        drop_channels=False, 
        channels=['AF3', 'F7', 'F8', 'AF4']
    )
    eeg_preprocessing.save_pkl_data(path_out=preprocessed_path, data=eeg_preprocessing.dataset_post_processing)
else:
    print(f"Preprocessed data already exists at {preprocessed_path}. Skipping preprocessing.")

# Features extraction
if not os.path.exists(features_out_path):
    with open(preprocessed_path, 'rb') as f:
        dataset_pre = pkl.load(f)

    extractor = FeatureExtractor(tmin=0.0, tmax=15.0)

    extractor.extract_epochs(dataset_pre)
    df_features = extractor.compute_all_features() 

    extractor.save_features_csv(df_features, path_out=features_out_path)
else:
    print(f"Features already exist at {features_out_path}. Skipping feature extraction.")

df = pd.read_csv('./temp/features_antropy.csv')

print(f"Forma originale: {df.shape}")

colonne_da_cancellare = [col for col in df.columns if 'Delta' in col or 'Theta' in col]
df = df.drop(columns=colonne_da_cancellare)
print(f"Forma dopo la pulizia: {df.shape}")

# df = df.sample(frac=1, random_state=42).reset_index(drop=True)
# df = df.drop('User', axis=1)

# Filtering only for classes 2 and 3 (left or right hand imagination). We assume 1 is rest
df = df[df['Target_Label'].isin([2,3])].copy()

features = df.columns

df['User'] = df['User'].str.split('\\').str[-1].str.split('/').str[-1]

# print(df.head())

df['Session'] = df['Session'].str.replace(r'dataset_mi_emotive\\[a-zA-Z0-9_$]*\\imm', '0', regex=True)
df['Session'] = df['Session'].str.replace(r'dataset_mi_emotive\\[a-zA-Z0-9_$]*\\real', '1', regex=True)
df['Session'] = df['Session'].astype(int)

df_real = df[df['Session'] == 1]
df_imm = df[df['Session'] == 0]
unique_user = df_imm['User'].unique() 

# print(df_imm.head(20))


#results_real = train_SVM(df_real, True)
results_imm = train_SVM(df_imm, False)

"""comparison_df = pd.DataFrame({
    'Task': ['Real Movement', 'Imagined Movement'],
    'F1_Mean': [results_real['F1_Mean'], results_imm['F1_Mean']],
    'F1_Std': [results_real['F1_Std'], results_imm['F1_Std']],
    'AUC_Mean': [results_real['AUC_Mean'], results_imm['AUC_Mean']],
    'AUC_Std': [results_real['AUC_Std'], results_imm['AUC_Std']]
})

print("\n CONFRONTO FINALE DELLE PERFORMANCE ")
print(comparison_df.to_string(index=False))

# Salvataggio su disco (formato CSV)
results_dir = 'temp\results'
os.makedirs(results_dir, exist_ok=True)
csv_path = os.path.join(results_dir, 'svm_performance_comparison.csv')

comparison_df.to_csv(csv_path, index=False)
print(f"\nRisultati salvati con successo in: {csv_path}")"""