const path = require('path');

// Import necessary modules
const express = require('express');
const { exec } = require('child_process');

// Initialize the app
const app = express();

app.use('/static', express.static(path.join(__dirname, 'static')));

// Define the endpoint
app.get('/api/network-status', (req, res) => {
    // Execute ifconfig command
    exec('ifconfig', (error, stdout, stderr) => {
        if (error) {
            console.log(`Error: ${error.message}`);
            return res.json({ error: error.message });
        }

        if (stderr) {
            console.log(`Stderr: ${stderr}`);
            return res.json({ error: stderr });
        }

        // Parse the ifconfig output and send it as the response
        const parsedOutput = parseIfconfigOutput(stdout);
        return res.json({ data: parsedOutput });
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(express.static(__dirname));

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server started on port ${port}`));

function parseIfconfigOutput(ifconfigOutput) {
    const lines = ifconfigOutput.split('\n');
    const interfaces = [];

    let currentInterface = null;

    for (const line of lines) {
        // Each interface starts with an alphanumeric character at the beginning of a line
        if (line[0] && line[0].match(/\w/)) {
            if (currentInterface) {
                interfaces.push(currentInterface);
            }
            currentInterface = {};
        }

        const flagMatch = line.match(/^(\w+): flags=(\d+)<(.+)> mtu (\d+)/);
        if (flagMatch) {
            currentInterface.Interface = flagMatch[1];
            currentInterface.Flags = flagMatch[2];
            currentInterface.Options = flagMatch[3];
            currentInterface.MTU = flagMatch[4];
        }

        const etherMatch = line.match(/ether (\S+)/);
        if (etherMatch) {
            currentInterface.Ether = etherMatch[1];
        }

        // Match inet
        const inetMatch = line.match(/inet (\S+)/);
        if (inetMatch) {
            currentInterface.Inet = inetMatch[1];
        }

        // Match netmask
        const netmaskMatch = line.match(/netmask (\S+)/);
        if (netmaskMatch) {
            currentInterface.Netmask = netmaskMatch[1];
        }

        // Match broadcast
        const broadcastMatch = line.match(/broadcast (\S+)/);
        if (broadcastMatch) {
            currentInterface.Broadcast = broadcastMatch[1];
        }

        // Match media
        const mediaMatch = line.match(/media: (\S+)/);
        if (mediaMatch) {
            currentInterface.Media = mediaMatch[1];
        }
    }

    // Push the last interface
    if (currentInterface) {
        interfaces.push(currentInterface);
    }

    return interfaces;
}

