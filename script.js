// Retrieve the old data from localStorage or initialize it as an empty array
let oldData = JSON.parse(localStorage.getItem('oldData')) || [];

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

            // Highlight changes
            if (row.InterfaceChanged) cell1.classList.add('bg-warning');
            if (row.FlagsChanged) cell2.classList.add('bg-warning');
            if (row.OptionsChanged) cell3.classList.add('bg-warning');
            if (row.MTUChanged) cell4.classList.add('bg-warning');
            if (row.EtherChanged) cell5.classList.add('bg-warning');
            if (row.InetChanged) cell6.classList.add('bg-warning');
            if (row.NetmaskChanged) cell7.classList.add('bg-warning');
            if (row.BroadcastChanged) cell8.classList.add('bg-warning');
            if (row.MediaChanged) cell9.classList.add('bg-warning');

            // Highlight removals
            if (row.removed) {
                newRow.classList.add('bg-danger');
            }
        }
    });
}

// Function to fetch the data from the API and then render the table
function refreshTable() {
    fetch('/api/network-status')
        .then(response => response.json())
        .then(data => {
            let currentData = data.data;

            // Convert oldData and currentData to Map for easy lookup
            let oldDataMap = new Map(oldData.map(i => [i.Interface, i]));
            let currentDataMap = new Map(currentData.map(i => [i.Interface, i]));

            // Identify changed and new interfaces
            currentDataMap.forEach((value, key) => {
                let oldInterfaceData = oldDataMap.get(key);
                if (oldInterfaceData) {
                    // Compare each field
                    for (const field in value) {
                        if (value[field] !== oldInterfaceData[field]) {
                            value[field + 'Changed'] = true;
                        }
                    }
                } else {
                    // Interface is new, mark all fields as changed
                    for (const field in value) {
                        value[field + 'Changed'] = true;
                    }
                }
            });

            // Identify removed interfaces
            oldDataMap.forEach((value, key) => {
                if (!currentDataMap.has(key)) {
                    value.removed = true;
                    currentData.push(value);
                }
            });

            // Render the table with the current data
            renderTableData(currentData);

            // Update oldData for the next refresh, stripping 'Changed' and 'removed' properties
            oldData = currentData.filter(interface => !interface.removed).map((interface) => {
                let cleanInterface = {};
                for (let key in interface) {
                    if (!key.endsWith('Changed') && key !== 'removed') {
                        cleanInterface[key] = interface[key];
                    }
                }
                return cleanInterface;
            });

            // Save the updated oldData to localStorage
            localStorage.setItem('oldData', JSON.stringify(oldData));
        })
        .catch(error => console.error('Error:', error));
}

// Fetch the data and render the table when the page loads
window.onload = refreshTable;
