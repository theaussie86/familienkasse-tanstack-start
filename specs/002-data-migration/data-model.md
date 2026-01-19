# Data Model: Data Migration & Weekly Allowance Cron

**Feature**: 002-data-migration
**Date**: 2026-01-19

## Entity Changes

### familienkasse_account (Extended)

Extends the existing account entity with recurring allowance configuration fields.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | text | PK | Existing: unique identifier |
| name | text | NOT NULL | Existing: account display name |
| user_id | text | FK → user.id, NOT NULL | Existing: owner reference |
| **recurring_allowance_enabled** | boolean | NOT NULL, DEFAULT false | **New**: enables weekly allowance |
| **recurring_allowance_amount** | integer | NOT NULL, DEFAULT 0 | **New**: weekly amount in cents |
| created_at | timestamp | NOT NULL, DEFAULT now() | Existing: creation timestamp |
| updated_at | timestamp | NOT NULL, DEFAULT now() | Existing: last update timestamp |

**Validation Rules**:
- `recurring_allowance_amount` must be >= 0
- When `recurring_allowance_enabled` is true and `recurring_allowance_amount` is 0, the account is skipped during cron execution (per edge case)

**Drizzle Schema Update**:
```typescript
export const familienkasseAccount = pgTable(
  "familienkasse_account",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    recurringAllowanceEnabled: boolean("recurring_allowance_enabled")
      .notNull()
      .default(false),
    recurringAllowanceAmount: integer("recurring_allowance_amount")
      .notNull()
      .default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("familienkasse_account_userId_idx").on(table.userId)]
);
```

---

### familienkasse_transaction (Unchanged Schema)

The existing transaction table is reused for automated allowance transactions. No schema changes required.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | text | PK | Unique identifier |
| account_id | text | FK → familienkasse_account.id, NOT NULL | Parent account |
| description | text | NULLABLE | Transaction description |
| amount | integer | NOT NULL | Amount in cents (positive = credit) |
| is_paid | boolean | NOT NULL, DEFAULT false | Payment status |
| created_at | timestamp | NOT NULL, DEFAULT now() | Creation timestamp |

**Automated Allowance Transaction Pattern**:
- `description`: `"Weekly Allowance"` (consistent prefix for duplicate detection)
- `amount`: Copied from account's `recurring_allowance_amount`
- `is_paid`: `true` (allowances are immediately available)

---

### migration_log (New Entity)

Tracks migration execution for auditability and debugging.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | text | PK | Unique identifier (UUID) |
| started_at | timestamp | NOT NULL | Migration start time |
| completed_at | timestamp | NULLABLE | Migration end time (null if failed) |
| status | text | NOT NULL | 'running', 'completed', 'failed' |
| accounts_migrated | integer | NOT NULL, DEFAULT 0 | Count of accounts created |
| accounts_skipped | integer | NOT NULL, DEFAULT 0 | Count of accounts already existing |
| transactions_migrated | integer | NOT NULL, DEFAULT 0 | Count of transactions created |
| transactions_skipped | integer | NOT NULL, DEFAULT 0 | Count of transactions already existing |
| error_message | text | NULLABLE | Error details if status = 'failed' |

**Drizzle Schema**:
```typescript
export const migrationLog = pgTable("migration_log", {
  id: text("id").primaryKey(),
  startedAt: timestamp("started_at").notNull(),
  completedAt: timestamp("completed_at"),
  status: text("status").notNull(), // 'running', 'completed', 'failed'
  accountsMigrated: integer("accounts_migrated").notNull().default(0),
  accountsSkipped: integer("accounts_skipped").notNull().default(0),
  transactionsMigrated: integer("transactions_migrated").notNull().default(0),
  transactionsSkipped: integer("transactions_skipped").notNull().default(0),
  errorMessage: text("error_message"),
});
```

---

## Entity Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                          user                                │
│  (Better-Auth managed)                                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 1:N
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   familienkasse_account                      │
│  + recurring_allowance_enabled (NEW)                         │
│  + recurring_allowance_amount (NEW)                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 1:N
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 familienkasse_transaction                    │
│  (includes both migrated historical + new automated)         │
└─────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│                      migration_log                           │
│  (standalone audit table, no FK relationships)               │
└─────────────────────────────────────────────────────────────┘
```

---

## State Transitions

### Account Recurring Allowance States

```
                    ┌──────────────────┐
                    │    DISABLED      │
                    │  enabled=false   │
                    │  amount=0        │
                    └────────┬─────────┘
                             │
                    Enable + Set Amount
                             │
                             ▼
                    ┌──────────────────┐
                    │    CONFIGURED    │
                    │  enabled=true    │◄────┐
                    │  amount>0        │     │
                    └────────┬─────────┘     │
                             │               │
                      Disable                │ Update Amount
                             │               │
                             ▼               │
                    ┌──────────────────┐     │
                    │    DISABLED      │─────┘
                    │  enabled=false   │
                    │  (amount kept)   │
                    └──────────────────┘
```

**Note**: When disabled, the `recurring_allowance_amount` value is preserved so re-enabling doesn't require re-entering the amount.

### Migration Log States

```
    ┌──────────┐     Success     ┌───────────┐
    │ RUNNING  │ ──────────────► │ COMPLETED │
    └──────────┘                 └───────────┘
         │
         │ Error
         ▼
    ┌──────────┐
    │  FAILED  │
    └──────────┘
```

---

## Type Exports

```typescript
// Extended types
export type FamilienkasseAccount = typeof familienkasseAccount.$inferSelect;
export type NewFamilienkasseAccount = typeof familienkasseAccount.$inferInsert;
export type UpdateFamilienkasseAccount = Partial<Omit<NewFamilienkasseAccount, 'id' | 'userId' | 'createdAt'>>;

// New types
export type MigrationLog = typeof migrationLog.$inferSelect;
export type NewMigrationLog = typeof migrationLog.$inferInsert;

// Allowance configuration subset for UI
export type AllowanceConfig = Pick<
  FamilienkasseAccount,
  'recurringAllowanceEnabled' | 'recurringAllowanceAmount'
>;
```

---

## Migration Script Data Flow

```
┌─────────────────────────┐
│   Supabase (Source)     │
│   via Supavisor         │
└───────────┬─────────────┘
            │
            │ 1. Read all accounts
            │ 2. Read all transactions
            ▼
┌─────────────────────────┐
│   Migration Script      │
│   (TypeScript)          │
│                         │
│   - Map source → target │
│   - Skip existing (id)  │
│   - Track counts        │
└───────────┬─────────────┘
            │
            │ 3. Upsert accounts
            │ 4. Upsert transactions
            │ 5. Write migration_log
            ▼
┌─────────────────────────┐
│   Local PostgreSQL      │
│   (Target)              │
└─────────────────────────┘
```
