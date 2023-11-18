(async function() {
  // Example data? I am so lost hehe
  
  const data = [
    { time: 1, voltage: 1},
    { time: 2, voltage: 3},
    { time: 3, voltage: 2},
    { time: 4, voltage: -1},
    { time: 5, voltage: 2},
    { time: 6, voltage: 4}
  ];


  // data = csvJSON("/test.csv");
  var json_file_path = '../EEGdata.json';

  // Fetch the JSON file
  fetch(json_file_path)
      .then(response => {
      // Check if the response is successful (status code 200)
      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }
      // Parse the response JSON
      return response.json();
      })
      .then(jsonData => {
      // Now you have the JSON data as an object
      console.log(jsonData);

      // Extract values associated with the key "1"
      const valuesForKey1 = Object.values(jsonData)
          .filter(entry => "1" in entry)
          .map(entry => entry["1"]);

      // Log the result
      console.log(valuesForKey1);
      })
      .catch(error => {
      console.error('Error fetching the JSON file:', error);
  });

  new Chart(
    document.getElementById('eeg_data_visual'),
    {
        data: {
            datasets: [{
                type: 'line',
                label: 'ALPHA Dataset',
                data: [3, 4, 2, -2, 4, 3]
            }, {
                type: 'line',
                label: 'GAMMA Dataset',
                data: [1, 3, 2, -1, 2, 4],
            }],
            labels: data.map(row => row.time)
        }
    }
  );
})();