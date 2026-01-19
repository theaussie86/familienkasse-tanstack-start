# Tasks: Data Migration & Weekly Allowance Cron

**Input**: Design documents from `/specs/002-data-migration/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Tests**: Not explicitly requested in the feature specification. Test tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Environment configuration and schema preparation

- [ ] T001 Add `SUPABASE_DATABASE_URL` to `.env.example` with documentation comments
- [ ] T002 [P] Create Supabase client connection module in `src/lib/supabase-client.ts`
- [ ] T003 [P] Extend `familienkasse_account` schema with `recurring_allowance_enabled` and `recurring_allowance_amount` fields in `src/db/schema.ts`
- [ ] T004 [P] Add `migration_log` table schema in `src/db/schema.ts`
- [ ] T005 Generate database migration with `npm run db:generate`
- [ ] T006 Apply database migration with `npm run db:migrate`
- [ ] T007 Export new types (`MigrationLog`, `AllowanceConfig`) in `src/db/schema.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T008 Add Zod validation schemas for recurring allowance fields in `src/lib/validations.ts`
- [ ] T009 [P] Create migration log query functions (`createLog`, `updateLog`, `getLatestLog`) in `src/db/queries/migration-log.ts`
- [ ] T010 [P] Extend account query functions with recurring allowance field handling in `src/db/queries/accounts.ts`
- [ ] T011 Enable Nitro experimental tasks feature in `vite.config.ts` with `experimental: { tasks: true }`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - One-Time Data Migration from Supabase (Priority: P1) 🎯 MVP

**Goal**: Migrate all existing family account and transaction data from Supabase to local PostgreSQL with full data integrity

**Independent Test**: Run migration script against Supabase, verify all accounts/transactions appear in local database, confirm balances match source

### Implementation for User Story 1

- [ ] T012 [US1] Define source database Drizzle schema (read-only) for Supabase tables in `src/db/migrations/supabase-schema.ts`
- [ ] T013 [US1] Implement account migration function with `onConflictDoNothing()` pattern in `src/db/migrations/supabase-migration.ts`
- [ ] T014 [US1] Implement transaction migration function with `onConflictDoNothing()` pattern in `src/db/migrations/supabase-migration.ts`
- [ ] T015 [US1] Implement balance validation function (sum of transactions = account balance) in `src/db/migrations/supabase-migration.ts`
- [ ] T016 [US1] Implement migration orchestrator with logging to `migration_log` table in `src/db/migrations/supabase-migration.ts`
- [ ] T017 [US1] Create CLI entry point script in `src/scripts/migrate-from-supabase.ts`
- [ ] T018 [US1] Add error handling for Supabase connection failures with clear error messages in `src/scripts/migrate-from-supabase.ts`

**Checkpoint**: Migration script complete - can migrate data from Supabase to local database idempotently

---

## Phase 4: User Story 2 - Configure Accounts for Recurring Allowance (Priority: P2)

**Goal**: Allow account owners to enable/disable weekly allowances and set amounts via the UI

**Independent Test**: Edit an account, toggle recurring allowance on/off, set amount, verify configuration persists after page reload

### Implementation for User Story 2

- [ ] T019 [P] [US2] Create `AllowanceConfigForm` component with toggle and amount input in `src/components/AllowanceConfigForm.tsx`
- [ ] T020 [P] [US2] Update `updateAccount` query to handle recurring allowance fields in `src/db/queries/accounts.ts`
- [ ] T021 [US2] Extend `EditAccountDialog` to include `AllowanceConfigForm` in `src/components/EditAccountDialog.tsx`
- [ ] T022 [US2] Update account PATCH API route to accept recurring allowance fields in `src/routes/api/accounts/[accountId]/index.ts`
- [ ] T023 [US2] Display current recurring allowance configuration in account detail view in `src/routes/accounts/[accountId].tsx`
- [ ] T024 [US2] Add currency formatting for allowance amount display using `formatCurrency()` from `@/lib/currency`

**Checkpoint**: Account configuration complete - users can enable and configure weekly allowances per account

---

## Phase 5: User Story 3 - Weekly Allowance Cron Job (Priority: P3)

**Goal**: Automatically add weekly allowance transactions to configured accounts on a schedule

**Independent Test**: Configure test accounts with allowances, trigger cron job manually, verify transactions created with correct amounts; run again to confirm no duplicates

### Implementation for User Story 3

- [ ] T025 [US3] Create `getAccountsWithAllowanceEnabled` query function in `src/db/queries/accounts.ts`
- [ ] T026 [US3] Implement duplicate detection logic (check for "Weekly Allowance" transaction in current week) in `src/db/queries/transactions.ts`
- [ ] T027 [US3] Create `createAllowanceTransaction` function with proper description format in `src/db/queries/transactions.ts`
- [ ] T028 [US3] Implement weekly allowance Nitro task at `src/tasks/allowance/weekly.ts`
- [ ] T029 [US3] Add scheduled task configuration to Nitro config in `vite.config.ts` with cron pattern `"0 0 * * 0"`
- [ ] T030 [US3] Create manual trigger API endpoint for testing at `src/routes/api/cron/weekly-allowance.ts`
- [ ] T031 [US3] Add execution logging for cron job runs with success/failure counts

**Checkpoint**: Cron job complete - weekly allowances are automatically processed for all configured accounts

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validation and cleanup

- [ ] T032 [P] Run migration script in development environment and verify quickstart.md steps
- [ ] T033 [P] Verify account balance matches sum of transactions after migration
- [ ] T034 Test manual cron trigger API endpoint and verify duplicate prevention
- [ ] T035 Verify all existing functionality (CRUD accounts, transactions) still works after schema changes
- [ ] T036 [P] Clean up any console.log statements, ensure proper logging throughout

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion (schema must be migrated first) - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - No dependencies on US1 (uses new schema fields)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Benefits from US2 for configuration but can test with direct DB setup

### Within Each User Story

- Schema before queries
- Queries before API routes
- API routes before UI components
- Core implementation before integration

### Parallel Opportunities

**Phase 1 - Setup (3 parallel groups)**:
- T002, T003, T004 can run in parallel (different files)

**Phase 2 - Foundational (2 parallel groups)**:
- T009, T010, T011 can run in parallel (different files)

**Phase 4 - User Story 2 (2 parallel groups)**:
- T019, T020 can run in parallel (component vs query)

**Phase 6 - Polish (3 parallel groups)**:
- T032, T033, T036 can run in parallel (independent validation)

---

## Parallel Example: Phase 1 Setup

```bash
# Launch parallel tasks together:
Task: "Create Supabase client connection module in src/lib/supabase-client.ts"
Task: "Extend familienkasse_account schema with recurring allowance fields in src/db/schema.ts"
Task: "Add migration_log table schema in src/db/schema.ts"
```

## Parallel Example: User Story 2

```bash
# Launch parallel tasks together:
Task: "Create AllowanceConfigForm component in src/components/AllowanceConfigForm.tsx"
Task: "Update updateAccount query for recurring allowance fields in src/db/queries/accounts.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Migration)
4. **STOP and VALIDATE**: Run migration, verify data integrity
5. Deploy/demo if ready - historical data is now available

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test migration → Deploy (MVP - data migrated!)
3. Add User Story 2 → Test configuration → Deploy (users can configure allowances)
4. Add User Story 3 → Test cron → Deploy (automated allowances working)
5. Each story adds value without breaking previous stories

### Suggested MVP Scope

**Minimum Viable Product**: User Story 1 (Data Migration) only

This allows:
- Historical data to be preserved
- Users to access their accounts and transactions
- Manual allowance entry to continue as before
- US2 and US3 to be added later without data loss

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Migration is idempotent - safe to re-run
- Cron job has duplicate prevention - safe if triggered multiple times
