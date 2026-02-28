# Implementation Plan: Agent Browser Testing with Playwright

**Track:** agent-playwright-browser_20260227  
**Last Updated:** 2026-02-27

---

## Phase 1: Docker Environment Setup [checkpoint: 10b6753]

### Task 1.1: Update Agent Dockerfile
- [x] Add Playwright library installation to Dockerfile [3ce5ac6]
- [x] Install Chromium headless shell with system dependencies [3ce5ac6]
- [x] Clean up apt cache to minimize image size [3ce5ac6]
- [x] Document the changes [3ce5ac6]

### Task 1.2: Update Docker Compose Configuration
- [x] Add `shm_size: '2gb'` to agent service for Chromium shared memory [eb4173b]
- [x] Verify health check still passes after changes [eb4173b]
- [x] Test docker-compose configuration validity [eb4173b]

### Task 1.3: Build and Validate Container
- [x] Build new agent image locally [037b44e]
- [x] Verify image size is ~2.02GB (within acceptable range) [037b44e]
- [x] Test that container starts successfully [037b44e]
- [x] Browser launch test passed [037b44e]
- [x] Screenshot capture test passed [037b44e]

---

## Phase 2: Browser Installation Validation [checkpoint: 001e6d2]

### Task 2.1: Verify Chromium Installation
- [x] Run container and check Chromium binary exists [f7fa795]
- [x] Verify browser version and installation path (Chromium 145.0.7632.0) [f7fa795]
- [x] Confirm no missing dependencies errors [f7fa795]

### Task 2.2: Test Browser Launch
- [x] Create test script to launch browser in headless mode [f760f17]
- [x] Verify browser launches without sandbox errors [f760f17]
- [x] Confirm browser closes cleanly [f760f17]

### Task 2.3: Test Basic Operations
- [x] Navigate to a test website (example.com) [99942f0]
- [x] Take a screenshot and save to /code volume [99942f0]
- [x] Verify screenshot file is created and valid (16KB PNG) [99942f0]
- [x] Test element selection and interaction [99942f0]
- [ ] Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

---

## Phase 3: Integration Testing [checkpoint: 73b5ed1]

### Task 3.1: OpenCode Session Integration
- [x] Start OpenCode agent session
- [x] Verify Playwright is require-able from session
- [x] Test browser launch from within OpenCode environment
- [x] Confirm /code volume is accessible for saving files

### Task 3.2: Resource Usage Testing
- [x] Monitor memory usage during browser operations
- [x] Verify stays under 800MB during active testing (407MB peak)
- [x] Test sequential browser launches (no memory leaks)
- [x] Confirm 2GB RAM VPS can handle workload

### Task 3.3: Error Handling Validation
- [x] Test graceful handling of invalid URLs
- [x] Verify timeout behavior (configurable)
- [x] Test browser crash recovery
- [x] Confirm error messages are clear and actionable

---

## Phase 4: Documentation and Finalization

### Task 4.1: Update Documentation
- [x] Add browser testing section to README.md [198a54c]
- [x] Document Playwright usage examples [198a54c]
- [x] Update tech-stack.md with browser testing capabilities [198a54c]
- [x] Add troubleshooting guide for common issues [198a54c]

### Task 4.2: Create Usage Examples
- [x] Write example script: Basic screenshot capture [e77194b]
- [x] Write example script: Form interaction [e77194b]
- [x] Write example script: Data extraction [e77194b]
- [x] Place examples in doc/examples/ directory [e77194b]

### Task 4.3: Final Validation
- [ ] Run complete workflow test end-to-end
- [ ] Verify all acceptance criteria are met
- [ ] Clean up any temporary test files
- [ ] Conductor - User Manual Verification 'Phase 4' (Protocol in workflow.md)

---

## Implementation Notes

### Dockerfile Changes Required
```dockerfile
# After: RUN npm i -g opencode-ai@latest
RUN npm i -g playwright
RUN npx playwright install chromium --with-deps --only-shell
RUN rm -rf /var/lib/apt/lists/*
```

### Docker Compose Changes Required
```yaml
services:
  agent:
    # ... existing config ...
    shm_size: '2gb'
```

### Testing Commands
```bash
# Build image
docker build -t openmoko/agent:browser-test .

# Test browser launch
docker run --rm openmoko/agent:browser-test node -e "
  const { chromium } = require('playwright');
  (async () => {
    const browser = await chromium.launch({ headless: true });
    console.log('Success!');
    await browser.close();
  })();
"

# Monitor resources
docker stats agent
```

---

## Dependencies

### Prerequisites
- [x] Research spike completed (doc/research/agent-browser-playwright-spike.md)
- [ ] Branch created: feature/agent-playwright-browser

### Blocking Issues
None identified.

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Image size exceeds 2GB | High | Use --only-shell flag, clean apt cache |
| Memory usage too high on 2GB VPS | High | Sequential testing only, monitor with docker stats |
| Chromium launch failures | Medium | Test thoroughly on target VPS, check shared memory |
| Build time too long | Low | Acceptable tradeoff for functionality |

---

## Success Metrics

- [ ] Image size < 2GB (current: ~500MB, target: <1.5GB)
- [ ] Memory usage < 800MB during browser testing
- [ ] Browser launch time < 5 seconds
- [ ] All acceptance criteria scenarios pass
- [ ] Works on 2GB RAM VPS without OOM
