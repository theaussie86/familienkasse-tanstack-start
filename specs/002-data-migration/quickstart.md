# Quickstart: Data Migration & Weekly Allowance Cron

**Feature**: 002-data-migration

## Prerequisites

1. Local PostgreSQL database running and accessible via `DATABASE_URL`
2. Supabase project with existing familienkasse data
3. Node.js 20+ installed

## Setup Steps

### 1. Configure Environment Variables

Add the Supabase connection string to your `.env` file:

```bash
# Existing
DATABASE_URL=postgresql://user:password@localhost:5432/familienkasse

# New: Supabase source database (transaction pooler)
# Get this from: Supabase Dashboard → Project Settings → Database → Connection string → Transaction pooler
SUPABASE_DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

### 2. Run Database Migration

Apply the schema changes to add recurring allowance fields:

```bash
# Generate the migration
npm run db:generate

# Apply the migration
npm run db:migrate
```

This adds:
- `recurring_allowance_enabled` (boolean) to `familienkasse_account`
- `recurring_allowance_amount` (integer) to `familienkasse_account`
- New `migration_log` table

### 3. Run Data Migration from Supabase

Execute the one-time migration script:

```bash
# From the project root
npx tsx src/scripts/migrate-from-supabase.ts
```

Expected output:
```
Starting migration from Supabase...
Connecting to source database...
Connecting to target database...
Migrating accounts... 5 migrated, 0 skipped
Migrating transactions... 47 migrated, 0 skipped
Validating balances... OK
Migration completed successfully!
```

**Re-running**: The migration is idempotent. Running it again will skip existing records:
```
Migrating accounts... 0 migrated, 5 skipped
```

### 4. Configure Weekly Allowance (Per Account)

In the app UI:
1. Navigate to Dashboard → Account → Edit
2. Toggle "Enable Weekly Allowance"
3. Enter the allowance amount (e.g., €5.00)
4. Save

Or via API:
```bash
curl -X PATCH http://localhost:3000/api/accounts/{accountId} \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=..." \
  -d '{"recurringAllowanceEnabled": true, "recurringAllowanceAmount": 500}'
```

### 5. Test Weekly Cron Job

Manually trigger the cron job to verify it works:

```bash
# Via API (requires admin auth)
curl -X POST http://localhost:3000/api/cron/weekly-allowance \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=..." \
  -d '{"dryRun": true}'  # Use dryRun first to test
```

Or via Nitro CLI (in development):
```bash
# List available tasks
curl http://localhost:3000/_nitro/tasks

# Run the task
npx nitro task run allowance:weekly
```

### 6. Verify Scheduled Task Configuration

The weekly cron is configured in `vite.config.ts` (Nitro section):

```typescript
scheduledTasks: {
  "0 0 * * 0": ["allowance:weekly"]  // Every Sunday at midnight
}
```

To test in development, temporarily change to run every minute:
```typescript
scheduledTasks: {
  "* * * * *": ["allowance:weekly"]  // Every minute (DEV ONLY)
}
```

## Verification Checklist

- [ ] Migration script runs without errors
- [ ] All accounts appear in local database with correct names
- [ ] All transactions appear with correct amounts and dates
- [ ] Account balances match original Supabase balances
- [ ] Edit account dialog shows allowance configuration fields
- [ ] Enabling allowance persists correctly
- [ ] Manual cron trigger creates allowance transactions
- [ ] Duplicate prevention works (run cron twice, only one transaction created)

## Troubleshooting

### Migration Errors

**"Connection refused" to Supabase**:
- Verify `SUPABASE_DATABASE_URL` uses the transaction pooler endpoint (port 6543)
- Check that your IP is allowed in Supabase network settings

**"Duplicate key" errors**:
- This shouldn't happen with `onConflictDoNothing()`, but if it does, the migration is safe to re-run

**Balance mismatch after migration**:
- Check `migration_log` table for details
- Run validation query: `SELECT account_id, SUM(amount) FROM familienkasse_transaction GROUP BY account_id`

### Cron Job Issues

**Cron not running**:
- Ensure `experimental: { tasks: true }` is set in Nitro config
- Check that the task file exists at `tasks/allowance/weekly.ts`

**Duplicate allowances created**:
- The duplicate detection checks for "Weekly Allowance" description in current week
- Verify transaction descriptions match exactly
