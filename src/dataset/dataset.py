from src.dataset.load_user_path import LoadUserPath
from src.dataset.load_emotive_raw_data import LoadEmotiveRawDta
from src.utils.save_pkl_data import SavePklData

class Dataset(LoadUserPath, LoadEmotiveRawDta, SavePklData):
    def __init__(self):
        LoadUserPath.__init__(self)
        LoadEmotiveRawDta.__init__(self)
        SavePklData.__init__(self)
