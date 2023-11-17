from brainflow.board_shim import (
    BoardShim,
    BrainFlowInputParams,
    BoardIds,
    BrainFlowPresets
)
import numpy as np

class MuseBoard(object):
    def __init__(self, serial_port_num:int) -> None:
        self.params = BrainFlowInputParams()
        self.params.serial_port = str(serial_port_num)

        self.board_type = BoardIds.MUSE_2_BOARD
        self.board_preset = BrainFlowPresets.DEFAULT_PRESET
        self.board = BoardShim(self.board_type, self.params)

    def connect_to_session(self) -> None:
        self.board.prepare_session()
        self.board.start_stream()

    def get_session_data(self) -> np.ndarray:
        return self.board.get_board_data(num_samples=None, preset=self.board_preset)

    def get_eeg_channel_id(self) -> np.ndarray:
        return self.board.get_eeg_channels(board_id=self.board_type, preset=self.board_preset)

    def get_timestamp_id(self) -> np.ndarray:
        return self.board.get_timestamp_channel(board_id=self.board_type, preset=self.board_preset)

    def release_session(self) -> None:
        self.board.release_session()
