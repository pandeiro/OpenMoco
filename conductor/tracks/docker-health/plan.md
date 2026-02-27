# Implementation Plan: Docker Health Checks

## Track ID
`docker-health`

## Source
`doc/plans/2026-02-27-v0.4-improvements.md` Task 3

## Priority
P1 (High) | Effort: Small (~30 min)

---

## Phase 1: Investigation

### Task 1: Verify Endpoints
- [ ] Task: Verify health endpoints exist
    - [ ] Check if agent has `/health` endpoint (or investigate OpenCode)
    - [ ] Verify events has `/api/health` endpoint
    - [ ] Verify init serves root `/`
    - [ ] Verify gateway serves `/init/`

---

## Phase 2: Implementation

### Task 2: Add Health Checks
- [ ] Task: Add healthcheck to docker-compose.yml
    - [ ] Add healthcheck for agent service
    - [ ] Add healthcheck for events service
    - [ ] Add healthcheck for init service
    - [ ] Add healthcheck for gateway service

---

## Phase 3: Verification

### Task 3: Verify Health Status
- [ ] Task: Verify health checks work
    - [ ] `docker ps` shows health status for all containers
    - [ ] Unhealthy containers are detected and logged
