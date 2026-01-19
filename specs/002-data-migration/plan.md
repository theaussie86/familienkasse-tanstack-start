# Implementation Plan: Data Migration & Weekly Allowance Cron

**Branch**: `002-data-migration` | **Date**: 2026-01-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-data-migration/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Migrate existing family account data from Supabase PostgreSQL to local PostgreSQL database, extend the account schema to support recurring allowance configuration, and implement a weekly cron job for automated allowance transactions. The migration connects directly to Supabase using the `postgres` driver with a secondary connection for the source database.

## Technical Context

**Language/Version**: TypeScript 5.7
**Primary Dependencies**: TanStack Start 1.132, Drizzle ORM 0.45, postgres driver 3.4, Better-Auth 1.4
**Storage**: PostgreSQL (local target via Drizzle ORM, Supabase source via direct postgres connection)
**Testing**: Vitest 3.0 with Testing Library
**Target Platform**: Node.js server (Nitro runtime)
**Project Type**: Web application (TanStack Start full-stack)
**Performance Goals**: Migration completes within 5 minutes for all existing data; cron job processes all accounts within 5 minutes
**Constraints**: Zero data loss during migration; idempotent migration (re-runnable without duplicates)
**Scale/Scope**: ~10-50 family accounts, ~500-1000 historical transactions

**Migration Approach**: Direct Supabase PostgreSQL connection using environment variables for credentials (`SUPABASE_DATABASE_URL`). The migration will be a one-time CLI script that can be re-run safely.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Evaluation ✅

### Principle I: Type Safety ✅
- All migration code will use Drizzle ORM's type-safe query builders
- Supabase source queries will use typed interfaces matching the schema
- New recurring allowance fields will have explicit TypeScript types

### Principle II: Security First ✅
- Supabase credentials stored in environment variables only
- Migration script requires authentication context
- No raw SQL string concatenation - parameterized queries via Drizzle ORM
- Cron job validates account ownership before creating transactions

### Principle III: Simplicity ✅
- One-time migration script (no ongoing sync complexity)
- Simple boolean + integer for recurring allowance config
- Weekly cron using native scheduling (Nitro scheduled tasks or external cron)
- No over-engineering: direct DB-to-DB migration without intermediate formats

---

### Post-Design Re-Evaluation ✅

**Reviewed against**: data-model.md, contracts/api.yaml, research.md

### Principle I: Type Safety ✅ CONFIRMED
- Schema extends use Drizzle's `pgTable` with explicit column types
- API contracts define TypeScript-compatible JSON schemas
- Type exports provided: `FamilienkasseAccount`, `MigrationLog`, `AllowanceConfig`
- No `any` types introduced

### Principle II: Security First ✅ CONFIRMED
- `SUPABASE_DATABASE_URL` environment variable for credentials
- Cron endpoint requires authentication (sessionAuth in OpenAPI spec)
- Account update validates ownership via existing middleware
- All DB operations use Drizzle's parameterized queries

### Principle III: Simplicity ✅ CONFIRMED
- Only 2 new columns on existing table (no new relationships)
- Single new table (`migration_log`) for audit only
- Reuses existing transaction table for allowances (no new entity)
- Nitro's built-in tasks (no external dependencies added)
- `onConflictDoNothing()` for idempotency (no complex sync logic)

## Project Structure

### Documentation (this feature)

```text
specs/002-data-migration/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── routes/
│   ├── api/
│   │   └── cron/
│   │       └── weekly-allowance.ts    # Cron job endpoint
│   └── accounts/
│       └── [accountId].tsx            # Extended with allowance config UI
├── components/
│   ├── AllowanceConfigForm.tsx        # New: recurring allowance settings
│   └── EditAccountDialog.tsx          # Extended with allowance fields
├── db/
│   ├── schema.ts                      # Extended with allowance fields
│   ├── queries/
│   │   ├── accounts.ts                # Extended with allowance queries
│   │   └── transactions.ts            # Extended with allowance transaction type
│   └── migrations/
│       └── supabase-migration.ts      # New: one-time migration script
├── lib/
│   └── supabase-client.ts             # New: Supabase direct connection
└── scripts/
    └── migrate-from-supabase.ts       # CLI entry point for migration
```

**Structure Decision**: Web application with TanStack Start full-stack pattern. New files added to existing `src/` structure following established conventions. Migration script placed in `src/scripts/` for CLI execution.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*No violations identified. All design decisions align with Constitution principles.*
