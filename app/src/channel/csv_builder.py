import csv
import numpy as np


def build_csv_from_muse_channels(
    eeg_channels: list[list[np.float64]], timestamp_channel: list[np.float64]
) -> None:
    file = open("test.csv", "w")
    writer = csv.writer(file)

    # Create header for csv
    fieldnames = ["timestamp"]
    for i in range(len(eeg_channels)):
        fieldnames.append(f"Channel {i + 1}")
    writer.writerow(fieldnames)

    # Create body for csv
    for i in range(len(timestamp_channel)):
        csv_row = []
        csv_row.append(timestamp_channel[i])
        for channel in eeg_channels:
            csv_row.append(channel[i])
        writer.writerow(csv_row)

    file.close()
    pass
