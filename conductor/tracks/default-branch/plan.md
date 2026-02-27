# Implementation Plan: Use Repo Default Branch

## Track ID
`default-branch`

## Source
`doc/plans/2026-02-27-v0.4-improvements.md` Task 6

## Priority
P2 (Medium) | Effort: Small (~30 min)

---

## Phase 1: Investigation [checkpoint: n/a]

### Task 1: Verify GitHub API Response
- [x] Task: Verify default_branch field
    - [x] Check GitHub API response includes default_branch
    - [x] Verify repos.json stores this field (already stored in githubMeta.defaultBranch)

---

## Phase 2: Implementation [checkpoint: n/a]

### Task 2: Update repos.js
- [x] Task: Use dynamic default branch
    - [x] Update clone/reset logic at repos.js:155
    - [x] Use `repo.default_branch || 'main'` fallback
    - [x] Update git fetch/reset commands

---

## Phase 3: Verification

### Task 3: Test with Different Branches
- [ ] Task: Manual verification
    - [ ] Test with repo using `main` as default
    - [ ] Test with repo using `master` as default
    - [ ] Clone/reset works correctly for both
