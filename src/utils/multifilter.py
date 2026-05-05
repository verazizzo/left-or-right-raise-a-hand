import mne

def multifilter(epochs, frequencies, freq_band):
    """
    Applica un filtro passa-banda a un oggetto Epochs di MNE.
    
    :param epochs: L'oggetto mne.Epochs da filtrare.
    :param frequencies: Un dizionario con le bande, es. {'alpha': [8, 12], 'beta': [13, 30]}
    :param freq_band: La stringa che indica quale banda usare (es. 'alpha')
    :return: L'oggetto Epochs filtrato.
    """
    # Creiamo una copia per non sovrascrivere i dati originali in memoria
    epochs_filtered = epochs.copy()
    
    # Recuperiamo il limite inferiore e superiore della frequenza
    l_freq = frequencies[freq_band][0]
    h_freq = frequencies[freq_band][1]
    
    print(f"Filtraggio in corso per la banda '{freq_band}': {l_freq}-{h_freq} Hz")
    
    # Applichiamo il filtro passa-banda di MNE
    epochs_filtered.filter(l_freq=l_freq, h_freq=h_freq)
    
    return epochs_filtered