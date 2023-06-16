// Retrieve the old data from localStorage or initialize it as an empty array
let oldData = JSON.parse(localStorage.getItem('oldData')) || [];

// Function to render the table
function renderTableData(data) {
    const table = document.getElementById('networkStatusTable');
    // Clear out any old rows
    table.innerHTML = '';
    let fields = ['Interface', 'Flags', 'Options', 'MTU', 'Ether', 'Inet', 'Netmask', 'Broadcast', 'Media'];
    data.forEach((row, index) => {
        if (row.Interface) {
            const newRow = table.insertRow(-1);
            for (let i = 0; i < fields.length; i++) {
                let cell = newRow.insertCell(i);
                let field = fields[i];

                // Clear existing classes and tooltip
                cell.className = '';
                cell.title = '';
                cell.removeAttribute('data-toggle');

                cell.innerHTML = row[field] || '';
                if (row[field + 'Changed']) {
                    cell.classList.add('bg-warning');
                    cell.title = 'Old value: ' + row[field + 'OldValue'];
                    cell.dataset.toggle = "tooltip";
                }
            }


            // Highlight removals
            if (row.removed) {
                newRow.classList.add('bg-danger');
            }
        }
    });
    // Initialize tooltips
    $('[data-toggle="tooltip"]').tooltip();
}

// Function to fetch the data from the API and then render the table
function refreshTable() {
    fetch('/api/network-status')
        .then(response => response.json())
        .then(data => {
            let currentData = data.data;

            // Clean up oldData
            oldData.forEach((row) => {
                for (let key in row) {
                    if (key.endsWith('Changed') || key.endsWith('OldValue')) {
                        delete row[key];
                    }
                }
            });

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
                            value[field + 'OldValue'] = oldInterfaceData[field];
                        }
                    }
                } else {
                    // Interface is new, mark all fields as changed
                    for (const field in value) {
                        value[field + 'Changed'] = true;
                        value[field + 'OldValue'] = '';
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

            // Store currentData to oldData for the next refresh, but filter out any removed interfaces
            oldData = currentData.filter(interface => !interface.removed);

            localStorage.setItem('oldData', JSON.stringify(oldData));
        })
        .catch(error => console.error('Error:', error));
}

// Fetch the data and render the table when the page loads
window.onload = refreshTable;
