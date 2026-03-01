# Speech-to-Text Debug Track

## Overview

Speech-to-text in the init app works on Chrome/macOS but fails on Chrome/Android (primary concern) and Firefox/macOS. This track will:
1. Extract the speech UI into a reusable component
2. Create a standalone debug page for cross-browser testing
3. Identify the root cause of the failures
4. Fix the issue for Chrome/Android

## Problem Statement

The current `speech.js` implementation uses the Web Speech API with a custom pause-detection timeout flow. It works reliably on Chrome/macOS but exhibits issues on:
- **Chrome/Android** (PRIMARY): Unknown failure mode - needs investigation
- **Firefox/macOS**: Likely lacks full Web Speech API support

## Functional Requirements

### FR1: Reusable Speech Component
- Extract speech recording UI into a self-contained component
- Component must be usable in both:
  - The main init flow (existing behavior)
  - A standalone debug page (new)
- Maintain existing pause-detection UX (2.5s silence → PAUSED → 1s grace period)

### FR2: Standalone Debug Page
- Create a `/debug` route or separate debug.html accessible without full app initialization
- Must run without:
  - Events service connection
  - Agent session creation
  - Repository listing API calls

### FR3: Debug Page Features
- **Live transcript display**: Real-time transcript with interim/final distinction, state transitions
- **Browser API event logging**: Detailed logs for all SpeechRecognition events (onstart, onresult, onend, onerror, onnomatch)
- **Permission state visibility**: Visual indicators for microphone permission status and errors
- **Configurable timeouts**: Allow tweaking pause threshold and grace period values
- **Exportable logs**: Ability to copy/download logs for sharing

### FR4: Cross-Browser Fix
- Identify why Chrome/Android fails
- Implement fix that works on Chrome/Android (primary)
- Document any Firefox limitations if discovered

## Non-Functional Requirements

### NFR1: No External Dependencies
- Debug page must work offline (no backend required)
- No API keys needed for basic speech testing

### NFR2: Minimal Bundle
- Debug page should load quickly on mobile networks

## Acceptance Criteria

1. **AC1**: A reusable speech component exists and is used by both main app and debug page
2. **AC2**: Debug page is accessible at `/init/debug` without backend services
3. **AC3**: Debug page shows live transcript, all API events, permission states, and configurable timeouts
4. **AC4**: Speech-to-text works on Chrome/Android after fixes
5. **AC5**: Changes do not break existing Chrome/macOS functionality

## Out of Scope

- Safari/iOS support (can be addressed in future track)
- Whisper API transcription testing (focus on Web Speech API only)
- PWA/service worker changes
