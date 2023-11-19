from museboard import MuseBoard
from csv_builder import build_csv_from_muse_channels
import time

def get_channel_data(board: MuseBoard) -> tuple[list[list], list]:
    eeg_channel_ids = board.get_eeg_channel_id()
    timestamp_channel_id = board.get_time_channel_id()
    all_muse_channels = board.get_session_data()

    eeg_channels = []
    for channel_id in eeg_channel_ids:
        eeg_channels.append(all_muse_channels[channel_id])

    timestamp_channel = all_muse_channels[timestamp_channel_id]

    return (eeg_channels, timestamp_channel)

def retrieve_user_session_args() -> tuple[str, str]:
    print("enter serial number of bluetooth COM: ", end="")
    serial_num = int(input())

    print("enter file name for saving: ", end="")
    file_name = str(input())
    file_name = "data/" + file_name
    if (".csv" not in file_name):
        file_name += ".csv"

    return (serial_num, file_name)

def save_brain_test_data():
    serial_num, file_name = retrieve_user_session_args()

    muse_board = MuseBoard(serial_num)
    muse_board.connect_to_session()
    time.sleep(30)
    eeg_channels, timestamp_channel = get_channel_data(muse_board)
    muse_board.release_session()

    build_csv_from_muse_channels(eeg_channels, timestamp_channel, file_name)

    return file_name


if __name__ == "__main__":
    file_name = save_brain_test_data()    
    print(f"Writing session data to: {file_name}")
    pass
