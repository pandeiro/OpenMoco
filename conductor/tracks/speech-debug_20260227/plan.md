# Speech-to-Text Debug Track - Implementation Plan

## Phase 1: Extract Reusable Speech UI Component

- [ ] Task: Create SpeechUI component class
    - [ ] Extract speech UI rendering logic from home.js into new `lib/speech-ui.js`
    - [ ] Component renders: mic button, status text, live transcript, continue button
    - [ ] Component accepts callbacks for state changes and transcript updates
    - [ ] Component exposes methods: render(), updateTranscript(), updateState()
    - [ ] Ensure no API dependencies (purely UI)

- [ ] Task: Refactor home.js to use SpeechUI component
    - [ ] Import SpeechUI component
    - [ ] Replace inline speech UI code with component instance
    - [ ] Wire up callbacks to existing handleTranscription/updateUI functions
    - [ ] Verify existing Chrome/macOS behavior unchanged

- [ ] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: Create Debug Page

- [ ] Task: Add /debug route to main.js router
    - [ ] Add '/init/debug': 'debug' to routes object
    - [ ] Create new `views/debug.js` view file

- [ ] Task: Build debug.js view with comprehensive logging
    - [ ] Import SpeechManager and SpeechUI components
    - [ ] Create standalone page with no API dependencies
    - [ ] Implement live transcript display (interim vs final distinction)
    - [ ] Implement event log panel showing all SpeechRecognition events
    - [ ] Implement permission status display (granted/denied/prompt)
    - [ ] Add configurable timeout controls (pause threshold, grace period)
    - [ ] Add "Copy Logs" button for easy sharing

- [ ] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3: Debug and Fix Chrome/Android Issues

- [ ] Task: Test on Chrome/Android and capture detailed logs
    - [ ] Access debug page from Chrome/Android device
    - [ ] Attempt speech recording and capture all event logs
    - [ ] Document exact failure mode and error messages

- [ ] Task: Research Chrome/Android Web Speech API limitations
    - [ ] Investigate known Chrome/Android Web Speech bugs
    - [ ] Check for HTTPS/secure context requirements
    - [ ] Check for user gesture requirements
    - [ ] Document findings in track notes

- [ ] Task: Implement fix for Chrome/Android
    - [ ] Apply fix based on research findings
    - [ ] Possible fixes: HTTPS enforcement, gesture handling, API alternatives
    - [ ] Verify fix works on debug page first

- [ ] Task: Verify fix in main app (home.js)
    - [ ] Test complete flow on Chrome/Android
    - [ ] Ensure no regression on Chrome/macOS

- [ ] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4: Documentation and Cleanup

- [ ] Task: Document browser compatibility findings
    - [ ] Add notes to speech.js about browser-specific behavior
    - [ ] Document any Firefox limitations discovered
    - [ ] Update tech-stack.md if speech approach changes

- [ ] Task: Final verification across browsers
    - [ ] Test Chrome/macOS (baseline)
    - [ ] Test Chrome/Android (primary fix target)
    - [ ] Test Firefox/macOS (document limitations if any)

- [ ] Task: Conductor - User Manual Verification 'Phase 4' (Protocol in workflow.md)
