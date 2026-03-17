import glob
import os
import numpy as np
import pandas as pd
import pyedflib
import mne


def edf_to_df_pyedflib(edf_path: str, include_eeg: list[str] | None = None):
    """
    Legge EDF Emotiv con pyEDFlib, costruisce df con:
      - relative_time (da TIME_STAMP_s + TIME_STAMP_ms/1000 se presenti, altrimenti indice/fs)
      - colonne EEG selezionate
    Ritorna: df, eeg_cols, meta
    """
    with pyedflib.EdfReader(edf_path) as f:
        n_signals = f.signals_in_file
        labels = [f.getLabel(i).strip() for i in range(n_signals)]

        def find_label(target: str):
            for i, lab in enumerate(labels):
                if lab == target:
                    return i
            return None

        idx_ts_s = find_label("TIME_STAMP_s")
        idx_ts_ms = find_label("TIME_STAMP_ms")

        # Selezione canali EEG
        exclude = {"TIME_STAMP_s", "TIME_STAMP_ms"}
        all_eeg = [lab for lab in labels if lab not in exclude]

        if include_eeg is not None:
            eeg_cols = [c for c in include_eeg if c in all_eeg]
            if len(eeg_cols) == 0:
                raise ValueError("Nessun canale in include_eeg trovato nell'EDF.")
        else:
            eeg_cols = all_eeg

        # Leggi segnali EEG
        eeg = []
        fs_list = []
        for ch in eeg_cols:
            i = labels.index(ch)
            sig = f.readSignal(i).astype(np.float64)
            eeg.append(sig)
            fs_list.append(float(f.getSampleFrequency(i)))

        # Controllo fs coerente
        fs = fs_list[0]
        if not all(abs(x - fs) < 1e-9 for x in fs_list):
            raise ValueError(f"Frequenze di campionamento non coerenti: {dict(zip(eeg_cols, fs_list))}")

        eeg = np.vstack(eeg).T  # (N, n_chan)
        N = eeg.shape[0]

        # Costruisci RELATIVE_TIME
        if idx_ts_s is not None and idx_ts_ms is not None:
            ts_s = f.readSignal(idx_ts_s).astype(np.float64)
            ts_ms = f.readSignal(idx_ts_ms).astype(np.float64)
            if ts_s.shape[0] != N or ts_ms.shape[0] != N:
                raise ValueError("TIME_STAMP_s/ms non hanno la stessa lunghezza dei canali EEG.")

            rel_time = ts_s + ts_ms / 1000.0
            rel_time = rel_time - rel_time[0]  # start at 0
        else:
            rel_time = np.arange(N, dtype=np.float64) / fs

        df = pd.DataFrame(eeg, columns=eeg_cols)
        df.insert(0, "relative_time", rel_time)

        meta = {
            "fs": fs,
            "n_samples": N,
            "has_emotiv_timestamps": (idx_ts_s is not None and idx_ts_ms is not None),
        }
        return df, eeg_cols, meta


def make_uniform_grid(rel_time: np.ndarray, fs_target: float) -> np.ndarray:
    """
    Crea una griglia uniforme [t0, t_end] con passo 1/fs_target.
    Usa linspace per ridurre errori floating.
    """
    rel_time = np.asarray(rel_time, dtype=np.float64)
    if rel_time.ndim != 1 or rel_time.size < 2:
        raise ValueError("rel_time deve essere un array 1D con almeno 2 elementi.")

    if not np.all(np.diff(rel_time) > 0):
        raise ValueError("rel_time deve essere strettamente crescente (monotona).")

    t0 = float(rel_time[0])
    t1 = float(rel_time[-1])

    dt = 1.0 / float(fs_target)
    n = int(np.floor((t1 - t0) / dt)) + 1  # include l'ultimo punto possibile
    t_uniform = t0 + np.arange(n, dtype=np.float64) * dt
    return t_uniform


def interp_multich(rel_time: np.ndarray, data: np.ndarray, t_uniform: np.ndarray) -> np.ndarray:
    """
    Interpola multicanale su griglia uniforme.
    data: (N, n_chan)
    """
    rel_time = np.asarray(rel_time, dtype=np.float64)
    data = np.asarray(data, dtype=np.float64)
    t_uniform = np.asarray(t_uniform, dtype=np.float64)

    if data.ndim != 2:
        raise ValueError("data deve avere shape (N, n_chan).")
    if rel_time.shape[0] != data.shape[0]:
        raise ValueError("rel_time e data devono avere lo stesso N.")

    out = np.empty((t_uniform.size, data.shape[1]), dtype=np.float64)
    for ch in range(data.shape[1]):
        out[:, ch] = np.interp(t_uniform, rel_time, data[:, ch])
    return out


def build_raw_mne_from_emotiv(
    df_edf: pd.DataFrame,
    eeg_cols: list[str],
    fs_target: float,
    markers_df: pd.DataFrame | None = None,
    marker_desc_prefix: str = ''
):
    """
    Costruisce una Raw MNE su griglia uniforme (time-warp via relative_time) e inserisce marker come annotations.
    markers_df: deve avere colonna 'latency' (sec) e 'marker_value'.
    """
    rel = df_edf["relative_time"].to_numpy(dtype=np.float64)
    eeg = df_edf[eeg_cols].to_numpy(dtype=np.float64)*1e-6

    # 1) griglia uniforme e interpolazione
    t_uniform = make_uniform_grid(rel, fs_target)
    eeg_u = interp_multich(rel, eeg, t_uniform)  # (n_times, n_chan)

    # 2) Raw
    info = mne.create_info(ch_names=eeg_cols, sfreq=float(fs_target), ch_types=["eeg"] * len(eeg_cols))
    raw = mne.io.RawArray(eeg_u.T, info)

    # 3) Markers -> Annotations
    if markers_df is not None and len(markers_df) > 0:
        mk = markers_df.sort_values("latency").reset_index(drop=True).copy()

        onsets = mk["latency"].to_numpy(dtype=np.float64)

        # Raw parte da t_uniform[0] (che coincide con rel[0] tipicamente ~0)
        onsets_raw = onsets - float(t_uniform[0])

        # durata reale della raw in secondi
        raw_dur = raw.n_times / raw.info["sfreq"]

        in_range = (onsets_raw >= 0.0) & (onsets_raw < raw_dur)
        onsets_raw = onsets_raw[in_range]

        desc_vals = mk.loc[in_range, "marker_value"].to_numpy()
        desc = np.array([f"{marker_desc_prefix}{int(v)}" for v in desc_vals], dtype=object)

        ann = mne.Annotations(onset=onsets_raw, duration=np.zeros_like(onsets_raw), description=desc)
        raw.set_annotations(ann)

    return raw


def ndvar_duration_seconds(ndvar):
    # prova a recuperare i tempi dal dim time
    t = np.asarray(ndvar.time.times)  # in molti NDVar è così
    dt = float(np.median(np.diff(t))) if t.size > 1 else 0.0
    # durata = ultimo - primo + un passo (campione finale incluso)
    return float(t[-1] - t[0] + dt)

def apply_audio_duration_annotations(raw, audio_durs, prefix="", assume_1_based=True):
    """
    raw: mne.io.Raw con annotations già presenti (audio_track_*)
    audio_durs: array/list di durate audio in secondi (len=32 nel tuo caso)
    prefix: prefisso descrizione marker
    assume_1_based: True se audio_track_1 -> audio_durs[0]
    """
    events, event_id = mne.events_from_annotations(raw)
    sfreq = float(raw.info["sfreq"])

    # mapping code -> index in audio_durs
    code_to_idx = {}
    for desc, code in event_id.items():
        if desc.startswith(prefix):
            num = int(desc.replace(prefix, ""))  # es. "audio_track_12" -> 12
            idx = num - 1 if assume_1_based else num
            code_to_idx[int(code)] = idx

    onsets = events[:, 0].astype(np.float64) / sfreq
    codes = events[:, 2].astype(int)

    # durata tra marker consecutivi (per stimare gap e per clipping)
    dur_to_next = np.empty(len(onsets), dtype=np.float64)
    dur_to_next[:-1] = np.diff(onsets)
    dur_to_next[-1] = np.nan

    # costruisci duration = audio_dur per ogni marker
    durations = np.empty(len(onsets), dtype=np.float64)
    descs = np.empty(len(onsets), dtype=object)

    for i, code in enumerate(codes):
        if code not in code_to_idx:
            raise KeyError(f"Evento code={code} non mappabile a {prefix}*. Controlla event_id.")
        aidx = code_to_idx[code]
        if aidx < 0 or aidx >= len(audio_durs):
            raise IndexError(f"Indice audio fuori range: {aidx} per code={code}.")
        durations[i] = float(audio_durs[aidx])
        descs[i] = f"{prefix}{aidx+1 if assume_1_based else aidx}"

    # Clipping: evita che la duration superi il marker successivo o la fine della raw
    raw_dur = raw.n_times / sfreq
    max_to_end = raw_dur - onsets
    durations = np.minimum(durations, max_to_end)

    # se vuoi impedire overlap col marker successivo, clip a "to_next - 1 sample"
    one_sample = 1.0 / sfreq
    has_next = ~np.isnan(dur_to_next)
    durations[has_next] = np.minimum(durations[has_next], dur_to_next[has_next] - one_sample)

    # rimuovi eventuali durate negative (se audio_dur > to_next per qualche evento)
    durations = np.maximum(durations, 0.0)

    # set annotations
    ann = mne.Annotations(onset=onsets, duration=durations, description=descs)
    raw.set_annotations(ann)

    # gap stimato: (t_{i+1}-t_i) - audio_dur_i
    gaps = np.full(len(onsets), np.nan, dtype=np.float64)
    gaps[:-1] = dur_to_next[:-1] - np.array([float(audio_durs[code_to_idx[c]]) for c in codes[:-1]])

    report = pd.DataFrame({
        "event_code": codes,
        "onset_s": onsets,
        "audio_dur_s": np.array([float(audio_durs[code_to_idx[c]]) for c in codes], dtype=np.float64),
        "to_next_s": dur_to_next,
        "gap_s": gaps,
        "used_duration_s": durations,
        "description": descs,
    })
    return raw, report

class LoadEmotiveRawDta:
    def __init__(self):
        self.dataset = {}

    def load_emotive_raw_data_edf(self, channels, plot, resample, sfreq_Resample):
        for user in self.data_user:
            users = glob.glob(user + '/*')
            for session in users:
                user_eeg = glob.glob(session + '/*.edf')
                user_eeg.sort(key=os.path.getmtime)
                user_name = user.split('/')[-1]
                session_name = session.split('/')[-1]
                print(f'user: {user_name} session: {session_name}')

                df, eeg_cols, meta = edf_to_df_pyedflib(user_eeg[0], include_eeg=channels)

                user_marker = glob.glob(os.path.join(session, '*.csv'))
                user_marker.sort(key=os.path.getmtime)
                markers = None
                if len(user_marker) > 0:
                    markers = pd.read_csv(user_marker[0]).sort_values("latency").reset_index(drop=True)

                # 3) Raw time-warped su griglia uniforme
                fs_target = sfreq_Resample if resample else meta["fs"]
                raw = build_raw_mne_from_emotiv(df, eeg_cols, fs_target=fs_target, markers_df=markers)
                raw.drop_channels(['MarkerValueInt'])


                if resample:
                    raw.resample(sfreq=sfreq_Resample)

                if plot:
                    raw.plot(block=True)

                if user_name not in self.dataset:
                    self.dataset[user_name] = {}

                # Aggiungi il trial per l'utente specifico
                self.dataset[user_name][session_name] = {'raw': raw}
