import time
from brainflow.board_shim import (
    BoardShim,
    BrainFlowInputParams,
    BoardIds,
)


def connect_brainflow():
    """
    Connects with MUSE2 using brainflow and returns the buffer
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
    return board_data_buff
