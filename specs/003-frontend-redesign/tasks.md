# Tasks: Frontend Redesign with shadcn/ui

**Input**: Design documents from `/specs/003-frontend-redesign/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

**Tests**: Not requested in specification. No test tasks generated.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install shadcn/ui components and prepare shared utilities

- [X] T001 Install all required shadcn/ui components via CLI: `npx shadcn@latest add button card input label badge skeleton alert alert-dialog dialog separator spinner`
- [X] T002 Verify all shadcn/ui components exist in src/components/ui/ (button, card, input, label, badge, skeleton, alert, alert-dialog, dialog, separator, spinner)
- [X] T003 [P] Add shared utility types and functions from contracts to src/lib/balance-utils.ts (BalanceState, getBalanceState, balanceStateClasses)
- [X] T004 [P] Add shared transaction status badge utilities to src/lib/transaction-utils.ts (TransactionStatus, transactionStatusBadge)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Refactor the Header component that appears on all pages

**⚠️ CRITICAL**: Header is used across all routes and should be done first

- [X] T005 Refactor src/components/Header.tsx to use shadcn/ui Button component (ghost variant for sign-out)
- [X] T006 Verify Header renders correctly on all pages (dashboard, account detail, login)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - View Account Dashboard (Priority: P1) 🎯 MVP

**Goal**: Display clean, modern dashboard with account cards showing balances and visual hierarchy

**Independent Test**: Log in and view the account list. Verify all accounts display with consistent Card styling, color-coded balances (green positive, red negative, neutral zero), and hover states.

### Implementation for User Story 1

- [X] T007 [P] [US1] Refactor src/components/AccountCard.tsx to use Card, CardContent, CardHeader, CardTitle from shadcn/ui
- [X] T008 [P] [US1] Add balance color coding to AccountCard using getBalanceState and balanceStateClasses utilities
- [X] T009 [P] [US1] Update AccountCard action buttons to use shadcn/ui Button (ghost variant with size="icon" for edit/delete)
- [X] T010 [US1] Refactor src/components/AccountList.tsx to use Card and Skeleton components for loading states
- [X] T011 [US1] Refactor src/routes/dashboard.tsx to use Card component for section containers
- [X] T012 [US1] Verify dashboard displays accounts with proper Card styling, balance colors, and skeleton loading

**Checkpoint**: User Story 1 complete - Dashboard displays polished account cards with color-coded balances

---

## Phase 4: User Story 2 - Manage Transactions (Priority: P2)

**Goal**: Provide polished transaction management with forms, status badges, and confirmation dialogs

**Independent Test**: Navigate to an account, add a transaction, toggle its paid status, and delete it. Verify form inputs have proper styling, status badges update with colors, and delete shows AlertDialog confirmation.

### Implementation for User Story 2

- [X] T013 [P] [US2] Refactor src/components/TransactionRow.tsx to use Card, Badge (with transactionStatusBadge styling), and Button components
- [X] T014 [P] [US2] Create src/components/DeleteTransactionDialog.tsx using AlertDialog component per contracts/component-interfaces.ts
- [X] T015 [US2] Refactor src/components/TransactionList.tsx to use Skeleton components and integrate DeleteTransactionDialog
- [X] T016 [US2] Refactor src/components/TransactionForm.tsx to use Input, Label, and Button components with proper spacing
- [X] T017 [US2] Add form validation error display to TransactionForm using Alert component with destructive variant
- [X] T018 [US2] Refactor src/routes/accounts/$accountId.tsx to use Card component for page layout and integrate dialog state management
- [X] T019 [US2] Verify transaction management: form submission, status toggle with Badge colors, delete with AlertDialog

**Checkpoint**: User Story 2 complete - Transaction CRUD works with polished forms and dialogs

---

## Phase 5: User Story 3 - Account Management (Priority: P2)

**Goal**: Provide consistent modal dialogs for account create/edit/delete workflows

**Independent Test**: Create an account, edit its name, and delete it. Verify all actions use consistent Dialog/AlertDialog patterns with proper form styling.

### Implementation for User Story 3

- [X] T020 [P] [US3] Refactor src/components/CreateAccountForm.tsx to use Input, Label, and Button components
- [X] T021 [P] [US3] Add form validation error display to CreateAccountForm using Alert component
- [X] T022 [US3] Refactor src/components/EditAccountDialog.tsx to use Dialog, Input, Label, Button per contracts (controlled open state pattern)
- [X] T023 [US3] Add form validation error display to EditAccountDialog using Alert component
- [X] T024 [US3] Refactor src/components/DeleteAccountDialog.tsx to use AlertDialog per contracts (controlled open state pattern)
- [X] T025 [US3] Update src/routes/dashboard.tsx to use new controlled dialog prop patterns for EditAccountDialog and DeleteAccountDialog
- [X] T026 [US3] Verify account management: create form, edit dialog, delete confirmation all work correctly

**Checkpoint**: User Story 3 complete - Account CRUD uses consistent modal dialogs

---

## Phase 6: User Story 4 - Authentication Experience (Priority: P3)

**Goal**: Professional, trustworthy login page with polished form styling

**Independent Test**: Visit login page, attempt sign-in with invalid credentials (see error Alert), sign in successfully. Verify form is centered with Card styling, inputs are properly labeled, and loading states show Spinner.

### Implementation for User Story 4

- [X] T027 [P] [US4] Refactor src/routes/login.tsx form container to use Card, CardContent, CardHeader, CardTitle components
- [X] T028 [US4] Refactor login form inputs to use Input and Label components with proper grid spacing
- [X] T029 [US4] Refactor login form buttons to use Button component (default variant for submit, outline for Google)
- [X] T030 [US4] Add error display using Alert component with AlertCircle icon and destructive variant
- [X] T031 [US4] Add Separator component between email/password form and Google OAuth button
- [X] T032 [US4] Add Spinner component to submit button for loading state
- [X] T033 [US4] Verify login page: centered Card layout, styled inputs, error alerts, loading spinner

**Checkpoint**: User Story 4 complete - Login page provides professional first impression

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cross-cutting improvements

- [X] T034 Verify dark mode works correctly on all pages (toggle system preference)
- [X] T035 Verify responsive layout on viewport widths 320px to 1920px
- [X] T036 [P] Run `npm run lint` and fix any linting errors
- [X] T037 [P] Run `npm run build` and verify production build succeeds
- [X] T038 Run quickstart.md validation checklist
- [X] T039 Final manual testing: complete user journey through all 4 user stories

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-6)**: All depend on Foundational phase completion
  - User stories can proceed in priority order (P1 → P2 → P2 → P3)
  - Or in parallel if multiple developers available
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational - Independent of US1
- **User Story 3 (P2)**: Can start after Foundational - Independent of US1/US2
- **User Story 4 (P3)**: Can start after Foundational - Independent of US1/US2/US3

### Within Each User Story

- Refactor components that don't depend on each other in parallel [P]
- Integrate components into route files after component refactoring
- Verify story works end-to-end before moving to next story

### Parallel Opportunities

- T003 and T004 can run in parallel (different utility files)
- T007, T008, T009 can run in parallel (same component but different aspects)
- T013 and T014 can run in parallel (different components)
- T020 and T021 can run in parallel (same component but form + validation)
- T027 can start immediately in Phase 6 (no dependencies within story)
- T036 and T037 can run in parallel (lint and build are independent)

---

## Parallel Example: User Story 1

```bash
# Launch component refactoring tasks in parallel:
Task: "Refactor AccountCard to use Card components" (T007)
Task: "Add balance color coding to AccountCard" (T008)
Task: "Update AccountCard action buttons" (T009)

# Then sequentially:
Task: "Refactor AccountList" (T010) - uses AccountCard
Task: "Refactor dashboard route" (T011) - uses AccountList
Task: "Verify dashboard" (T012) - integration test
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T006)
3. Complete Phase 3: User Story 1 (T007-T012)
4. **STOP and VALIDATE**: Dashboard shows polished account cards
5. Deploy/demo if ready - delivers immediate visual improvement

### Incremental Delivery

1. Setup + Foundational → shadcn/ui components ready
2. User Story 1 → Test independently → Dashboard polished (MVP!)
3. User Story 2 → Test independently → Transaction management polished
4. User Story 3 → Test independently → Account dialogs polished
5. User Story 4 → Test independently → Login page polished
6. Polish → Final verification → Feature complete

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Dashboard)
   - Developer B: User Story 2 (Transactions)
   - Developer C: User Story 3 (Account Dialogs)
   - Developer D: User Story 4 (Login)
3. Stories complete and merge independently

---

## Notes

- [P] tasks = different files or independent aspects, no blocking dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- shadcn/ui components are installed once and shared across all stories
- Dialog components use controlled `open`/`onOpenChange` pattern per contracts
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
