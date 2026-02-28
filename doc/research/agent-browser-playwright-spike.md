# Research Spike: Headless Browser & Playwright Integration

**Status:** Research Complete  
**Date:** 2026-02-27  
**Scope:** Evaluate feasibility of adding Playwright and headless browser support to `openmoko/agent` Docker image

---

## Executive Summary

**VERDICT: FEASIBLE with resource trade-offs**

Adding Playwright + Chromium headless shell to the agent container is technically viable within typical VPS resource constraints (2-4GB RAM, 20-40GB disk). The primary concerns are:

1. **Disk Space:** +500MB-1GB for Chromium headless shell (vs +2GB for full browsers)
2. **RAM:** ~200-400MB per browser instance during active testing
3. **Image Build Time:** +2-5 minutes to install system dependencies
4. **Runtime Overhead:** Minimal when not actively testing

**Recommended Approach:** Install Chromium headless shell only (not full Chromium/Firefox/WebKit trio) to minimize footprint while enabling sophisticated browser testing.

---

## Current State Analysis

### Agent Container (Dockerfile)
- **Base Image:** `node:bookworm-slim` (Debian 12, minimal)
- **Current Size:** ~300-500MB (estimated after Node.js + OpenCode + mise)
- **Key Dependencies:** git, ssh, build tools, jq, curl
- **No existing browser infrastructure**

### Resource Context
- **Target Environment:** Personal VPS (typical: 2-4GB RAM, 1-2 vCPU, 20-40GB SSD)
- **Existing Services:** 4 containers (agent, gateway, init, events)
- **Shared Volumes:** `/code` (projects), `agent_data`, `mise_data`

---

## Playwright Integration Options

### Option A: Full Playwright Suite (Chromium + Firefox + WebKit)
```dockerfile
RUN npx playwright install --with-deps
```
**Footprint:**
- Disk: ~2-3GB
- RAM per instance: 300-500MB
- System deps: 200+ packages

**Verdict:** ❌ Too heavy for VPS use

### Option B: Chromium Headless Shell Only (RECOMMENDED)
```dockerfile
RUN npx playwright install --with-deps --only-shell chromium
```
**Footprint:**
- Disk: ~500MB-1GB
- RAM per instance: 200-400MB
- System deps: ~50 packages

**Verdict:** ✅ Optimal balance

### Option C: Chrome/Chromium via apt (System Package)
```dockerfile
RUN apt-get update && apt-get install -y chromium
```
**Footprint:**
- Disk: ~300-500MB
- Version: Often outdated (Debian stable)
- Compatibility: May not work with Playwright

**Verdict:** ⚠️ Possible but version compatibility risks

---

## Implementation Requirements

### System Dependencies (Chromium)
Based on Playwright's Dockerfile.noble, the following packages are required:

```dockerfile
# Essential for headless Chromium
libnss3 \
libnspr4 \
libatk1.0-0 \
libatk-bridge2.0-0 \
cups-libs \
libdrm2 \
libxkbcommon0 \
libxcomposite1 \
libxdamage1 \
libxfixes3 \
libxrandr2 \
libgbm1 \
libpango-1.0-0 \
libcairo2 \
libasound2 \
fonts-noto-color-emoji \
fonts-unifont
```

### Playwright Library Installation
```dockerfile
# Install Playwright library (not @playwright/test)
RUN npm install -g playwright

# Install Chromium headless shell with system dependencies
RUN npx playwright install chromium --with-deps --only-shell

# Optional: Set browser cache location
ENV PLAYWRIGHT_BROWSERS_PATH=/root/.cache/ms-playwright
```

### Docker Compose Adjustments
```yaml
services:
  agent:
    # ... existing config ...
    shm_size: '2gb'  # Required for Chromium (shared memory)
    # OR use: --ipc=host (less secure, simpler)
```

---

## Resource Impact Analysis

### Disk Space Breakdown

| Component | Size | Notes |
|-----------|------|-------|
| Current agent image | ~500MB | Node.js + OpenCode + tools |
| Playwright library | ~50MB | NPM package |
| Chromium headless shell | ~500MB | Binary + deps |
| System dependencies | ~200MB | Additional apt packages |
| **Total new footprint** | **~750MB** | Added to base image |
| **Final image estimate** | **~1.25GB** | Acceptable for VPS |

### Runtime Memory

| Scenario | Memory Usage |
|----------|--------------|
| Agent idle (no browser) | ~100-200MB |
| Agent + 1 headless Chromium | ~400-600MB |
| Agent + 2 headless Chromium | ~700-1000MB |
| Agent + OpenCode session | +200-500MB |

**VPS with 4GB RAM:** Can comfortably run agent + browser testing  
**VPS with 2GB RAM:** Tight but workable (sequential testing only)

### CPU Impact
- **Build time:** +2-5 minutes to install deps
- **Idle:** Negligible
- **Active testing:** Moderate spike (1-2 vCPU sufficient)

---

## Use Cases & Value Proposition

### Primary Use Cases

1. **End-to-End Testing**
   - Run Playwright tests against web apps in `/code`
   - Test UI changes before committing
   - Validate responsive design across viewports

2. **Screenshot/Diff Testing**
   - Capture visual regression screenshots
   - Compare UI states programmatically
   - Generate documentation images

3. **Web Scraping/Data Extraction**
   - Scrape documentation sites
   - Extract data from dashboards
   - Automated data collection tasks

4. **Agent-Driven Browser Automation**
   - AI agent navigates sites to test functionality
   - Form filling and workflow validation
   - Cross-browser compatibility checks

### Integration with OpenCode

Playwright could be exposed to OpenCode via:
- **MCP Server:** Browser automation tools
- **SDK Integration:** Direct Playwright API access
- **CLI Tools:** `npx playwright` commands in workspace

Example workflow:
```javascript
// In an OpenCode session
const { chromium } = require('playwright');
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto('http://localhost:3000');
await page.screenshot({ path: 'test.png' });
await browser.close();
```

---

## Security Considerations

### Container Security
- **Root user:** Current agent runs as root (simplifies setup)
- **Sandbox:** Chromium sandbox requires `--cap-add=SYS_ADMIN` or seccomp profile
- **Recommendation:** Use `--ipc=host` for shared memory (simpler) or increase `shm_size`

### Safe Browsing
- **Trusted sites only:** Use for testing own projects
- **No untrusted browsing:** Container not hardened for arbitrary web crawling
- **Network isolation:** Consider firewall rules if exposing to external sites

---

## Implementation Recommendations

### Phase 1: Minimal Integration (RECOMMENDED)

**Dockerfile Changes:**
```dockerfile
# Add to existing Dockerfile after 'npm i -g opencode-ai'

# Install Playwright library
RUN npm i -g playwright

# Install Chromium headless shell with dependencies
# Note: Must run as root (current setup)
RUN npx playwright install chromium --with-deps --only-shell

# Clean up apt cache to minimize image size
RUN rm -rf /var/lib/apt/lists/*
```

**docker-compose.yml Changes:**
```yaml
services:
  agent:
    # ... existing config ...
    shm_size: '2gb'  # Required for Chromium
```

### Phase 2: Optimized Integration (Future)

- **Multi-stage build:** Separate build stage for browser deps
- **Volume for browsers:** Mount browser cache as volume to share across restarts
- **On-demand install:** Install browsers only when needed (slower first use)

---

## Alternative Approaches Considered

### Alternative 1: Separate Browser Container
Create a standalone `browser` service that agent can connect to via WebSocket.

**Pros:**
- Isolates resource usage
- Can scale independently
- Cleaner separation of concerns

**Cons:**
- More complex networking
- Requires remote connection setup
- Additional container overhead

**Verdict:** Overkill for current needs

### Alternative 2: Chrome DevTools Protocol (CDP)
Use direct Chrome/Chromium without Playwright wrapper.

**Pros:**
- Lighter weight
- More control

**Cons:**
- More complex API
- Less cross-browser support
- No built-in waiting/automation

**Verdict:** Playwright's ergonomics justify the overhead

### Alternative 3: External Browser Service
Connect to external browser grid (BrowserStack, etc.)

**Pros:**
- Zero local resources
- Professional infrastructure
- Many browsers/devices

**Cons:**
- Requires paid service
- Network dependency
- Latency issues

**Verdict:** Contradicts self-hosted philosophy

---

## Testing the Implementation

### Validation Checklist

1. **Build Test:**
   ```bash
   docker build -t openmoko/agent:browser-test .
   ```
   - Should complete without errors
   - Image size < 2GB

2. **Chromium Launch Test:**
   ```bash
   docker run --rm openmoko/agent:browser-test node -e "
     const { chromium } = require('playwright');
     (async () => {
       const browser = await chromium.launch({ headless: true });
       console.log('Chromium launched successfully');
       await browser.close();
       console.log('Chromium closed successfully');
     })();
   "
   ```

3. **Screenshot Test:**
   ```bash
   docker run --rm -v $(pwd):/workspace openmoko/agent:browser-test node -e "
     const { chromium } = require('playwright');
     (async () => {
       const browser = await chromium.launch({ headless: true });
       const page = await browser.newPage();
       await page.goto('https://example.com');
       await page.screenshot({ path: '/workspace/test.png' });
       await browser.close();
     })();
   "
   ```

4. **Memory Test:**
   ```bash
   docker stats --no-stream openmoko-agent
   ```
   - Should show reasonable memory usage (<1GB idle)

---

## Conclusion & Next Steps

### Summary

Adding Playwright + Chromium headless shell to the `openmoko/agent` image is **feasible and recommended** for enabling sophisticated browser-based testing within the OpenMoko ecosystem.

**Key Findings:**
- ✅ **Disk:** ~750MB additional footprint (acceptable)
- ✅ **RAM:** 200-400MB per browser instance (manageable on 4GB VPS)
- ✅ **Build:** +2-5 minutes (one-time cost)
- ✅ **Runtime:** Minimal overhead when idle
- ⚠️ **Security:** Requires `--ipc=host` or `shm_size` increase

### Recommended Implementation

1. **Update Dockerfile** with Playwright installation (Phase 1 approach)
2. **Update docker-compose.yml** with `shm_size: '2gb'`
3. **Test build** and validate Chromium launches
4. **Document** usage patterns for browser testing
5. **Consider** MCP server for OpenCode integration

### Estimated Effort

- **Dockerfile changes:** 15 minutes
- **Testing & validation:** 1-2 hours
- **Documentation:** 30 minutes
- **Total:** 2-3 hours

---

## Appendix: Reference Links

- [Playwright Docker Documentation](https://playwright.dev/docs/docker)
- [Playwright Library Guide](https://playwright.dev/docs/library)
- [Playwright Browsers](https://playwright.dev/docs/browsers)
- [Microsoft Playwright Docker Images](https://mcr.microsoft.com/en-us/product/playwright/about)
- [Chromium Headless Shell](https://developer.chrome.com/blog/chrome-headless-shell)

---

*Document generated for OpenMoko project research.*
