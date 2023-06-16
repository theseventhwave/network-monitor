// Function to render the table
function renderTableData(data) {
    const table = document.getElementById('networkStatusTable');
    // Clear out any old rows
    table.innerHTML = '';
    data.forEach((row, index) => {
        if (row.Interface) {
            const newRow = table.insertRow(-1);
            const cell1 = newRow.insertCell(0);
            const cell2 = newRow.insertCell(1);
            const cell3 = newRow.insertCell(2);
            const cell4 = newRow.insertCell(3);
            const cell5 = newRow.insertCell(4);
            const cell6 = newRow.insertCell(5);
            const cell7 = newRow.insertCell(6);
            const cell8 = newRow.insertCell(7);
            const cell9 = newRow.insertCell(8);
            cell1.innerHTML = row.Interface;
            cell2.innerHTML = row.Flags;
            cell3.innerHTML = row.Options;
            cell4.innerHTML = row.MTU;
            cell5.innerHTML = row.Ether;
            cell6.innerHTML = row.Inet || '';
            cell7.innerHTML = row.Netmask || '';
            cell8.innerHTML = row.Broadcast || '';
            cell9.innerHTML = row.Media || '';
        }
    });
}

// Function to fetch the data from the API and then render the table
function refreshTable() {
    fetch('/api/network-status')
        .then(response => response.json())
        .then(data => renderTableData(data.data))
        .catch(error => console.error('Error:', error));
}

// Fetch the data and render the table when the page loads
window.onload = refreshTable;
