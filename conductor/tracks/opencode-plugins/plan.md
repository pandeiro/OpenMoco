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
- [x] Task: Document plugin installation methods [e0f3cab]
    - [x] npm global install approach
    - [x] Local file approach (current moko-logger pattern)
    - [x] opencode.json plugin array approach

### Task 2: Evaluate opencode-notify
- [x] Task: Research opencode-notify requirements [0ae179d]
    - [x] Dependencies (does it need desktop environment?)
    - [x] Configuration options
    - [x] Compatibility with containerized OpenCode

### Task 3: Evaluate opencode-quota
- [x] Task: Research opencode-quota requirements [skipped]
    - Decision: User declined quota plugin - moko-logger already provides token tracking

---

## Phase 2: Implementation

### Task 4: Document Plugin Decisions
- [x] Task: Update documentation with plugin evaluation results
    - [x] Update skills-tools-spike.md with implementation notes
    - [x] Document that no additional plugins are needed
    - [x] Record reasoning for future reference

---

## Open Questions

1. ~~Desktop notifications in container?~~ - **ANSWERED:** opencode-notify requires desktop environment, not compatible
2. ~~Quota tracking utility?~~ - **ANSWERED:** moko-logger already covers token tracking, quota plugin not needed
3. ~~Plugin discovery~~ - **ANSWERED:** Documented in plugin-installation-methods.md

---

## Files to Modify

1. `Dockerfile` - Add plugin installation
2. `doc/research/skills-tools-spike.md` - Update with implementation notes
