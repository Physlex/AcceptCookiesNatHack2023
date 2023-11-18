import time
from museboard import MuseBoard
from brainflow import BoardShim


def connect_brainflow(serial_port_num: int, log: bool = False) -> tuple:
    """
    Connects with MUSE2 using brainflow and returns the buffer
    """
    if log == True:
        BoardShim.enable_dev_board_logger()

    board = MuseBoard(serial_port_num=serial_port_num)
    board.connect_to_session()
    time.sleep(2)
    board_eeg_chann = board.get_eeg_channel_id()
    board_time_chann = board.get_timestamp_id()
    board_data_buff = board.get_session_data()
    board.release_session()


    if log == True:
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

    return {
        "board_egg_chann": board_eeg_chann,
        "board_time_chann": board_time_chann,
        "board_data_buff": board_data_buff,
    }


if __name__ == "__main__":
    connect_brainflow(serial_port_num=5, log=True)
    pass
