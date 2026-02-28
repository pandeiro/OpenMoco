# Implementation Plan: Agent Browser Testing with Playwright

**Track:** agent-playwright-browser_20260227  
**Last Updated:** 2026-02-27

---

## Phase 1: Docker Environment Setup

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
- [ ] Build new agent image locally
- [ ] Verify image size is under 2GB
- [ ] Test that container starts successfully
- [ ] Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

---

## Phase 2: Browser Installation Validation

### Task 2.1: Verify Chromium Installation
- [ ] Run container and check Chromium binary exists
- [ ] Verify browser version and installation path
- [ ] Confirm no missing dependencies errors

### Task 2.2: Test Browser Launch
- [ ] Create test script to launch browser in headless mode
- [ ] Verify browser launches without sandbox errors
- [ ] Confirm browser closes cleanly

### Task 2.3: Test Basic Operations
- [ ] Navigate to a test website (example.com)
- [ ] Take a screenshot and save to /code volume
- [ ] Verify screenshot file is created and valid
- [ ] Test element selection and interaction
- [ ] Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

---

## Phase 3: Integration Testing

### Task 3.1: OpenCode Session Integration
- [ ] Start OpenCode agent session
- [ ] Verify Playwright is require-able from session
- [ ] Test browser launch from within OpenCode environment
- [ ] Confirm /code volume is accessible for saving files

### Task 3.2: Resource Usage Testing
- [ ] Monitor memory usage during browser operations
- [ ] Verify stays under 800MB during active testing
- [ ] Test sequential browser launches (no memory leaks)
- [ ] Confirm 2GB RAM VPS can handle workload

### Task 3.3: Error Handling Validation
- [ ] Test graceful handling of invalid URLs
- [ ] Verify timeout behavior (30s default)
- [ ] Test browser crash recovery
- [ ] Confirm error messages are clear and actionable
- [ ] Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)

---

## Phase 4: Documentation and Finalization

### Task 4.1: Update Documentation
- [ ] Add browser testing section to README.md
- [ ] Document Playwright usage examples
- [ ] Update tech-stack.md with browser testing capabilities
- [ ] Add troubleshooting guide for common issues

### Task 4.2: Create Usage Examples
- [ ] Write example script: Basic screenshot capture
- [ ] Write example script: Form interaction
- [ ] Write example script: Data extraction
- [ ] Place examples in doc/examples/ directory

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
