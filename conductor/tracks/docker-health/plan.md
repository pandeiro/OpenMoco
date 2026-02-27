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

## Phase 3: Verification

### Task 3: Verify Health Status
- [ ] Task: Verify health checks work
    - [ ] `docker ps` shows health status for all containers
    - [ ] Unhealthy containers are detected and logged
