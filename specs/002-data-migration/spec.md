# Feature Specification: Data Migration & Weekly Allowance Cron

**Feature Branch**: `002-data-migration`
**Created**: 2026-01-19
**Status**: Draft
**Input**: User description: "Migrate existing data from Supabase and set up weekly database cron job for regular allowance additions"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - One-Time Data Migration from Supabase (Priority: P1)

As an administrator, I need to migrate all existing family account data from the Supabase database to the new local PostgreSQL database so that users can continue using the application with their historical data intact.

**Why this priority**: Without the historical data, users would lose their account balances and transaction history, making the new system unusable. This is the foundation for all other features.

**Independent Test**: Can be fully tested by running the migration against a copy of Supabase data and verifying all accounts and transactions appear correctly in the local database with matching balances.

**Acceptance Scenarios**:

1. **Given** existing accounts and transactions in Supabase, **When** the migration runs, **Then** all familienkasse_account records are created in the local database with matching names and user associations
2. **Given** existing transactions in Supabase, **When** the migration runs, **Then** all familienkasse_transaction records are created with correct amounts, descriptions, and paid status
3. **Given** a record that already exists in the local database, **When** the migration encounters it, **Then** the migration skips that record and continues without error
4. **Given** the migration completes successfully, **When** a user logs in, **Then** they see their accounts with correct balances matching the Supabase source

---

### User Story 2 - Configure Accounts for Recurring Allowance (Priority: P2)

As an account owner, I want to mark specific family accounts to receive automatic weekly allowances so that regular payments are added without manual entry.

**Why this priority**: Before the cron job can run, accounts need a way to be configured for recurring allowances. This enables the automated feature in P3.

**Independent Test**: Can be fully tested by editing an account's recurring allowance settings and verifying the configuration persists.

**Acceptance Scenarios**:

1. **Given** an existing family account, **When** the owner enables recurring allowance, **Then** the account is marked to receive weekly allowances
2. **Given** an account with recurring allowance enabled, **When** the owner sets an allowance amount, **Then** the amount is saved for weekly distribution
3. **Given** an account with recurring allowance enabled, **When** the owner disables it, **Then** the account no longer receives automated allowances
4. **Given** an account, **When** the owner views account details, **Then** the current recurring allowance configuration is displayed

---

### User Story 3 - Weekly Allowance Cron Job (Priority: P3)

As an administrator, I want the system to automatically add weekly allowance transactions to configured accounts so that family members receive their allowances without manual intervention.

**Why this priority**: This automates a repetitive task but depends on P1 (migrated data) and P2 (account configuration) to be useful.

**Independent Test**: Can be fully tested by configuring test accounts with allowances, triggering the cron job, and verifying new transactions appear with correct amounts.

**Acceptance Scenarios**:

1. **Given** accounts configured for recurring allowances, **When** the weekly cron job runs, **Then** a new transaction is created for each configured account with the specified allowance amount
2. **Given** the cron job creates a transaction, **When** viewing the transaction, **Then** it has a descriptive label indicating it's an automated weekly allowance
3. **Given** an account not configured for recurring allowances, **When** the cron job runs, **Then** no transaction is created for that account
4. **Given** the cron job runs successfully, **When** the user views their account, **Then** the balance reflects the added allowance

---

### Edge Cases

- What happens when the Supabase source is unavailable during migration? The migration should fail gracefully with a clear error message and allow retry
- How does the system handle if a user in Supabase doesn't exist in the local database? The migration should create the user mapping or skip with a warning log
- What happens if the cron job runs twice in the same week? Each run should check if an allowance was already added that week and skip if so
- How does the system handle accounts with €0 configured allowance? Skip these accounts during the weekly run
- What happens if the database is unavailable when the cron job runs? Log the failure and retry on the next scheduled run

## Requirements *(mandatory)*

### Functional Requirements

**Migration Requirements**

- **FR-001**: System MUST support a one-time migration of all familienkasse_account records from Supabase to local database
- **FR-002**: System MUST support a one-time migration of all familienkasse_transaction records from Supabase to local database
- **FR-003**: System MUST preserve all data relationships (user-to-account, account-to-transaction) during migration
- **FR-004**: System MUST skip records that already exist in the target database without failing
- **FR-005**: System MUST log the count of migrated vs skipped records upon completion
- **FR-006**: System MUST validate data integrity after migration (account balances match sum of transactions)

**Account Configuration Requirements**

- **FR-007**: System MUST allow account owners to enable/disable recurring allowances per account
- **FR-008**: System MUST allow account owners to set an allowance amount (in cents) per configured account
- **FR-009**: System MUST display current recurring allowance configuration when viewing account details
- **FR-010**: System MUST persist allowance configuration changes immediately

**Cron Job Requirements**

- **FR-011**: System MUST run a scheduled job once per week to process recurring allowances
- **FR-012**: System MUST create a transaction for each account with recurring allowances enabled and amount greater than zero
- **FR-013**: System MUST mark automated allowance transactions with a recognizable description (e.g., "Weekly Allowance")
- **FR-014**: System MUST prevent duplicate allowances in the same week by checking existing transactions
- **FR-015**: System MUST log all cron job executions with success/failure status and counts

### Key Entities

- **familienkasse_account (extended)**: Existing account entity with new fields for recurring_allowance_enabled (boolean) and recurring_allowance_amount (integer in cents)
- **familienkasse_transaction**: Existing transaction entity, used for both migrated historical data and new automated allowance transactions
- **Migration Log (new)**: Record of migration runs including timestamp, records processed, records skipped, and success/failure status

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of existing Supabase accounts and transactions are successfully migrated to the local database
- **SC-002**: Account balances in the new system match the original Supabase balances exactly
- **SC-003**: Users can configure recurring allowances for their accounts within 30 seconds
- **SC-004**: The weekly cron job completes processing all configured accounts within 5 minutes
- **SC-005**: Zero duplicate allowance transactions are created from multiple cron job runs in the same week
- **SC-006**: Migration can be re-run safely without creating duplicate records
- **SC-007**: Users see their full transaction history including both migrated and new automated transactions

## Assumptions

- The Supabase database schema matches or is compatible with the current local schema (familienkasse_account, familienkasse_transaction)
- Supabase database credentials will be provided as environment variables for the migration
- The weekly cron job schedule defaults to Sunday at 00:00 (can be configured)
- Allowance amounts use the same cent-based integer format as existing transactions
- User authentication records (Better-Auth tables) are already synchronized or users will re-authenticate
