# Data Model: Docker Compose Deployment

**Feature**: 004-docker-compose-deploy | **Date**: 2026-01-20

## Overview

This feature is primarily infrastructure-focused. No new application tables are required. This document describes:
1. Existing schema elements used by pg_cron for weekly allowance processing
2. pg_cron system tables for job scheduling

---

## Existing Entities (Used by pg_cron)

### familienkasse_account

The existing account table already has fields for recurring allowance configuration.

| Field | Type | Description |
|-------|------|-------------|
| `id` | text | Primary key (UUID) |
| `name` | text | Account holder name |
| `user_id` | text | FK to user table |
| `recurring_allowance_enabled` | boolean | Whether weekly allowance is active |
| `recurring_allowance_amount` | integer | Amount in cents (e.g., 500 = €5.00) |
| `created_at` | timestamp | Creation timestamp |
| `updated_at` | timestamp | Last update timestamp |

**pg_cron Usage:** The scheduled job queries this table to find accounts where `recurring_allowance_enabled = true`.

### familienkasse_transaction

The existing transaction table where pg_cron inserts allowance transactions.

| Field | Type | Description |
|-------|------|-------------|
| `id` | text | Primary key (UUID) |
| `account_id` | text | FK to familienkasse_account |
| `description` | text | Transaction description |
| `amount` | integer | Amount in cents |
| `is_paid` | boolean | Payment status (default: false) |
| `created_at` | timestamp | Creation timestamp |

**pg_cron Usage:** Inserts new rows with description "Weekly allowance" for enabled accounts.

---

## pg_cron System Tables

pg_cron creates and manages these tables in the `cron` schema.

### cron.job

System table storing scheduled job definitions.

| Field | Type | Description |
|-------|------|-------------|
| `jobid` | bigint | Auto-generated job ID |
| `schedule` | text | Cron schedule expression |
| `command` | text | SQL command to execute |
| `nodename` | text | Node hostname |
| `nodeport` | integer | PostgreSQL port |
| `database` | text | Target database |
| `username` | text | Executing user |
| `active` | boolean | Whether job is active |
| `jobname` | text | Human-readable job name |

### cron.job_run_details

System table storing job execution history.

| Field | Type | Description |
|-------|------|-------------|
| `jobid` | bigint | Reference to cron.job |
| `runid` | bigint | Unique run identifier |
| `job_pid` | integer | PostgreSQL backend PID |
| `database` | text | Target database |
| `username` | text | Executing user |
| `command` | text | Executed SQL command |
| `status` | text | 'starting', 'running', 'succeeded', 'failed' |
| `return_message` | text | Result message or error |
| `start_time` | timestamptz | Job start time |
| `end_time` | timestamptz | Job completion time |

**Maintenance Note:** This table grows unbounded. A cleanup job should purge entries older than 7 days.

---

## Scheduled Jobs Configuration

### weekly_allowance

Inserts weekly allowance transactions for enabled accounts.

```sql
SELECT cron.schedule(
    'weekly_allowance',
    '0 10 * * 1',  -- Every Monday at 10:00 AM
    $$INSERT INTO familienkasse_transaction (id, account_id, description, amount, is_paid, created_at)
      SELECT
        gen_random_uuid()::text,
        fa.id,
        'Weekly allowance',
        fa.recurring_allowance_amount,
        false,
        NOW()
      FROM familienkasse_account fa
      WHERE fa.recurring_allowance_enabled = true
        AND fa.recurring_allowance_amount > 0$$
);
```

### purge_cron_history

Maintenance job to prevent unbounded table growth.

```sql
SELECT cron.schedule(
    'purge_cron_history',
    '0 1 * * *',  -- Daily at 1:00 AM
    $$DELETE FROM cron.job_run_details
      WHERE end_time < NOW() - INTERVAL '7 days'$$
);
```

---

## Entity Relationship Diagram

```
┌─────────────────────────────────┐
│       familienkasse_account     │
├─────────────────────────────────┤
│ id (PK)                         │
│ name                            │
│ user_id (FK → user)             │
│ recurring_allowance_enabled ◄───┼──── pg_cron filters WHERE = true
│ recurring_allowance_amount  ◄───┼──── pg_cron reads for INSERT amount
│ created_at                      │
│ updated_at                      │
└─────────────────────────────────┘
              │
              │ 1:N
              ▼
┌─────────────────────────────────┐
│    familienkasse_transaction    │
├─────────────────────────────────┤
│ id (PK)                         │◄──── pg_cron generates via gen_random_uuid()
│ account_id (FK)                 │◄──── pg_cron INSERTs from account query
│ description                     │◄──── pg_cron sets "Weekly allowance"
│ amount                          │◄──── pg_cron copies from account
│ is_paid                         │◄──── pg_cron sets false
│ created_at                      │◄──── pg_cron sets NOW()
└─────────────────────────────────┘
```

---

## Validation Rules

### For pg_cron INSERT

1. **Account must exist**: FK constraint ensures `account_id` references valid account
2. **Amount must be positive**: WHERE clause filters `recurring_allowance_amount > 0`
3. **UUID format**: `gen_random_uuid()::text` generates valid UUIDs

### Data Integrity

- pg_cron runs within a database transaction
- If INSERT fails, no partial data is written
- Failed jobs are logged to `cron.job_run_details` for troubleshooting

---

## No Schema Migrations Required

This feature does not modify the database schema. All required fields already exist:
- `familienkasse_account.recurring_allowance_enabled` - Added in previous feature
- `familienkasse_account.recurring_allowance_amount` - Added in previous feature

The only database changes are:
1. pg_cron extension installation (handled by Docker PostgreSQL image)
2. cron job scheduling (handled by init scripts)
