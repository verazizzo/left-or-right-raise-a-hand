import os
import pandas as pd
import pickle as pkl

from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import train_test_split

from src.dataset.dataset import Dataset
from src.preprocessing.preprocessing import Preprocessing
from src.utils.feature_extractor import FeatureExtractor
from src.utils.training_2 import train_SVM

#from src.utils.training_2 import train_SVM, train_xgboost
#from src.utils.shap_analysis import shap_analysis_xgboost, shap_analysis_svm

import shap
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np


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
        drop_channels=True,  # Change to True to drop channels (SVM accuracy is the same, XGBoost accuracy decreases)
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

    extractor.extract_epochs(dataset_pre, reject=True)
    df_features = extractor.compute_all_features() 

    extractor.save_features_csv(df_features, path_out=features_out_path)
else:
    print(f"Features already exist at {features_out_path}. Skipping feature extraction.")

df = pd.read_csv('./temp/features_antropy.csv')

print(f"Forma originale: {df.shape}")
bad_channels = ['AF3', 'F7', 'F8', 'AF4']
# 2. Trovi tutte le colonne che contengono le parole da eliminare
colonne_da_cancellare = [col for col in df.columns if 'Delta' in col or 'Theta' in col or any(col.startswith(ch + '_') for ch in bad_channels)]
   
# 3. Le elimini dal dataframe in un decimo di secondo
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

print(df_imm.head(20))


train_SVM(df_real)

"""# Changing flag to use real sessions for training or not
use_real_for_training = False
if use_real_for_training:
    print("Using real sessions for training.")
    df_train = df_real
    best_svm, scaler_svm = train_SVM(df_train)
    best_xgb, scaler_xgb = train_xgboost(df_train)
    df_test = df_imm
else:
    unique_user = df_imm['User'].unique() 
    #train_user, test_user = train_test_split(unique_user, test_size=0.03, random_state=42) 

    #df_train = df_imm[df_imm['User'].isin(train_user)] 
    #df_test = df_imm[df_imm['User'].isin(test_user)] 

    #print(f"Addestramento su {len(train_user)} utenti ({len(df_train)} epoche)") 
    #print(f"Test su {len(test_user)} utenti ({len(df_test)} epoche)")
    print("Using imaginary sessions for training.")
    
    best_svm, scaler_svm = train_SVM(df_imm)
    best_xgb, scaler_xgb = train_xgboost(df_imm)


x_test = df_test.drop(columns=['Target_Label', 'User'])
y_true = df_test['Target_Label']
y_true_xgb = y_true.map({2: 0, 3: 1})

x_test_scaled_svm = scaler_svm.transform(x_test)
x_test_scaled_xgb = scaler_xgb.transform(x_test)


y_pred_svm = best_svm.predict(x_test_scaled_svm)
y_pred_xgb = best_xgb.predict(x_test_scaled_xgb)

accuracy_svm = accuracy_score(y_true, y_pred_svm)
accuracy_xgb = accuracy_score(y_true_xgb, y_pred_xgb)

print(f"\n Evaluation Metrics:")
print(f"Accuracy SVM: {accuracy_svm * 100:.2f}%")
print(f"Accuracy XGBoost: {accuracy_xgb * 100:.2f}%\n")
print("Classification report SVM:")
print(classification_report(y_true, y_pred_svm))
print("Confusion matrix SVM:")
print(confusion_matrix(y_true, y_pred_svm))
print("Classification report XGBoost:")
print(classification_report(y_true_xgb, y_pred_xgb))
print("Confusion matrix XGBoost:")
print(confusion_matrix(y_true_xgb, y_pred_xgb))


# SHAP Analysis

print("\nStarting SHAP analysis for SVM...")
shap_analysis_svm(best_svm, x_test, x_test_scaled_svm, scaler_svm.transform(df_train.drop(columns=['Target_Label', 'User'])))

print("\nStarting SHAP analysis for XGBoost...")
shap_analysis_xgboost(best_xgb, x_test, x_test_scaled_xgb)"""