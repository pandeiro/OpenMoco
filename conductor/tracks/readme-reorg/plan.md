# Implementation Plan: README Reorganization & Deployment Docs

## Track ID
`readme-reorg`

## Source
`doc/plans/2026-02-27-v0.4-improvements.md` Task 4

## Priority
P1 (High) | Effort: Medium (~1 hour)

---

## Phase 1: Structure Planning [checkpoint: n/a]

### Task 1: Plan New Structure
- [x] Task: Outline new README structure
    - [x] Header + Screenshot
    - [x] Quick Setup (streamlined)
    - [x] Architecture (brief)
    - [x] Configuration (Env vars, Webhooks)
    - [x] Deployment (Local, Production, Multi-arch)
    - [x] Usage (Repos, Tasks, Failures)
    - [x] Troubleshooting
    - [x] Persistence
    - [x] License

---

## Phase 2: Content Creation [checkpoint: n/a]

### Task 2: Reorganize README
- [x] Task: Rewrite README.md
    - [x] Streamline Quick Setup section
    - [x] Add Configuration section with env vars
    - [x] Add GitHub Webhook setup instructions

### Task 3: Add Deployment Docs
- [x] Task: Add deployment documentation
    - [x] Local Development instructions
    - [x] Production VPS deployment (HTTPS, domain)
    - [x] Multi-arch build instructions

### Task 4: Add Troubleshooting
- [x] Task: Create troubleshooting section
    - [x] "Clone failed" → SSH key permissions
    - [x] "Push not working" → VAPID key setup
    - [x] "Transcription failed" → API key issues
    - [x] "Disk full on server" → cleanup steps

---

## Phase 3: Verification [checkpoint: 4ccf99b]

### Task 5: Verify Documentation
- [x] Task: Manual verification
    - [x] No broken links
    - [x] New user can follow Quick Setup successfully
