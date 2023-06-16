document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('refresh-button').addEventListener('click', refreshNetworkStatus);
});

function refreshNetworkStatus() {
    fetch('/api/network-status')
        .then(response => response.json())
        .then(data => {
            document.getElementById('network-status').textContent = JSON.stringify(data, null, 2);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}
