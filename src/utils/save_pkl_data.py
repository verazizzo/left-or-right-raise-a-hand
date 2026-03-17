import pickle as pkl


class SavePklData:

    def save_pkl_data(self, path_out, data):
        pkl.dump(data, open(path_out, 'wb'))
