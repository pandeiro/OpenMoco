# Implementation Plan: Input Validation & Error Logging

## Track ID
`validation-logging`

## Source
`doc/plans/2026-02-27-v0.4-improvements.md` Task 5

## Priority
P2 (Medium) | Effort: Medium (~2 hours)

---

## Phase 1: Dependencies [checkpoint: n/a]

### Task 1: Add express-validator
- [x] Task: Install express-validator dependency
    - [x] Run `npm install express-validator` in events/
    - [x] Verify package added to package.json

---

## Phase 2: Data Layer Logging [checkpoint: n/a]

### Task 2: Add Error Logging to data.js
- [x] Task: Add logging to data layer
    - [x] Add error logging to readJSON function
    - [x] Add error logging to writeJSON function
    - [x] Log file paths and error messages

---

## Phase 3: Route Validation [checkpoint: n/a]

### Task 3: Add Validation to repos.js
- [x] Task: Add input validation
    - [x] Validate owner/name params (alphanumeric)
    - [x] Return 400 with clear error messages

### Task 4: Add Validation to session.js
- [x] Task: Add input validation
    - [x] Validate prompt text
    - [x] Validate project path

### Task 5: Add Validation to subscribe.js
- [x] Task: Add input validation
    - [x] Validate push subscription data

---

## Phase 4: Verification [checkpoint: n/a]

### Task 6: Verify Validation
- [ ] Task: Manual verification
    - [ ] Invalid inputs return 400 with clear error messages
    - [ ] Error logs appear in console for debugging
    - [ ] No regressions in existing functionality
