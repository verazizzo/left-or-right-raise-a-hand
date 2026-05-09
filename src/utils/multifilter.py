
def multifilter(epochs, frequencies, freq_band):

    # Apply band-pass filter using MNE's built-in function
    # parameters: 
    # epochs: the MNE Epochs object to filter
    # frequencies: a dictionary defining the frequency bands, e.g. {'alpha': [8, 12], 'beta': [13, 30]}
    # freq_band: the key in the frequencies dictionary that specifies which band to filter 
    # Return the filtered epochs

    epochs_filtered = epochs.copy() # Create a copy of the original epochs to avoid modifying them in place
    
    # Retrieve the low and high frequencies for the specified band
    l_freq = frequencies[freq_band][0]
    h_freq = frequencies[freq_band][1]
    
    print(f"Filtering in progress for band: '{freq_band}': {l_freq}-{h_freq} Hz")
    
    # Apply the band-pass filter to the epochs
    epochs_filtered.filter(l_freq=l_freq, h_freq=h_freq)
    
    return epochs_filtered