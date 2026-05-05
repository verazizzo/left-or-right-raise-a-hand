import os
import shap
import joblib
import pandas as pd

from sklearn.model_selection import LeaveOneGroupOut, GridSearchCV
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler

from src.dataset.dataset import Dataset
from src.preprocessing.preprocessing import Preprocessing
import pickle as pkl
from src.utils.feature_extractor import FeatureExtractor

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

x = df.drop(columns=['Target_Label', 'User'])
y = df['Target_Label']
groups = df['User']

scaler = StandardScaler()
x_scaled = scaler.fit_transform(x)
x_scaled_df = pd.DataFrame(x_scaled, columns=x.columns) # Utile per SHAP con nomi colonne

logo = LeaveOneGroupOut()
svm = SVC(probability=True)
param_grid = {
    'kernel': ['linear', 'rbf'],
    'C': [0.1, 1, 10]
}

logo = LeaveOneGroupOut()

grid_search = GridSearchCV(
    estimator=svm, 
    param_grid=param_grid, 
    cv=logo, 
    scoring='accuracy',
    n_jobs=-1 
)

grid_search.fit(x_scaled, y, groups=groups)
print(f"Migliori parametri (LOGO): {grid_search.best_params_}")

best_svm = grid_search.best_estimator_
all_shap_values = []
test_indices = []

print("\nAvvio calcolo SHAP per ogni soggetto...")

for train_idx, test_idx in logo.split(x_scaled, y, groups=groups):
    X_train, X_test = x_scaled[train_idx], x_scaled[test_idx]
    y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]
    
    best_svm.fit(X_train, y_train)
    
    # Nota: su 3000 campioni KernelExplainer è lento. Usiamo una sintesi del training.
    X_train_summary = shap.kmeans(X_train, 10) # Riassume il training in 10 campioni "rappresentativi"
    explainer = shap.KernelExplainer(best_svm.predict, X_train_summary)
    
    shap_vals = explainer.shap_values(X_test)
    all_shap_values.append(shap_vals)
    test_indices.extend(test_idx)

joblib.dump(all_shap_values, 'shap_values_matrix.pkl')
print("Analisi SHAP completata e salvata.")

# Esempio Visualizzazione SHAP per l'ultimo soggetto testato
shap.summary_plot(shap_vals, x_scaled_df.iloc[test_idx])