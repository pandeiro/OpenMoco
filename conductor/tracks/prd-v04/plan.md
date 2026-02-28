# Implementation Plan: Create PRD v0.4

## Track ID
`prd-v04`

## Source
`doc/plans/2026-02-27-v0.4-improvements.md` Task 2

## Priority
P0 (Critical) | Effort: Medium (~1 hour)

---

## Phase 1: Document Updates [checkpoint: cb65894]

### Task 1: Create PRD v0.4
- [x] Task: Create `doc/prd/openmoko-prd-v0.4.md`
    - [x] Copy v0.3 as base
    - [x] Update primary reformulation provider to Gemini 2.5 Flash (not Groq)
    - [x] Keep Ollama Cloud as fallback
    - [x] Document multi-arch Docker builds (optional via workflow_dispatch)
    - [x] Update architecture diagrams if needed

### Task 2: Document v0.4 Features
- [x] Task: Add new features to PRD
    - [x] OpenCode event capture plugin
    - [x] Docker health checks
    - [x] Graceful shutdown

---

## Phase 2: Status Tracking [checkpoint: cb65894]

### Task 3: Update Status Documents
- [x] Task: Create status tracking files — SKIPPED (using conductor instead)

### Task 4: Verify Accuracy
- [x] Task: Manual verification
    - [x] PRD accurately reflects current implementation
    - [x] No conflicting information between PRD and code
