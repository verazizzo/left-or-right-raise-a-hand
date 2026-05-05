import os
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