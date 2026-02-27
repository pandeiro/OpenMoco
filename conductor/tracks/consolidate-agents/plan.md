# Implementation Plan: Consolidate Agent Documentation

## Track ID
`consolidate-agents`

## Source
`doc/plans/2026-02-27-v0.4-improvements.md` Task 8

## Priority
P3 (Low) | Effort: Small (~30 min)

---

## Phase 1: Content Review

### Task 1: Compare Files
- [ ] Task: Review AGENTS.md and GEMINI.md
    - [ ] Identify overlapping content
    - [ ] Identify unique content in each file
    - [ ] Determine what to keep

---

## Phase 2: Consolidation

### Task 2: Update AGENTS.md
- [ ] Task: Enhance AGENTS.md
    - [ ] Add section on OpenCode event capture plugin
    - [ ] Reference v0.4 improvements plan
    - [ ] Clarify provider configuration (Gemini primary)

### Task 3: Create Symlink
- [ ] Task: Replace GEMINI.md with symlink
    - [ ] Delete GEMINI.md
    - [ ] Create symlink: `ln -s AGENTS.md GEMINI.md`

---

## Phase 3: Verification

### Task 4: Verify Consolidation
- [ ] Task: Manual verification
    - [ ] `cat GEMINI.md` shows same content as `AGENTS.md`
    - [ ] Both files tracked correctly by git
