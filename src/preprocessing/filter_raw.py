import mne
from src.utils.SPA_EEG import SPA

class Filter:
    def __init__(self):
        self.chanset = None
        self.notch = None
        self.filt = None
        self.dataset_post_processing = {}

    def basic_preprocessing(self, plot, LOW_FREQUENCY, HIGH_FREQUENCY, drop_channels,
                                   channels, **filter_kwargs):

        for user in self.dataset:
            for session in self.dataset[user]:
                print(f'preprocessing {user} {session}')
                raw = self.dataset[user][session]['raw'].copy()
                raw.filter(l_freq=LOW_FREQUENCY, h_freq=HIGH_FREQUENCY)

                if drop_channels:
                    raw.drop_channels(channels)

                raw.set_montage('standard_1020')
                sfreq = raw.info['sfreq']
                raw_clean = SPA(raw, int(sfreq))
                raw_clean.set_montage('standard_1020')

                if plot:
                    raw_clean.plot(block=True)


                if user not in self.dataset_post_processing:
                    self.dataset_post_processing[user] = {}

                # Aggiungi il trial per l'utente specifico
                self.dataset_post_processing[user][session] = {'raw': raw_clean}























                    # if os.path.exists(path_out):
                    #     shutil.rmtree(path_out)  # elimina cartella e sottocartelle
                    #     print(f"Cartella '{path_out}' eliminata.")
                    # else:
                    #     print(f"La cartella '{path_out}' non esiste.")
                    #
                    # os.makedirs(path_out)
                    #
                    # # save raw
                    # base_out = Path(path_out)
                    # current_out = base_out / user / sess
                    # current_out.mkdir(parents=True, exist_ok=True)
                    # raw_clean.save(current_out / f"{user}_{sess}-raw.fif", overwrite=True)