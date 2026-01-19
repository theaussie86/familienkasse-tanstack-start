# Feature Specification: Family Finance Data Model

**Feature Branch**: `001-data-model`
**Created**: 2025-01-19
**Status**: Draft
**Input**: User description: "Create the data model for the family finance application"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Family Account Balances (Priority: P1)

As a family administrator, I want to see the current balance of each family account so that I can understand the financial state of the household at a glance.

**Why this priority**: This is the core value proposition of the app. Without balance visibility, no other features make sense. Users need to see balances before they can manage transactions.

**Independent Test**: Can be fully tested by displaying a list of family accounts with their calculated balances (sum of transactions). Delivers immediate value by providing financial visibility.

**Acceptance Scenarios**:

1. **Given** a household with three accounts, **When** I view the dashboard, **Then** I see each account's name and current balance displayed clearly.
2. **Given** a newly created account with no transactions, **When** I view the dashboard, **Then** its balance shows as zero.
3. **Given** an account with a negative balance, **When** I view the dashboard, **Then** the negative amount is clearly indicated.

---

### User Story 2 - Record Transactions (Priority: P2)

As a family administrator, I want to record transactions (allowances, expenses, payments) for a family account so that balances stay accurate and we have a history of financial activity.

**Why this priority**: After seeing balances, users need to modify them. Transactions are the mechanism for balance changes and form the audit trail.

**Independent Test**: Can be tested by adding a transaction and verifying the calculated balance updates correctly. Delivers value by enabling balance management.

**Acceptance Scenarios**:

1. **Given** an account with a balance of €50, **When** I record a new transaction of €20, **Then** the balance reflects the change appropriately.
2. **Given** a transaction is recorded, **When** I view the transaction, **Then** I can see the amount, date, description, and payment status.
3. **Given** a transaction with `is_paid = false`, **When** I mark it as paid, **Then** the transaction status updates accordingly.

---

### User Story 3 - Manage Family Accounts (Priority: P3)

As a family administrator, I want to create and manage family accounts so that I can track finances for different family members or purposes (e.g., "Kids Allowance", "Vacation Fund").

**Why this priority**: Account management is foundational but depends on having the data structure in place first. Users need accounts before they can add transactions.

**Independent Test**: Can be tested by creating a new account and verifying it appears in the dashboard with zero balance.

**Acceptance Scenarios**:

1. **Given** I am logged in, **When** I create a new account with name "Kids Allowance", **Then** the account is created and appears in my dashboard.
2. **Given** an existing account, **When** I rename it, **Then** the new name is reflected everywhere.
3. **Given** multiple accounts, **When** I view the dashboard, **Then** all my accounts are listed (and only my accounts, not other users').

---

### User Story 4 - Control User Registration (Priority: P4)

As a system administrator, I want to enable or disable new user registration via an environment variable so that I can control who can sign up for the application.

**Why this priority**: Important for private/family use but doesn't affect core functionality. Can be implemented independently of the data model.

**Independent Test**: Can be tested by toggling the environment variable and verifying registration is blocked/allowed accordingly.

**Acceptance Scenarios**:

1. **Given** registration is disabled (`ALLOW_REGISTRATION=false`), **When** a new user tries to sign up, **Then** they see a message that registration is closed.
2. **Given** registration is enabled (`ALLOW_REGISTRATION=true`), **When** a new user tries to sign up, **Then** they can complete the registration process.
3. **Given** registration is disabled, **When** an existing user tries to log in, **Then** they can still log in normally.

---

### Edge Cases

- What happens when an account is deleted that has transaction history?
  - Cascade delete: removing an account removes all its transactions (with confirmation).
- How does the system handle very large transaction amounts?
  - Amounts stored as integers (cents), supporting up to ~€21 million (int4 max / 100).
- What if the environment variable is not set?
  - Default to registration enabled for ease of initial setup.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST store family accounts with a unique identifier and name.
- **FR-002**: System MUST associate accounts with the authenticated user (via Better-Auth user.id).
- **FR-003**: System MUST record transactions with amount, description, creation date, and payment status.
- **FR-004**: System MUST calculate account balance from the sum of transaction amounts.
- **FR-005**: System MUST allow marking transactions as paid or unpaid via `is_paid` flag.
- **FR-006**: System MUST isolate data by user - users can only see their own accounts and transactions.
- **FR-007**: System MUST allow enabling/disabling new user registration via `ALLOW_REGISTRATION` environment variable.
- **FR-008**: System MUST store amounts as integers (cents) to avoid floating-point precision issues.
- **FR-009**: System MUST use Better-Auth for authentication (email/password and Google OAuth).

### Key Entities

- **User** (existing Better-Auth table): Authenticated user. Key attributes: id, name, email, emailVerified, image, timestamps.

- **Familienkasse Account**: Represents a trackable financial account within a household. Key attributes: id, name, user reference. One user can have many accounts.

- **Familienkasse Transaction**: Represents a financial event on an account. Key attributes: id, amount (in cents), description, created timestamp, is_paid status. One account can have many transactions.

### Assumptions

- Currency amounts stored as integers representing cents (€1.50 = 150).
- Better-Auth handles all authentication (existing setup with email/password + Google OAuth).
- Accounts belong to a single user (no shared accounts between users).
- `is_paid` tracks whether a transaction/allowance has been fulfilled.
- `ALLOW_REGISTRATION` defaults to `true` if not set.
- Cascade delete for accounts (deleting account removes all its transactions).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view all account balances within 2 seconds of loading the dashboard.
- **SC-002**: Recording a transaction updates the displayed balance immediately (within 1 second).
- **SC-003**: Transaction history loads within 3 seconds for up to 1,000 transactions per account.
- **SC-004**: 100% of transactions maintain accurate balance calculations with no precision errors.
- **SC-005**: Data isolation ensures users cannot view or modify other users' data.
- **SC-006**: Registration control responds correctly to environment variable within one application restart.
