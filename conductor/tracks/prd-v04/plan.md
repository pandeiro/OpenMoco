# Implementation Plan: Create PRD v0.4

## Track ID
`prd-v04`

## Source
`doc/plans/2026-02-27-v0.4-improvements.md` Task 2

## Priority
P0 (Critical) | Effort: Medium (~1 hour)

---

## Phase 1: Document Updates

### Task 1: Create PRD v0.4
- [ ] Task: Create `doc/prd/openmoko-prd-v0.4.md`
    - [ ] Copy v0.3 as base
    - [ ] Update primary reformulation provider to Gemini 2.5 Flash (not Groq)
    - [ ] Keep Ollama Cloud as fallback
    - [ ] Document multi-arch Docker builds (optional via workflow_dispatch)
    - [ ] Update architecture diagrams if needed

### Task 2: Document v0.4 Features
- [ ] Task: Add new features to PRD
    - [ ] OpenCode event capture plugin
    - [ ] Docker health checks
    - [ ] Graceful shutdown

---

## Phase 2: Status Tracking

### Task 3: Update Status Documents
- [ ] Task: Create status tracking files
    - [ ] Create `doc/status/v0.3-completion.md` (mark as complete)
    - [ ] Create `doc/status/v0.4-progress.md` for tracking

### Task 4: Verify Accuracy
- [ ] Task: Manual verification
    - [ ] PRD accurately reflects current implementation
    - [ ] No conflicting information between PRD and code
