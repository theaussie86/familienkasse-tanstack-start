# Quickstart: Family Finance Data Model

**Feature**: 001-data-model
**Date**: 2025-01-19

## Prerequisites

- Node.js 18+
- PostgreSQL database running
- Environment variables configured (see below)

## Environment Setup

Create or update `.env.local`:

```bash
# Existing variables
DATABASE_URL=postgresql://user:password@localhost:5432/familienkasse
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# New variable for registration control
ALLOW_REGISTRATION=true  # Set to 'false' to disable new user registration
```

## Installation

```bash
# Install dependencies (if not already done)
npm install

# Generate database migration
npm run db:generate

# Apply migration
npm run db:migrate

# Verify tables created
npm run db:studio
```

## Verify Schema

After running migrations, verify in Drizzle Studio (`npm run db:studio`):

1. Navigate to Tables
2. Confirm `familienkasse_account` exists with columns:
   - `id`, `name`, `user_id`, `created_at`, `updated_at`
3. Confirm `familienkasse_transaction` exists with columns:
   - `id`, `account_id`, `description`, `amount`, `is_paid`, `created_at`

## Test Registration Control

1. **With registration enabled** (default):
   ```bash
   # Start server
   npm run dev

   # Visit http://localhost:3000/login
   # "Sign up" option should be visible and functional
   ```

2. **With registration disabled**:
   ```bash
   # Update .env.local
   ALLOW_REGISTRATION=false

   # Restart server
   npm run dev

   # Visit http://localhost:3000/login
   # Attempting to sign up should show an error or be blocked
   ```

## Manual Database Verification

```sql
-- Connect to your PostgreSQL database
-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'familienkasse%';

-- Check foreign key constraints
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name LIKE 'familienkasse%';
```

## Test Data (Optional)

After creating a user account via the login page, you can add test data:

```sql
-- Replace 'your-user-id' with actual user ID from the user table
INSERT INTO familienkasse_account (id, name, user_id, created_at, updated_at)
VALUES
  ('acc-001', 'Kids Allowance', 'your-user-id', NOW(), NOW()),
  ('acc-002', 'Vacation Fund', 'your-user-id', NOW(), NOW());

-- Add test transactions (amounts in cents)
INSERT INTO familienkasse_transaction (id, account_id, description, amount, is_paid, created_at)
VALUES
  ('txn-001', 'acc-001', 'Weekly allowance', 1000, true, NOW()),
  ('txn-002', 'acc-001', 'Bought candy', -250, true, NOW()),
  ('txn-003', 'acc-002', 'Birthday gift', 5000, true, NOW());
```

## Verification Checklist

- [ ] `npm run db:migrate` completes without errors
- [ ] `familienkasse_account` table exists in database
- [ ] `familienkasse_transaction` table exists in database
- [ ] Foreign key from `familienkasse_account.user_id` to `user.id` works
- [ ] Foreign key from `familienkasse_transaction.account_id` to `familienkasse_account.id` works
- [ ] Cascade delete works (deleting account removes its transactions)
- [ ] `ALLOW_REGISTRATION=false` blocks new sign-ups
- [ ] `ALLOW_REGISTRATION=true` (or unset) allows sign-ups

## Troubleshooting

### Migration fails

```bash
# Check database connection
npm run db:studio

# If schema is out of sync, push directly (dev only)
npm run db:push
```

### Foreign key errors

Ensure the `user` table exists with Better-Auth schema. Run Better-Auth migrations first if needed.

### Registration control not working

1. Confirm `ALLOW_REGISTRATION` is set in `.env.local` (not `.env`)
2. Restart the dev server after changing env vars
3. Check `src/lib/auth.ts` includes `disabledPaths` configuration
