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


/// CHART FUNCTIONALITY

// Configures and updates the global chart context
async function createEEGChart(chart_type, eeg_channels, timestamps) {
  let datasets = [];
  for (i = 0; i < eeg_channels.length; ++i) {
    datasets.push({label: `Channel ${i + 1}`, data: eeg_channels[i]});
  }
  const time_series_data = {datasets: datasets, labels: timestamps};

  const context = document.querySelector('#eeg-data-visual');
  const config = {type: chart_type, data: time_series_data};
  console.log(config);
  let eeg_chart = await new Chart(context, config);

  return eeg_chart;
}

function updateChart(new_data, label) {
  // TODO: FINISH FUNCT
}

function shortPollEEG() {
  fetchEEGData().then( (data_package) => {
    let eeg_channels = data_package["eeg_channels"];
    let timestamp_channel = data_package["timestamp_channel"];

    const epoch = timestamp_channel[0];
    for (i = 0; i < timestamp_channel.length; i++) {
      timestamp_channel[i] = timestamp_channel[i] - epoch;
    }

    createEEGChart('line', eeg_channels, timestamp_channel);
  });
}
