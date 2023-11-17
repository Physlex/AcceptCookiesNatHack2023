from connect_muse import connect_brainflow
import csv

serial_port_num = int(input("Enter your serial port no: "))
brainflow_data = connect_brainflow(serial_port_num)
fieldnames = ["timestamp"]
for channel in brainflow_data["board_egg_chann"]:
    fieldnames.append(f"channel{channel}")
csv_writer = csv.DictWriter("test.csv", fieldnames=fieldnames)
for channel in brainflow_data["board_egg_chann"]:
    csv_data = {}
    for i in range(len(brainflow_data["board_data_buff"][channel])):
        data = brainflow_data["board_data_buff"][channel][i]
        timestamp = brainflow_data["board_time_chann"][i]
        csv_data[f"channel{channel}"] = data
        csv_data["timestamp"] = timestamp
    csv_writer.writerow(csv_data)
        
