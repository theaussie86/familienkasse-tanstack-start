# Feature Specification: Docker Compose Deployment

**Feature Branch**: `004-docker-compose-deploy`
**Created**: 2026-01-20
**Status**: Draft
**Input**: User description: "Docker Compose deployment with PostgreSQL 17, pg_cron for weekly allowance scheduling, and Node.js container for building and serving the TanStack Start app with Nitro. Local development runs locally, production uses Docker Compose."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Deploy Application to Production Server (Priority: P1)

As a developer, I want to deploy the Familienkasse application to my own server using Docker Compose so that the application runs in a consistent, reproducible environment with all required services.

**Why this priority**: This is the core value of the feature - enabling production deployment. Without this, the entire feature has no purpose.

**Independent Test**: Can be fully tested by running `docker compose up` on the target server and verifying the application is accessible and functional.

**Acceptance Scenarios**:

1. **Given** a server with Docker and Docker Compose installed, **When** I run `docker compose up -d`, **Then** the application starts with all services (app, database) running and healthy
2. **Given** the Docker Compose stack is running, **When** I access the application URL, **Then** I see the login page and can authenticate
3. **Given** the Docker Compose stack is running, **When** I check service health, **Then** all containers report healthy status

---

### User Story 2 - Automated Weekly Allowance Processing (Priority: P2)

As a family administrator, I want the system to automatically process weekly allowance transactions so that children's accounts are credited without manual intervention.

**Why this priority**: This automates a key recurring task and is enabled by the pg_cron extension. It depends on P1 being complete.

**Independent Test**: Can be tested by configuring a cron job and verifying transactions are created at the scheduled time.

**Acceptance Scenarios**:

1. **Given** the pg_cron extension is installed and configured, **When** the scheduled time arrives, **Then** allowance transactions are automatically created for configured accounts
2. **Given** an allowance schedule is configured, **When** I check the cron jobs, **Then** I see the scheduled job listed with correct timing
3. **Given** the weekly allowance job runs, **When** I view account balances, **Then** the balances reflect the credited allowance amounts

---

### User Story 3 - Local Development with Hot Reload (Priority: P3)

As a developer, I want to run the application locally with hot reload while using a containerized PostgreSQL database so that I have fast iteration cycles with instant feedback on code changes.

**Why this priority**: Developer experience is important but secondary to production deployment capability. This is the primary development workflow.

**Independent Test**: Can be tested by starting the database container, running `npm run dev`, and verifying hot reload works on code changes.

**Acceptance Scenarios**:

1. **Given** the PostgreSQL container is running with exposed port, **When** I run `npm run dev`, **Then** the application starts and connects to the containerized database
2. **Given** I'm developing locally, **When** I make code changes, **Then** the application hot-reloads without rebuilding any container
3. **Given** the development database container is running, **When** I connect via a database client to the exposed port, **Then** I can inspect and modify data directly

---

### User Story 4 - Local Production Simulation (Priority: P4)

As a developer, I want to run the full production Docker Compose stack locally so that I can verify the production build works correctly before deploying to the server.

**Why this priority**: Testing production builds locally prevents deployment failures but is less frequent than active development.

**Independent Test**: Can be tested by running the production Docker Compose configuration and verifying the app works identically to production.

**Acceptance Scenarios**:

1. **Given** I have made code changes, **When** I run the local production Docker Compose configuration, **Then** the app builds and runs with production settings
2. **Given** the local production stack is running, **When** I access the application, **Then** only the app port is exposed (database is internal only)
3. **Given** the local production stack is running, **When** I try to connect to the database from outside Docker, **Then** the connection is refused (database not exposed)
4. **Given** the local production stack is running, **When** I compare behavior to the development setup, **Then** the application functions identically

---

### Edge Cases

- What happens when the database container fails to start? The app container should wait and retry connection.
- What happens when pg_cron job fails? The failure should be logged and not crash the database.
- What happens when the app container crashes? Docker Compose should restart it automatically.
- What happens when database migrations need to run? Migrations should run automatically on container startup.
- What happens during a deployment update? The update should be possible with minimal downtime.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a Docker Compose configuration that starts all required services (application, database)
- **FR-002**: System MUST use PostgreSQL 17 as the database container image
- **FR-003**: System MUST include the pg_cron extension in the PostgreSQL container for scheduled jobs
- **FR-004**: System MUST use a Node.js container to build and serve the TanStack Start application with Nitro
- **FR-005**: System MUST provide a development setup with PostgreSQL container (port exposed) and local `npm run dev` for hot reload
- **FR-005a**: System MUST provide a local production simulation setup running both containers with only the app port exposed
- **FR-006**: System MUST configure Nitro as the server runtime for TanStack Start in production
- **FR-007**: System MUST automatically run database migrations on application startup
- **FR-008**: System MUST provide health checks for all containers
- **FR-009**: System MUST persist database data using Docker volumes
- **FR-010**: System MUST support environment variable configuration for secrets and settings
- **FR-011**: System MUST configure pg_cron to execute weekly allowance transactions
- **FR-012**: System MUST restart containers automatically on failure

### Key Entities

- **App Container**: Node.js environment that builds and serves the TanStack Start application using Nitro runtime
- **Database Container**: PostgreSQL 17 with pg_cron extension for scheduled job execution
- **Docker Volume**: Persistent storage for database data that survives container restarts
- **Cron Job**: Scheduled database job that creates weekly allowance transactions
- **Development Configuration**: Docker Compose setup with only PostgreSQL, port exposed for local app development
- **Production Simulation Configuration**: Docker Compose setup mimicking production with internal-only database networking
- **Production Configuration**: Docker Compose setup for deployment to server

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Application starts successfully within 60 seconds of running `docker compose up`
- **SC-002**: All containers pass health checks within 90 seconds of startup
- **SC-003**: Weekly allowance transactions are created automatically within 1 minute of scheduled time
- **SC-004**: Local development server starts within 10 seconds using `npm run dev` (with database container already running)
- **SC-004a**: Local production simulation starts within 90 seconds and mirrors production behavior exactly
- **SC-005**: Database data persists across container restarts with zero data loss
- **SC-006**: Application remains available during container restarts (restart completes in under 30 seconds)
- **SC-007**: Deployment to a new server can be completed in under 15 minutes following documentation

## Assumptions

- The target server has Docker and Docker Compose installed (version 2.x or later)
- The developer has Docker installed locally for running the PostgreSQL container in development
- The server has sufficient resources (minimum 1GB RAM, 10GB storage)
- Network ports 3000 (app) and 5432 (database, if exposed) are available
- The build pipeline mentioned by the user will be configured separately and is out of scope
- Weekly allowance configuration (amounts, accounts, schedule) will use existing or new database tables
- SSL/TLS termination will be handled by a reverse proxy outside this Docker Compose stack
