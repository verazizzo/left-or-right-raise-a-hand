import os
import pandas as pd
import pickle as pkl

from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

from src.dataset.dataset import Dataset
from src.preprocessing.preprocessing import Preprocessing
from src.utils.feature_extractor import FeatureExtractor
from src.utils.training import training


filter_low = 8
filter_high = 30
sfreq_resample = 256
raw_path = 'dataset/dataset.pkl'
preprocessed_path = 'dataset/dataset_preprocessed.pkl'
features_out_path = 'dataset/features_antropy.csv'

os.makedirs('dataset', exist_ok=True)

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

#Features extraction
if not os.path.exists(features_out_path):
    with open(preprocessed_path, 'rb') as f:
        dataset_pre = pkl.load(f)

    extractor = FeatureExtractor(tmin=0.0, tmax=3.0)

    extractor.extract_epochs(dataset_pre)
    df_features = extractor.compute_antropy_features()

    extractor.save_features_csv(path_out=features_out_path)
else:
    print(f"Features already exist at {features_out_path}. Skipping feature extraction.")

df = pd.read_csv('./dataset/features_antropy.csv')

# df = df.sample(frac=1, random_state=42).reset_index(drop=True)
# df = df.drop('User', axis=1)

# Stiamo rimuovendo il target 1 che dovrebbe essere il cervello a riposo, mentre 2 e 3 indicano rispettivamente braccio destro e sinistro
df = df[df['Target_Label'].isin([2,3])].copy()

features = df.columns

df['Session'] = df['Session'].str.replace(r'dataset_mi_emotive\\[a-zA-Z0-9_$]*\\imm', '0', regex=True)
df['Session'] = df['Session'].str.replace(r'dataset_mi_emotive\\[a-zA-Z0-9_$]*\\real', '1', regex=True)
df['Session'] = df['Session'].astype(int)

df_real = df[df['Session'] == 1]
df_imm = df[df['Session'] == 0]

#cambiare questa variabile se si vogliono usare le immaginarie per il training invece che le reali
use_real_for_training = True
if use_real_for_training:
    print("Using real sessions for training.")
    best_svm, scaler = training(df_real)
else:
    print("Using imaginary sessions for training.")
    best_svm, scaler = training(df_imm)

df_test = df_imm

x_test = df_test.drop(columns=['Target_Label', 'User'])
y_true = df_test['Target_Label']

# 1. Proiezione dei dati di Test nello spazio standardizzato dal Training
x_test_scaled = scaler.transform(x_test)

# 2. Inferenza del modello sui dati immaginari
y_pred = best_svm.predict(x_test_scaled)

# 3. Calcolo e restituzione delle metriche di validazione
accuracy = accuracy_score(y_true, y_pred)
print(f"\n Metriche di Validazione sul Test Set (Motor Imagery)")
print(f"Accuracy Globale: {accuracy * 100:.2f}%\n")
print("Report di Classificazione:")
print(classification_report(y_true, y_pred))
print("Matrice di Confusione:")
print(confusion_matrix(y_true, y_pred))