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

### Fixes Applied (Feb 27, 2026):
- **Universal `curl`:** Installed `curl` in all Dockerfiles (`events`, `init`, `gateway`) for reliable health checks.
- **Bypassed Auth:** Added unauthenticated `/health` location in `gateway/nginx.conf` to prevent 401 failures.
- **Improved Reliability:** Switched from `wget` to `curl -f` in `docker-compose.yml` healthcheck commands.
