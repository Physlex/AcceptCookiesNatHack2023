const connect_url = 'http://localhost:8000/connect_brainflow';
document.querySelector('#start-btn').addEventListener('click', () => {
    let payload = document.querySelector('#start-text-field').value;
    console.log(payload);

    // Post the payload to the muse board
    fetch(connect_url+"?id="+payload, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });
});

const resolve_url = 'http://localhost:8000/remove_connection';
document.querySelector('#stop-btn').addEventListener('click', () => {
    let payload = document.querySelector('#stop-text-field').value;
    console.log(payload);
    // Post the payload to the muse board
    fetch(resolve_url+"?id="+payload, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    });
})
