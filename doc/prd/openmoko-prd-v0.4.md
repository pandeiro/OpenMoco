# OpenMoko PRD — v0.4

**Status:** Active
**Features:** Init (voice entry) · CI/CD awareness + push notifications · Repo management · Production reliability

---

## What's New in v0.4

- **Gemini 2.5 Flash** is now the primary reformulation provider (replaces Groq)
- **Docker health checks** for all services
- **Graceful shutdown** handling in events service
- **Dynamic default branch** detection (supports repos with `master` or `main`)
- **Multi-arch Docker builds** (optional via workflow_dispatch)

---

## Architecture

**Greenfield PWA wrapper, not an OpenCode fork.** Init is a separate PWA served at `/init`. OpenCode runs unchanged at `/`. Handoff uses the `@opencode-ai/sdk` — no scraping, no forking.

**Internal nginx as network hub.** An nginx container inside docker-compose routes all internal traffic. The developer's existing reverse proxy points at one host port (`7777` by default). See Appendix C for the full nginx.conf.

**No repos.txt.** Replaced by a repo management UI backed by the GitHub API. The PAT required for CI/CD is the same one used to fetch and manage repos.

**Singleton active session.** OpenMoko tracks one active session at a time in `active_session.json` on the events_data volume. Starting a new task overwrites it. Sessions are abandoned on the OpenCode side (not explicitly deleted) — at personal use scale this is fine. The active session is cleared when its branch is detected as merged via GitHub webhook. This sidesteps all session lifecycle and workspace cleanup complexity.

**CI/CD notifications are Web Push.** No surface to inject toasts into OpenCode's UI without forking. Service worker registered by Init receives push events and delivers OS-level notifications visible even when backgrounded.

**Service worker from day one.** Start thin (push subscriptions, offline Init shell, notification click routing), grow later.

---

## Speech & Inference Stack

**Web Speech API always runs.** It provides live transcription display during recording, native silence detection via `speechend`/`onend` events (no manual AudioContext analysis needed), and the fallback transcript if Whisper is not configured. Browser-native, no cost, routes through Apple/Google servers depending on platform.

**Whisper enhances if configured.** If `WHISPER_API_KEY` is set, the audio blob is also POSTed to `/api/transcribe` which forwards to OpenAI Whisper. On return, Whisper's transcript replaces the Web Speech result before reformulation. Whisper is meaningfully better on technical vocabulary (variable names, library names, jargon). Cost ~$0.006/min, negligible at personal use volumes.

The UX is identical either way — the developer sees live text during recording regardless. Whisper just improves what gets handed to reformulation.

**Reformulation — Gemini 2.5 Flash (default).** A single LLM call: raw transcript + project context → clean agent prompt. Gemini 2.5 Flash via `@google/genai` is fast, capable, and free via Google AI Studio. Ollama Cloud is the configurable fallback for offline/self-hosted scenarios.

**Reformulation system prompt includes:**
- Raw transcript
- Active project: name, description, default branch, last pushed
- List of other enabled repos (so model can flag if it sounds like the wrong project)
- Instruction: *reformat into a clear, well-scoped agent prompt; preserve all technical specifics; output only the reformulated prompt and, if branching, a kebab-case branch slug — no commentary*

**`.env` vars for inference:**
```
WHISPER_API_KEY=    # optional — OpenAI key, transcription only. Omit to use Web Speech API alone.
GEMINI_API_KEY=     # reformulation (primary)
OLLAMA_API_KEY=     # reformulation fallback (optional)
```

---

## Feature 0: Repo Management

Foundational to everything — project selection is required input to `session.create()`, and repo metadata feeds the reformulation call.

### First run experience

Init detects no enabled repos on first load and shows a welcome state: a prompt to connect GitHub and enable repos, or a "New project" path for starting from scratch (empty `/workspace` directory, no GitHub repo yet). Repo management is not a separate settings page — it's the first thing Init shows when there's nothing enabled.

On subsequent loads, a **gear icon** in the Init header opens the repo management view. Enabled repos appear in the project picker; everything else is invisible to the main flow.

### Repo management UI (`/init/repos`)

- List of user's GitHub repos fetched via PAT, cached locally, refresh button available
- Each repo: name, description, last pushed, enabled toggle
- Search/filter at the top
- On enable: clone triggered (see below), status shown inline ("Cloning..." → "Ready")
- On disable: confirm prompt, then removal from workspace

### Clone and sync

The events service clones repos directly to the shared `/code` volume. It has read-write access for cloning and git operations.

**Default branch detection:** When fetching repos from GitHub, the `default_branch` field is stored. On subsequent syncs (when a repo already exists), the stored default branch is used for `git fetch` and `git reset --hard` operations. This supports repos using `master`, `main`, or any other default branch name.

---

## Feature 1: Init

The mobile entry point for starting an agent task.

### Visual Design
- **Aesthetic**: Clean, modern look, mirroring OpenCode's interface design.
- **Theming**: Native CSS variables supporting Light and Dark modes. Defaults to matching the system (`prefers-color-scheme`).

### Happy path

1. Developer opens `openmoko.yourvps.com/init`
2. If no repos enabled → welcome/onboarding state. Otherwise: **project picker** — horizontally scrollable row of enabled repo chips, most recently active first. Tap to switch. Gear icon → repo management.
3. **Voice button** — tap to begin. Web Speech API starts immediately; flowing live transcription appears on screen as the developer speaks.
4. **Pause Detection & Grace Period:**
   - When the user pauses speaking, a visual **2.5s timer** begins running on screen.
   - If the timer hits 0 (2.5s elapsed), the system determines the user has stopped, and a **"Continue Talking" button** appears temporarily for 1 second.
   - If tapped within that 1 second, the user can continue talking and append more speech to the current transcript.
   - If ignored, the recording definitively stops, defaulting to "send" the audio to the processing pipeline.
   - A manual stop/send button is always visible to skip the wait.
5. If `WHISPER_API_KEY` configured: audio blob POSTs to `/api/transcribe`, Whisper result replaces Web Speech transcript.
6. Transcript POSTs to `/api/reform` with project context.
7. Cleaned prompt appears in editable text field. Re-record icon (↺) lets developer discard and start over.
8. **Two action buttons:**
   - **`Branch & Start →`** — primary, visually dominant. Default.
   - **`Start on main →`** — secondary, smaller. Requires deliberate tap.
9. **Notification toggle** — below the buttons, "Notify me when CI completes" on/off, default on.
10. On tap:
    - Events service calls `client.session.create({ directory: '/code/[repo]' })`
    - Calls `client.session.prompt(session.id, { text: formattedPrompt, mode: 'plan' })`
    - Prompt includes branch instruction if applicable: `git checkout -b [slug]` as first action
    - Stores session ID + repo + branch in `active_session.json`
    - Returns `{ sessionId, redirectUrl }` to client
    - Browser navigates to `openmoko.yourvps.com/#/session/[sessionId]`

---

## Feature 2: CI/CD Awareness

After the agent pushes, the developer knows what happened without switching apps.

### Happy path

1. Agent pushes branch. GitHub fires `push` + `workflow_run` events to `/webhooks/github`.
2. Webhook receiver validates (HMAC-SHA256), matches against active session branch.
3. On workflow completion → Web Push notification dispatched.
4. **Pass:** `✓ fix/admin-route-auth-bypass passed — your-repo`
5. **Fail:** `✗ fix/admin-route-auth-bypass failed — Run tests — tap to send to agent`
6. Tapping a pass notification opens OpenCode at the active session.
7. Tapping a failure notification opens `/init/resume?failureId=[id]`. Init reads the stored failure record, calls `client.session.prompt()` on the active session with the pre-composed follow-up, and redirects to the session.
8. On `pull_request` webhook event with `merged: true` matching the active session branch: `active_session.json` is cleared.

---

## openmoko-events Service

Node.js, Express 5.x with ES modules.

| Endpoint | Purpose |
|---|---|
| `POST /webhooks/github` | Validate + handle `push`, `workflow_run`, `pull_request` events |
| `GET /events` | SSE (future in-page use) |
| `GET /api/health` | Health check endpoint |
| `POST /api/subscribe` | Store Web Push subscription |
| `POST /api/transcribe` | Proxy audio blob → Whisper API |
| `POST /api/reform` | Gemini call with transcript + context → `{ prompt, slug? }` |
| `POST /api/session/create` | OpenCode SDK: create session + send prompt |
| `GET /api/repos` | GitHub API proxy merged with local enabled state |
| `POST /api/repos/:name/enable` | Clone repo, store state |
| `POST /api/repos/:name/disable` | Remove from workspace, store state |

### Production Reliability (v0.4)

- **Graceful shutdown:** SIGTERM/SIGINT handlers close HTTP connections cleanly before exiting (10s timeout)
- **Docker health checks:** All services report health status; unhealthy containers can be detected and restarted

---

## docker-compose

```yaml
services:
  agent:
    image: openmoko/agent:latest
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    restart: unless-stopped

  gateway:
    image: openmoko/gateway:latest
    ports:
      - "7777:80"
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:80/init/"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

  init:
    image: openmoko/init:latest
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000/"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

  events:
    image: openmoko/events:latest
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:3001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped
```

---

## Full `.env`

```
# Git identity
GIT_USER_NAME=
GIT_USER_EMAIL=

# OpenCode
OPENCODE_SERVER_PASSWORD=

# GitHub
GITHUB_PAT=               # repo scope — repo listing, cloning, log fetching
GITHUB_WEBHOOK_SECRET=    # HMAC validation for inbound webhooks

# Web Push (VAPID) — generate once: npx web-push generate-vapid-keys
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_CONTACT=mailto:you@example.com

# Inference
WHISPER_API_KEY=          # optional — omit to use Web Speech API transcript only
GEMINI_API_KEY=           # reformulation (primary)
OLLAMA_API_KEY=           # reformulation fallback (optional)

# Auth
OPENMOKO_USER=
OPENMOKO_PASSWORD=
```

---

## Out of Scope

- Autonomous / fire-and-forget agent mode
- In-app diff viewer or CI panel
- PR auto-creation
- GitLab, CircleCI, Buildkite
- Forking or modifying OpenCode's web UI
- Task templates
- Multi-user / team features
- Silence threshold configuration (hardcoded at 2.5s)

---

## Data Model (events_data volume)

All state is stored as JSON files on the `events_data` Docker volume at `/data/`. No database.

### `/data/active_session.json`

```json
{
  "sessionId": "abc123",
  "repo": "my-api",
  "projectPath": "/code/my-api",
  "branch": "fix/admin-route-auth-bypass",
  "createdAt": "2026-02-19T21:00:00Z",
  "notificationsEnabled": true
}
```

### `/data/repos.json`

```json
{
  "my-api": {
    "enabled": true,
    "cloneStatus": "ready",
    "githubMeta": {
      "description": "Main backend API",
      "defaultBranch": "main",
      "lastPushed": "2026-02-19T18:00:00Z",
      "private": true
    },
    "enabledAt": "2026-02-01T10:00:00Z"
  }
}
```

### `/data/push_subscriptions.json`

Array of Web Push subscription objects.

### `/data/failures/[failureId].json`

Stored when a workflow failure is received. Contains failing job, step, and log tail.
