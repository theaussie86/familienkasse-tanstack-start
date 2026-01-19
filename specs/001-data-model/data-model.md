# Data Model: Family Finance Data Model

**Feature**: 001-data-model
**Date**: 2025-01-19

## Entity Relationship Diagram

```
┌─────────────────────────────┐
│         user                │  (existing Better-Auth table)
│─────────────────────────────│
│ id (text, PK)               │
│ name (text)                 │
│ email (text, unique)        │
│ emailVerified (boolean)     │
│ image (text, nullable)      │
│ createdAt (timestamp)       │
│ updatedAt (timestamp)       │
└─────────────┬───────────────┘
              │
              │ 1:N
              ▼
┌─────────────────────────────┐
│   familienkasse_account     │  (new)
│─────────────────────────────│
│ id (text, PK)               │
│ name (text)                 │
│ userId (text, FK → user.id) │
│ createdAt (timestamp)       │
│ updatedAt (timestamp)       │
└─────────────┬───────────────┘
              │
              │ 1:N
              ▼
┌─────────────────────────────────┐
│   familienkasse_transaction     │  (new)
│─────────────────────────────────│
│ id (text, PK)                   │
│ accountId (text, FK → account)  │
│ description (text, nullable)    │
│ amount (integer, cents)         │
│ isPaid (boolean)                │
│ createdAt (timestamp)           │
└─────────────────────────────────┘
```

## Entity Definitions

### familienkasse_account

Represents a trackable financial account within a household (e.g., "Kids Allowance", "Vacation Fund").

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PRIMARY KEY | Application-generated UUID |
| name | text | NOT NULL | Display name for the account |
| userId | text | NOT NULL, FK → user.id, ON DELETE CASCADE | Owner of this account |
| createdAt | timestamp | NOT NULL, DEFAULT NOW() | When account was created |
| updatedAt | timestamp | NOT NULL, DEFAULT NOW(), ON UPDATE | Last modification time |

**Indexes**:
- `familienkasse_account_userId_idx` on `userId` (foreign key lookup)

**Relationships**:
- Belongs to one `user`
- Has many `familienkasse_transaction`

**Business Rules**:
- Account names should be unique per user (enforced at application level)
- Deleting an account cascades to delete all transactions

---

### familienkasse_transaction

Represents a financial event that affects an account's balance.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PRIMARY KEY | Application-generated UUID |
| accountId | text | NOT NULL, FK → familienkasse_account.id, ON DELETE CASCADE | The account this transaction belongs to |
| description | text | NULLABLE | Optional description of the transaction |
| amount | integer | NOT NULL | Amount in cents (can be positive or negative) |
| isPaid | boolean | NOT NULL, DEFAULT FALSE | Whether this transaction has been fulfilled |
| createdAt | timestamp | NOT NULL, DEFAULT NOW() | When transaction was recorded |

**Indexes**:
- `familienkasse_transaction_accountId_idx` on `accountId` (foreign key lookup, list queries)

**Relationships**:
- Belongs to one `familienkasse_account`

**Business Rules**:
- Amount is stored in cents (€1.50 = 150, -€5.00 = -500)
- Positive amounts = money added (deposits, allowances received)
- Negative amounts = money removed (withdrawals, expenses)
- `isPaid` tracks fulfillment (e.g., allowance promised vs. paid out)
- Balance = SUM(amount) of all transactions for the account

---

## Drizzle Schema Definition

```typescript
// src/db/schema.ts (additions)

import { pgTable, text, integer, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { user } from "./schema"; // existing Better-Auth user table

export const familienkasseAccount = pgTable(
  "familienkasse_account",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("familienkasse_account_userId_idx").on(table.userId)]
);

export const familienkasseTransaction = pgTable(
  "familienkasse_transaction",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id")
      .notNull()
      .references(() => familienkasseAccount.id, { onDelete: "cascade" }),
    description: text("description"),
    amount: integer("amount").notNull(),
    isPaid: boolean("is_paid").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("familienkasse_transaction_accountId_idx").on(table.accountId)]
);

// Type exports for use in application code
export type FamilienkasseAccount = typeof familienkasseAccount.$inferSelect;
export type NewFamilienkasseAccount = typeof familienkasseAccount.$inferInsert;
export type FamilienkasseTransaction = typeof familienkasseTransaction.$inferSelect;
export type NewFamilienkasseTransaction = typeof familienkasseTransaction.$inferInsert;
```

---

## Validation Rules

### Account Validation (Zod Schema)

```typescript
import { z } from "zod";

export const createAccountSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
});

export const updateAccountSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
});
```

### Transaction Validation (Zod Schema)

```typescript
import { z } from "zod";

export const createTransactionSchema = z.object({
  accountId: z.string().uuid("Invalid account ID"),
  description: z.string().max(500, "Description too long").optional(),
  amount: z.number().int("Amount must be in cents").min(-21474836, "Amount too small").max(21474836, "Amount too large"),
  isPaid: z.boolean().optional().default(false),
});

export const updateTransactionSchema = z.object({
  description: z.string().max(500, "Description too long").optional(),
  amount: z.number().int("Amount must be in cents").optional(),
  isPaid: z.boolean().optional(),
});
```

---

## Computed Values

### Account Balance

Balance is computed dynamically, not stored:

```typescript
// Query to get account with balance
const accountWithBalance = await db
  .select({
    id: familienkasseAccount.id,
    name: familienkasseAccount.name,
    balance: sql<number>`COALESCE(SUM(${familienkasseTransaction.amount}), 0)`.as("balance"),
  })
  .from(familienkasseAccount)
  .leftJoin(
    familienkasseTransaction,
    eq(familienkasseTransaction.accountId, familienkasseAccount.id)
  )
  .where(eq(familienkasseAccount.userId, userId))
  .groupBy(familienkasseAccount.id);
```

---

## Migration Notes

1. Run `npm run db:generate` to create migration file
2. Review generated SQL for correctness
3. Run `npm run db:migrate` to apply migration
4. Verify tables created with `npm run db:studio`
