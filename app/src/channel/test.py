import argparse, time
from brainflow.board_shim import BoardShim, BrainFlowInputParams, BoardIds, BrainFlowPresets
import numpy as np

def run_tests() -> None:
    """
        Rough assertion-based-tests to quickly craft the MVP for nathack
    """

    BoardShim.enable_dev_board_logger()

    params = BrainFlowInputParams()
    params.serial_port = "4"

    board = BoardShim(BoardIds.MUSE_2_BOARD, params)
    board.prepare_session()
    board.start_stream()
    time.sleep(2)

    board_data_buff = board.get_board_data(256)

    board.release_session()
    print(board_data_buff)

    return

if __name__ == "__main__":
    run_tests()
    pass
