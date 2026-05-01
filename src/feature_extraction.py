import mne
import antropy as ant
import numpy as np
import pandas as pd
import os

def extract_antropy_features(epoch_data):
    """
    Calcola le features di entropia per una singola epoca (trial).
    epoch_data è un array numpy di dimensione (n_canali, n_campioni).
    """
    features = []
    
    # Iteriamo su ogni canale EEG del caschetto EPOCX
    for channel_data in epoch_data:
        # 1. Sample Entropy 
        try:
            samp_en = ant.sample_entropy(channel_data)
        except:
            samp_en = 0
            
        # 2. Permutation Entropy 
        perm_en = ant.perm_entropy(channel_data, normalize=True)
        
        # 3. Higuchi Fractal Dimension 
        hfd = ant.higuchi_fd(channel_data)
        
        # Aggiungiamo le features estratte per QUESTO canale alla lista
        features.extend([samp_en, perm_en, hfd])
        
    return features

def create_dataset_for_subject(edf_path, csv_path, subject_id, condition):
    """
    Legge il file .edf e i marker .csv, estrae i trial e costruisce il dataset.
    """
    # 1. Caricamento del segnale EEG grezzo dal file .edf
    raw = mne.io.read_raw_edf(edf_path, preload=True, verbose=False)
    
    # 2. Lettura dei marker degli intervalli dal file .csv
    markers_df = pd.read_csv(csv_path)
    
    # Prepariamo liste vuote per salvare i dati finali
    all_features = []
    labels = []
    
    # Frequenza di campionamento dell'EEG
    sfreq = raw.info['sfreq'] 
    
    # 3. Iteriamo su ogni trial registrato nel CSV
    for index, row in markers_df.iterrows():
        start_time = row['latency'] 
        duration = row['duration']
        end_time = start_time + duration 
        
        # Scegli la colonna che contiene la classe (es. "Left"/"Right"). 
        label = row['marker_value'] 
        
        # Convertiamo il tempo (secondi) in indici del vettore EEG
        start_idx = int(start_time * sfreq)
        end_idx = int(end_time * sfreq)
        
        # 4. Estraiamo il segmento di segnale (l'Epoca)
        epoch_data = raw.get_data(start=start_idx, stop=end_idx)
        
        # Controllo di sicurezza: saltiamo l'epoca se è vuota o troppo corta
        if epoch_data.shape[1] == 0:
            continue
            
        # 5. Calcoliamo le features
        trial_features = extract_antropy_features(epoch_data)
        
        # Salviamo i risultati
        all_features.append(trial_features)
        labels.append(label)
        
    # 6. Creazione del DataFrame Pandas
    n_channels = raw.info['nchan']
    feature_names = []
    for ch in range(n_channels):
        feature_names.extend([f'ch{ch}_samp_en', f'ch{ch}_perm_en', f'ch{ch}_hfd'])
        
    df = pd.DataFrame(all_features, columns=feature_names)
    df['label'] = labels
    df['subject'] = subject_id
    df['condition'] = condition
    
    return df

# --- ESECUZIONE ---
# 1. Definiamo la cartella principale che contiene tutti i soggetti
base_dataset_path = 'dataset_mi_emotive'

# Questa lista conterrà i DataFrame di ogni singolo file prima di unirli
all_subjects_dataframes = []

print("Inizio l'estrazione delle features. Questa operazione potrebbe richiedere alcuni minuti...")

# 2. Iteriamo su tutte le cartelle all'interno di dataset_mi_emotive (alessio_matt, andrea_dam, ecc.)
for subject_folder in os.listdir(base_dataset_path):
    subject_path = os.path.join(base_dataset_path, subject_folder)
    
    # Assicuriamoci che sia una cartella e non un file nascosto
    if not os.path.isdir(subject_path):
        continue
        
    print(f"\nAnalizzando il soggetto: {subject_folder}")
    
    # 3. Iteriamo sulle due condizioni: Immaginazione (imm) e Reale (real)
    for condition in ['imm', 'real']:
        condition_path = os.path.join(subject_path, condition)
        
        # Se per qualche motivo manca la cartella imm o real, saltiamo
        if not os.path.exists(condition_path):
            continue
            
        # 4. Cerchiamo automaticamente i file .edf e .csv dentro la cartella
        edf_files = [f for f in os.listdir(condition_path) if f.endswith('.edf')]
        csv_files = [f for f in os.listdir(condition_path) if f.endswith('intervalMarker.csv')]
        
        # Se abbiamo trovato sia il segnale che i marker, procediamo
        if len(edf_files) > 0 and len(csv_files) > 0:
            edf_file_path = os.path.join(condition_path, edf_files[0])
            csv_file_path = os.path.join(condition_path, csv_files[0])
            
            print(f"  -> Estrazione dati condizione: {condition}...")
            
            try:
                # Chiamiamo la funzione di estrazione per questo specifico file
                subject_df = create_dataset_for_subject(
                    edf_file_path, 
                    csv_file_path, 
                    subject_id=subject_folder, 
                    condition=condition
                )
                # Aggiungiamo i risultati alla nostra lista master
                all_subjects_dataframes.append(subject_df)
            except Exception as e:
                # Se un file è corrotto, il programma non si bloccherà ma stamperà un avviso
                print(f"  [ERRORE] Impossibile processare {condition} per {subject_folder}: {e}")

# 5. Uniamo tutti i dataset individuali in un'unica enorme tabella
print("\nUnione di tutti i dati in corso...")
final_master_dataset = pd.concat(all_subjects_dataframes, ignore_index=True)

# 6. Salviamo il risultato finale in un file CSV!
os.makedirs('temp', exist_ok=True)
output_filename = 'temp/final_extracted_features.csv'
final_master_dataset.to_csv(output_filename, index=False)

print(f"ESTRAZIONE COMPLETATA CON SUCCESSO!")
print(f"Il dataset finale contiene {len(final_master_dataset)} trial totali.")
print(f"File salvato in: {output_filename}")
