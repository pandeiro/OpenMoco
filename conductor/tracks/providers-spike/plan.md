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
- [ ] Task: Investigate opencode.json format
    - [ ] How does `~/.config/opencode/opencode.json` store provider configs?
    - [ ] What fields are required for a custom provider?

### Task 2: Research Environment Variables
- [ ] Task: Investigate env var patterns
    - [ ] Do these providers expect specific env var names?
    - [ ] Can we inject via `entrypoint.sh`?

### Task 3: Research OpenCode Go
- [ ] Task: Document OpenCode Go provider
    - [ ] Provider ID and configuration format
    - [ ] Base URL and model names

### Task 4: Research OpenCode Zen
- [ ] Task: Document OpenCode Zen provider
    - [ ] Provider ID and configuration format
    - [ ] Base URL and model names

---

## Phase 2: Documentation

### Task 5: Create Spike Report
- [ ] Task: Document findings
    - [ ] Create `doc/research/opencode-providers-spike.md`
    - [ ] Document exact config format for each provider
    - [ ] Update `.env.example` with new optional keys

### Task 6: Update Entrypoint (Optional)
- [ ] Task: Update entrypoint.sh if feasible
    - [ ] Add conditional provider setup for OPENCODE_GO_API_KEY
    - [ ] Add conditional provider setup for OPENCODE_ZEN_API_KEY
