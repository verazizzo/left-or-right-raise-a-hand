import mne
import antropy as ant
import pandas as pd

class FeatureExtractor:
    """
    Class designed to extract epochs and non-linear features 
    (e.g., entropy, complexity) from pre-processed EEG signals.
    """
    def __init__(self, tmin=0.0, tmax=3.0):
        self.tmin = tmin
        self.tmax = tmax
        self.epochs_dict = {}
        self.features_df = None

    def extract_epochs(self, dataset_pre):
        """
        Segments the continuous EEG signal into discrete epochs 
        based on event markers.
        """
        print("Starting epoch extraction...")
        for user, sessions in dataset_pre.items():
            self.epochs_dict[user] = {}
            for session, data in sessions.items():
                raw = data['raw']
                
                # Extract events generated during the preprocessing phase
                events, event_id = mne.events_from_annotations(raw)
                
                # Slice the continuous signal into discrete epochs
                epochs = mne.Epochs(
                    raw, events, event_id=event_id, 
                    tmin=self.tmin, tmax=self.tmax, 
                    baseline=None, preload=True
                )
                self.epochs_dict[user][session] = epochs
        
        return self.epochs_dict

    def compute_antropy_features(self):
        """
        Computes non-linear features (e.g., various entropy measures, 
        Hjorth parameters) for each channel across all epochs.
        """
        print("Starting feature extraction using Antropy...")
        if not self.epochs_dict:
            raise ValueError("No epochs found. Execute extract_epochs() before calling compute_antropy_features().")

        features_list = []

        for user, sessions in self.epochs_dict.items():
            for session, epochs in sessions.items():
                # get_data() returns a 3D array: (n_epochs, n_channels, n_times)
                data = epochs.get_data() 
                # The last column of the events array contains the event code
                labels = epochs.events[:, -1]
                ch_names = epochs.ch_names
                sfreq = epochs.info['sfreq']
                
                for i in range(len(data)):
                    epoch_data = data[i]
                    label = labels[i]
                    
                    # Create a base dictionary for the current dataset row
                    epoch_features = {
                        'User': user, 
                        'Session': session, 
                        'Target_Label': label
                    }
                    
                    # Extract features for each individual electrode (channel)
                    for ch_idx, ch_name in enumerate(ch_names):
                        signal = epoch_data[ch_idx]
                        
                        # --- ANTROPY FEATURES ---
                        
                        # 1. Permutation Entropy: Evaluates temporal complexity
                        epoch_features[f'{ch_name}_PermEntropy'] = ant.perm_entropy(signal, normalize=True)
                        
                        # 2. Spectral Entropy: Evaluates the uniformity of the power spectrum
                        epoch_features[f'{ch_name}_SpecEntropy'] = ant.spectral_entropy(signal, sf=sfreq, method='welch', normalize=True)
                        
                        # 3. Singular Value Decomposition (SVD) Entropy: Assesses the dimensionality of the signal
                        epoch_features[f'{ch_name}_SVDEntropy'] = ant.svd_entropy(signal, normalize=True)
                        
                        # 4. Sample Entropy: Quantifies signal regularity and predictability
                        epoch_features[f'{ch_name}_SampEntropy'] = ant.sample_entropy(signal)
                        
                        # 5. Petrosian Fractal Dimension: Estimates the fractal dimension of the signal
                        epoch_features[f'{ch_name}_PetrosianFD'] = ant.petrosian_fd(signal)
                        
                        # 6. Hjorth Parameters: Mobility (mean frequency) and Complexity (frequency variation)
                        mob, comp = ant.hjorth_params(signal)
                        epoch_features[f'{ch_name}_HjorthMob'] = mob
                        epoch_features[f'{ch_name}_HjorthComp'] = comp

                    # Append the processed epoch to the main list
                    features_list.append(epoch_features)

        self.features_df = pd.DataFrame(features_list)
        return self.features_df

    def save_features_csv(self, path_out):
        """
        Saves the extracted features DataFrame to a CSV file.
        """
        if self.features_df is None:
            raise ValueError("Empty DataFrame. Execute compute_antropy_features() before saving.")
        
        self.features_df.to_csv(path_out, index=False)
        print(f"Features successfully saved at: {path_out}")