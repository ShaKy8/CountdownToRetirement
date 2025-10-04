#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;
const HOSTNAME = '0.0.0.0'; // Listen on all network interfaces

// MIME types for common file extensions
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

    // Parse URL and remove query string
    let filePath = req.url.split('?')[0];

    // Default to index.html for root path
    if (filePath === '/') {
        filePath = '/index.html';
    }

    // Construct full file path
    const fullPath = path.join(__dirname, filePath);

    // Security: prevent directory traversal
    if (!fullPath.startsWith(__dirname)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('403 Forbidden');
        return;
    }

    // Check if file exists
    fs.access(fullPath, fs.constants.R_OK, (err) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
        }

        // Get file extension and determine MIME type
        const ext = path.extname(fullPath).toLowerCase();
        const mimeType = mimeTypes[ext] || 'application/octet-stream';

        // Read and serve the file
        fs.readFile(fullPath, (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 Internal Server Error');
                return;
            }

            res.writeHead(200, { 'Content-Type': mimeType });
            res.end(data);
        });
    });
});

server.listen(PORT, HOSTNAME, () => {
    console.log(`\n===========================================`);
    console.log(`🎉 Retirement Countdown Server Running!`);
    console.log(`===========================================`);
    console.log(`Local:    http://localhost:${PORT}`);
    console.log(`Network:  http://geekom1:${PORT}`);
    console.log(`          http://192.168.86.42:${PORT}`);
    console.log(`===========================================\n`);
    console.log(`Press Ctrl+C to stop the server\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('\nSIGTERM received, shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\nSIGINT received, shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
