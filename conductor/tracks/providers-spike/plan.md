# Implementation Plan: OpenCode Go/Zen API Key Integration Spike

## Track ID
`providers-spike`

## Source
`doc/plans/2026-02-27-v0.4-improvements.md` Task 11

## Priority
P3 (Low) | Effort: Research only (~1 hour)

---

## Phase 1: Research

### Task 1: Research Config Structure
- [x] Task: Investigate opencode.json format
    - [x] How does `~/.config/opencode/opencode.json` store provider configs?
    - [x] What fields are required for a custom provider?

### Task 2: Research Environment Variables
- [x] Task: Investigate env var patterns
    - [x] Do these providers expect specific env var names?
    - [x] Can we inject via `entrypoint.sh`?

### Task 3: Research OpenCode Go
- [x] Task: Document OpenCode Go provider
    - [x] Provider ID and configuration format
    - [x] Base URL and model names

### Task 4: Research OpenCode Zen
- [x] Task: Document OpenCode Zen provider
    - [x] Provider ID and configuration format
    - [x] Base URL and model names

---

## Phase 2: Documentation

### Task 5: Create Spike Report
- [x] Task: Document findings
    - [x] Create `doc/research/opencode-providers-spike.md`
    - [x] Document exact config format for each provider
    - [x] Update `.env.example` with new optional keys

### Task 6: Update Entrypoint (Optional)
- [x] Task: Update entrypoint.sh if feasible
    - [x] Add conditional provider setup for OPENCODE_GO_API_KEY
    - [x] Add conditional provider setup for OPENCODE_ZEN_API_KEY
