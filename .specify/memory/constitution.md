<!--
================================================================================
SYNC IMPACT REPORT
================================================================================
Version change: N/A → 1.0.0 (initial constitution)

Modified principles: N/A (initial creation)

Added sections:
- Core Principles (3 principles: Type Safety, Security First, Simplicity)
- Technology Standards (project-specific constraints)
- Development Workflow (trunk-based development)
- Governance (amendment procedures)

Removed sections: N/A (initial creation)

Templates requiring updates:
- .specify/templates/plan-template.md: ✅ Compatible (Constitution Check placeholder exists)
- .specify/templates/spec-template.md: ✅ Compatible (requirements structure aligns)
- .specify/templates/tasks-template.md: ✅ Compatible (phase structure supports principles)

Follow-up TODOs: None
================================================================================
-->

# Weissteiner Familienkasse Constitution

## Core Principles

### I. Type Safety

All code MUST be fully type-safe with strict TypeScript configuration.

- The `any` type is FORBIDDEN except in rare, documented escape hatches
- All function parameters, return types, and variables MUST have explicit or inferable types
- Database queries MUST use Drizzle ORM's type-safe query builders
- API responses MUST be validated against TypeScript types
- Third-party libraries without TypeScript support require typed wrappers

**Rationale**: Type safety prevents runtime errors, enables confident refactoring, and serves as living documentation. In a financial application, type errors can lead to incorrect balance calculations or data corruption.

### II. Security First

User authentication, data privacy, and secure coding practices are non-negotiable.

- All routes handling user data MUST use `authMiddleware` for protection
- Passwords MUST be hashed; secrets MUST be stored in environment variables
- SQL queries MUST use parameterized queries via Drizzle ORM (no raw string concatenation)
- User input MUST be validated and sanitized at API boundaries
- Session tokens MUST have appropriate expiration and rotation policies
- HTTPS MUST be enforced in production

**Rationale**: Financial data is sensitive. A security breach could expose family financial information, violate trust, and potentially enable fraud.

### III. Simplicity

Start simple. Add complexity only when proven necessary.

- YAGNI: Do not build features "just in case"
- Prefer direct solutions over abstractions until patterns repeat 3+ times
- Components should do one thing well
- Avoid premature optimization; measure before optimizing
- Delete unused code immediately; do not comment it out
- Dependencies MUST be justified; prefer built-in solutions

**Rationale**: Complexity is the primary source of bugs and maintenance burden. Simple code is easier to understand, test, and modify.

## Technology Standards

### Stack Constraints

- **Framework**: TanStack Start with Vite and Nitro runtime
- **Database**: PostgreSQL via Drizzle ORM (type-safe queries mandatory)
- **Authentication**: Better-Auth with session-based auth
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **Testing**: Vitest with Testing Library

### Code Organization

- Routes in `src/routes/` following TanStack Router file-based conventions
- Reusable components in `src/components/`
- Database logic in `src/db/`
- Utilities in `src/lib/`
- Path alias `@/*` maps to `./src/*`

### Naming Conventions

- Components: PascalCase (e.g., `TransactionList.tsx`)
- Routes: lowercase (e.g., `dashboard.tsx`)
- Utilities: camelCase (e.g., `formatCurrency.ts`)

## Development Workflow

### Trunk-Based Development

- The `main` branch is the source of truth
- Feature branches MUST be short-lived (< 2 days recommended)
- Integrate frequently to avoid merge conflicts
- All commits to `main` MUST pass CI checks

### Quality Gates

- All code MUST pass `npm run lint` without errors
- All code MUST pass `npm run test` without failures
- Type checking (`tsc --noEmit`) MUST pass
- Database migrations MUST be reviewed for data safety

### Commit Standards

- Commits SHOULD be atomic and self-contained
- Commit messages SHOULD follow conventional commits format
- Breaking changes MUST be clearly documented

## Governance

### Amendment Process

1. Propose changes via pull request to this constitution file
2. Document rationale for the change
3. Changes require explicit approval before merge
4. Update dependent templates if principles change

### Versioning Policy

This constitution follows semantic versioning:

- **MAJOR**: Principle removals or incompatible governance changes
- **MINOR**: New principles, sections, or material expansions
- **PATCH**: Clarifications, wording improvements, typo fixes

### Compliance

- All PRs MUST be checked against these principles
- Violations MUST be documented and justified in `Complexity Tracking` section of plans
- Runtime development guidance is available in `CLAUDE.md`

**Version**: 1.0.0 | **Ratified**: 2025-01-19 | **Last Amended**: 2025-01-19
