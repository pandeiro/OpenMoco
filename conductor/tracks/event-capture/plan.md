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
- [ ] Task: Set up plugin files
    - [ ] Create `opencode-plugin/package.json`
    - [ ] Create `opencode-plugin/moko-logger.ts`

### Task 2: Implement Event Hook
- [ ] Task: Implement event hook
    - [ ] Capture `message.updated` events
    - [ ] Log token counts (input/output)
    - [ ] Log cost when available

### Task 3: Implement Tool Hooks
- [ ] Task: Implement tool execute hooks
    - [ ] Implement `tool.execute.before` hook
    - [ ] Implement `tool.execute.after` hook
    - [ ] Log tool name and success/failure status

---

## Phase 2: Docker Integration

### Task 4: Update Dockerfile
- [ ] Task: Install plugin in agent container
    - [ ] Copy plugin files to container
    - [ ] Place in `/root/.config/opencode/plugin/`

### Task 5: Configure Plugin
- [ ] Task: Ensure plugin is loaded
    - [ ] Verify opencode.json loads plugins
    - [ ] Or configure via entrypoint.sh

---

## Phase 3: Verification

### Task 6: Verify Logging
- [ ] Task: Manual verification
    - [ ] `docker logs agent` shows structured event logs
    - [ ] Token usage logged after each assistant message
    - [ ] Tool calls logged with success/failure status
