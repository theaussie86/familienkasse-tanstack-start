# Research: Family Finance Data Model

**Feature**: 001-data-model
**Date**: 2025-01-19
**Status**: Complete

## Research Topics

### 1. Better-Auth Registration Control

**Question**: How to enable/disable user registration via environment variable?

**Decision**: Use `disabledPaths` configuration option combined with environment variable check.

**Rationale**: Better-Auth provides a `disabledPaths` array that can disable specific authentication endpoints. By conditionally adding `/sign-up/email` to this array based on `ALLOW_REGISTRATION` environment variable, we can control registration without modifying auth logic.

**Implementation**:

```typescript
// src/lib/auth.ts
export const auth = betterAuth({
  // ... existing config
  disabledPaths: process.env.ALLOW_REGISTRATION === 'false'
    ? ['/sign-up/email']
    : [],
});
```

**Alternatives Considered**:

| Alternative | Why Rejected |
|-------------|--------------|
| Database hooks with `user.create.before` | More complex, requires custom error handling |
| Custom middleware on sign-up route | Bypasses Better-Auth's built-in mechanism |
| UI-only disable | Not secure, API would still accept registrations |

**Environment Variable**:
- Name: `ALLOW_REGISTRATION`
- Values: `'true'` (default) or `'false'`
- When `false`: `/sign-up/email` endpoint returns 404

---

### 2. Drizzle ORM Schema Patterns

**Question**: How to define familienkasse tables with proper types and foreign keys?

**Decision**: Use `pgTable` with `uuid` for IDs, `integer` for cents, and cascading foreign keys.

**Rationale**: Following existing Better-Auth schema patterns in the project. Using `text` for IDs (matching user.id) and `integer` for amounts ensures type safety and precision.

**Key Patterns**:

```typescript
// UUID generation
import { pgTable, text, integer, boolean, timestamp, index } from "drizzle-orm/pg-core";

// Foreign key with cascade delete
userId: text("user_id")
  .notNull()
  .references(() => user.id, { onDelete: "cascade" })

// Integer for cents (no floating point issues)
amount: integer("amount").notNull()

// Index for performance on foreign keys
(table) => [index("account_userId_idx").on(table.userId)]
```

**Type Inference**:

```typescript
export type FamilienkasseAccount = typeof familienkasseAccount.$inferSelect;
export type NewFamilienkasseAccount = typeof familienkasseAccount.$inferInsert;
```

---

### 3. ID Generation Strategy

**Question**: What ID format to use for new entities?

**Decision**: Use `text` type with application-generated UUIDs (matching Better-Auth pattern).

**Rationale**: Better-Auth uses `text` for all IDs, not PostgreSQL `uuid` type. Keeping consistency avoids type mismatches in foreign key relationships.

**Implementation**: Use `crypto.randomUUID()` or a library like `nanoid` for ID generation in application code.

---

### 4. Amount Storage

**Question**: How to store currency amounts without precision issues?

**Decision**: Store as `integer` representing cents (€1.50 = 150).

**Rationale**:
- Avoids floating-point precision issues (0.1 + 0.2 ≠ 0.3)
- `int4` supports values up to 2,147,483,647 cents (~€21.4 million)
- Simple arithmetic operations
- No need for decimal/numeric types

**Display**: Format with `/100` and locale-aware currency formatter on frontend.

---

## Summary

| Topic | Decision | Confidence |
|-------|----------|------------|
| Registration control | `disabledPaths` with env var | High |
| Schema pattern | Match existing Better-Auth style | High |
| ID type | `text` with app-generated UUIDs | High |
| Amount storage | `integer` (cents) | High |

All research questions resolved. Ready for Phase 1: Design & Contracts.
