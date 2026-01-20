# Quickstart: Docker Compose Deployment

**Feature**: 004-docker-compose-deploy | **Date**: 2026-01-20

## Prerequisites

- Docker Engine 24.0+ and Docker Compose 2.x
- Git (to clone the repository)
- Environment variables configured (see below)

---

## Environment Setup

Create a `.env` file in the project root:

```bash
# Database
POSTGRES_USER=familienkasse
POSTGRES_PASSWORD=your-secure-password
POSTGRES_DB=familienkasse

# Application
DATABASE_URL=postgresql://familienkasse:your-secure-password@postgres:5432/familienkasse
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
ALLOW_REGISTRATION=true
```

---

## Development Setup

Run the database container only, then use local hot-reload development:

```bash
# 1. Start PostgreSQL with pg_cron
docker compose -f docker-compose.dev.yml up -d

# 2. Wait for database to be ready
docker compose -f docker-compose.dev.yml ps  # Check health status

# 3. Run migrations
npm run db:migrate

# 4. Start local development server
npm run dev
```

Access the app at `http://localhost:3000`

**Database Access:**
- Host: `localhost`
- Port: `5432`
- Database: `familienkasse`

---

## Production Deployment

Deploy the full stack to a server:

```bash
# 1. Clone repository on server
git clone <repository-url>
cd familienkasse-tanstack-start

# 2. Create .env file with production values
cp .env.example .env
# Edit .env with production credentials

# 3. Build and start all services
docker compose up -d --build

# 4. Verify health
docker compose ps

# 5. Check logs
docker compose logs -f app
```

Access the app at `http://your-server:3000`

---

## Local Production Simulation

Test the production build locally before deploying:

```bash
# Build and run full production stack locally
docker compose -f docker-compose.local.yml up -d --build

# Verify
docker compose -f docker-compose.local.yml ps
```

---

## Common Commands

### View Logs

```bash
# All services
docker compose logs -f

# App only
docker compose logs -f app

# Database only
docker compose logs -f postgres
```

### Check pg_cron Jobs

```bash
docker compose exec postgres psql -U familienkasse -d familienkasse -c "SELECT * FROM cron.job;"
```

### View Cron Job History

```bash
docker compose exec postgres psql -U familienkasse -d familienkasse -c "SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;"
```

### Restart Services

```bash
# Restart app only
docker compose restart app

# Restart all
docker compose restart
```

### Stop and Remove

```bash
# Stop services (keep data)
docker compose down

# Stop and remove volumes (DESTROYS DATA)
docker compose down -v
```

### Rebuild After Code Changes

```bash
docker compose up -d --build app
```

---

## Troubleshooting

### App Can't Connect to Database

1. Check database health: `docker compose ps`
2. Verify `DATABASE_URL` in `.env` uses `postgres` as host (not `localhost`)
3. Check database logs: `docker compose logs postgres`

### Migrations Not Running

1. Migrations run on app container start
2. Check app logs: `docker compose logs app`
3. Manual migration: `docker compose exec app npm run db:migrate`

### pg_cron Jobs Not Running

1. Verify extension is installed:
   ```bash
   docker compose exec postgres psql -U familienkasse -d familienkasse -c "SELECT * FROM pg_extension WHERE extname = 'pg_cron';"
   ```
2. Check scheduled jobs: `SELECT * FROM cron.job;`
3. Check job history for errors: `SELECT * FROM cron.job_run_details WHERE status = 'failed';`

### Health Check Failing

1. App health check: `curl -f http://localhost:3000/`
2. DB health check: `docker compose exec postgres pg_isready -U familienkasse`

---

## File Structure

After implementation, new files will be:

```
/
├── Dockerfile                      # Multi-stage Node.js build
├── docker-compose.yml              # Production configuration
├── docker-compose.dev.yml          # Development (DB only)
├── docker-compose.local.yml        # Local production simulation
├── .dockerignore                   # Docker build exclusions
├── .env.example                    # Environment variable template
└── docker/
    └── postgres/
        ├── Dockerfile              # PostgreSQL 17 + pg_cron
        └── init-extensions.sql     # pg_cron setup script
```
