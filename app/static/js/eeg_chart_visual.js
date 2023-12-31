// GLOBAL

const timestamp_channel_id = "timestamp_channel";
const eeg_channels_id = "eeg_channels";
const data_retrieval_url = 'http://localhost:8000/poll';

/// CLASSES
//   /**
//    * @brief Updates the chart internals based on data provided to it.
//    * 
//    * @description Update accepts data packets that hold timestamp and EEG channel data.
//    *              It seperates, normalizes and processes the data by passing it to the chart
//    *              internal object to be rendered. The render process is called by side-effect.
//    * 
//    * @param {EEGPacket} new_data new eeg and timestamp data. 
//    */
//   update(new_data) {
//     // Update timestamp channel
//     const offset = this.timestamp_channel[this.timestamp_channel.length - 1];
//     let new_timestamps = new_data.normalize(new_data.getChannelData('timestamp'), offset);
//     for (let i = 0; i < new_timestamps.length; ++i) {
//       this.timestamp_channel.push(new_timestamps[i]);
//     }
//     this.chart_internal.data.labels = this.timestamp_channel;

//     // // Update eeg channel
//     for (let i = 0; i < this.eeg_channels.length; ++i) {
//       let new_channel = new_data.getChannelData(`channel${i}`);
//       for (let j = 0; j < new_channel.length; ++j) {
//         this.chart_internal.data.datasets[i].data.push(new_channel[j]);
//       }
//     }

//     this.chart_internal.update();
//   }


class EEGMuseStream {
  /// PUBLIC METHODS

  /**
   * @brief constructor for muse2 stream object
   * @details constructs a museStream object containing eeg and timestamp samples
   *          each eeg_channel must have an equal amount of elements to time samples.
   * 
   * @param {list[float64]} eeg_channels all eeg channels in a 2D Matrix 
   * @param {list[float64]} time_channel all time values at each sample instance
   */
  constructor(eeg_channels, time_channels) {
    try {
      if (eeg_channels[0].length != time_channels.length) {
        throw("number of eeg samples must be equal to nmber of time samples")
      };

      for (let i = 0; i < this.#NUM_EEG_CHANNELS; ++i) {
        this.channels.push(eeg_channels[i]);
      }
      this.channels.push(time_channels);

    } catch(error_msg) {
      console.error(error_msg);
    }
  }

  // EXTRACTORS

  /**
   * @brief returns the timestamp channel
   * 
   * @returns {list[int]} timestamp channel
   */
  getTimestamps() {
    return this.channels[4];
  }

  /**
   * @brief returns the number of samples collected from the muse2
   * 
   * @returns {int} number of samples collected from muse2 board
   */
  getNumSamples() {
    return this.channels[0].length;
  }

  /**
   * @brief returns the number of EEG channels collected in the stream
   * 
   * @return {int} number of eeg channels
   */
  getNumChannels() {
    return this.#NUM_EEG_CHANNELS;
  }

  /**
   * @brief Returns all EEG Channels
   * @details Returns a 2D matrix of eeg elements indexed by channel ID (rows)
   *          and sample (columns)
   * 
   * @returns All EEG channels
   */
  getChannels() {
    let result = [];
    for (let i = 0; i < this.#NUM_EEG_CHANNELS; ++i) {
      result.push(this.channels[i]);
    }

    return this.channels;
  }

  /**
   * @brief Returns a specific EEG Channel ID
   * @details Returns a list of id specified channel ID from muse2 board.
   *          Throws an error if id >= 4 or < 0
   * 
   * @returns list a list of floating point eeg values
   */
  getChannel(id) {
    try {
      if (this.#isOOR(id)) {throw("channel id is out of range")};
      return this.channels[id];
    } catch(error_msg) {
      console.error(error_msg);
    }
  }

  // MUTATORS

  /**
   * @brief Normalizes an entered timestamp channel and returns a new one 
   * @details Creates a new list of float values from {0 -> elapsed timestamp sample} + offset.
   *          In place algorithm. Throws if first element of list is not 0.
   * 
   * @param {list[float64]} old_timestamp the timestamp wished to be normalized
   * @param {float64} offset a specified offset. A good offset choice may be the last element of the prior timestamp sample list.
   * 
   * @returns {list[float64]} the normalized timestamp.
   */
  normalize(offset) {
    try {
      if (abs(this.eeg_channels[4]) < 0.001) {
        throw("Old timestamp must have non-zero element");
      }

      const prior_last_stamp = parseFloat(offset);
      const epoch = parseFloat(this.eeg_channels[4][0]);
      for (let i = 1; i < this.getNumSamples(); ++i) {
        this.eeg_channels[4][i] = (parseFloat(this.eeg_channels[4][i] - epoch + prior_last_stamp));
      }
    } catch(error_msg) {
      console.error(error_msg);
    }
  } 

  /// PRIVATE METHODS

  /**
   * @brief checks if id is out of range
   * @details returns a boolean to check if the index entered is within the range of accepted values
   *          associated with a muse headset. Accepted values are between [0, 3]
   * 
   * @param {int} index the index associated with the muse stream
   * 
   * @return {bool} returns true of out of range, else false.
   */
  #isOOR(index) {
    if ((index >= this.#NUM_EEG_CHANNELS) || (index < 0)) {
      return true;
    }
  }

  /// PRIVATE MEMBERS

  #NUM_EEG_CHANNELS = 4;
}

/**
 * @brief Fetch Decorator API
 */
class EEGPacket {
  /**
   * Default constructor
   */
  constructor() {
  }

  /**
   * @brief fetch wrapper for Muse EEG data
   * @details requests an eeg_packet object from the server and converts it to a musestream object
   * 
   * @param {str} url the url to send request to
   * @param {str} http_request GET, PUSH, POST, PATCH, or DELETE
   * 
   * @returns {EEGMuseStream} the requested muse stream
   */
  async fetch(url, http_request, http_body='') {
    let promise = await fetch(url, {method: http_request, body: http_body}).then((response) => {response.json()});
    let muse_stream = promise.then((eeg_packet) => {
      return new EEGMuseStream(eeg_packet[eeg_channels_id], eeg_packet[timestamp_channel_id]);
    });

    return muse_stream;
  }
};

/**
 * @brief Defines options and types to build a chart context object
 */
class EEGChartBuilder {
  /**
   * @brief Default constructor for chartbuilder
   * 
   * @param {EEGMuseStream} muse_stream a freshly fetched muse stream object from the EEGPacket API 
   * @param {str} plot_type the type of plot we want to build. ex 'line', 'bar', etc.
   */
  constructor(plot_type) {
    this.plot_type = plot_type;
  }

  /**
   * @brief Creates a chart from prior definitions
   * @details Creates a chart of plot_type after defining the data and options. Both are defined by the
   *          'defineData' and 'defineOptions' methods respectively. Will not work without calling these
   *          methods. Returns a chart object asynchronously. Throws if context id is invalid.
   * 
   * @param {str} context_id the id associated with the html canvas element the chart will be rendered to
   * 
   * @returns {Chart} chartjs chart object
   */
  async build(context_id) {
    try {
      const context = document.querySelector(context_id);
      if (context == undefined) { throw('chart context is undefined, invalid context id'); }
      const config = {type: this.plot_type, data: this.eeg_data, options: this.options};
      return await new Chart(context, config);
    } catch(error_msg) {
      console.error(error_msg);
    }
  }

  /**
   * @brief Creates the definition for an eeg_data mapping.
   * @details Converts the muse stream object handed in the constructor into a hash map to be used in defining
   *          the context of a chart object. Part of the required operations to build a chart context.
   * 
   * @param {EEGMuseStream} muse_stream the muse stream that defines the dataset for the chart context 
   */
  defineData(muse_stream) {
    datasets = [];
    for (let i = 0; i < muse_stream.getNumChannels(); ++i) {
      datasets.push({label: `Channel ${i + 1}`, data: muse_stream.getChannel(i)});
    }
    this.eeg_data = {datasets: datasets, labels: muse_stream.getTimestamps()};
  }

  /**
   * @brief Creates the definition for an options mapping.
   * @details Defines individual options for the definition of a specific chart type.
   *          Each option has it's own documentation under the chartjs docs.
   * 
   * @param {boolean} [is_animated=false] Whether or not the chart should have animations
   * @param {boolean} [is_normalized=true] Whether or not the chart has normalized data
   * @param {boolean} [is_responsive=true] Whether or not the chart is resposnive and reacts to window resizing
   * 
   */
  defineOptions(is_animated=false, is_normalized=true, is_responsive=true) {
    this.options = {
        animation: is_animated,
        normalized: is_normalized,
        responsive: is_responsive,
        parsing: false
    };
  }
};

/**
 * @brief Provides an interface to initilize and update the global chart
 */
class EEGChart {
  /**
   * Default constructor
   */
  constructor() {
  }

  /**
   * @brief Initalizes a chart object
   */
  async initialize(muse_stream) {
    chart_builder = new EEGChartBuilder('line');
    chart_builder.defineData(muse_stream);
    chart_builder.defineOptions();
    this.chart = await chart_builder.build();
    this.current_stream = muse_stream;
  }

  /**
   * @brief Destroys the chart object
   */
  destroy() {
    delete this.chart; // TODO: Does this work as intended??
  }

  /**
   * @brief Updates data for chart object
   */
  update() {
    // TODO
  }
};

/**
 * @brief Creates a chart specifically for uploading EEG Data to a visualizer
 */
class EEGConsole {
  constructor() {
    const eeg_packet = new EEGPacket();
    let initializing_stream = eeg_packet.fetch(data_retrieval_url, 'POST');
    initializing_stream.normalize(offset=0.0);

    this.interactive_chart = new EEGChart();
    this.interactive_chart.initialize(initializing_stream);
  }

  /**
   * @brief updates the consolve view
   */
  update() {
    const eeg_packet = new EEGPacket();
    let initializing_stream = eeg_packet.fetch(data_retrieval_url, 'POST');
    initializing_stream.normalize(offset=0.0);

    this.interactive_chart.update();
  }
};


/// FUNCTIONS
let shortPollUpdateConsole = ((console) => {
  console.update();
});


/// 'MAIN'
const num_seconds = 5;
const SEC_TO_MILLISEC = 1000;
let eeg_console = new EEGConsole();
window.setInterval(shortPollUpdateConsole, (num_seconds * SEC_TO_MILLISEC), eeg_console);
