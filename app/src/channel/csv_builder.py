from connect_muse import connect_brainflow
import csv

serial_port_num = int(input("Enter your serial port no: "))
brainflow_data = connect_brainflow(serial_port_num)
file = open("test.csv", "w")
writer = csv.writer(file)
channels = brainflow_data["board_egg_chann"]
fieldnames = ["timestamp"]
fieldnames.extend(channels)
writer.writerow(fieldnames)
timestamp_id = brainflow_data["board_time_chann"] 
timestamps = brainflow_data["board_data_buff"][timestamp_id]
for i in range(len(timestamps)):
    csv_row = []
    csv_row.append(timestamps[i])
    for channel in brainflow_data["board_egg_chann"]:
        csv_row.append(brainflow_data["board_data_buff"][channel][i])
    writer.writerow(csv_row)      
file.close()
