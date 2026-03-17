import mne
from matplotlib import pyplot as plt


class ExtractEpochs:
    def __init__(self):
        pass

    def extract_epochs(self, tmin, tmax, drop_channels, channels_to_drop,
                       plot=False, reject=False):
        for user in self.dataset:
            print(f'Extracting epochs for {user}')
            for session in self.dataset[user]:
                print(f'session: {session}')
                raw = self.dataset[user][session]['raw'].copy()

                if drop_channels:
                    raw.drop_channels(channels_to_drop)

                events, event_dict = mne.events_from_annotations(raw)
                events_maps = {'marker': 2}
                epochs = mne.Epochs(raw=raw,
                                    events=events,
                                    event_id=events_maps,
                                    tmin=tmin,
                                    tmax=tmax,
                                    baseline=None,
                                    preload=False,
                                    reject=None,
                                    detrend=1)

                if reject:
                    reject_criteria = dict(eeg=0.0001)
                    epochs.drop_bad(reject=reject_criteria)

                if plot:
                    epochs.plot(block=True, n_epochs=4)

                # Aggiungi i dati al dizionario
                if user not in self.dataset:
                    self.dataset[user] = {}
                    # Aggiungi il trial per l'utente specifico
                self.dataset[user][session] = {
                    'epochs': epochs,
                }
