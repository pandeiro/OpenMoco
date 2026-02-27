# Implementation Plan: Graceful Shutdown

## Track ID
`graceful-shutdown`

## Source
`doc/plans/2026-02-27-v0.4-improvements.md` Task 7

## Priority
P2 (Medium) | Effort: Small (~20 min)

---

## Phase 1: Implementation

### Task 1: Add Shutdown Handlers
- [x] Task: Add SIGTERM/SIGINT handlers to server.js
    - [x] Handle SIGTERM signal
    - [x] Handle SIGINT signal
    - [x] Close HTTP server gracefully
    - [x] Add 10s force-close timeout

---

## Phase 2: Verification [checkpoint: cc55a0c]

### Task 2: Verify Graceful Shutdown
- [x] Task: Manual verification
    - [x] `docker compose restart events` logs graceful shutdown
    - [x] No abrupt connection terminations
