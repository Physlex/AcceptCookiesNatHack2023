from abc import ABC
import numpy as np

# All instructions come from: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4045570/

class Filter(ABC):
    def __init__(self) -> None:
        """
            Default base class constructor. Defines the command pattern.
        """
        pass

    def apply(self, eeg_channels: list[list[np.float64]]) -> list[list[np.float64]]:
        """
            Abstract apply function. Takes a list of eeg data channels and returns
            it instantly, applying no operations.
        """
        return eeg_channels

class ICAFilter(Filter):
    def __init__(self) -> None:
        super().__init__()
        pass

    def apply(self, eeg_channels: list[list[np.float64]]) -> list[list[np.float64]]:
        # TODO: Apply ICA here to seperate out wave frequencies. Remember to document wth is
        #       actually happening here. Try and follow loosely the ABC's format.
        return eeg_channels
    
class FourierFilter(Filter):
    def __init__(self) -> None:
        super().__init__()
        pass

    def apply(self, eeg_channels: list[list[np.float64]]) -> list[list[np.float64]]:
        # TODO: Fourier Transform the autocorrelation sequence to get the PSD
        #       using welch's method (As you did in jupyter, I assume)
        return eeg_channels
    
class WavelettFilter(Filter):
    def __init__(self) -> None:
        super().__init__()
        pass

    def apply(self, eeg_channels: list[list[np.float64]]) -> list[list[np.float64]]:
        # TODO: Wavelet Transform
        pass
