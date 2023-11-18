import scipy.signal as signal

#THESE ARE GLOBAL CONSTANTS
# Define frequency bands
frequency_bands = {
    'Infra-slow': (0.01, 0.5),
    'Delta': (0.5, 4),
    'Theta': (4, 7),
    'Alpha': (8, 12),
    'Sigma': (12, 16),
    'Beta': (13, 30),
    'Low Gamma': (30, 80),
    'High Gamma': (80, 127),  # Adjusted upper limit to 127 Hz
}
sfreq = 256

# Function to apply band-pass filter
def band_pass_filter(data, low_freq, high_freq, sfreq, order=5):
    nyquist = 0.5 * sfreq

    # Normalize frequencies by the Nyquist frequency, ensure they are within valid range
    low = None if low_freq is None else max(min(low_freq / nyquist, 1), 0)
    high = None if high_freq is None else max(min(high_freq / nyquist, 1), 0)

    # Handle edge cases and create filter coefficients
    if low is None and high is None:
        raise ValueError("Both low_freq and high_freq cannot be None.")
    elif low is None:
        b, a = signal.butter(order, high, btype='lowpass')
    elif high is None:
        b, a = signal.butter(order, low, btype='highpass')
    else:
        if not 0 < low < high < 1:
            raise ValueError(f"Frequencies must satisfy 0 < low ({low_freq} Hz) < high ({high_freq} Hz) < Nyquist ({nyquist} Hz)")
        b, a = signal.butter(order, [low, high], btype='band')

    filtered_data = signal.lfilter(b, a, data)
    return filtered_data

def filter_data_signal(eeg_data,eeg_channels):
        filtered_data = {band: {str(channel): None for channel in eeg_channels} for band in frequency_bands}
        for band, (low_freq, high_freq) in frequency_bands.items():
             for channel in eeg_channels:
                 filtered_data[band][channel] = band_pass_filter(eeg_data[channel], low_freq, high_freq, sfreq)
        return filtered_data
   