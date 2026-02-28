# Frontend Console Log Exporter

## Overview

Add a frontend log forwarding system that captures `console.log`, `console.warn`, and `console.error` output from the browser and sends it to the init Docker container logs. This enables debugging of Web Speech API and other frontend issues by making browser logs visible in `docker logs`.

## Functional Requirements

### FR-1: Console Method Interception
- Override native `console.log`, `console.warn`, and `console.error` methods
- Preserve original console behavior (logs still appear in browser DevTools)
- Send a copy of each log entry to the server endpoint

### FR-2: Log Transport via Nginx
- Create a new nginx location block for `POST /api/logs`
- Nginx receives the POST body and writes it to stdout (Docker captures this)
- Return `204 No Content` to the client (no response body needed)

### FR-3: Structured JSON Log Format
Each log entry must be a JSON object with the following fields:
- `source`: Always `"frontend"` to identify the origin
- `level`: One of `"log"`, `"warn"`, `"error"`
- `message`: The log message (string or stringified object)
- `timestamp`: ISO 8601 timestamp (e.g., `2024-01-15T10:30:00.000Z`)

Example:
```json
{"source":"frontend","level":"warn","message":"Web Speech API not supported","timestamp":"2024-01-15T10:30:00.000Z"}
```

### FR-4: Endpoint Configuration
- Hardcoded endpoint: `/api/logs`
- Use `navigator.sendBeacon()` for fire-and-forget delivery (survives page unload)
- Fallback to `fetch()` if beacon is unavailable

### FR-5: Error Handling
- Fail silently if the log endpoint is unreachable
- Do not block or throw errors that would affect normal application operation

## Non-Functional Requirements

### NFR-1: Performance
- Log forwarding must be non-blocking
- Use `navigator.sendBeacon()` to avoid delaying page navigation

### NFR-2: Prototype Quality
- This is a prototype/debugging feature
- No filtering, sampling, or log buffering required
- All logs forwarded unconditionally

## Acceptance Criteria

- [ ] `docker logs <init-container>` shows frontend console output
- [ ] Frontend logs are clearly distinguishable (contain `"source":"frontend"`)
- [ ] `console.log`, `console.warn`, and `console.error` all work in browser DevTools
- [ ] Logs appear in Docker output with JSON structure
- [ ] Page navigation/unload does not lose pending logs

## Out of Scope

- Log filtering by level or sampling
- Authentication or authorization for the log endpoint
- Log persistence (beyond Docker's default log rotation)
- Backend validation of log payload
