/// CLASSES

const timestamp_channel_id = "timestamp_channel";
const eeg_channels_id = "eeg_channels";

/**
 *
*/
class EEGChart {
  /// PUBLIC

  /**
   * @brief Turns a data package into a chart for eeg-data-analysis.
   * 
   * @details It is required that data_package is a hash table with the
   *          parameters 'eeg_channels' which holds the eeg_channel data
   *          and 'timestamp_channel' which holds the times at each
   *          eeg data sample instance.
   * 
   * @param data_package, map:
   *            A fetched package with eeg_channel data in
   *            the 'eeg_channels' access, and timestamps for sampled
   *            eeg data in the 'timestamp_channel' access.
   * @param type, str:
   *            The type of chart. Default is line chart.
   * @param html_ctx, str:
   *            Should be in the form of a css selector for an id.
   *            The ID should be for the canvas element assigned
   *            to hold the chart.
  */
  constructor(data_package, type='line', html_ctx='#eeg-data-visual') {
    this.eeg_channels = data_package[eeg_channels_id];
    if(this.eeg_channels == undefined) {
      throw ("eeg_channels is undefined. Likely a network or response error\n");
    }

    this.timestamp_channel = data_package[timestamp_channel_id];
    if(this.timestamp_channel == undefined) {
      throw ("timestamp_channel is undefined. Likely a network or response error\n");
    }

    this.type = type;
    this.context_id = html_ctx;
  }

  /**
   * Updates chart by appending more data from the short poll 
  */
  update(new_data) {
    let new_timestamps = new_data[timestamp_channel_id];
    const prior_last_stamp = parseFloat(this.timestamp_channel[this.timestamp_channel.length - 1]);
    const epoch = parseFloat(new_timestamps[0]);
    for (let i = 1; i < new_timestamps.length; ++i) {
      const normalized_stamp = (parseFloat(new_timestamps[i] - epoch + prior_last_stamp)).toFixed(4);
      this.timestamp_channel.push(normalized_stamp);
    }

    // Update eeg channel
    let new_eeg_channels = new_data[eeg_channels_id]
    for (let i = 0; i < eeg_channels.length; ++i) {
      let current_new_eeg_channel = new_eeg_channels[i];
      for (let j = 0; j < current_new_eeg_channel.length; ++j) {
        this.eeg_channels.push(current_new_eeg_channel[j]);
      }
    }
    console.log(this.eeg_channels);

    // console.log(this.data_internal);

    // for (let i = 0; i < this.eeg_channels.length; ++i) {
    //   let current_channel = this.eeg_channels[i];
    //   let current_dataset = this.chart_internal.data.datasets[i].data;
    //   for (let j = 0; j < current_channel.length; ++j) {
    //     current_dataset.push(current_channel[j]);
    //   }
    //   this.chart_internal.data.datasets[i].data = current_dataset;
    // }

    this.chart_internal.data.labels = this.timestamp_channel;
    this.chart_internal.update();
  }


  /// PRIVATE

  /**
   * @brief Turns the context, type, and datasets allocated in constructor
   *        into a canvas chart.
   * 
   * @details asynchronous. Returns a response object that must be handled.
   *          Type of returned object is a chart object from chartjs.
   * 
   * @return chart, promise(Chart):
   *         Returns a chart promise to be resolved on return.
  */
  async constructChart() {
    let datasets = [];
    for (let i = 0; i < this.eeg_channels.length; ++i) {
      datasets.push({label: `Channel ${i + 1}`, data: this.eeg_channels[i]});
    }

    const epoch = this.timestamp_channel[0];
    for (let i = 0; i < this.timestamp_channel.length; i++) {
      this.timestamp_channel[i] = (this.timestamp_channel[i] - epoch).toFixed(4);
    }
    this.data_internal = {datasets: datasets, labels: this.timestamp_channel};

    const config = {type: this.type, data: this.data_internal};
    const context = document.querySelector(this.context_id);
    this.chart_internal = await new Chart(context, config);
  }
}


/// FUNCTIONS

/**
 * 
 * @returns 
 */
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

function shortPollUpdateChart(chart, new_data) {
  chart.update(new_data);
}


/// 'MAIN'

let eeg_data_visual_chart = fetchEEGData().then((data_packet) => {
  let eeg_data_visual_chart = new EEGChart(data_packet);
  eeg_data_visual_chart.constructChart();
  return eeg_data_visual_chart;
});

const num_seconds = 1;
const SEC_TO_MILLISEC = 1000;
eeg_data_visual_chart.then((chart) => {
  fetchEEGData().then((new_data) => {
    window.setInterval(shortPollUpdateChart, (num_seconds * SEC_TO_MILLISEC), chart, new_data);
  });
})
