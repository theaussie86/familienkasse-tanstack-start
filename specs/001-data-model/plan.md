# Implementation Plan: Family Finance Data Model

**Branch**: `001-data-model` | **Date**: 2025-01-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-data-model/spec.md`

## Summary

Create the core data model for the Familienkasse application: two new database tables (`familienkasse_account` and `familienkasse_transaction`) linked to the existing Better-Auth user table. Add registration control via environment variable. This enables tracking family member balances and transaction history with full user data isolation.

## Technical Context

**Language/Version**: TypeScript 5.7, React 19.2.0
**Primary Dependencies**: TanStack Start, TanStack Router 1.132, TanStack Query 5.66, Better-Auth 1.4
**Storage**: PostgreSQL via Drizzle ORM 0.45
**Testing**: Vitest 3.0 with Testing Library
**Target Platform**: Web application (SSR via Nitro runtime)
**Project Type**: Web application (full-stack monolith)
**Performance Goals**: Dashboard load < 2s, transaction operations < 1s (per spec SC-001, SC-002)
**Constraints**: Data isolation per user, amounts as integers (cents)
**Scale/Scope**: Single-family use, ~1000 transactions per account max

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Type Safety ✅

| Requirement | Compliance |
|-------------|------------|
| No `any` types | Will use Drizzle's inferred types for all entities |
| Explicit types for functions | All DB operations will have typed inputs/outputs |
| Type-safe DB queries | Drizzle ORM with `pgTable` definitions |
| Validated API responses | TanStack Query with typed responses |

### II. Security First ✅

| Requirement | Compliance |
|-------------|------------|
| Auth middleware on data routes | All account/transaction routes use `authMiddleware` |
| Parameterized queries | Drizzle ORM prevents SQL injection |
| User data isolation | All queries filter by `userId` from session |
| Input validation | Zod schemas for all mutations |
| Environment secrets | `ALLOW_REGISTRATION` as env var |

### III. Simplicity ✅

| Requirement | Compliance |
|-------------|------------|
| YAGNI | Only 2 new tables, no premature abstractions |
| Direct solutions | Simple foreign key relationships |
| Single responsibility | Clear entity boundaries |
| No unused code | Extending existing schema, not replacing |

**Gate Status**: ✅ PASSED - No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/001-data-model/
├── plan.md              # This file
├── research.md          # Phase 0: Better-Auth registration control research
├── data-model.md        # Phase 1: Entity definitions
├── quickstart.md        # Phase 1: Setup and testing guide
├── contracts/           # Phase 1: API contracts
│   └── api.yaml         # OpenAPI spec for account/transaction endpoints
└── checklists/
    └── requirements.md  # Spec validation checklist
```

### Source Code (repository root)

```text
src/
├── db/
│   ├── index.ts         # Existing Drizzle client
│   └── schema.ts        # Add familienkasse_account, familienkasse_transaction
├── lib/
│   ├── auth.ts          # Add ALLOW_REGISTRATION check
│   └── middleware.ts    # Existing auth middleware
├── routes/
│   ├── dashboard.tsx    # Update to show accounts/balances
│   └── api/
│       └── ...          # API routes for CRUD operations
└── components/
    └── ui/              # Existing shadcn components
```

**Structure Decision**: Extending existing TanStack Start structure. New tables added to `src/db/schema.ts`. No new directories needed - follows existing conventions.

## Complexity Tracking

> No constitution violations requiring justification.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | - | - |
