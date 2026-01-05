# Test Suite Documentation

## Overview

This test suite provides comprehensive coverage for the CountdownToRetirement application, including:

- **Regression tests** for previously fixed bugs
- **Core functionality tests** for countdown logic and calculations
- **Security tests** for XSS prevention and server hardening
- **Integration tests** for server endpoints and headers
- **Edge case tests** for boundary conditions

## Test Files

### 1. `tests.js` - Unit and Logic Tests

Tests all client-side JavaScript logic including:
- Confetti memory leak prevention (MAX_CONFETTI_ELEMENTS = 200)
- Date validation (empty, past, too far future, NaN)
- localStorage error handling (unavailable, invalid data)
- Path traversal protection (../, encoded attempts)
- Countdown calculations (days, hours, minutes, seconds)
- Fun metrics calculations (weekends, workdays, Mondays, Fridays)
- Progress percentage calculation
- Milestone state determination (achieved, active, locked)
- XSS prevention (safe DOM manipulation)

**Total Tests: 80+**

### 2. `tests-server.js` - Server Integration Tests

Tests the Node.js HTTP server including:
- Security headers (X-Frame-Options, CSP, X-Content-Type-Options, etc.)
- Path traversal protection with actual HTTP requests
- HTTP method validation (GET/HEAD allowed, POST/PUT/DELETE blocked)
- Content-Type headers for different file types
- Cache headers (no-cache for HTML, long cache for assets)
- Response compression (gzip)
- Error handling (404, 403, 405)
- Rate limiting validation
- Root path handling (/ serves index.html)

**Total Tests: 40+**

## Running the Tests

### Quick Start

```bash
# Run all unit/logic tests
node tests.js

# Run all server integration tests (server must NOT be running)
node tests-server.js

# Run both test suites
node tests.js && node tests-server.js
```

### Prerequisites

- Node.js installed (built-in modules only, no dependencies required)
- For server tests: Ensure server is NOT running on port 8000
- Tests use Node.js assert module and built-in HTTP client

### Expected Output

**Successful run:**
```
============================================================
CountdownToRetirement Test Suite
============================================================

REGRESSION TESTS - Confetti Memory Leak
✓ Should not exceed MAX_CONFETTI_ELEMENTS (200)
✓ Should stop exactly at MAX_CONFETTI_ELEMENTS even with multiple rapid calls

REGRESSION TESTS - Date Validation
✓ Should reject empty date input
✓ Should reject invalid date format (NaN)
...

============================================================
TEST SUMMARY
============================================================
Total Tests:  80
Passed:       80
Failed:       0
Success Rate: 100.0%
============================================================

🎉 All tests passed!
```

## Test Coverage

### Regression Tests (Bugs Fixed)

| Bug | Test Coverage | Status |
|-----|---------------|--------|
| Confetti memory leak | Tests MAX_CONFETTI_ELEMENTS limit (200) | ✅ |
| Date validation | Tests empty, past, NaN, too far future | ✅ |
| localStorage errors | Tests graceful degradation when unavailable | ✅ |
| Path traversal | Tests ../, encoded, double-slash attempts | ✅ |

### Core Functionality

| Feature | Test Coverage | Status |
|---------|---------------|--------|
| Countdown calculations | Days, hours, minutes, seconds | ✅ |
| Fun metrics | Weekends, workdays, Mondays, Fridays | ✅ |
| Progress calculation | Percentage, min/max capping | ✅ |
| Milestone states | Achieved, active, locked logic | ✅ |

### Security

| Security Feature | Test Coverage | Status |
|-----------------|---------------|--------|
| XSS prevention | textContent vs innerHTML | ✅ |
| Path traversal | Server blocks ../, //, encoded | ✅ |
| Security headers | All 6 headers present and correct | ✅ |
| Method validation | Only GET/HEAD allowed | ✅ |
| File whitelist | Only safe extensions served | ✅ |

## Test Architecture

### Mock DOM Environment

The unit tests use a mock DOM implementation to test client-side code without requiring a browser:

```javascript
class MockDOM {
    getElementById(id) { ... }
    createElement(tag) { ... }
    appendChild(child) { ... }
}

class MockElement {
    textContent = '';
    value = '';
    className = '';
    style = {};
    setAttribute(name, value) { ... }
    addEventListener(event, handler) { ... }
}
```

### Mock localStorage

Tests localStorage error handling with a mock that can be made unavailable:

```javascript
class MockLocalStorage {
    makeUnavailable() { this.accessible = false; }
    getItem(key) {
        if (!this.accessible) throw new Error('Not accessible');
        return this.store.get(key);
    }
}
```

### HTTP Request Helper

Server tests use a promise-based HTTP client:

```javascript
function makeRequest(options) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ res, data }));
        });
        req.end();
    });
}
```

## Adding New Tests

### Add a Unit Test

```javascript
describe('NEW FEATURE - Description', () => {
    test('Should do something specific', () => {
        // Arrange
        const input = 'test';

        // Act
        const result = functionUnderTest(input);

        // Assert
        assert.strictEqual(result, expected, 'Error message');
    });
});
```

### Add a Server Integration Test

```javascript
await test('Should validate some server behavior', async () => {
    const { res, data } = await makeRequest({
        hostname: TEST_HOST,
        port: TEST_PORT,
        path: '/some-path',
        method: 'GET'
    });

    assert.strictEqual(res.statusCode, 200, 'Should return 200 OK');
});
```

## Continuous Integration

To integrate with CI/CD:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: node tests.js
      - run: node tests-server.js
```

## Coverage Goals

- **Line Coverage:** 90%+
- **Branch Coverage:** 85%+
- **Function Coverage:** 95%+

Current coverage focuses on:
- All fixed bugs have regression tests
- All core calculations tested
- All security measures validated
- All edge cases covered

## Debugging Failed Tests

If tests fail:

1. **Check the error message** - Tests include descriptive assertions
2. **Review the failed test name** - Tests are named descriptively
3. **Check server logs** - Server tests show stdout/stderr
4. **Run individual test** - Comment out other tests to isolate

Example:
```javascript
// Run only one test by commenting others
test('Should reject empty date input', () => {
    const newDateValue = '';
    const isValid = newDateValue !== '';
    assert.strictEqual(isValid, false, 'Empty date should be rejected');
});
```

## Performance

- **Unit tests:** ~500ms (no I/O)
- **Server tests:** ~3-5 seconds (includes server start/stop)
- **Total runtime:** ~5-6 seconds

Tests are optimized for:
- No external dependencies (uses Node.js built-ins only)
- Minimal I/O operations
- Parallel test execution where possible
- Fast server startup/shutdown

## Future Enhancements

Potential test additions:
- [ ] Visual regression tests (screenshot comparison)
- [ ] Accessibility tests (ARIA attributes, screen reader compatibility)
- [ ] Load testing (concurrent request handling)
- [ ] Browser compatibility tests (Playwright/Puppeteer)
- [ ] Code coverage reporting (Istanbul/nyc)
- [ ] Performance benchmarks (countdown update speed)

## Troubleshooting

### Server tests fail with "EADDRINUSE"
- Ensure server is not already running on port 8000
- Kill any existing processes: `lsof -ti:8000 | xargs kill`

### Tests timeout
- Check network connectivity
- Increase timeout values in test configuration
- Verify server.js path is correct

### Mock DOM issues
- Ensure mock classes match actual DOM API
- Check that textContent is used (not innerHTML)
- Verify event listeners are properly mocked

## License

Tests are part of the CountdownToRetirement project and follow the same license.
