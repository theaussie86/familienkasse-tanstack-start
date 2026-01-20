# Research: Docker Compose Deployment

**Feature**: 004-docker-compose-deploy | **Date**: 2026-01-20

## Research Tasks Completed

1. TanStack Start Docker deployment patterns
2. PostgreSQL 17 with pg_cron extension in Docker
3. Docker Compose health checks and service dependencies

---

## Decision 1: TanStack Start Production Build & Docker

### Decision
Use multi-stage Docker build with Node.js 22 Alpine, building with `npm run build` and running the Nitro server from `.output/server/index.mjs`.

### Rationale
- TanStack Start with Nitro outputs to `.output/` directory (not `dist/`)
- The `.output` directory is self-contained and doesn't require `node_modules` at runtime
- Alpine images reduce size by ~70% (70MB vs 700MB+)
- Multi-stage builds separate build dependencies from runtime

### Key Findings

**Build Process:**
- Command: `npm run build` (runs `vite build`)
- Output: `.output/` directory containing:
  - `.output/server/index.mjs` - Nitro server entry point
  - `.output/public/` - Static assets

**Entry Point:**
```
node .output/server/index.mjs
```

**Environment Variables:**
- Build-time: Variables baked into client bundles require `VITE_` prefix
- Runtime: `DATABASE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ALLOW_REGISTRATION`
- Nitro: `PORT` or `NITRO_PORT` (default 3000), `HOST` or `NITRO_HOST`

**Multi-Stage Build Pattern:**
1. Stage 1 (deps): Install all dependencies
2. Stage 2 (builder): Copy source, run build
3. Stage 3 (runtime): Alpine image, copy only `.output/`

### Alternatives Considered
- Single-stage build: Rejected due to larger image size (includes dev dependencies)
- Debian-based runtime: Rejected; Alpine is sufficient and smaller

---

## Decision 2: PostgreSQL with pg_cron

### Decision
Build a custom PostgreSQL 17 Dockerfile based on `postgres:17-bookworm` with `postgresql-17-cron` installed and configured.

### Rationale
- Official `postgres:17` image doesn't include pg_cron
- Pre-built images (qonicsinc/postgres-pgcron) exist but custom build gives full control
- pg_cron requires `shared_preload_libraries` configuration which must be set at startup

### Key Findings

**Extension Setup:**
1. Install `postgresql-17-cron` package in Dockerfile
2. Configure `shared_preload_libraries = 'pg_cron'` in postgresql.conf
3. Set `cron.database_name = 'familienkasse'`
4. Run `CREATE EXTENSION pg_cron` after database init

**Important Limitation:**
- Cannot create extension in `/docker-entrypoint-initdb.d` SQL scripts (timing issue)
- Extension must be created after PostgreSQL starts with pg_cron loaded
- Solution: Use init script that waits for PostgreSQL, then creates extension

**Cron Schedule Syntax:**
```sql
-- Every Monday at 10:00 AM
SELECT cron.schedule(
    'weekly_allowance',
    '0 10 * * 1',
    $$INSERT INTO familienkasse_transaction (id, account_id, description, amount, is_paid, created_at)
      SELECT
        gen_random_uuid()::text,
        fa.id,
        'Weekly allowance',
        fa.recurring_allowance_amount,
        false,
        NOW()
      FROM familienkasse_account fa
      WHERE fa.recurring_allowance_enabled = true$$
);
```

**Maintenance Required:**
```sql
-- Purge old job history daily
SELECT cron.schedule(
    'purge_cron_history',
    '0 1 * * *',
    $$DELETE FROM cron.job_run_details WHERE end_time < NOW() - INTERVAL '7 days'$$
);
```

### Alternatives Considered
- Pre-built `qonicsinc/postgres-pgcron:17.5`: Valid option, but custom build preferred for control
- Application-level scheduling (node-cron): Rejected; database-level is more reliable and survives app restarts

---

## Decision 3: Health Checks & Service Dependencies

### Decision
Use native Docker Compose healthchecks with `depends_on: condition: service_healthy` for PostgreSQL readiness.

### Rationale
- Native Docker Compose feature (no external scripts like wait-for-it)
- Continuous monitoring, not just one-time check
- `pg_isready` is purpose-built for PostgreSQL connection verification

### Key Findings

**PostgreSQL Health Check:**
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}"]
  interval: 10s
  timeout: 5s
  retries: 5
  start_period: 10s
```

**Node.js App Health Check:**
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/"]
  interval: 15s
  timeout: 5s
  retries: 5
  start_period: 30s
```

**Service Dependency:**
```yaml
app:
  depends_on:
    postgres:
      condition: service_healthy
```

**Condition Options:**
- `service_started`: Default, shortest wait
- `service_healthy`: Waits for healthcheck to pass
- `service_completed_successfully`: For one-time tasks

### Alternatives Considered
- wait-for-it.sh script: Rejected; native healthchecks are preferred and more maintainable
- Just port checking: Rejected; `pg_isready` verifies actual database readiness

---

## Decision 4: Docker Compose Configurations

### Decision
Three separate docker-compose files for different environments:
1. `docker-compose.yml` - Production deployment
2. `docker-compose.dev.yml` - Development (DB only)
3. `docker-compose.local.yml` - Local production simulation

### Rationale
- Clear separation of concerns
- Different networking requirements (DB exposed in dev, internal in prod)
- Different volume requirements (dev may need additional mounts)

### Configuration Matrix

| Config | App Container | DB Container | DB Port Exposed | Use Case |
|--------|--------------|--------------|-----------------|----------|
| `docker-compose.yml` | Yes | Yes | No | Production server |
| `docker-compose.dev.yml` | No | Yes | Yes (5432) | Local dev with `npm run dev` |
| `docker-compose.local.yml` | Yes | Yes | No | Test production build locally |

### Alternatives Considered
- Single docker-compose with profiles: More complex, harder to understand
- Extends/override files: Valid but separate files are clearer

---

## Decision 5: Database Migrations

### Decision
Run Drizzle migrations on app container startup via entrypoint script.

### Rationale
- Migrations must complete before app serves traffic
- Drizzle's `npm run db:migrate` handles migration tracking
- Containerized approach ensures migrations run in the correct environment

### Implementation
App container entrypoint:
1. Wait for PostgreSQL to be healthy (handled by depends_on)
2. Run `npm run db:migrate`
3. Start the application

### Alternatives Considered
- Separate migration container: Over-engineering for this use case
- Manual migrations: Risk of forgetting, not reproducible

---

## Technical Specifications

### Dockerfile (Multi-Stage)

**Stage 1 - Dependencies:**
- Base: `node:22-alpine`
- Install `libc6-compat` for native module compatibility
- Copy `package*.json`, run `npm ci`

**Stage 2 - Builder:**
- Copy source code
- Run `npm run build`

**Stage 3 - Runtime:**
- Base: `node:22-alpine`
- Copy `.output/` from builder
- Run as non-root user
- Entry: `node .output/server/index.mjs`

### PostgreSQL Dockerfile

**Base:** `postgres:17-bookworm`
**Packages:** `postgresql-17-cron`
**Config:** `shared_preload_libraries = 'pg_cron'`

### Volume Configuration

```yaml
volumes:
  postgres_data:
    driver: local
```

Mount: `/var/lib/postgresql/data`

---

## Open Items Resolved

All technical unknowns from the spec have been resolved:
- Build process for TanStack Start with Nitro
- pg_cron setup in Docker
- Health check patterns for both services
- Migration strategy on startup
- Three-configuration approach for different environments
