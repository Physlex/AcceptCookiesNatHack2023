document.getElementById('start').addEventListener('click', function() {
    // Your API endpoint URL on localhost
    const apiUrl = 'http://localhost:3000/connect_brainflow';  // Replace with your actual API endpoint

    // Sample data to be sent in the POST request
    const postData = {
        key1: 'value1',
        key2: 'value2'
    };

    // Make a POST request using the Fetch API
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        // You can handle the response data here
    })
    .catch(error => {
        console.error('Error:', error);
        // Handle errors here
    });
});

