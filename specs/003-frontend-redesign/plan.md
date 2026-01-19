# Implementation Plan: Frontend Redesign with shadcn/ui

**Branch**: `003-frontend-redesign` | **Date**: 2026-01-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-frontend-redesign/spec.md`

## Summary

Replace custom Tailwind-styled components with shadcn/ui component library to achieve a polished, consistent user interface. The project already has shadcn/ui configured (new-york style, zinc base color) but no UI components are currently installed. This redesign will install required shadcn/ui components and refactor existing components to use them while maintaining 100% feature parity.

## Technical Context

**Language/Version**: TypeScript 5.7, React 19.2.0
**Primary Dependencies**: TanStack Start, TanStack Router 1.132, TanStack Query 5.66, shadcn/ui (new-york style), Tailwind CSS 4.0, Lucide React
**Storage**: PostgreSQL via Drizzle ORM 0.45 (no changes needed)
**Testing**: Vitest 3.0 with Testing Library
**Target Platform**: Web (SSR via Nitro runtime)
**Project Type**: Web application (full-stack React)
**Performance Goals**: <100ms interactive response time, immediate form validation feedback
**Constraints**: Must maintain feature parity, responsive 320px-1920px, dark mode support
**Scale/Scope**: 4 main pages (login, dashboard, account detail, forms), ~12 components to refactor

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Type Safety** | ✅ PASS | shadcn/ui components are fully TypeScript-typed; existing type-safe patterns preserved |
| **II. Security First** | ✅ PASS | No security changes; all auth middleware and data isolation remains intact |
| **III. Simplicity** | ✅ PASS | Replacing custom CSS with established component library reduces complexity |
| **Stack Constraints** | ✅ PASS | shadcn/ui + Tailwind CSS 4 explicitly allowed in constitution |
| **Code Organization** | ✅ PASS | UI components go to `src/components/ui/` per existing structure |
| **Quality Gates** | ✅ PASS | lint, test, and type-check requirements remain applicable |

**Pre-Phase 0 Gate**: PASSED - No constitution violations

**Post-Phase 1 Gate**: PASSED - Design artifacts validated against constitution:
- Type Safety: Component interfaces in `contracts/component-interfaces.ts` are fully typed
- Security: No changes to auth patterns; all existing security measures preserved
- Simplicity: Component count unchanged; complexity reduced by using established patterns

## Project Structure

### Documentation (this feature)

```text
specs/003-frontend-redesign/
├── plan.md              # This file
├── research.md          # Phase 0 output - shadcn/ui component selection
├── data-model.md        # Phase 1 output - Component/props data model
├── quickstart.md        # Phase 1 output - Development setup guide
├── contracts/           # Phase 1 output - Component interface contracts
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── ui/              # shadcn/ui base components (to be installed)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── badge.tsx
│   │   ├── skeleton.tsx
│   │   ├── alert.tsx
│   │   ├── alert-dialog.tsx
│   │   └── separator.tsx
│   ├── AccountCard.tsx      # Refactor to use Card, Button, Badge
│   ├── AccountList.tsx      # Refactor to use Card, Skeleton
│   ├── TransactionRow.tsx   # Refactor to use Card, Badge, Button
│   ├── TransactionList.tsx  # Refactor to use Skeleton
│   ├── TransactionForm.tsx  # Refactor to use Input, Label, Button
│   ├── CreateAccountForm.tsx # Refactor to use Input, Label, Button
│   ├── EditAccountDialog.tsx # Refactor to use Dialog, Input, Label, Button
│   ├── DeleteAccountDialog.tsx # Refactor to use AlertDialog, Button
│   └── Header.tsx           # Refactor to use Button
├── routes/
│   ├── login.tsx            # Refactor to use Card, Input, Label, Button, Alert
│   ├── dashboard.tsx        # Refactor to use Card, Button
│   └── accounts/
│       └── $accountId.tsx   # Refactor to use Card, Button, Skeleton
└── lib/
    └── utils.ts             # Already has cn() utility
```

**Structure Decision**: Single project web application using existing TanStack Start structure. UI components installed to `src/components/ui/` via shadcn CLI as configured in `components.json`.

## Complexity Tracking

No constitution violations to track. This feature reduces complexity by:
- Replacing ~500 lines of custom CSS classes with standardized components
- Eliminating manual dark mode handling (shadcn/ui handles it)
- Using established accessibility patterns from shadcn/ui
