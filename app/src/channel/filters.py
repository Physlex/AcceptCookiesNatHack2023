from abc import ABC
import numpy as np

# All instructions come from: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4045570/
filters = []
last_state = [[]]


class Filter(ABC):
    def __init__(self) -> None:
        """
        Default base class constructor. Defines the command pattern.
        """

    def apply(self, eeg_channels: list[list[np.float64]]) -> list[list[np.float64]]:
        """
        Abstract apply function. Takes a list of eeg data channels and returns
        it instantly, applying no operations.
        """
        pass


class ICAFilter(Filter):
    def __init__(self) -> None:
        super().__init__()

    def apply(self, eeg_channels: list[list[np.float64]]) -> list[list[np.float64]]:
        # TODO: Apply ICA here to seperate out wave frequencies. Remember to document wth is
        #       actually happening here. Try and follow loosely the ABC's format.
        # send to whatever return you are doing
        last_state = eeg_channels
        filters.append("ICA")
        return eeg_channels


class FourierFilter(Filter):
    def __init__(self) -> None:
        super().__init__()

    def apply(self, eeg_channels: list[list[np.float64]]) -> list[list[np.float64]]:
        # TODO: Fourier Transform the autocorrelation sequence to get the PSD
        #       using welch's method (As you did in jupyter, I assume)
        filters.append("FOURIER")
        last_state = eeg_channels
        return eeg_channels


class WavelettFilter(Filter):
    def __init__(self) -> None:
        super().__init__()

    def apply(self, eeg_channels: list[list[np.float64]]) -> list[list[np.float64]]:
        # TODO: Wavelet Transform
        filters.append("WAVELETT")
        last_state = eeg_channels
        return eeg_channels
