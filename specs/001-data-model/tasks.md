# Tasks: Family Finance Data Model

**Input**: Design documents from `/specs/001-data-model/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/api.yaml

**Tests**: Tests are OPTIONAL - not explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Project initialization and database schema

- [x] T001 Add familienkasse_account table to src/db/schema.ts per data-model.md
- [x] T002 Add familienkasse_transaction table to src/db/schema.ts per data-model.md
- [x] T003 Export type definitions (FamilienkasseAccount, FamilienkasseTransaction) from src/db/schema.ts
- [x] T004 Run `npm run db:generate` to create migration file
- [x] T005 Run `npm run db:migrate` to apply migration
- [x] T006 [P] Add Zod validation schemas in src/lib/validations.ts per data-model.md

**Checkpoint**: Database tables exist, types exported, validation schemas ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared utilities and API infrastructure needed by all user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Create currency formatting utility in src/lib/currency.ts (cents to Euro display)
- [x] T008 [P] Create ID generation utility in src/lib/id.ts using crypto.randomUUID()
- [x] T009 [P] Create API error handling utility in src/lib/api-error.ts with typed error responses

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - View Family Account Balances (Priority: P1) 🎯 MVP

**Goal**: Display list of accounts with calculated balances on dashboard

**Independent Test**: Navigate to dashboard after login, see all accounts with their balances (including zero and negative)

### Implementation for User Story 1

- [x] T010 [US1] Create getAccountsWithBalances query function in src/db/queries/accounts.ts
- [x] T011 [US1] Create GET /api/accounts server function in src/routes/api/accounts/index.ts
- [x] T012 [US1] Create AccountCard component in src/components/AccountCard.tsx
- [x] T013 [US1] Create AccountList component in src/components/AccountList.tsx
- [x] T014 [US1] Update dashboard route to fetch and display accounts in src/routes/dashboard.tsx
- [x] T015 [US1] Add loading and empty states to AccountList component
- [x] T016 [US1] Style negative balances with visual indicator (red color) in AccountCard

**Checkpoint**: User Story 1 complete - users can view all account balances on dashboard

---

## Phase 4: User Story 2 - Record Transactions (Priority: P2)

**Goal**: Create, view, update, and delete transactions for an account

**Independent Test**: Add a transaction to an account, see balance update, view transaction in history, mark as paid/unpaid

### Implementation for User Story 2

- [x] T017 [US2] Create transaction query functions in src/db/queries/transactions.ts (create, list, update, delete)
- [x] T018 [US2] Create POST /api/accounts/[accountId]/transactions endpoint in src/routes/api/accounts/[accountId]/transactions/index.ts
- [x] T019 [P] [US2] Create GET /api/accounts/[accountId]/transactions endpoint in src/routes/api/accounts/[accountId]/transactions/index.ts
- [x] T020 [P] [US2] Create PATCH /api/accounts/[accountId]/transactions/[transactionId] endpoint in src/routes/api/accounts/[accountId]/transactions/[transactionId].ts
- [x] T021 [P] [US2] Create DELETE /api/accounts/[accountId]/transactions/[transactionId] endpoint in src/routes/api/accounts/[accountId]/transactions/[transactionId].ts
- [x] T022 [US2] Create TransactionForm component in src/components/TransactionForm.tsx
- [x] T023 [US2] Create TransactionList component in src/components/TransactionList.tsx
- [x] T024 [US2] Create TransactionRow component with paid/unpaid toggle in src/components/TransactionRow.tsx
- [x] T025 [US2] Create account detail page with transaction management in src/routes/accounts/[accountId].tsx
- [x] T026 [US2] Add navigation from AccountCard to account detail page

**Checkpoint**: User Story 2 complete - users can record and manage transactions

---

## Phase 5: User Story 3 - Manage Family Accounts (Priority: P3)

**Goal**: Create, rename, and delete family accounts

**Independent Test**: Create a new account, rename it, delete it (with confirmation)

### Implementation for User Story 3

- [x] T027 [US3] Create account mutation functions in src/db/queries/accounts.ts (create, update, delete)
- [x] T028 [US3] Create POST /api/accounts endpoint in src/routes/api/accounts/index.ts
- [x] T029 [P] [US3] Create PATCH /api/accounts/[accountId] endpoint in src/routes/api/accounts/[accountId]/index.ts
- [x] T030 [P] [US3] Create DELETE /api/accounts/[accountId] endpoint in src/routes/api/accounts/[accountId]/index.ts
- [x] T031 [US3] Create CreateAccountForm component in src/components/CreateAccountForm.tsx
- [x] T032 [US3] Create EditAccountDialog component in src/components/EditAccountDialog.tsx
- [x] T033 [US3] Create DeleteAccountDialog component with confirmation in src/components/DeleteAccountDialog.tsx
- [x] T034 [US3] Add account management UI to dashboard (create button, edit/delete options)

**Checkpoint**: User Story 3 complete - users can fully manage their accounts

---

## Phase 6: User Story 4 - Control User Registration (Priority: P4)

**Goal**: Enable/disable registration via ALLOW_REGISTRATION environment variable

**Independent Test**: Set ALLOW_REGISTRATION=false, restart server, verify sign-up is blocked

### Implementation for User Story 4

- [x] T035 [US4] Add ALLOW_REGISTRATION to .env.example with documentation
- [x] T036 [US4] Update Better-Auth config in src/lib/auth.ts to use disabledPaths based on env var
- [x] T037 [US4] Update login page to hide/show sign-up option based on registration status in src/routes/login.tsx
- [x] T038 [US4] Add user-friendly message when registration is disabled

**Checkpoint**: User Story 4 complete - registration can be controlled via environment variable

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T039 Add loading skeletons to all data-fetching components
- [x] T040 [P] Add error boundaries with user-friendly error messages
- [x] T041 [P] Verify data isolation (user can only see own accounts/transactions)
- [x] T042 Run quickstart.md verification checklist
- [x] T043 Update CLAUDE.md if any new patterns established

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can proceed in priority order (P1 → P2 → P3 → P4)
  - Or in parallel if desired (all are independently testable after Foundational)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational - Uses US1's account queries but doesn't depend on US1 completion
- **User Story 3 (P3)**: Can start after Foundational - Independent of other stories
- **User Story 4 (P4)**: Can start after Foundational - Completely independent (auth only)

### Within Each User Story

- Queries/mutations before endpoints
- Endpoints before components
- Components before page integration
- Page integration completes the story

### Parallel Opportunities

**Setup Phase:**
```
T001, T002, T003 → sequential (same file)
T006 → parallel with T004, T005 (different file)
```

**Foundational Phase:**
```
T007, T008, T009 → all parallel (different files)
```

**User Story 2:**
```
T019, T020, T021 → parallel (different endpoints)
```

**User Story 3:**
```
T029, T030 → parallel (different endpoints)
```

---

## Parallel Example: User Story 2

```bash
# After T017, T018 complete, launch remaining endpoints in parallel:
Task: "Create GET endpoint in src/routes/api/accounts/[accountId]/transactions/index.ts"
Task: "Create PATCH endpoint in src/routes/api/accounts/[accountId]/transactions/[transactionId].ts"
Task: "Create DELETE endpoint in src/routes/api/accounts/[accountId]/transactions/[transactionId].ts"

# Then components can proceed
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T009)
3. Complete Phase 3: User Story 1 (T010-T016)
4. **STOP and VALIDATE**: Users can view account balances
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → View balances (MVP!)
3. Add User Story 2 → Record transactions
4. Add User Story 3 → Manage accounts
5. Add User Story 4 → Registration control
6. Polish phase → Production ready

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Amounts are always in cents (integer) - use currency.ts for display
- All API routes require authentication via authMiddleware
- Commit after each task or logical group
