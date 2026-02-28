# Implementation Plan: Frontend Console Log Exporter

## Phase 1: Backend (Nginx Configuration)

- [ ] Task: Add `/api/logs` endpoint to nginx.conf
    - [ ] Create new location block for `POST /api/logs` in `gateway/nginx.conf`
    - [ ] Configure nginx to read POST body and write to stdout using `access_log`
    - [ ] Return `204 No Content` response to client
    - [ ] Test with curl to verify logs appear in `docker logs`

- [ ] Task: Conductor - User Manual Verification 'Backend (Nginx Configuration)' (Protocol in workflow.md)

## Phase 2: Frontend (Logger Utility)

- [ ] Task: Create frontend logger module
    - [ ] Create `init/src/lib/logger.js` with console override logic
    - [ ] Implement `sendLog(level, ...args)` function with JSON structure
    - [ ] Use `navigator.sendBeacon()` with `fetch()` fallback
    - [ ] Handle multi-argument console calls and object serialization

- [ ] Task: Override native console methods
    - [ ] Store references to original `console.log`, `console.warn`, `console.error`
    - [ ] Replace with wrapped versions that call original + `sendLog()`
    - [ ] Ensure errors in log sending are caught silently

- [ ] Task: Initialize logger on app startup
    - [ ] Import and execute logger setup in `init/src/main.js` (or entry point)
    - [ ] Verify logs are sent before page unload

- [ ] Task: Conductor - User Manual Verification 'Frontend (Logger Utility)' (Protocol in workflow.md)

## Phase 3: Integration & Verification

- [ ] Task: End-to-end verification
    - [ ] Rebuild Docker containers with new nginx config
    - [ ] Open PWA in browser and trigger console logs
    - [ ] Run `docker logs <init-container>` and verify frontend logs appear
    - [ ] Confirm logs are JSON structured with `"source":"frontend"`

- [ ] Task: Conductor - User Manual Verification 'Integration & Verification' (Protocol in workflow.md)
