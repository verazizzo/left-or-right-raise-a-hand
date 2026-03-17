from src.dataset.dataset import Dataset
from src.preprocessing.preprocessing import Preprocessing

filter_low = 8
filter_high = 30
sfreq_resample = 256

dataset = Dataset()
dataset.load_user_path(path_in='dataset_mi_emotive')
dataset.load_emotive_raw_data_edf(
    channels=["AF3", "F7", "F3", "FC5", "T7", "P7", "O1", "O2", "P8", "T8", "FC6", "F4", "F8", "AF4",'MarkerValueInt'],
    plot=False,
    resample=True,
    sfreq_Resample=sfreq_resample)
dataset.save_pkl_data(path_out='dataset/dataset.pkl', data=dataset.dataset)

eeg_preprocessing = Preprocessing()
eeg_preprocessing.load_dataframe(path_in='dataset/dataset.pkl')
eeg_preprocessing.basic_preprocessing(plot=False,
                                      LOW_FREQUENCY=filter_low, HIGH_FREQUENCY=filter_high,
                                      drop_channels=False,channels=['AF3', 'F7', 'F8', 'AF4'])
eeg_preprocessing.save_pkl_data(path_out='dataset/dataset_preprocessed.pkl', data=eeg_preprocessing.dataset_post_processing)


# to do ---> features extraction and ML
