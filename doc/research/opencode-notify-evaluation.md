# opencode-notify Plugin Evaluation

**Date:** 2026-02-27
**Track:** opencode-plugins
**Plugin:** opencode-notify v0.3.1
**Repository:** https://github.com/mattietk/opencode-notify

---

## Overview

opencode-notify provides native OS notifications with actionable buttons for OpenCode. When OpenCode needs permission or has a question, users receive a popup they can respond to directly without switching to the terminal.

---

## Features

- **Actionable buttons** – Accept, Always, Reject, or Dismiss permission requests directly from popups
- **Cross-platform** – Works on macOS (no dependencies), Linux, and Windows
- **Terminal focus detection** – Suppresses popups when terminal is already focused
- **Quiet hours** – Optionally silence alerts during specified times
- **Child session control** – Choose whether to notify for subagent sessions
- **Auto-focus** – Optionally focus terminal after responding to a popup
- **Idle alerts** – Optionally alert when agent stops without requesting input

---

## Dependencies by Platform

### macOS
- **Status:** ✅ No additional dependencies
- **Implementation:** Bundled Swift app for notifications
- **Options:**
  - Native Notification Centre banners (default) - respects Do Not Disturb
  - Modal alert dialogs - bypasses Do Not Disturb, supports multiple buttons

### Linux
- **Status:** ⚠️ Requires D-Bus development libraries
- **Installation:**
  ```bash
  # Debian/Ubuntu
  sudo apt install libdbus-1-dev

  # Fedora
  sudo dnf install dbus-devel
  ```
- **Fallback:** Uses `notify-send` if D-Bus unavailable (but actions won't work)

### Windows
- **Status:** ✅ No additional dependencies
- **Requirements:** Windows 10 version 1709 or later

---

## Configuration

**Location:** `~/.config/opencode/opencode-notify.json`

**Example:**
```json
{
  "sounds": {
    "permission": "Submarine",
    "error": "Basso"
  },
  "quietHours": {
    "enabled": false,
    "start": "22:00",
    "end": "08:00"
  },
  "notifyChildSessions": false,
  "terminal": null,
  "focusAfterAction": true,
  "notifyOnIdle": false,
  "nativeMacNotifications": true
}
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `sounds.permission` | string | `"Submarine"` | Sound for permission requests |
| `sounds.error` | string | `"Basso"` | Sound for errors |
| `quietHours.enabled` | boolean | `false` | Enable quiet hours |
| `quietHours.start` | string | `"22:00"` | Quiet hours start (HH:MM) |
| `quietHours.end` | string | `"08:00"` | Quiet hours end (HH:MM) |
| `notifyChildSessions` | boolean | `false` | Notify for subagent sessions |
| `terminal` | string \| null | `null` | Override terminal detection |
| `focusAfterAction` | boolean | `true` | Focus terminal after popup response |
| `notifyOnIdle` | boolean | `false` | Notify when agent stops without input |
| `nativeMacNotifications` | boolean | `true` | Use macOS Notification Centre |

---

## Installation

**Method:** opencode.json plugin array (auto-installed by Bun)

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["opencode-notify"]
}
```

---

## Compatibility with Containerized OpenCode

### ❌ NOT COMPATIBLE

**Reasons:**
1. **Headless Environment** - Docker containers run without GUI/desktop environment
2. **No Notification System** - Containers don't have:
   - macOS Notification Centre
   - Linux D-Bus notification daemon
   - Windows notification system
3. **No User Session** - Notifications require an active user session

**What would happen:**
- Plugin would install successfully
- Events would be captured but notifications would fail
- Error logs would show notification delivery failures
- No actionable benefit in container environment

---

## How It Works

The plugin hooks into OpenCode events:

1. **Permission requests** → Shows popup with Accept/Always/Reject/Dismiss buttons
2. **Questions** → Shows popup when OpenCode asks a question (AskUserQuestion tool)
3. **Session errors** → Shows error popup
4. **Session idle** → Optionally shows popup when agent stops

When user clicks a button:
1. Response sent to OpenCode via API
2. Terminal window focused (if `focusAfterAction` enabled)

---

## Comparison with Alternatives

| Feature | mohak34/opencode-notifier | opencode-notify |
|---------|--------------------------|-----------------|
| Action buttons | No | Yes |
| macOS notifications | osascript | CFUserNotification or Notification Centre |
| Linux notifications | notify-send | D-Bus |
| Windows notifications | node-notifier | powertoast |
| Permission response | Manual in terminal | Click button |
| Terminal focus detection | No | Yes |

---

## Recommendation for OpenMoko

### ❌ DO NOT INSTALL

**Rationale:**
1. **Incompatible Environment** - Agent container is headless
2. **No User Benefit** - No one to receive notifications in container
3. **Resource Waste** - Would add unnecessary overhead
4. **Error Logging** - Would generate error logs for failed notifications

### Alternative Approach for OpenMoko

Instead of desktop notifications in the container:

1. **moko-logger** already captures events (tokens, tools)
2. **Events service** could expose webhook notifications
3. **PWA frontend** could show real-time status updates
4. **Push notifications** to mobile device (already implemented)

---

## Use Case Where This Would Work

opencode-notify is excellent for:
- Local development on developer's machine
- Desktop OpenCode installations
- Developers who want to multitask while OpenCode runs

It's NOT designed for:
- Headless server environments
- Containerized deployments
- CI/CD pipelines
- Remote/SSH-based usage

---

## Conclusion

**Verdict:** Skip installation in OpenMoko agent container

**Action:** Document evaluation, mark task complete, move to next plugin evaluation

**Note:** This plugin remains valuable for developers using OpenCode locally on their machines. Consider recommending it in documentation for users who run OpenCode outside the container.
