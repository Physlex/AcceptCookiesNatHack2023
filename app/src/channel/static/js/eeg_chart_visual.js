let current_data = [];
// Polls for the EEG data every second
window.setInterval(shortPollEEG, 1000);

async function fetchEEGData() {
  const data_url = 'http://localhost:8000/poll_data';
  const response = await fetch(data_url, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
  });
  return response.json();
}

function createChart(eeg_channels, time_channel) {
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
  fetchEEGData().then((response) => {
    const package = JSON.parse(response);

    timestamp_channel_id = package['eeg_timestamp_id']
    eeg_channels_id = package['eeg_channel_id']
    brainflow_data = package['eeg_brainwave_data']
  
    if (timestamp_channel_id === -1) {
      return;
    }
  
    time_channel = [...brainflow_data[timestamp_channel_id]];
    eeg_channels = [];
    for (let i = 0; i < eeg_channels_id.length; ++i) {
      let curr_channel = eeg_channels_id[i];
      eeg_channels.push(brainflow_data[curr_channel]);
    }
  
    createChart(eeg_channels, time_channel);  
  });
};
