from connect_muse import connect_brainflow
import csv

def write_to_csv(data, file_path):
    with open(file_path, "w", newline="") as csvfile:
        # Create a CSV writer
        csv_writer = csv.DictWriter(csvfile, fieldnames=data.keys())

        # Write the header
        csv_writer.writeheader()

        # Write the data
        csv_writer.writerow(data)


serial_port_num = int(input("Enter your serial port no: "))
brainflow_data = connect_brainflow(serial_port_num)
write_to_csv(brainflow_data,"test.csv")
