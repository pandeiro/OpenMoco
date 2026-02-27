# Implementation Plan: Use Repo Default Branch

## Track ID
`default-branch`

## Source
`doc/plans/2026-02-27-v0.4-improvements.md` Task 6

## Priority
P2 (Medium) | Effort: Small (~30 min)

---

## Phase 1: Investigation

### Task 1: Verify GitHub API Response
- [ ] Task: Verify default_branch field
    - [ ] Check GitHub API response includes default_branch
    - [ ] Verify repos.json stores this field

---

## Phase 2: Implementation

### Task 2: Update repos.js
- [ ] Task: Use dynamic default branch
    - [ ] Update clone/reset logic at repos.js:155
    - [ ] Use `repo.default_branch || 'main'` fallback
    - [ ] Update git fetch/reset commands

---

## Phase 3: Verification

### Task 3: Test with Different Branches
- [ ] Task: Manual verification
    - [ ] Test with repo using `main` as default
    - [ ] Test with repo using `master` as default
    - [ ] Clone/reset works correctly for both
