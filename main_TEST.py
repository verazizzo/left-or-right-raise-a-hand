import os
from src.dataset.dataset import Dataset
from src.preprocessing.preprocessing import Preprocessing
import pickle as pkl
import mne
import pandas as pd
import numpy as np
import antropy as ant
from src.preprocessing.multifilter import MultiFilter


filter_low = 8
filter_high = 30
sfreq_resample = 256
raw_path = 'dataset/dataset.pkl'
preprocessed_path = 'dataset/dataset_preprocessed.pkl'

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
        channels=['AF3', 'F7', 'F8', 'AF4', 'MarkerValueInt']
    )
    eeg_preprocessing.save_pkl_data(path_out=preprocessed_path, data=eeg_preprocessing.dataset_post_processing)
else:
    print(f"Preprocessed data already exists at {preprocessed_path}. Skipping preprocessing.")

# to do ---> features extraction and ML


# ==========================================
# 1. CARICAMENTO DEL DATASET PRE-PROCESSATO
# ==========================================
print("Caricamento dataset pre-processato...")
with open('dataset/dataset_preprocessed.pkl', 'rb') as f:
    dataset_pre = pkl.load(f)

# ==========================================
# 2. ESTRAZIONE DELLE EPOCHE (EPOCHING)
# ==========================================
print("Inizio estrazione epoche...")
epochs_dict = {}
tmin = 0.0  # Inizio dell'epoca rispetto al marker (in secondi)
tmax = 3.0  # Fine dell'epoca rispetto al marker (in secondi)

for user in dataset_pre:
    epochs_dict[user] = {}
    for session in dataset_pre[user]:
        raw = dataset_pre[user][session]['raw']
        
        # Estrai gli eventi (marker) creati nel preprocessing
        events, event_id = mne.events_from_annotations(raw)
        
        # Taglia il segnale continuo in epoche
        epochs = mne.Epochs(raw, events, event_id=event_id, 
                            tmin=tmin, tmax=tmax, 
                            baseline=None, preload=True)
        
        epochs_dict[user][session] = epochs

# ==========================================
# 3. ESTRAZIONE FEATURES CON ANTROPY
# ==========================================
print("Inizio estrazione features con Antropy...")
features_list = []

for user in epochs_dict:
    for session in epochs_dict[user]:
        epochs = epochs_dict[user][session]
        
        # get_data() restituisce una matrice 3D: (numero_epoche, numero_canali, campioni_temporali)
        data = epochs.get_data() 
        labels = epochs.events[:, -1] # L'ultima colonna degli eventi contiene il codice del marker
        ch_names = epochs.ch_names
        sfreq = epochs.info['sfreq']
        
        for i in range(len(data)): # Itera su ogni singola epoca
            epoch_data = data[i]
            label = labels[i]
            
            # Crea un dizionario base per questa riga del dataset
            epoch_features = {
                'User': user, 
                'Session': session, 
                'Target_Label': label
            }
            
            # Estrai le features per ogni singolo elettrodo (canale)
            for ch_idx, ch_name in enumerate(ch_names):
                signal = epoch_data[ch_idx]
                
                # --- ANTROPY FEATURES ---
                
                # 1. Permutation Entropy: Misura la complessità temporale
                epoch_features[f'{ch_name}_PermEntropy'] = ant.perm_entropy(signal, normalize=True)
                
                # 2. Spectral Entropy: Misura l'uniformità dello spettro di potenza (simile alle frequenze)
                epoch_features[f'{ch_name}_SpecEntropy'] = ant.spectral_entropy(signal, sf=sfreq, method='welch', normalize=True)
                
                # 3. Singular Value Decomposition (SVD) Entropy: Dimensionalità del segnale
                epoch_features[f'{ch_name}_SVDEntropy'] = ant.svd_entropy(signal, normalize=True)
                
                # 4. Sample Entropy: Misura la regolarità e la prevedibilità del segnale
                epoch_features[f'{ch_name}_SampEntropy'] = ant.sample_entropy(signal)
                
                # 5. Petrosian Fractal Dimension: Stima la dimensione frattale del segnale
                epoch_features[f'{ch_name}_PetrosianFD'] = ant.petrosian_fd(signal)
                
                # 6. Parametri di Hjorth: Mobilità (frequenza media) e Complessità (variazione della frequenza)
                mob, comp = ant.hjorth_params(signal)
                epoch_features[f'{ch_name}_HjorthMob'] = mob
                epoch_features[f'{ch_name}_HjorthComp'] = comp

            # Aggiungi l'epoca processata alla lista
            features_list.append(epoch_features)

# ==========================================
# 4. CREAZIONE DATAFRAME PER MACHINE LEARNING
# ==========================================
# Convertiamo la lista di dizionari in un DataFrame Pandas
df_features = pd.DataFrame(features_list)

# Salviamo in CSV, pronto per essere dato in pasto a scikit-learn o simili
path_out = 'dataset/features_antropy.csv'
df_features.to_csv(path_out, index=False)

print(f"Estrazione completata! Features salvate in {path_out}")
print(f"Dimensioni del dataset finale: {df_features.shape[0]} epoche (righe) e {df_features.shape[1]} features (colonne)")