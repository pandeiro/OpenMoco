# OpenMoko Agent Guidelines

Welcome to the OpenMoko codebase. If you are an AI assistant (Agent / Gemini), please read this document before making structural changes to the project.

## Project Overview
OpenMoko is a voice-first, progressive web app (PWA) wrapper around OpenCode. It allows the user to record voice prompts on their phone, transcribe them, automatically reformulate them into precise agent instructions using an LLM, and seamlessly hand them off to an OpenCode agent session. It also handles CI/CD push notifications.

## Architecture & Services
The project uses a 4-container Docker Compose setup routed through Nginx:
1. **`agent`**: The core AI agent environment (runs on `:8080` internally).
2. **`gateway`**: The ingress router (`:7777` mapped to `:80`). See `gateway/nginx.conf`.
3. **`events`**: A Node.js backend (`:3001` internally). Handles GitHub API routing, Webhooks, Push Notifications, Audio Transcription (Whisper), and LLM Reformulation (Gemini 2.5 Flash primary, Ollama fallback).
4. **`init`**: The Vite-built frontend PWA running on `:3000` internally.

## Key Technical Decisions
- **No Database**: State is stored as flat JSON files in the `events_data` Docker volume (`active_session.json`, `repos.json`, `push_subscriptions.json`, `failures/`).
- **Projects Directory**: Projects are cloned into the shared `/code` volume by the `events` service via `events/routes/repos.js`. We use `git clone` or, if existing, `git fetch && git reset --hard origin/main` to ensure clean states.
- **Transcription UX Flow**: In `init/src/lib/speech.js`, we use the Web Speech API with a custom timeout loop: 2.5s of silence triggers a "PAUSED" state, revealing a 1-second "Continue Talking" grace-period button before automatically processing the transcript.
- **Frontend Styling**: Native CSS variables in `init/src/style.css` support robust light and dark modes via `@media (prefers-color-scheme: dark)`.

## Local Development Setup
For debugging init locally, run the services separately:
```bash
# Terminal 1: Events backend (requires .env)
cd events && DATA_DIR=../events_data CODE_DIR=../code npm run dev

# Terminal 2: Init frontend with API proxy
cd init && npm run dev
```
The init Vite dev server proxies `/api/*` to `localhost:3001`. Ensure you have API keys (GEMINI_API_KEY, GITHUB_PAT) in your `.env` file.

## Single Source of Truth
The Product Requirements Document (PRD) at `doc/prd/openmoko-prd-v0.4.md` is the absolute source of truth for architectural constraints and feature behavior. **Always consult the PRD before fundamentally altering how features operate.**

## Commit and Push Guidelines
**Never push without explicit user instruction.** Stage and commit changes after completing a task and verifying the work is correct. Always wait for user confirmation before pushing to remote.

## Post-Push Verification
After pushing consequential changes (especially to CI/CD workflows), use the `gh` CLI to verify workflow runs:

```bash
# Check recent workflow runs
gh run list --workflow=Deploy --limit 5

# View specific job logs
gh run view --job=<job-id>

# View full job logs
gh run view --log --job=<job-id>
```

This helps verify that the deploy succeeded and diagnose issues quickly.
