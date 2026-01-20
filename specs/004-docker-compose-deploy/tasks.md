# Tasks: Docker Compose Deployment

**Input**: Design documents from `/specs/004-docker-compose-deploy/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/docker-contracts.md ✓, quickstart.md ✓

**Tests**: Not explicitly requested in the feature specification. Test tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the directory structure and shared configuration files

- [ ] T001 Create docker/ directory structure at repository root
- [ ] T002 [P] Create .dockerignore file at repository root
- [ ] T003 [P] Create .env.example file with environment variable template at repository root

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core Docker infrastructure that MUST be complete before any user story can work

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Create PostgreSQL Dockerfile with pg_cron extension at docker/postgres/Dockerfile
- [ ] T005 Create init-extensions.sql script at docker/postgres/init-extensions.sql

**Checkpoint**: Foundation ready - PostgreSQL container with pg_cron is buildable

---

## Phase 3: User Story 1 - Deploy Application to Production Server (Priority: P1) 🎯 MVP

**Goal**: Enable production deployment with `docker compose up` serving a healthy, functional application

**Independent Test**: Run `docker compose up -d` and verify the application is accessible at port 3000 with all containers healthy

### Implementation for User Story 1

- [ ] T006 [US1] Create multi-stage Dockerfile for Node.js app at Dockerfile
- [ ] T007 [US1] Create production docker-compose.yml at repository root
- [ ] T008 [US1] Configure app container with health check and restart policy in docker-compose.yml
- [ ] T009 [US1] Configure postgres container with health check and restart policy in docker-compose.yml
- [ ] T010 [US1] Configure depends_on with service_healthy condition in docker-compose.yml
- [ ] T011 [US1] Configure volume for PostgreSQL data persistence in docker-compose.yml
- [ ] T012 [US1] Add entrypoint logic for running database migrations on app startup in Dockerfile

**Checkpoint**: Production deployment works - `docker compose up -d` starts all services, health checks pass, app is accessible

---

## Phase 4: User Story 2 - Automated Weekly Allowance Processing (Priority: P2)

**Goal**: Configure pg_cron to automatically process weekly allowance transactions

**Independent Test**: Verify pg_cron extension is installed and scheduled jobs are listed in `cron.job` table

### Implementation for User Story 2

- [ ] T013 [US2] Add weekly_allowance cron job to init-extensions.sql at docker/postgres/init-extensions.sql
- [ ] T014 [US2] Add purge_cron_history maintenance job to init-extensions.sql at docker/postgres/init-extensions.sql
- [ ] T015 [US2] Configure pg_cron database settings in PostgreSQL Dockerfile at docker/postgres/Dockerfile

**Checkpoint**: pg_cron jobs are scheduled and visible via `SELECT * FROM cron.job`

---

## Phase 5: User Story 3 - Local Development with Hot Reload (Priority: P3)

**Goal**: Provide a development workflow with containerized database and local hot-reload app

**Independent Test**: Start `docker compose -f docker-compose.dev.yml up -d`, then `npm run dev` - verify hot reload works on code changes

### Implementation for User Story 3

- [ ] T016 [US3] Create docker-compose.dev.yml with PostgreSQL container only at repository root
- [ ] T017 [US3] Expose port 5432 for local database access in docker-compose.dev.yml
- [ ] T018 [US3] Configure same PostgreSQL image (with pg_cron) as production in docker-compose.dev.yml

**Checkpoint**: Development workflow works - database container running, `npm run dev` connects and hot-reloads

---

## Phase 6: User Story 4 - Local Production Simulation (Priority: P4)

**Goal**: Allow testing production builds locally before deploying to server

**Independent Test**: Run `docker compose -f docker-compose.local.yml up -d --build` and verify app works identically to production with database port NOT exposed

### Implementation for User Story 4

- [ ] T019 [US4] Create docker-compose.local.yml for local production simulation at repository root
- [ ] T020 [US4] Configure separate volume name to avoid conflicts with dev database in docker-compose.local.yml
- [ ] T021 [US4] Ensure database port is NOT exposed (internal only) in docker-compose.local.yml

**Checkpoint**: Local production simulation mirrors production behavior - only app port exposed, database internal only

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and documentation alignment

- [ ] T022 [P] Verify .env.example matches all required environment variables from contracts
- [ ] T023 [P] Verify Dockerfile builds successfully with multi-stage build
- [ ] T024 Run full production stack locally to validate quickstart.md commands
- [ ] T025 Verify all health checks pass within success criteria timeframes (app 60s, healthy 90s)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (T001) - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) completion
- **User Story 2 (Phase 4)**: Depends on Phase 2 completion, refines init-extensions.sql from T005
- **User Story 3 (Phase 5)**: Depends on Phase 2 completion (needs PostgreSQL Dockerfile)
- **User Story 4 (Phase 6)**: Depends on Phase 3 completion (uses same Dockerfile as production)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational - Modifies files from T005 (sequence after T005)
- **User Story 3 (P3)**: Can start after Foundational - Independent of US1/US2
- **User Story 4 (P4)**: Depends on US1 (reuses Dockerfile) - Should complete after US1

### Within Each User Story

- Core configuration files first
- Health checks and policies second
- Integration/validation last

### Parallel Opportunities

**Phase 1:**
- T002 and T003 can run in parallel (different files)

**Phase 2:**
- T004 and T005 target different files but T005 conceptually depends on T004

**After Foundational:**
- US1 and US3 can be worked on in parallel (different compose files)
- US2 modifies T005 file, should sequence after T005

**Phase 7:**
- T022 and T023 can run in parallel (different validation tasks)

---

## Parallel Example: Phase 1 Setup

```bash
# Launch these tasks together:
Task: "Create .dockerignore file at repository root"
Task: "Create .env.example file at repository root"
```

## Parallel Example: User Stories 1 and 3

```bash
# After Foundational completes, these can run in parallel:
# Developer A works on:
Task: "[US1] Create multi-stage Dockerfile for Node.js app"
Task: "[US1] Create production docker-compose.yml"

# Developer B works on:
Task: "[US3] Create docker-compose.dev.yml with PostgreSQL container only"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T005)
3. Complete Phase 3: User Story 1 (T006-T012)
4. **STOP and VALIDATE**: Run `docker compose up -d` and verify app is accessible
5. Deploy to server if ready

### Incremental Delivery

1. Complete Setup + Foundational → PostgreSQL with pg_cron ready
2. Add User Story 1 → Production deployment works → Deploy (MVP!)
3. Add User Story 2 → Automated allowances scheduled → No redeployment needed (jobs added on next fresh DB init)
4. Add User Story 3 → Developer workflow improved
5. Add User Story 4 → Pre-deployment validation available
6. Polish → Documentation verified

### Files to Create

| File | Phase | User Story |
|------|-------|------------|
| `docker/` directory | Phase 1 | - |
| `.dockerignore` | Phase 1 | - |
| `.env.example` | Phase 1 | - |
| `docker/postgres/Dockerfile` | Phase 2 | - |
| `docker/postgres/init-extensions.sql` | Phase 2, US2 | US2 |
| `Dockerfile` | Phase 3 | US1 |
| `docker-compose.yml` | Phase 3 | US1 |
| `docker-compose.dev.yml` | Phase 5 | US3 |
| `docker-compose.local.yml` | Phase 6 | US4 |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- No schema migrations needed - existing `familienkasse_account` already has `recurring_allowance_enabled` and `recurring_allowance_amount` fields
