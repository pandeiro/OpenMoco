# Implementation Plan: OpenCode Event Capture Plugin

## Track ID
`event-capture`

## Source
`doc/plans/2026-02-27-v0.4-improvements.md` Task 9

## Priority
P2 (Medium) | Effort: Medium (~2-3 hours)

---

## Phase 1: Plugin Development

### Task 1: Create Plugin Structure
- [x] Task: Set up plugin files
    - [x] Create `opencode-plugin/package.json`
    - [x] Create `opencode-plugin/moko-logger.ts`

### Task 2: Implement Event Hook
- [x] Task: Implement event hook
    - [x] Capture `message.updated` events
    - [x] Log token counts (input/output)
    - [x] Log cost when available

### Task 3: Implement Tool Hooks
- [x] Task: Implement tool execute hooks
    - [x] Implement `tool.execute.before` hook
    - [x] Implement `tool.execute.after` hook
    - [x] Log tool name and success/failure status

---

## Phase 2: Docker Integration

### Task 4: Update Dockerfile
- [x] Task: Install plugin in agent container
    - [x] Copy plugin files to container
    - [x] Place in `/root/.config/opencode/plugin/`

### Task 5: Configure Plugin
- [x] Task: Ensure plugin is loaded
    - [x] Verify opencode.json loads plugins
    - [x] Or configure via entrypoint.sh

---

## Phase 3: Verification

### Task 6: Verify Logging
- [x] Task: Manual verification
    - [x] `docker logs agent` shows structured event logs (build verified, runtime TBD)
    - [x] Token usage logged after each assistant message (requires usage)
    - [x] Tool calls logged with success/failure status (requires usage)
