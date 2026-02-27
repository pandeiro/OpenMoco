# Implementation Plan: Input Validation & Error Logging

## Track ID
`validation-logging`

## Source
`doc/plans/2026-02-27-v0.4-improvements.md` Task 5

## Priority
P2 (Medium) | Effort: Medium (~2 hours)

---

## Phase 1: Dependencies

### Task 1: Add express-validator
- [ ] Task: Install express-validator dependency
    - [ ] Run `npm install express-validator` in events/
    - [ ] Verify package added to package.json

---

## Phase 2: Data Layer Logging

### Task 2: Add Error Logging to data.js
- [ ] Task: Add logging to data layer
    - [ ] Add error logging to readJSON function
    - [ ] Add error logging to writeJSON function
    - [ ] Log file paths and error messages

---

## Phase 3: Route Validation

### Task 3: Add Validation to repos.js
- [ ] Task: Add input validation
    - [ ] Validate owner/name params (alphanumeric)
    - [ ] Return 400 with clear error messages

### Task 4: Add Validation to session.js
- [ ] Task: Add input validation
    - [ ] Validate prompt text
    - [ ] Validate project path

### Task 5: Add Validation to subscribe.js
- [ ] Task: Add input validation
    - [ ] Validate push subscription data

---

## Phase 4: Verification

### Task 6: Verify Validation
- [ ] Task: Manual verification
    - [ ] Invalid inputs return 400 with clear error messages
    - [ ] Error logs appear in console for debugging
    - [ ] No regressions in existing functionality
