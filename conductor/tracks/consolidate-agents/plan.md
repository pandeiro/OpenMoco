# Implementation Plan: Consolidate Agent Documentation

## Track ID
`consolidate-agents`

## Source
`doc/plans/2026-02-27-v0.4-improvements.md` Task 8

## Priority
P3 (Low) | Effort: Small (~30 min)

---

## Phase 1: Content Review [checkpoint: n/a]

### Task 1: Compare Files
- [x] Task: Review AGENTS.md and GEMINI.md
    - [x] Identify overlapping content
    - [x] Identify unique content in each file (GEMINI.md is subset)
    - [x] Determine what to keep (AGENTS.md is source)

---

## Phase 2: Consolidation [checkpoint: n/a]

### Task 2: Update AGENTS.md
- [x] Task: Enhance AGENTS.md
    - [x] Clarify provider configuration (Gemini 2.5 Flash primary)
    - [x] Update PRD reference to v0.4

### Task 3: Create Symlink
- [x] Task: Replace GEMINI.md with symlink
    - [x] Delete GEMINI.md
    - [x] Create symlink: `ln -s AGENTS.md GEMINI.md`

---

## Phase 3: Verification [checkpoint: n/a]

### Task 4: Verify Consolidation
- [x] Task: Manual verification
    - [x] `cat GEMINI.md` shows same content as `AGENTS.md`
    - [x] Symlink created: GEMINI.md -> AGENTS.md
