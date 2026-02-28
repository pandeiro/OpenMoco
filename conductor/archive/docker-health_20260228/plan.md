# Implementation Plan: Docker Health Checks

## Track ID
`docker-health`

## Source
`doc/plans/2026-02-27-v0.4-improvements.md` Task 3

## Priority
P1 (High) | Effort: Small (~30 min)

---

## Phase 1: Investigation [checkpoint: n/a]

### Task 1: Verify Endpoints
- [x] Task: Verify health endpoints exist
    - [x] Check if agent has `/health` endpoint (or investigate OpenCode)
    - [x] Verify events has `/api/health` endpoint
    - [x] Verify init serves root `/`
    - [x] Verify gateway serves `/init/`

---

## Phase 2: Implementation [checkpoint: n/a]

### Task 2: Add Health Checks
- [x] Task: Add healthcheck to docker-compose.yml
    - [x] Add healthcheck for agent service (curl, has curl installed)
    - [x] Add healthcheck for events service (wget, Alpine)
    - [x] Add healthcheck for init service (wget, Alpine)
    - [x] Add healthcheck for gateway service (wget, Alpine)

---

## Phase 3: Verification [checkpoint: d11c403]

### Task 3: Verify Health Status
- [x] Task: Verify health checks work
    - [x] `docker ps` shows health status for all containers
    - [x] Unhealthy containers are detected and logged

---

## Phase 4: Local Development [checkpoint: 7584dfc]

### Task 4: Create docker-compose.dev.yml
- [x] Task: Create development-specific docker-compose
    - [x] Add `build` sections for all services
    - [x] Use local Dockerfiles to solve architecture mismatches
    - [x] Test system boot-up

### Success (Feb 28, 2026):
- All 4 services (`agent`, `events`, `init`, `gateway`) are Up and **healthy**.
- Gateway reachable on port 7777.
- `/health` endpoint verified (200 OK).
- `/init/` endpoint verified with auth (200 OK).

---

## Phase: Review Fixes
- [x] Task: Apply review suggestions [95152f0]
