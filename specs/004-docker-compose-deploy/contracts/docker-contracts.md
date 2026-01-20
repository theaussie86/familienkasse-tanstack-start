# Docker Configuration Contracts

**Feature**: 004-docker-compose-deploy | **Date**: 2026-01-20

## Overview

This feature introduces no new HTTP APIs. Instead, it defines Docker infrastructure contracts specifying the expected configuration structure, environment variables, and service interfaces.

---

## Container Interfaces

### App Container

**Image Base:** `node:22-alpine`
**Exposed Port:** 3000
**Entry Point:** `node .output/server/index.mjs`

#### Environment Variables (Required)

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `DATABASE_URL` | string | PostgreSQL connection string | `postgresql://user:pass@postgres:5432/familienkasse` |
| `GOOGLE_CLIENT_ID` | string | Google OAuth client ID | `123456789.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | string | Google OAuth client secret | `GOCSPX-xxxxx` |

#### Environment Variables (Optional)

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `PORT` | number | 3000 | HTTP server port |
| `ALLOW_REGISTRATION` | boolean | true | Enable/disable new user signup |
| `NODE_ENV` | string | production | Runtime environment |

#### Health Check Endpoint

```
GET http://localhost:3000/

Expected Response: 200 OK (any response indicates healthy)
```

---

### PostgreSQL Container

**Image Base:** `postgres:17-bookworm` (custom with pg_cron)
**Internal Port:** 5432
**Volume Mount:** `/var/lib/postgresql/data`

#### Environment Variables (Required)

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `POSTGRES_USER` | string | Database superuser name | `familienkasse` |
| `POSTGRES_PASSWORD` | string | Database superuser password | `secretpassword` |
| `POSTGRES_DB` | string | Default database name | `familienkasse` |

#### Health Check Command

```bash
pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}

Expected: Exit code 0 when ready
```

---

## Docker Compose Service Contracts

### Production Configuration (`docker-compose.yml`)

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      - DATABASE_URL
      - GOOGLE_CLIENT_ID
      - GOOGLE_CLIENT_SECRET
      - ALLOW_REGISTRATION
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/"]
      interval: 15s
      timeout: 5s
      retries: 5
      start_period: 30s

  postgres:
    build: ./docker/postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER
      - POSTGRES_PASSWORD
      - POSTGRES_DB
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s

volumes:
  postgres_data:
```

**Constraints:**
- Database port NOT exposed to host
- App container waits for healthy database before starting
- Both containers restart automatically on failure

---

### Development Configuration (`docker-compose.dev.yml`)

```yaml
services:
  postgres:
    build: ./docker/postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER
      - POSTGRES_PASSWORD
      - POSTGRES_DB
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s

volumes:
  postgres_data:
```

**Constraints:**
- Database port 5432 exposed for local development
- No app container (app runs locally via `npm run dev`)
- Same PostgreSQL image as production (with pg_cron)

---

### Local Production Simulation (`docker-compose.local.yml`)

Same as production but:
- May use different volume name to avoid conflicts
- Intended for testing production builds before deployment

---

## Network Contracts

### Production Network

```
                    ┌─────────────────────────────┐
                    │        Host Machine         │
                    │                             │
   External ───────►│  Port 3000 ──► app:3000     │
                    │                    │        │
                    │                    ▼        │
                    │              postgres:5432  │ (internal only)
                    │                             │
                    └─────────────────────────────┘
```

### Development Network

```
                    ┌─────────────────────────────┐
                    │        Host Machine         │
                    │                             │
   npm run dev ────►│  localhost:3000 (local app) │
                    │           │                 │
                    │           ▼                 │
   DB Tools ───────►│  Port 5432 ──► postgres     │
                    │                             │
                    └─────────────────────────────┘
```

---

## Volume Contracts

### postgres_data

**Purpose:** Persist PostgreSQL data across container restarts

**Path in Container:** `/var/lib/postgresql/data`

**Contents:**
- Database files
- pg_cron extension data
- Transaction logs

**Backup Strategy:** Volume can be backed up using `docker cp` or volume backup tools

---

## Init Script Contract

### PostgreSQL Initialization (`docker/postgres/init-extensions.sql`)

Executed once when database is first created.

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule weekly allowance job (every Monday at 10 AM)
SELECT cron.schedule(
    'weekly_allowance',
    '0 10 * * 1',
    $SQL$
    INSERT INTO familienkasse_transaction (id, account_id, description, amount, is_paid, created_at)
    SELECT
        gen_random_uuid()::text,
        fa.id,
        'Weekly allowance',
        fa.recurring_allowance_amount,
        false,
        NOW()
    FROM familienkasse_account fa
    WHERE fa.recurring_allowance_enabled = true
      AND fa.recurring_allowance_amount > 0
    $SQL$
);

-- Schedule history cleanup (daily at 1 AM)
SELECT cron.schedule(
    'purge_cron_history',
    '0 1 * * *',
    $$DELETE FROM cron.job_run_details WHERE end_time < NOW() - INTERVAL '7 days'$$
);
```

**Note:** This script runs AFTER the database is ready and pg_cron is loaded. A wrapper script handles the timing.
