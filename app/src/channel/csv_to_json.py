import csv
import json
from pathlib import Path
# Function to convert a CSV to JSON
# Takes the file paths as arguments
def make_json(csvFilePath, jsonFilePath):
    # create a dictionary
    data = {}

    # Open a csv reader called DictReader
    with open(csvFilePath, encoding='utf-8') as csvf:
        csvReader = csv.DictReader(csvf)

        # Convert each row into a dictionary
        # and add it to data
        i = 0
        for rows in csvReader:
            # Set first timestamp as '0 seconds'
            if i == 0:
                base_time = rows['timestamp']
                i += 1
            key = str(float(rows['timestamp']) - float(base_time))
            data[key] = rows

    # Open a json writer, and use the json.dumps()
    # function to dump data
    with open(jsonFilePath, 'w', encoding='utf-8') as jsonf:
        jsonf.write(json.dumps(data, indent=4))

#def get_channel(jsonFilePath):
    #with open(jsonFilePath, 'w', encoding='utf-8') as jsonf:
        # get each channel timestamp data as a list
        # 

def make_json_test():
    json_file = open("EEGdata.json", "w")
    json_path = Path(f"EEGdata.json")
    csv_path = Path(f"test.csv")
    # converting eeg data to json
    make_json(csv_path, json_path)
    
# works as intended
make_json_test()



