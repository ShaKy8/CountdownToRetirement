#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PORT = 8000;
const HOSTNAME = '0.0.0.0';

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

// Allowed file extensions (whitelist)
const allowedExtensions = new Set(['.html', '.css', '.js', '.json', '.png', '.jpg', '.gif', '.svg', '.ico']);

// Security headers
const securityHeaders = {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'"
};

// Simple rate limiting
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100;

function checkRateLimit(ip) {
    const now = Date.now();

    if (!requestCounts.has(ip)) {
        requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return true;
    }

    const record = requestCounts.get(ip);
    if (now > record.resetTime) {
        record.count = 1;
        record.resetTime = now + RATE_LIMIT_WINDOW;
        return true;
    }

    if (record.count >= MAX_REQUESTS_PER_WINDOW) {
        return false;
    }

    record.count++;
    return true;
}

// Clean up old rate limit entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of requestCounts.entries()) {
        if (now > record.resetTime) {
            requestCounts.delete(ip);
        }
    }
}, RATE_LIMIT_WINDOW);

// Validate and sanitize file path
function validatePath(requestedPath) {
    // Remove query string
    let filePath = requestedPath.split('?')[0];

    // Default to index.html for root
    if (filePath === '/') {
        filePath = '/index.html';
    }

    // Decode URI components to catch encoded traversal attempts
    try {
        filePath = decodeURIComponent(filePath);
    } catch (e) {
        return null; // Invalid encoding
    }

    // Block obvious traversal patterns
    if (filePath.includes('..') || filePath.includes('//')) {
        return null;
    }

    // Construct and resolve absolute path
    const fullPath = path.resolve(__dirname, '.' + filePath);

    // Ensure path is within __dirname (normalized comparison)
    const normalizedDir = path.normalize(__dirname);
    if (!fullPath.startsWith(normalizedDir + path.sep) && fullPath !== normalizedDir) {
        return null;
    }

    // Check file extension whitelist
    const ext = path.extname(fullPath).toLowerCase();
    if (!allowedExtensions.has(ext)) {
        return null;
    }

    return { fullPath, ext };
}

// Compress response if client supports it
function compressResponse(req, res, data, contentType) {
    const acceptEncoding = req.headers['accept-encoding'] || '';

    // Set content type
    res.setHeader('Content-Type', contentType);

    // Add security headers
    for (const [header, value] of Object.entries(securityHeaders)) {
        res.setHeader(header, value);
    }

    // Check if content is compressible
    const isCompressible = contentType.startsWith('text/') ||
                           contentType === 'application/json' ||
                           contentType === 'application/javascript';

    if (isCompressible && data.length > 1024) {
        if (acceptEncoding.includes('gzip')) {
            res.setHeader('Content-Encoding', 'gzip');
            zlib.gzip(data, (err, compressed) => {
                if (err) {
                    res.setHeader('Content-Length', data.length);
                    res.writeHead(200);
                    res.end(data);
                } else {
                    res.setHeader('Content-Length', compressed.length);
                    res.writeHead(200);
                    res.end(compressed);
                }
            });
            return;
        }
    }

    res.setHeader('Content-Length', data.length);
    res.writeHead(200);
    res.end(data);
}

// Get cache headers based on file type
function getCacheHeaders(ext) {
    if (ext === '.html') {
        // HTML files: cache but revalidate
        return {
            'Cache-Control': 'no-cache, must-revalidate',
            'Pragma': 'no-cache'
        };
    } else {
        // Static assets: cache for 1 year
        return {
            'Cache-Control': 'public, max-age=31536000, immutable'
        };
    }
}

const server = http.createServer((req, res) => {
    const clientIp = req.socket.remoteAddress || 'unknown';
    const sanitizedUrl = req.url.substring(0, 200);

    console.log(`${new Date().toISOString()} - ${req.method} ${sanitizedUrl}`);

    // Rate limiting
    if (!checkRateLimit(clientIp)) {
        res.writeHead(429, { 'Content-Type': 'text/plain', 'Retry-After': '60' });
        res.end('429 Too Many Requests');
        return;
    }

    // Only allow GET and HEAD methods
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.writeHead(405, { 'Content-Type': 'text/plain', 'Allow': 'GET, HEAD' });
        res.end('405 Method Not Allowed');
        return;
    }

    // Validate path
    const pathResult = validatePath(req.url);
    if (!pathResult) {
        console.warn(`Path validation failed: ${sanitizedUrl} from ${clientIp}`);
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('403 Forbidden');
        return;
    }

    const { fullPath, ext } = pathResult;
    const mimeType = mimeTypes[ext] || 'application/octet-stream';

    // Check if file exists
    fs.access(fullPath, fs.constants.R_OK, (err) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
        }

        // Read and serve the file
        fs.readFile(fullPath, (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 Internal Server Error');
                return;
            }

            // Add cache headers
            const cacheHeaders = getCacheHeaders(ext);
            for (const [header, value] of Object.entries(cacheHeaders)) {
                res.setHeader(header, value);
            }

            // HEAD request - return headers only
            if (req.method === 'HEAD') {
                res.setHeader('Content-Type', mimeType);
                res.setHeader('Content-Length', data.length);
                for (const [header, value] of Object.entries(securityHeaders)) {
                    res.setHeader(header, value);
                }
                res.writeHead(200);
                res.end();
                return;
            }

            // Compress and send response
            compressResponse(req, res, data, mimeType);
        });
    });
});

server.listen(PORT, HOSTNAME, () => {
    console.log(`\n===========================================`);
    console.log(`Retirement Countdown Server Running!`);
    console.log(`===========================================`);
    console.log(`Local:    http://localhost:${PORT}`);
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
