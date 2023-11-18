from museboard import MuseBoard
from brainflow import BoardShim

def establish_muse2_connection(serial_port_num: int, board: MuseBoard) -> bool:
    if (board == None):
        board = MuseBoard(serial_port_num)
    board.connect_to_session()
    return True

def release_muse2_connection(board: MuseBoard) -> None:
    if (board != None):
        board.release_session()
    board = None
    pass

def log_muse2_connection(board: MuseBoard) -> None:
    assert(board != None)
    BoardShim.enable_dev_board_logger()

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
    if (board != None):
        return (board.get_eeg_channel_id(), board.get_timestamp_id())
    else:
        return (-1, -1)

def get_board_channels(board: MuseBoard) -> list:
    if (board != None):
        return board.get_session_data()
    else:
        return None

def get_board_data_as_dict(board: MuseBoard) -> dict:
    board_eeg_chann = board.get_eeg_channel_id()
    board_time_chann = board.get_timestamp_id()
    board_data_buff = board.get_session_data()

    return {
        "board_egg_chann": board_eeg_chann,
        "board_time_chann": board_time_chann,
        "board_data_buff": board_data_buff,
    }

def connect_brainflow() -> dict:
    return {"Depreciated": -1 }

if __name__ == "__main__":
    print("Input Serial Num: ", end=None)
    serial_port_num = input()
    muse_board = MuseBoard(serial_port_num)
    pass
