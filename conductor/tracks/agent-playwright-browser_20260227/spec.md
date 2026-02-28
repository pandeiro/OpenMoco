# Track: Agent Browser Testing with Playwright

**Track ID:** agent-playwright-browser_20260227  
**Type:** Feature  
**Status:** In Progress  
**Created:** 2026-02-27

---

## Overview

Enable the OpenMoko agent container to run sophisticated browser-based testing by integrating Playwright with Chromium headless shell. This allows the AI agent to programmatically navigate websites, capture screenshots, test functionality, and perform web scraping tasks.

### Success Criteria
- [ ] Playwright library installed globally in agent container
- [ ] Chromium headless shell browser available
- [ ] Agent can launch browser and navigate to websites
- [ ] Works within 2GB RAM VPS constraint
- [ ] Image size increase under 1GB

---

## Functional Requirements

### Core Browser Capabilities
1. **Browser Launch**: Agent can launch Chromium in headless mode
2. **Page Navigation**: Navigate to URLs and wait for page load
3. **Screenshot Capture**: Take full-page or element screenshots
4. **Element Interaction**: Click, type, scroll, and interact with page elements
5. **Content Extraction**: Extract text, HTML, and data from pages
6. **Network Monitoring**: Intercept and monitor HTTP requests/responses

### Resource Constraints
- **Memory**: Must work on VPS with 2GB RAM (single browser instance at a time)
- **Disk**: Total image size increase < 1GB
- **CPU**: Moderate usage, compatible with 1-2 vCPU

### Use Case: Agent-Driven Automation
The primary use case is enabling the AI agent to:
- Test web applications by simulating user interactions
- Verify UI functionality across different states
- Extract documentation or data from websites
- Validate responsive design at different viewports
- Debug frontend issues by inspecting DOM

---

## Non-Functional Requirements

### Performance
- Browser launch time < 5 seconds
- Page navigation timeout configurable (default: 30s)
- Screenshot capture < 2 seconds

### Security
- Container runs as root (existing setup)
- Browser sandbox disabled (required for root user)
- Trusted sites only - not hardened for arbitrary web crawling
- No persistent browser data between sessions

### Reliability
- Graceful handling of browser crashes
- Automatic cleanup of browser processes on container stop
- Clear error messages for common failures (network, timeouts)

---

## Out of Scope

The following are explicitly excluded from this initial implementation:

1. **Firefox and WebKit browsers** - Chromium-only for minimal footprint
2. **Headed mode (GUI browser)** - Headless only to save resources
3. **Video recording** - Screenshots only, no video capture capability
4. **Parallel test execution** - Sequential browser operations only (2GB RAM constraint)
5. **Multi-architecture browser builds** - x86_64 only initially
6. **MCP Server integration** - Direct Playwright library usage only
7. **Per-project Playwright versions** - Global installation only
8. **Mobile device emulation** - Desktop viewport testing only

---

## Acceptance Criteria

### Scenario 1: Basic Browser Launch
```javascript
const { chromium } = require('playwright');
const browser = await chromium.launch({ headless: true });
console.log('Browser launched successfully');
await browser.close();
```
**Expected:** Browser launches without error, no sandbox warnings

### Scenario 2: Screenshot Capture
```javascript
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto('https://example.com');
await page.screenshot({ path: '/code/test-screenshot.png' });
await browser.close();
```
**Expected:** Screenshot saved to filesystem, image is valid

### Scenario 3: Agent Can Access Playwright
In an OpenCode session:
```javascript
const playwright = require('playwright');
console.log('Playwright version:', playwright.chromium.version());
```
**Expected:** Returns version string without errors

### Scenario 4: Resource Usage
During active browser testing:
- Memory usage stays under 800MB total (agent + browser)
- No OOM kills on 2GB RAM VPS

---

## Technical Notes

### Implementation Approach
- Install Playwright as global NPM package
- Install Chromium headless shell with `--only-shell` flag
- Add system dependencies for headless browser operation
- Configure Docker shared memory (`shm_size`) for Chromium

### Browser Binary Location
Browsers installed to: `/root/.cache/ms-playwright/`

### Key Dependencies
- `libnss3`, `libnspr4` - Network Security Services
- `libatk1.0-0`, `libatk-bridge2.0-0` - Accessibility
- `libgbm1` - Generic Buffer Management (required for headless)
- `libxkbcommon0`, `libxcomposite1` - X11 libraries
- `fonts-noto-color-emoji` - Emoji font support

---

## Related Documents
- Research Spike: `doc/research/agent-browser-playwright-spike.md`
- Agent Dockerfile: `Dockerfile`
- Docker Compose: `docker-compose.yml`
