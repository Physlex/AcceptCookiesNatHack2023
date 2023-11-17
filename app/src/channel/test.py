import argparse, time
from brainflow.board_shim import BoardShim, BrainFlowInputParams, BoardIds, BrainFlowPresets
import numpy as np
import matplotlib.pyplot as plt

def run_tests() -> None:
    """
        Rough assertion-based-tests to quickly craft the MVP for nathack
    """

    BoardShim.enable_dev_board_logger()

    params = BrainFlowInputParams()
    params.serial_port = "4"

    # Call stream
    board = BoardShim(BoardIds.MUSE_2_BOARD, params)
    board.prepare_session()
    board.start_stream()
    time.sleep(2)
    board_data_buff = board.get_board_data(num_samples=None, preset=BrainFlowPresets.DEFAULT_PRESET)
    board_eeg_chann = board.get_eeg_channels(board_id=BoardIds.MUSE_2_BOARD, preset=BrainFlowPresets.DEFAULT_PRESET)
    board.release_session()

    # Output brain data
    print("Standard board data")
    for i in range(len(board_data_buff)):
        print(board_data_buff[i])

    print("EEG - specific data")
    print(board_eeg_chann)

    return

if __name__ == "__main__":
    run_tests()
    pass
