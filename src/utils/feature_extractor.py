import numpy as np
import pandas as pd
import antropy as ant
import mne
from scipy.signal import welch

class FeatureExtractor:
    def __init__(self, tmin=0.0, tmax=15.0, sfreq=256):

        self.tmin = tmin
        self.tmax = tmax
        self.sfreq = sfreq
        
        self.windows = [
            (0, 5, '0-5s'),
            (6, 10, '6-10s'),
            (11, 15, '11-15s')
        ]
        
        self.bands = {
            'Delta': (0.5, 4),
            'Theta': (4, 8),
            'Alpha': (8, 13),
            'Beta1': (13, 16),
            'Beta2': (16, 20),
            'Beta3': (20, 30)
        }
        
        self.extracted_data = [] 

    def extract_epochs(self, dataset_pre):
        
        print(f"Estrazione epoche da {self.tmin}s a {self.tmax}s...")
        for user in dataset_pre:
            for session in dataset_pre[user]:
                if 'imm' in session.lower() or 'real' in session.lower():
                    raw = dataset_pre[user][session]['raw']
                    events, event_id = mne.events_from_annotations(raw)
                    
                    epochs = mne.Epochs(raw, events, event_id=event_id, 
                                        tmin=self.tmin, tmax=self.tmax, 
                                        baseline=None, preload=True, verbose=False)
                    
                    data = epochs.get_data() 
                    labels = epochs.events[:, -1]
                    ch_names = epochs.ch_names
                    
                    for i in range(len(data)):
                        self.extracted_data.append({
                            'User': user,
                            'Session': session,
                            'Target_Label': labels[i],
                            'Data': data[i],
                            'Channels': ch_names
                        })
        print(f"Total epoch extracted: {len(self.extracted_data)}")

    def compute_all_features(self):

        print("Feature extraction in progress...")
        all_features_list = []
        
        for idx, epoch_info in enumerate(self.extracted_data):
            if idx % 50 == 0:
                print(f"Processing epoch {idx}/{len(self.extracted_data)}...")
                
            epoch_data = epoch_info['Data']
            ch_names = epoch_info['Channels']
            
            row_features = {
                'User': epoch_info['User'],
                'Session': epoch_info['Session'],
                'Target_Label': epoch_info['Target_Label']
            }
            
            for ch_idx, ch_name in enumerate(ch_names):
                if ch_name == 'MarkerValueInt':
                    continue
                    
                signal_full = epoch_data[ch_idx]
                
                for start_sec, end_sec, win_name in self.windows:

                    start_idx = int((start_sec - self.tmin) * self.sfreq)
                    end_idx = int((end_sec - self.tmin) * self.sfreq)
                    
                    end_idx = min(end_idx, len(signal_full))
                    
                    if start_idx >= len(signal_full):
                        continue 
                        
                    signal_win = signal_full[start_idx:end_idx]
                    
                    if len(signal_win) < self.sfreq: 
                        continue
                        
                    prefix = f"{ch_name}" 
                    suffix = f"{win_name}" 
                    
                    try:
                        row_features[f'{prefix}_ApEn_{suffix}'] = ant.app_entropy(signal_win)
                        row_features[f'{prefix}_SampEn_{suffix}'] = ant.sample_entropy(signal_win)
                        row_features[f'{prefix}_PermEn_{suffix}'] = ant.perm_entropy(signal_win, normalize=True)
                        row_features[f'{prefix}_SVDEn_{suffix}'] = ant.svd_entropy(signal_win, normalize=True)
                        row_features[f'{prefix}_SpecEn_{suffix}'] = ant.spectral_entropy(signal_win, sf=self.sfreq, method='welch', normalize=True)
                    except:
                        pass

                    try:
                        hjorth = ant.hjorth_params(signal_win)
                        row_features[f'{prefix}_HjorthMob_{suffix}'] = hjorth[0]
                        row_features[f'{prefix}_HjorthComp_{suffix}'] = hjorth[1]
                    except:
                        pass
 
                    try:
                        # LZV requires a binary sequence, so we binarize the signal based on its median value
                        bin_signal = (signal_win > np.median(signal_win)).astype(int)
                        row_features[f'{prefix}_LZV_{suffix}'] = ant.lziv_complexity(bin_signal, normalize=True)
                        row_features[f'{prefix}_DFA_{suffix}'] = ant.detrended_fluctuation(signal_win)
                    except:
                        pass
                        
                    try:
                        row_features[f'{prefix}_HFD_{suffix}'] = ant.higuchi_fd(signal_win)
                        row_features[f'{prefix}_KFD_{suffix}'] = ant.katz_fd(signal_win)
                        row_features[f'{prefix}_PFD_{suffix}'] = ant.petrosian_fd(signal_win)
                    except:
                        pass

                    try:
                        freqs, psd = welch(signal_win, self.sfreq, nperseg=self.sfreq)
                        total_power = np.sum(psd)
                        
                        for b_name, (fmin, fmax) in self.bands.items():
                            idx_band = np.logical_and(freqs >= fmin, freqs <= fmax)
                            band_power = np.sum(psd[idx_band])
                            norm_power = band_power / total_power if total_power > 0 else 0
                            row_features[f'{prefix}_{b_name}_{suffix}'] = norm_power
                    except:
                        pass
                        
            all_features_list.append(row_features)
            
        df_features = pd.DataFrame(all_features_list)
        return df_features

    def save_features_csv(self, df_features, path_out='temp/features_antropy.csv'):
        df_features.to_csv(path_out, index=False)
        print(f"Features stored in: {path_out}")
        print(f"Final dataframe shape: {df_features.shape}")