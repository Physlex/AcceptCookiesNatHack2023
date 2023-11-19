from museboard import MuseBoard
from signal_process import filter_data_signal 
import time

id=4
muse_board = MuseBoard(serial_port_num=id)
muse_board.connect_to_session()
time.sleep(3)
eeg_channels = muse_board.get_eeg_channel_id()
timestamp_channel = muse_board.get_time_channel_id()
brainflow_data = muse_board.get_session_data()
muse_board.release_session()
print(filter_data_signal(brainflow_data,eeg_channels))