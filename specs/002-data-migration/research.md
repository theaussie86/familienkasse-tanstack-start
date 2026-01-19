# Research: Data Migration & Weekly Allowance Cron

**Feature**: 002-data-migration
**Date**: 2026-01-19

## Research Topics

### 1. Supabase Connection via Transaction Pooler (Supavisor)

**Decision**: Use Supavisor transaction pooler connection string for the migration source database.

**Rationale**:
- Supavisor handles connection pooling efficiently, preventing connection exhaustion during bulk reads
- Transaction mode is ideal for migration scripts that perform many sequential queries
- The pooler connection string is available in Supabase dashboard under Project Settings > Database > Connection string > Transaction pooler

**Connection String Format**:
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

**Environment Variable**: `SUPABASE_DATABASE_URL`

**Alternatives Considered**:
- Direct connection (port 5432): Rejected - limited to 60 concurrent connections, risky for migrations
- Session pooler (port 5432): Rejected - maintains session state which isn't needed for one-time migration
- Supabase MCP tools: Rejected - adds unnecessary abstraction layer for simple data reads

### 2. Drizzle ORM Dual Database Connections

**Decision**: Create two separate Drizzle instances - one for the source (Supabase) and one for the target (local PostgreSQL).

**Rationale**:
- Drizzle supports initializing multiple database connections with `drizzle()` function
- Each connection can use a different connection string
- Type-safe queries work independently on each connection
- No need for complex replication or sync patterns

**Implementation Pattern**:
```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Source: Supabase via Supavisor
const supabaseClient = postgres(process.env.SUPABASE_DATABASE_URL!);
const sourceDb = drizzle(supabaseClient);

// Target: Local PostgreSQL (existing connection)
const localClient = postgres(process.env.DATABASE_URL!);
const targetDb = drizzle(localClient);
```

**Alternatives Considered**:
- Single Drizzle instance with dynamic connection switching: Rejected - more complex, error-prone
- Raw SQL via pg library: Rejected - loses type safety, violates Constitution Principle I
- Export/import via JSON files: Rejected - adds unnecessary intermediate step, slower

### 3. Nitro Scheduled Tasks for Weekly Cron

**Decision**: Use Nitro's built-in `scheduledTasks` configuration with cron patterns.

**Rationale**:
- Native to the existing Nitro runtime (already in use)
- Zero additional dependencies
- Supports standard cron syntax
- Works in development and production (node-server preset)
- Tasks can also be triggered manually via API for testing

**Implementation Pattern**:
```typescript
// nitro.config.ts or vite.config.ts nitro section
{
  experimental: { tasks: true },
  scheduledTasks: {
    // Every Sunday at midnight
    "0 0 * * 0": ["allowance:weekly"]
  }
}
```

**Task Definition** (in `tasks/allowance/weekly.ts`):
```typescript
export default defineTask({
  meta: {
    name: "allowance:weekly",
    description: "Process weekly allowances for configured accounts"
  },
  async run() {
    // Implementation here
    return { result: "success" };
  }
});
```

**Alternatives Considered**:
- External cron service (e.g., cron-job.org): Rejected - adds external dependency, requires exposed endpoint
- Supabase Edge Functions with pg_cron: Rejected - we're migrating away from Supabase
- Node-cron library: Rejected - duplicates Nitro's built-in capability

### 4. Idempotent Migration Strategy

**Decision**: Use "upsert on conflict skip" pattern for idempotent migration.

**Rationale**:
- Migration can be re-run without creating duplicates (spec requirement SC-006)
- Uses PostgreSQL's `ON CONFLICT DO NOTHING` via Drizzle's `onConflictDoNothing()`
- Preserves existing local data if any exists
- Simple to implement and understand

**Implementation Pattern**:
```typescript
// For each record from source
await targetDb
  .insert(familienkasseAccount)
  .values(accountData)
  .onConflictDoNothing({ target: familienkasseAccount.id });
```

**Alternatives Considered**:
- Delete all + re-insert: Rejected - destructive, loses local-only data
- Check existence before insert: Rejected - slower, more queries
- Timestamp-based sync: Rejected - over-engineering for one-time migration

### 5. Duplicate Allowance Prevention

**Decision**: Check for existing weekly allowance transaction before creating new one.

**Rationale**:
- Prevents duplicate allowances if cron runs multiple times (spec requirement FR-014)
- Uses transaction description pattern matching + date range query
- Simple week boundary check (Sunday 00:00 to Saturday 23:59)

**Implementation Pattern**:
```typescript
const startOfWeek = getStartOfCurrentWeek();
const existingAllowance = await db
  .select()
  .from(familienkasseTransaction)
  .where(
    and(
      eq(familienkasseTransaction.accountId, accountId),
      like(familienkasseTransaction.description, 'Weekly Allowance%'),
      gte(familienkasseTransaction.createdAt, startOfWeek)
    )
  )
  .limit(1);

if (existingAllowance.length === 0) {
  // Safe to create new allowance transaction
}
```

**Alternatives Considered**:
- Separate tracking table for cron runs: Rejected - over-engineering
- Lock file / mutex: Rejected - doesn't survive process restarts
- Unique constraint on (accountId, week, type): Rejected - requires schema change for edge case

## Resolved Unknowns

| Unknown | Resolution |
|---------|------------|
| How to connect to Supabase source? | Transaction pooler via `SUPABASE_DATABASE_URL` |
| How to handle dual DB connections in Drizzle? | Separate `drizzle()` instances per connection |
| How to implement weekly cron in Nitro? | Built-in `scheduledTasks` with cron pattern `"0 0 * * 0"` |
| How to make migration idempotent? | `onConflictDoNothing()` pattern |
| How to prevent duplicate allowances? | Query for existing allowance in current week before insert |

## Dependencies to Add

None required. The existing `postgres` and `drizzle-orm` packages support multiple connections. Nitro tasks are built-in (requires `experimental: { tasks: true }`).

## Environment Variables Required

```bash
# Existing
DATABASE_URL=postgresql://...  # Local PostgreSQL

# New for migration
SUPABASE_DATABASE_URL=postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres
```
