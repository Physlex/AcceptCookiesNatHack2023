let current_data = [];
// Polls for the EEG data every second
window.setInterval(createChart, 1000);


async function createChart() {

  const data_url = 'http://localhost:8000/poll_data';
  let data = await fetch(data_url, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
          'Content-Type': 'application/json',
      },
    }
  ).then((response) => {
    console.log(response);
    return JSON.parse(response);
  });

  timestamps = data['timestamp_channels']
  eeg_channels_id = data['eeg_channels']
  brainflow_data = data['brainflow_data']

  time_arr = [...brainflow_data[timestamps]];
  eeg_channels = [];
  for (let i = 0; i < 4; ++i) {
    let curr_channel = eeg_channels_id[i];
    eeg_channels.push(brainflow_data[curr_channel]);
  }
  

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

        labels: time_arr
        }
    }
  );
};
