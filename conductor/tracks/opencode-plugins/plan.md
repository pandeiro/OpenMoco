# Implementation Plan: OpenCode Plugins

## Track ID
`opencode-plugins`

## Source
Follow-up from `skills-spike` - Recommended plugins

## Priority
P3 (Low) | Effort: ~1 hour

---

## Background

The skills-spike identified several plugins that would enhance OpenCode's capabilities. We already implemented `moko-logger` for event capture.

---

## Recommended Plugins

### High Priority

| Plugin | Purpose | Stars |
|--------|---------|-------|
| **opencode-notify** | Desktop notifications when tasks complete | 78 |
| **opencode-quota** | Token usage tracking | 46 |

### Already Implemented

| Plugin | Purpose |
|--------|---------|
| **moko-logger** | Event logging (tokens, tools) |

---

## Phase 1: Research

### Task 1: Research Plugin Installation
- [x] Task: Document plugin installation methods
    - [x] npm global install approach
    - [x] Local file approach (current moko-logger pattern)
    - [x] opencode.json plugin array approach

### Task 2: Evaluate opencode-notify
- [ ] Task: Research opencode-notify requirements
    - [ ] Dependencies (does it need desktop environment?)
    - [ ] Configuration options
    - [ ] Compatibility with containerized OpenCode

### Task 3: Evaluate opencode-quota
- [ ] Task: Research opencode-quota requirements
    - [ ] How it tracks usage
    - [ ] Output format (logs? API?)
    - [ ] Integration with moko-logger

---

## Phase 2: Implementation

### Task 4: Add Selected Plugins
- [ ] Task: Install chosen plugins
    - [ ] Add to Dockerfile or entrypoint.sh
    - [ ] Configure in opencode.json if needed
    - [ ] Document in README

---

## Open Questions

1. **Desktop notifications in container?** - `opencode-notify` may not work in headless container. Need to verify.
2. **Quota tracking utility?** - If `opencode-quota` overlaps with `moko-logger`, we may not need both.
3. **Plugin discovery** - Should we use npm install or copy local files?

---

## Files to Modify

1. `Dockerfile` - Add plugin installation
2. `doc/research/skills-tools-spike.md` - Update with implementation notes
