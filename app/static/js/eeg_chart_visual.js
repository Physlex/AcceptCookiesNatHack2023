// GLOBAL

const timestamp_channel_id = "timestamp_channel";
const eeg_channels_id = "eeg_channels";


/// CLASSES

class EEGPacket {
  /// PUBLIC

  /**
   * @brief default constructor for eeg packet creation
   */
  constructor() {
  }

  /**
   * @brief queries packet on server, then processes and stores it.
   * 
   * @param {str} URL the url of the server request to be made for the fetch.
   */
  async fetchPacket(URL) {
    this.response = await fetch(URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'applications/json',
      },
    }).then((response) => {
      return response.json();
    }).catch((error) => {
      throw(error);
    });
  }

  /**
   * @brief Normalizes the timestamp channel into sequential data.
   * 
   * @param {float} offset the first element value for all timestamps.
   */
  normalize(old_timestamps, offset=0.0) {
    return this.response.then((raw) => {
      let new_timestamp = [];

      let old_timestamps = raw[timestamp_channel_id];
      const prior_last_stamp = parseFloat(offset);
      const epoch = parseFloat(old_timestamps[0]);
      for (let i = 1; i < old_timestamps.length; ++i) {
        const normalized_stamp = (parseFloat(old_timestamps[i] - epoch + prior_last_stamp)).toFixed(4);
        new_timestamp.push(normalized_stamp);
      }

      return new_timestamp;
    }).catch((error_msg) => {
      console.error(error_msg);
    });
  }

  /**
   * @brief returns channel data of pre-specified type.
   * 
   * @description Accepted types are:
   *              - channel{0, 1, 2, ... , 4} -- Returns a list of floats for ith eeg data channel
   *              - timestamps -- Returns duration of eeg measurement. Measured since epoch.
   *              - all -- Returns all data in a 2D list.
   *
   *              Note that timestamp data is not normalized by default. Un-normalized data will be
   *              offset by time since epoch. Normalized data will be returned if 'normalize' is
   *              called on this object before getChannelData('timestamps')
   *
   * @param {str} channel the channel name to return
   */
  getChannelData(channel) {
    this.response.then((raw) => {
      try {
        if ((typeof channel) != "string") {
          throw TypeError('channel id must be of type \'string\'');
        } else {
          channel.toLowerCase();
        }

        switch (channel) {
          case ('channel0'):
            return raw[eeg_channels_id][0];
          case ('channel1'):
            return raw[eeg_channels_id][1];
          case ('channel2'):
            return raw[eeg_channels_id][2];
          case ('channel3'):
            return raw[eeg_channels_id][3];
          case ('timestamp'):
            return raw[timestamp_channel_id];
          case ('all'):
            let result = [];
            result.push(raw[eeg_channels_id]);
            result.push(raw[timestamp_channel_id]);
            return result;
          default:
            throw EvalError('Undefined channel name. Double check you entered it right.');
        }
      } catch (error) {
        console.error(error);
      }
    });
  }
};

/**
 * @brief EEGChart is an interface class to the underlying Chart type from chart.js
 * 
 * @details TODO: Add description
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
    try {
      this.eeg_channels = [];

      const num_eeg_channels = 4;
      for (let i = 0; i < num_eeg_channels; ++i) {
        this.eeg_channels.push(data_package.getChannelData(`channel${i}`));
      }
      if(this.eeg_channels == undefined) {
        throw TypeError("eeg_channels is undefined.\n");
      }
  
      this.timestamp_channel = data_package.normalize(data_package.getChannelData('timestamp'));
      if(this.timestamp_channel == undefined) {
        throw TypeError("timestamp_channel is undefined.\n");
      }
  
      this.type = type;
      this.context_id = html_ctx;
    } catch(error_msg) {
      console.error(error_msg);
    }
  }

  /**
   * @brief Updates the chart internals based on data provided to it.
   * 
   * @description Update accepts data packets that hold timestamp and EEG channel data.
   *              It seperates, normalizes and processes the data by passing it to the chart
   *              internal object to be rendered. The render process is called by side-effect.
   * 
   * @param {EEGPacket} new_data new eeg and timestamp data. 
   */
  update(new_data) {
    // Update timestamp channel
    const offset = this.timestamp_channel[this.timestamp_channel.length - 1];
    let new_timestamps = new_data.normalize(new_data.getChannelData('timestamp'), offset);
    for (let i = 0; i < new_timestamps.length; ++i) {
      this.timestamp_channel.push(new_timestamps[i]);
    }
    this.chart_internal.data.labels = this.timestamp_channel;

    // // Update eeg channel
    for (let i = 0; i < this.eeg_channels.length; ++i) {
      let new_channel = new_data.getChannelData(`channel${i}`);
      for (let j = 0; j < new_channel.length; ++j) {
        this.chart_internal.data.datasets[i].data.push(new_channel[j]);
      }
    }

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
  async build() {
    let datasets = [];
    for (let i = 0; i < this.eeg_channels.length; ++i) {
      datasets.push({label: `Channel ${i + 1}`, data: this.eeg_channels[i]});
    }

    const epoch = this.timestamp_channel[0];
    for (let i = 0; i < this.timestamp_channel.length; i++) {
      this.timestamp_channel[i] = (this.timestamp_channel[i] - epoch).toFixed(4);
    }
    const eeg_data = {datasets: datasets, labels: this.timestamp_channel};

    const chart_options = {
        animation: false,
        normalized: true,
        parsion: false,
        responsive: true
    };

    const config = {type: this.type, data: eeg_data, options: chart_options};
    console.log(config);
    const context = document.querySelector(this.context_id);
    this.chart_internal = await new Chart(context, config);
  }
}

/// 'MAIN'

let intializing_packet = new EEGPacket();
intializing_packet.fetchPacket();
let eeg_console = new EEGChart(intializing_packet);

let shortPollUpdateChart = ((chart) => {
  let new_data = EEGPacket();
  new_data.fetchPacket();
  chart.update(new_data);
});

const num_seconds = 1;
const SEC_TO_MILLISEC = 1000;
window.setInterval(shortPollUpdateChart, (num_seconds * SEC_TO_MILLISEC), eeg_console);
