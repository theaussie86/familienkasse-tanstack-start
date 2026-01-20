# Implementation Plan: Docker Compose Deployment

**Branch**: `004-docker-compose-deploy` | **Date**: 2026-01-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-docker-compose-deploy/spec.md`

## Summary

Deploy the Familienkasse application using Docker Compose with PostgreSQL 17 (including pg_cron for automated weekly allowance processing) and a Node.js container running TanStack Start with Nitro. The setup provides three configurations: development (local app with containerized DB), local production simulation (both containers, internal DB), and production deployment.

## Technical Context

**Language/Version**: Node.js 22 LTS, TypeScript 5.7
**Primary Dependencies**: TanStack Start 1.132, Nitro (server runtime), Drizzle ORM 0.45, Vite 7
**Storage**: PostgreSQL 17 with pg_cron extension via Drizzle ORM
**Testing**: Vitest 3.0 (existing tests), Docker health checks
**Target Platform**: Docker containers (Linux-based), deployable to any Docker-capable server
**Project Type**: Web application (full-stack monolith)
**Performance Goals**: App starts within 60s, health checks pass within 90s
**Constraints**: Database data must persist across restarts, minimal downtime during updates
**Scale/Scope**: Single-user family application, low traffic

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Check (Phase 0)

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Type Safety** | PASS | No application code changes required; Docker/infrastructure only |
| **II. Security First** | PASS | Database not exposed in production; secrets via env vars; internal networking |
| **III. Simplicity** | PASS | Standard Docker Compose patterns; no over-engineering |
| **Stack Constraints** | PASS | Using existing stack (TanStack Start, Drizzle, PostgreSQL) |
| **Quality Gates** | PASS | Will use existing lint/test commands; migrations via Drizzle |

### Post-Design Re-Check (Phase 1)

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Type Safety** | PASS | pg_cron SQL is database-native; no TypeScript changes |
| **II. Security First** | PASS | Production config: DB internal only; secrets via `.env`; non-root container user |
| **III. Simplicity** | PASS | Three compose files (dev/local/prod) is minimal; multi-stage Dockerfile is standard |
| **Stack Constraints** | PASS | PostgreSQL 17 with pg_cron aligns with existing Drizzle ORM patterns |
| **Quality Gates** | PASS | Migrations via `npm run db:migrate`; healthchecks for container orchestration |

**Constitution Check Result**: All gates passed both pre- and post-design. No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/004-docker-compose-deploy/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (minimal - no new APIs)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
# Docker Configuration (new files at repository root)
docker-compose.yml           # Production configuration
docker-compose.dev.yml       # Development database only
docker-compose.local.yml     # Local production simulation
Dockerfile                   # Multi-stage Node.js build

# Database Extensions (new)
docker/
└── postgres/
    └── init-extensions.sql  # pg_cron extension setup and cron job

# Existing Source Structure (unchanged)
src/
├── routes/              # TanStack Router routes
├── components/          # React components
├── db/
│   ├── schema.ts        # Already has recurringAllowance fields
│   └── queries/         # Existing CRUD operations
└── lib/                 # Utilities
drizzle/                 # Migration files (unchanged)
```

**Structure Decision**: Infrastructure-only addition at repository root. No changes to existing `src/` structure. Docker configuration files follow standard placement conventions.

## Complexity Tracking

> No violations. Constitution Check passed.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (none) | — | — |

---

## Generated Artifacts

| Artifact | Description |
|----------|-------------|
| [research.md](./research.md) | Technical decisions for Docker, pg_cron, and health checks |
| [data-model.md](./data-model.md) | Existing schema fields used by pg_cron; cron job definitions |
| [contracts/docker-contracts.md](./contracts/docker-contracts.md) | Docker Compose service interfaces and environment variables |
| [quickstart.md](./quickstart.md) | Developer guide for dev, local-prod, and production deployment |

---

## Next Steps

Run `/speckit.tasks` to generate the implementation task list from this plan.
