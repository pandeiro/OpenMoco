# Implementation Plan: README Reorganization & Deployment Docs

## Track ID
`readme-reorg`

## Source
`doc/plans/2026-02-27-v0.4-improvements.md` Task 4

## Priority
P1 (High) | Effort: Medium (~1 hour)

---

## Phase 1: Structure Planning

### Task 1: Plan New Structure
- [ ] Task: Outline new README structure
    - [ ] Header + Screenshot
    - [ ] Quick Setup (streamlined)
    - [ ] Architecture (brief)
    - [ ] Configuration (Env vars, Webhooks)
    - [ ] Deployment (Local, Production, Multi-arch)
    - [ ] Usage (Repos, Tasks, Failures)
    - [ ] Troubleshooting
    - [ ] Persistence
    - [ ] License

---

## Phase 2: Content Creation

### Task 2: Reorganize README
- [ ] Task: Rewrite README.md
    - [ ] Streamline Quick Setup section
    - [ ] Add Configuration section with env vars
    - [ ] Add GitHub Webhook setup instructions

### Task 3: Add Deployment Docs
- [ ] Task: Add deployment documentation
    - [ ] Local Development instructions
    - [ ] Production VPS deployment (HTTPS, domain)
    - [ ] Multi-arch build instructions

### Task 4: Add Troubleshooting
- [ ] Task: Create troubleshooting section
    - [ ] "Clone failed" → SSH key permissions
    - [ ] "Push not working" → VAPID key setup
    - [ ] "Transcription failed" → API key issues
    - [ ] "Disk full on server" → cleanup steps

---

## Phase 3: Verification

### Task 5: Verify Documentation
- [ ] Task: Manual verification
    - [ ] No broken links
    - [ ] New user can follow Quick Setup successfully
