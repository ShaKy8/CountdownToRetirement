# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**BranyonTech** - A professional consulting website for AI, technology, and IT services at branyontech.com. The site also preserves the original retirement countdown as an easter egg at `/countdown/`.

## Tech Stack

- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Backend:** Node.js HTTP server (for local development)
- **Hosting:** AWS S3 + CloudFront (production)
- **Testing:** Custom test framework using Node.js built-in modules (no external dependencies)

## Development Commands

```bash
# Start local development server (port 8000)
node server.js

# Run client-side tests (79 tests)
node tests.js

# Run server integration tests (42 tests)
# Note: Stop any running server first, tests start their own
node tests-server.js
```

## Deployment

### Production (AWS)
- **S3 Bucket:** `branyontech.com`
- **CloudFront Distribution:** `E1MBTRO86GIH7E`
- **URL:** https://branyontech.com
- **Countdown URL:** https://branyontech.com/countdown/index.html

```bash
# Deploy to S3
aws s3 sync . s3://branyontech.com/ \
  --exclude "*" \
  --include "index.html" \
  --include "script.js" \
  --include "styles.css" \
  --include "favicon.svg" \
  --include "countdown/index.html" \
  --include "countdown/script.js" \
  --include "countdown/styles.css" \
  --include "countdown/favicon.svg"

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
├── index.html              # BranyonTech consulting landing page
├── script.js               # Business site JS (nav, scroll, animations)
├── styles.css              # Business site styles (dark navy/blue theme)
├── favicon.svg             # Professional "BT" monogram favicon
├── server.js               # Node.js HTTP server with security headers
├── countdown/              # Retirement countdown (easter egg)
│   ├── index.html          # Countdown page with back link to main site
│   ├── script.js           # Countdown logic, animations
│   ├── styles.css          # Countdown styling (purple/gradient theme)
│   └── favicon.svg         # Beach/sunset themed favicon
├── tests.js                # Client-side unit tests (79 tests)
├── tests-server.js         # Server integration tests (42 tests)
├── countdown-retirement.service  # Systemd service file
└── .github/workflows/      # GitHub Actions for CI/CD
    ├── deploy.yml          # Auto-deploy on push to main
    └── test.yml            # Run tests on PRs
```

## Key Features

### Business Site (/)
- **Services:** AI & Claude consulting, technology consulting, IT services
- **About:** Professional bio and experience highlights
- **Contact:** Email and GitHub links
- **Design:** Dark navy palette, responsive, accessible, minimal JS

### Countdown Page (/countdown/)
- **Countdown Timer:** Days, hours, minutes, seconds until retirement (Feb 27, 2026)
- **Fun Metrics:** Weekends left, workdays, work hours, sleeps, sunrises, Mondays, Fridays
- **Progress Tracking:** Visual hourglass and thermometer animations
- **Milestones:** Achievement system as countdown progresses
- **Customizable Date:** Users can set their own retirement date (stored in localStorage)

## Security Features

The server implements:
- Rate limiting (100 requests/minute/IP)
- Path traversal protection with URL decoding
- Dotfile/dotdirectory blocking (.env, .git, etc.)
- File extension whitelist
- Subdirectory index.html resolution
- Security headers (X-Frame-Options, CSP, X-Content-Type-Options, etc.)
- HTTP method validation (GET/HEAD only)
