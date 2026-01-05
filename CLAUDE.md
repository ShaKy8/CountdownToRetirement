# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CountdownToRetirement** - A web application displaying an animated countdown to retirement (February 27, 2026 at 4:00 PM). Features include real-time countdown, fun metrics (weekends left, workdays remaining, etc.), milestone tracking, and celebration animations.

## Tech Stack

- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Backend:** Node.js HTTP server (for local development)
- **Hosting:** AWS S3 + CloudFront (production)
- **Testing:** Custom test framework using Node.js built-in modules (no external dependencies)

## Development Commands

```bash
# Start local development server (port 8000)
node server.js

# Run client-side tests (66 tests)
node tests.js

# Run server integration tests (35 tests)
# Note: Stop any running server first, tests start their own
node tests-server.js
```

## Deployment

### Production (AWS)
- **S3 Bucket:** `branyontech.com`
- **CloudFront Distribution:** `E1MBTRO86GIH7E`
- **URL:** https://branyontech.com

```bash
# Deploy to S3
aws s3 sync . s3://branyontech.com/ \
  --exclude "*" \
  --include "index.html" \
  --include "script.js" \
  --include "styles.css" \
  --include "favicon.svg"

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id E1MBTRO86GIH7E --paths "/*"
```

### Local Server (Systemd)
```bash
# Install systemd service
sudo cp countdown-retirement.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable countdown-retirement
sudo systemctl start countdown-retirement

# Check status
sudo systemctl status countdown-retirement
```

## Project Structure

```
CountdownToRetirement/
├── index.html              # Main web page
├── script.js               # Client-side JavaScript (countdown logic, animations)
├── styles.css              # Responsive styling with animations
├── server.js               # Node.js HTTP server with security headers
├── favicon.svg             # Beach/sunset themed favicon
├── tests.js                # Client-side unit tests (66 tests)
├── tests-server.js         # Server integration tests (35 tests)
├── countdown-retirement.service  # Systemd service file
└── .github/workflows/      # GitHub Actions for CI/CD
    ├── deploy.yml          # Auto-deploy on push to main
    └── test.yml            # Run tests on PRs
```

## Key Features

- **Countdown Timer:** Days, hours, minutes, seconds until retirement
- **Fun Metrics:** Weekends left, workdays, work hours, sleeps, sunrises, Mondays, Fridays
- **Progress Tracking:** Visual hourglass and thermometer animations
- **Milestones:** Achievement system as countdown progresses
- **Customizable Date:** Users can set their own retirement date (stored in localStorage)
- **Security:** Rate limiting, path traversal protection, XSS prevention, security headers

## Security Features

The server implements:
- Rate limiting (100 requests/minute/IP)
- Path traversal protection with URL decoding
- File extension whitelist
- Security headers (X-Frame-Options, CSP, X-Content-Type-Options, etc.)
- HTTP method validation (GET/HEAD only)
