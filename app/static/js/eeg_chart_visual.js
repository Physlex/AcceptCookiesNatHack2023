let current_data = [[], [], [], []];

const num_seconds = 1; // You can change this
const SEC_TO_MILLISEC = 1000;
window.setInterval(shortPollEEG, (num_seconds * SEC_TO_MILLISEC));

async function fetchEEGData() {
  const data_url = 'http://localhost:8000/poll_data';
  const response = await fetch(data_url, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
  }).then((packet) => {
    return packet.json();
  });

  return response;
}

async function createChart(eeg_channels, time_channel) {
  new Chart(
    document.getElementById('eeg-data-visual'),
    {
        data: {
          datasets: [{
            type: 'line',
            label: 'channel one',
            data: eeg_channels[0]
          }, {
            type: 'line',
            label: 'channel two',
            data: eeg_channels[1]
          }, {
            type: 'line',
            label: 'channel three',
            data: eeg_channels[2]
          }, {
            type: 'line',
            label: 'channel four',
            data: eeg_channels[3]
          }
        ],
        labels: time_channel
  }});
}

function shortPollEEG() {
  fetchEEGData().then( (data_package) => {
    const eeg_channels = data_package["eeg_channels"];
    const timestamp_channel = data_package["timestamp_channel"];
    current_data.push(...eeg_channels);
    if (timestamp_channel.length == 0) {
      return;
    }
  
    createChart(eeg_channels, timestamp_channel);
  });
}
