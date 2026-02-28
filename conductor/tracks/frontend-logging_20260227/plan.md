# Implementation Plan: Frontend Console Log Exporter

## Phase 1: Backend (Nginx Configuration)

- [x] Task: Add `/api/logs` endpoint to nginx.conf [38bc59d]
    - [x] Create new location block for `POST /api/logs` in `gateway/nginx.conf`
    - [x] Configure nginx to read POST body and write to stdout using `access_log`
    - [x] Return `204 No Content` response to client
    - [ ] Test with curl to verify logs appear in `docker logs`

- [ ] Task: Conductor - User Manual Verification 'Backend (Nginx Configuration)' (Protocol in workflow.md)

## Phase 2: Frontend (Logger Utility) [checkpoint: be6ed0f]

- [x] Task: Create frontend logger module [765b9b3]
    - [x] Create `init/src/lib/logger.js` with console override logic
    - [x] Implement `sendLog(level, ...args)` function with JSON structure
    - [x] Use `navigator.sendBeacon()` with `fetch()` fallback
    - [x] Handle multi-argument console calls and object serialization

- [x] Task: Override native console methods [765b9b3]
    - [x] Store references to original `console.log`, `console.warn`, `console.error`
    - [x] Replace with wrapped versions that call original + `sendLog()`
    - [x] Ensure errors in log sending are caught silently

- [x] Task: Initialize logger on app startup [765b9b3]
    - [x] Import and execute logger setup in `init/src/main.js` (or entry point)
    - [x] Verify logs are sent before page unload

- [ ] Task: Conductor - User Manual Verification 'Frontend (Logger Utility)' (Protocol in workflow.md)

## Phase 3: Integration & Verification [checkpoint: b940d75]

- [x] Task: End-to-end verification
    - [x] Rebuild Docker containers with new nginx config
    - [x] Open PWA in browser and trigger console logs
    - [x] Run `docker logs <init-container>` and verify frontend logs appear
    - [x] Confirm logs are JSON structured with `"source":"frontend"`

- [ ] Task: Conductor - User Manual Verification 'Integration & Verification' (Protocol in workflow.md)
