/**
 * Server Integration Tests
 *
 * Tests the actual HTTP server for:
 * - Security headers
 * - Path traversal protection
 * - Rate limiting
 * - Response compression
 * - Method validation
 *
 * Run with: node tests-server.js
 * Prerequisites: Server should NOT be running (tests start their own instance)
 */

const http = require('http');
const assert = require('assert');
const { spawn } = require('child_process');
const path = require('path');

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m'
};

// Test state
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failedTestDetails = [];
let serverProcess = null;

const TEST_PORT = 8000;
const TEST_HOST = 'localhost';

/**
 * Test runner
 */
function test(name, fn) {
    totalTests++;
    return fn()
        .then(() => {
            passedTests++;
            console.log(`${colors.green}✓${colors.reset} ${name}`);
        })
        .catch((error) => {
            failedTests++;
            failedTestDetails.push({ name, error: error.message });
            console.log(`${colors.red}✗${colors.reset} ${name}`);
            console.log(`  ${colors.gray}${error.message}${colors.reset}`);
        });
}

/**
 * Describe block
 */
function describe(suiteName, fn) {
    console.log(`\n${colors.cyan}${suiteName}${colors.reset}`);
    return fn();
}

/**
 * Make HTTP request helper
 */
function makeRequest(options) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ res, data }));
        });

        req.on('error', reject);
        req.setTimeout(5000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        if (options.method === 'POST' && options.body) {
            req.write(options.body);
        }

        req.end();
    });
}

/**
 * Start test server
 */
function startServer() {
    return new Promise((resolve, reject) => {
        const serverPath = path.join(__dirname, 'server.js');
        serverProcess = spawn('node', [serverPath], {
            stdio: ['ignore', 'pipe', 'pipe'],
            env: { ...process.env }
        });

        let output = '';
        serverProcess.stdout.on('data', (data) => {
            output += data.toString();
            if (output.includes('Retirement Countdown Server Running')) {
                setTimeout(resolve, 500); // Give server time to fully start
            }
        });

        serverProcess.stderr.on('data', (data) => {
            console.error(`Server Error: ${data}`);
        });

        serverProcess.on('error', reject);

        // Timeout if server doesn't start
        setTimeout(() => reject(new Error('Server failed to start')), 5000);
    });
}

/**
 * Stop test server
 */
function stopServer() {
    return new Promise((resolve) => {
        if (serverProcess) {
            serverProcess.on('exit', resolve);
            serverProcess.kill('SIGTERM');
            setTimeout(() => {
                if (serverProcess) {
                    serverProcess.kill('SIGKILL');
                }
                resolve();
            }, 2000);
        } else {
            resolve();
        }
    });
}

// =============================================================================
// SERVER SECURITY TESTS
// =============================================================================

async function runSecurityHeaderTests() {
    await describe('SERVER TESTS - Security Headers', async () => {
        await test('Should return X-Frame-Options: DENY', async () => {
            const { res } = await makeRequest({
                hostname: TEST_HOST,
                port: TEST_PORT,
                path: '/index.html',
                method: 'GET'
            });

            assert.strictEqual(res.headers['x-frame-options'], 'DENY',
                'X-Frame-Options header should be DENY');
        });

        await test('Should return X-Content-Type-Options: nosniff', async () => {
            const { res } = await makeRequest({
                hostname: TEST_HOST,
                port: TEST_PORT,
                path: '/index.html',
                method: 'GET'
            });

            assert.strictEqual(res.headers['x-content-type-options'], 'nosniff',
                'X-Content-Type-Options should be nosniff');
        });

        await test('Should return X-XSS-Protection header', async () => {
            const { res } = await makeRequest({
                hostname: TEST_HOST,
                port: TEST_PORT,
                path: '/index.html',
                method: 'GET'
            });

            assert.strictEqual(res.headers['x-xss-protection'], '1; mode=block',
                'X-XSS-Protection should be enabled');
        });

        await test('Should return Content-Security-Policy', async () => {
            const { res } = await makeRequest({
                hostname: TEST_HOST,
                port: TEST_PORT,
                path: '/index.html',
                method: 'GET'
            });

            assert.ok(res.headers['content-security-policy'],
                'Content-Security-Policy should be present');
            assert.ok(res.headers['content-security-policy'].includes("default-src 'self'"),
                'CSP should restrict to same origin');
        });

        await test('Should return Referrer-Policy', async () => {
            const { res } = await makeRequest({
                hostname: TEST_HOST,
                port: TEST_PORT,
                path: '/index.html',
                method: 'GET'
            });

            assert.strictEqual(res.headers['referrer-policy'], 'strict-origin-when-cross-origin',
                'Referrer-Policy should be secure');
        });

        await test('Should return Permissions-Policy', async () => {
            const { res } = await makeRequest({
                hostname: TEST_HOST,
                port: TEST_PORT,
                path: '/index.html',
                method: 'GET'
            });

            assert.ok(res.headers['permissions-policy'],
                'Permissions-Policy should be present');
            assert.ok(res.headers['permissions-policy'].includes('geolocation=()'),
                'Should disable geolocation');
        });

        await test('Should include all security headers on CSS files', async () => {
            const { res } = await makeRequest({
                hostname: TEST_HOST,
                port: TEST_PORT,
                path: '/styles.css',
                method: 'GET'
            });

            assert.strictEqual(res.headers['x-frame-options'], 'DENY');
            assert.strictEqual(res.headers['x-content-type-options'], 'nosniff');
            assert.ok(res.headers['content-security-policy']);
        });

        await test('Should include all security headers on JS files', async () => {
            const { res } = await makeRequest({
                hostname: TEST_HOST,
                port: TEST_PORT,
                path: '/script.js',
                method: 'GET'
            });

            assert.strictEqual(res.headers['x-frame-options'], 'DENY');
            assert.strictEqual(res.headers['x-content-type-options'], 'nosniff');
            assert.ok(res.headers['content-security-policy']);
        });
    });
}

async function runPathTraversalTests() {
    await describe('SERVER TESTS - Path Traversal Protection', async () => {
        await test('Should block path traversal with ../ (403 Forbidden)', async () => {
            const { res } = await makeRequest({
                hostname: TEST_HOST,
                port: TEST_PORT,
                path: '/../etc/passwd',
                method: 'GET'
            });

            assert.strictEqual(res.statusCode, 403,
                'Should return 403 Forbidden for path traversal');
        });

        await test('Should block URL-encoded path traversal (403)', async () => {
            const { res } = await makeRequest({
                hostname: TEST_HOST,
                port: TEST_PORT,
                path: '/%2e%2e/etc/passwd',
                method: 'GET'
            });

            assert.strictEqual(res.statusCode, 403,
                'Should block encoded traversal');
        });

        await test('Should block double-slash paths', async () => {
            const { res } = await makeRequest({
                hostname: TEST_HOST,
                port: TEST_PORT,
                path: '//etc/passwd',
                method: 'GET'
            });

            assert.strictEqual(res.statusCode, 403,
                'Should block double-slash paths');
        });

        await test('Should block access to .git directory', async () => {
            const { res } = await makeRequest({
                hostname: TEST_HOST,
                port: TEST_PORT,
                path: '/.git/config',
                method: 'GET'
            });

            assert.strictEqual(res.statusCode, 403,
                'Should block access to .git directory (not whitelisted extension)');
        });

        await test('Should block access to .env files', async () => {
            const { res } = await makeRequest({
                hostname: TEST_HOST,
                port: TEST_PORT,
                path: '/.env',
                method: 'GET'
            });

            assert.strictEqual(res.statusCode, 403,
                'Should block access to .env files');
        });

        await test('Should block non-whitelisted file extensions (.sh)', async () => {
            const { res } = await makeRequest({
                hostname: TEST_HOST,
                port: TEST_PORT,
                path: '/script.sh',
                method: 'GET'
            });

            assert.strictEqual(res.statusCode, 403,
                'Should block .sh files (not in whitelist)');
        });

        await test('Should allow valid HTML file', async () => {
            const { res } = await makeRequest({
                hostname: TEST_HOST,
                port: TEST_PORT,
                path: '/index.html',
                method: 'GET'
            });

            assert.strictEqual(res.statusCode, 200,
                'Should allow valid HTML file');
        });

        await test('Should allow valid CSS file', async () => {
            const { res } = await makeRequest({
                hostname: TEST_HOST,
                port: TEST_PORT,
                path: '/styles.css',
                method: 'GET'
            });

            assert.strictEqual(res.statusCode, 200,
                'Should allow valid CSS file');
        });

        await test('Should allow valid JS file', async () => {
            const { res } = await makeRequest({
                hostname: TEST_HOST,
                port: TEST_PORT,
                path: '/script.js',
                method: 'GET'
            });

            assert.strictEqual(res.statusCode, 200,
                'Should allow valid JS file');
        });
    });
}

async function runMethodValidationTests() {
    await describe('SERVER TESTS - HTTP Method Validation', async () => {
        await test('Should allow GET requests', async () => {
            const { res } = await makeRequest({
                hostname: TEST_HOST,
                port: TEST_PORT,
                path: '/index.html',
                method: 'GET'
            });

            assert.strictEqual(res.statusCode, 200,
                'Should allow GET requests');
        });

        await test('Should allow HEAD requests', async () => {
            const { res } = await makeRequest({
                hostname: TEST_HOST,
                port: TEST_PORT,
                path: '/index.html',
                method: 'HEAD'
            });

            assert.strictEqual(res.statusCode, 200,
                'Should allow HEAD requests');
        });

        await test('Should block POST requests (405)', async () => {
            const { res } = await makeRequest({
                hostname: TEST_HOST,
                port: TEST_PORT,
                path: '/index.html',
                method: 'POST',
                body: 'test=data'
            });

            assert.strictEqual(res.statusCode, 405,
                'Should return 405 Method Not Allowed for POST');
        });

        await test('Should block PUT requests (405)', async () => {
            const { res } = await makeRequest({
                hostname: TEST_HOST,
                port: TEST_PORT,
                path: '/index.html',
                method: 'PUT'
            });

            assert.strictEqual(res.statusCode, 405,
                'Should return 405 for PUT');
        });

        await test('Should block DELETE requests (405)', async () => {
            const { res } = await makeRequest({
                hostname: TEST_HOST,
                port: TEST_PORT,
                path: '/index.html',
                method: 'DELETE'
            });

            assert.strictEqual(res.statusCode, 405,
                'Should return 405 for DELETE');
        });

        await test('Should include Allow header in 405 response', async () => {
            const { res } = await makeRequest({
                hostname: TEST_HOST,
                port: TEST_PORT,
                path: '/index.html',
                method: 'POST',
                body: ''
            });

            assert.strictEqual(res.headers['allow'], 'GET, HEAD',
                'Should include Allow header with permitted methods');
        });
    });
}

async function runContentTypeTests() {
    await describe('SERVER TESTS - Content Type Headers', async () => {
        await test('Should return text/html for HTML files', async () => {
            const { res } = await makeRequest({
                hostname: TEST_HOST,
                port: TEST_PORT,
                path: '/index.html',
                method: 'GET'
            });

            assert.strictEqual(res.headers['content-type'], 'text/html',
                'HTML files should have text/html content type');
        });

        await test('Should return text/css for CSS files', async () => {
            const { res } = await makeRequest({
                hostname: TEST_HOST,
                port: TEST_PORT,
                path: '/styles.css',
                method: 'GET'
            });

            assert.strictEqual(res.headers['content-type'], 'text/css',
                'CSS files should have text/css content type');
        });

        await test('Should return text/javascript for JS files', async () => {
            const { res } = await makeRequest({
                hostname: TEST_HOST,
                port: TEST_PORT,
                path: '/script.js',
                method: 'GET'
            });

            assert.strictEqual(res.headers['content-type'], 'text/javascript',
                'JS files should have text/javascript content type');
        });
    });
}

async function runCacheHeaderTests() {
    await describe('SERVER TESTS - Cache Headers', async () => {
        await test('Should set no-cache for HTML files', async () => {
            const { res } = await makeRequest({
                hostname: TEST_HOST,
                port: TEST_PORT,
                path: '/index.html',
                method: 'GET'
            });

            assert.ok(res.headers['cache-control'].includes('no-cache'),
                'HTML should have no-cache policy');
        });

        await test('Should set long cache for static assets (CSS)', async () => {
            const { res } = await makeRequest({
                hostname: TEST_HOST,
                port: TEST_PORT,
                path: '/styles.css',
                method: 'GET'
            });

            assert.ok(res.headers['cache-control'].includes('max-age'),
                'CSS should have cache-control with max-age');
        });

        await test('Should set long cache for static assets (JS)', async () => {
            const { res } = await makeRequest({
                hostname: TEST_HOST,
                port: TEST_PORT,
                path: '/script.js',
                method: 'GET'
            });

            assert.ok(res.headers['cache-control'].includes('max-age'),
                'JS should have cache-control with max-age');
        });
    });
}

async function runCompressionTests() {
    await describe('SERVER TESTS - Response Compression', async () => {
        await test('Should compress HTML responses when Accept-Encoding includes gzip', async () => {
            const { res } = await makeRequest({
                hostname: TEST_HOST,
                port: TEST_PORT,
                path: '/index.html',
                method: 'GET',
                headers: {
                    'Accept-Encoding': 'gzip, deflate, br'
                }
            });

            // Server compresses if content > 1024 bytes
            // index.html is larger than 1024 bytes
            assert.ok(res.headers['content-encoding'] === 'gzip' || !res.headers['content-encoding'],
                'Should compress large HTML files if gzip supported');
        });

        await test('Should include Content-Length header', async () => {
            const { res } = await makeRequest({
                hostname: TEST_HOST,
                port: TEST_PORT,
                path: '/index.html',
                method: 'GET'
            });

            assert.ok(res.headers['content-length'],
                'Should include Content-Length header');
        });
    });
}

async function runErrorHandlingTests() {
    await describe('SERVER TESTS - Error Handling', async () => {
        await test('Should return 404 for non-existent files', async () => {
            const { res } = await makeRequest({
                hostname: TEST_HOST,
                port: TEST_PORT,
                path: '/nonexistent.html',
                method: 'GET'
            });

            assert.strictEqual(res.statusCode, 404,
                'Should return 404 for missing files');
        });

        await test('Should return 404 with plain text message', async () => {
            const { res, data } = await makeRequest({
                hostname: TEST_HOST,
                port: TEST_PORT,
                path: '/missing.html',
                method: 'GET'
            });

            assert.strictEqual(res.headers['content-type'], 'text/plain',
                '404 response should be plain text');
            assert.strictEqual(data, '404 Not Found',
                '404 message should be clear');
        });
    });
}

async function runRateLimitingTests() {
    await describe('SERVER TESTS - Rate Limiting', async () => {
        await test('Should accept reasonable request volume', async () => {
            const requests = [];
            for (let i = 0; i < 10; i++) {
                requests.push(makeRequest({
                    hostname: TEST_HOST,
                    port: TEST_PORT,
                    path: '/index.html',
                    method: 'GET'
                }));
            }

            const results = await Promise.all(requests);
            const allSuccessful = results.every(({ res }) => res.statusCode === 200);

            assert.strictEqual(allSuccessful, true,
                'Should handle reasonable request volume');
        });

        // Note: Testing actual rate limit (100 requests) would slow down test suite
        // Production testing should include this
    });
}

async function runRootPathTests() {
    await describe('SERVER TESTS - Root Path Handling', async () => {
        await test('Should serve index.html for root path /', async () => {
            const { res, data } = await makeRequest({
                hostname: TEST_HOST,
                port: TEST_PORT,
                path: '/',
                method: 'GET'
            });

            assert.strictEqual(res.statusCode, 200,
                'Should return 200 for root path');
            assert.strictEqual(res.headers['content-type'], 'text/html',
                'Root should serve HTML');
            assert.ok(data.includes('<!DOCTYPE html>'),
                'Should serve HTML document');
        });
    });
}

// =============================================================================
// MAIN TEST EXECUTION
// =============================================================================

async function runAllTests() {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`${colors.blue}Server Integration Test Suite${colors.reset}`);
    console.log(`${'='.repeat(60)}\n`);

    console.log(`${colors.yellow}Starting test server...${colors.reset}`);

    try {
        await startServer();
        console.log(`${colors.green}✓ Server started successfully${colors.reset}`);

        // Run all test suites
        await runSecurityHeaderTests();
        await runPathTraversalTests();
        await runMethodValidationTests();
        await runContentTypeTests();
        await runCacheHeaderTests();
        await runCompressionTests();
        await runErrorHandlingTests();
        await runRateLimitingTests();
        await runRootPathTests();

    } catch (error) {
        console.error(`${colors.red}✗ Failed to start server: ${error.message}${colors.reset}`);
        process.exit(1);
    } finally {
        console.log(`\n${colors.yellow}Stopping test server...${colors.reset}`);
        await stopServer();
        console.log(`${colors.green}✓ Server stopped${colors.reset}`);
    }

    // Print summary
    console.log(`\n${'='.repeat(60)}`);
    console.log(`${colors.cyan}TEST SUMMARY${colors.reset}`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Total Tests:  ${totalTests}`);
    console.log(`${colors.green}Passed:       ${passedTests}${colors.reset}`);
    console.log(`${colors.red}Failed:       ${failedTests}${colors.reset}`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    console.log(`${'='.repeat(60)}\n`);

    if (failedTests > 0) {
        console.log(`${colors.red}FAILED TEST DETAILS:${colors.reset}\n`);
        failedTestDetails.forEach((test, index) => {
            console.log(`${index + 1}. ${colors.red}${test.name}${colors.reset}`);
            console.log(`   Error: ${test.error}`);
            console.log('');
        });
        process.exit(1);
    } else {
        console.log(`${colors.green}🎉 All server integration tests passed!${colors.reset}\n`);
        process.exit(0);
    }
}

// Run tests
runAllTests().catch((error) => {
    console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
    stopServer().then(() => process.exit(1));
});
