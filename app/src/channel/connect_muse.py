import time
from museboard import MuseBoard
from brainflow import BoardShim
from csv_builder import build_csv_from_muse_channels


def establish_muse2_connection(
    serial_port_num: int, board: MuseBoard, enable_log_connection: bool
) -> None:
    if enable_log_connection == True:
        BoardShim.enable_dev_board_logger()

    board.connect_to_session()
    pass


def release_muse2_connection(board: MuseBoard) -> None:
    if board != None:
        board.release_session()
    pass


def log_muse2_connection(board: MuseBoard) -> None:
    assert board != None

    board_data_buff = board.get_session_data()
    board_time_chann = board.get_time_channel_id()
    board_eeg_chann = board.get_eeg_channel_id()

    print("Standard board data")
    for i in range(len(board_data_buff)):
        print(board_data_buff[i])

    print("\n--------EEG Channels")
    print(board_eeg_chann)

    print("\n--------EEG Timestamps")
    print(board_time_chann)
    board_data_buff[board_time_chann]

    print("\n--------EEG Data")
    for chann_id in board_eeg_chann:
        print(board_data_buff[chann_id])

    pass


def get_board_channel_ids(board: MuseBoard) -> tuple:
    if board != None:
        return (board.get_eeg_channel_id(), board.get_time_channel_id())
    else:
        return (-1, -1)


def get_board_channels(board: MuseBoard) -> list:
    if board != None:
        return board.get_session_data()
    else:
        return None


def get_board_data_as_dict(board: MuseBoard) -> dict:
    board_eeg_chann = board.get_eeg_channel_id()
    board_time_chann = board.get_time_channel_id()
    board_data_buff = board.get_session_data()

    return {
        "board_egg_chann": board_eeg_chann,
        "board_time_chann": board_time_chann,
        "board_data_buff": board_data_buff,
    }


def connect_brainflow() -> dict:
    return {"Depreciated": -1}


if __name__ == "__main__":
    print("Input Serial Num: ", end="")
    serial_port_num = input()

    # Establish muse connection
    muse_board = MuseBoard(serial_port_num)
    muse_board.connect_to_session()

    # Do all muse operations before closing
    time.sleep(2)
    log_muse2_connection(muse_board)
    board_channels = get_board_channels(muse_board)
    channel_ids = get_board_channel_ids(muse_board)

    # Close connection
    muse_board.release_session()

    # Use data obtained while connected as cleanup

    eeg_channel_ids = channel_ids[0]
    eeg_channels = []
    for id in eeg_channel_ids:
        eeg_channels.append(board_channels[id])

    time_channel_id = channel_ids[1]
    timestamp_channel = board_channels[time_channel_id]

    build_csv_from_muse_channels(eeg_channels, timestamp_channel)

    pass
