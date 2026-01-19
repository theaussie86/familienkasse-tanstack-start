# Weissteiner Familienkasse

A family finance tracking application built with TanStack Start. This application helps track family account balances and transactions.

## Technology Stack

### Core Framework
- **TanStack Start** - Full-stack React framework with SSR
- **TanStack Router 1.132** - File-based routing with type safety
- **React 19.2.0**
- **TypeScript 5.7**
- **Vite 7** - Build tool and dev server

### Database & Backend
- **Drizzle ORM 0.45** - TypeScript ORM with PostgreSQL
- **PostgreSQL** - Main database (via `postgres` driver)
- **Nitro** - Server runtime (nightly build)

### Authentication
- **Better-Auth 1.4** - Authentication library
  - Email/password authentication
  - Google OAuth social login
  - TanStack Start cookie integration
  - Session management via Drizzle adapter

### UI & Styling
- **Tailwind CSS 4.0** - Utility-first CSS framework
- **shadcn/ui** - Pre-built components (new-york style, zinc base color)
- **Lucide React** - Icon library
- **tw-animate-css** - Animation utilities
- **class-variance-authority** - Component variant management
- **tailwind-merge** - Utility class merging

### State Management & Data Fetching
- **TanStack Query 5.66** - Server state management with SSR integration
- **TanStack Router SSR Query** - Router + Query SSR integration

### Testing
- **Vitest 3.0** - Test runner
- **Testing Library** - React and DOM testing utilities

## Project Structure

```
/src
  /routes               - TanStack Router file-based routes
    __root.tsx         - Root layout with devtools and ErrorBoundary
    index.tsx          - Home page
    login.tsx          - Login page
    dashboard.tsx      - Protected dashboard with account management
    /accounts
      [accountId].tsx  - Account detail page with transactions
    /api
      /auth/$.ts       - Better-Auth catch-all API route
      config.ts        - Public config API (registration status)
      /accounts        - REST API for accounts
        index.ts       - GET/POST accounts
        /[accountId]
          index.ts     - GET/PATCH/DELETE account
          /transactions
            index.ts   - GET/POST transactions
            [transactionId].ts - GET/PATCH/DELETE transaction
  /components          - React components
    Header.tsx         - Main header component
    AccountCard.tsx    - Account display with balance
    AccountList.tsx    - Account list with loading states
    TransactionForm.tsx - Transaction creation form
    TransactionList.tsx - Transaction list display
    TransactionRow.tsx  - Transaction row with actions
    CreateAccountForm.tsx - Account creation form
    EditAccountDialog.tsx - Account edit modal
    DeleteAccountDialog.tsx - Account delete confirmation
    ErrorBoundary.tsx  - Error boundary wrapper
    /ui                - shadcn/ui components
  /db                  - Database layer
    index.ts           - Drizzle client setup
    schema.ts          - Database schema
    /queries           - Database query functions
      accounts.ts      - Account CRUD operations
      transactions.ts  - Transaction CRUD operations
  /lib                 - Utility libraries
    auth.ts            - Better-Auth server config with registration control
    auth-client.ts     - Better-Auth client
    middleware.ts      - Auth middleware
    utils.ts           - Utility functions (cn)
    currency.ts        - Currency formatting (cents to Euro)
    id.ts              - UUID generation
    api-error.ts       - API error response helpers
    validations.ts     - Zod validation schemas
  /integrations
    /tanstack-query    - Query provider and devtools
    /better-auth       - Auth UI components
  /styles.css          - Global styles
  router.tsx           - Router configuration
  routeTree.gen.ts     - Generated route tree (auto-generated)
/drizzle               - Migration files
/specs                 - Feature specifications (speckit)
/public                - Static assets
```

## Key Files

- **vite.config.ts** - Vite configuration with TanStack Start, Tailwind, and Nitro plugins
- **drizzle.config.ts** - Drizzle Kit configuration for migrations
- **components.json** - shadcn/ui configuration (new-york style, zinc base)
- **tsconfig.json** - TypeScript configuration with `@/*` path alias

## Database Schema

The database schema (in `src/db/schema.ts`) includes:

### Better-Auth tables:
- **user** - User profiles (id, name, email, emailVerified, image)
- **session** - User sessions with expiration
- **account** - OAuth accounts and credentials
- **verification** - Email verification tokens

### Familienkasse tables:
- **familienkasse_account** - Family accounts (id, name, user_id, created_at, updated_at)
- **familienkasse_transaction** - Transactions (id, account_id, description, amount, is_paid, created_at)

### Amount Storage
- Amounts are stored as integers representing cents (e.g., €10.50 = 1050)
- Use `formatCurrency()` from `@/lib/currency` for display
- Use `parseToCents()` for converting user input to cents

## Development Commands

```bash
npm run dev          # Start development server on port 3000
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests with Vitest
npm run lint         # Run ESLint
npm run format       # Run Prettier
npm run check        # Format and lint fix

# Database commands
npm run db:generate  # Generate migrations from schema
npm run db:migrate   # Run migrations
npm run db:push      # Push schema changes directly
npm run db:studio    # Open Drizzle Studio
```

## Authentication

- Login URL: `/login`
- Protected routes use `authMiddleware` from `@/lib/middleware`
- Auth API handled at `/api/auth/*` via Better-Auth
- Client-side session access via `authClient.useSession()`
- Social providers: Google OAuth

### Environment Variables Required
```
DATABASE_URL=postgresql://...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
ALLOW_REGISTRATION=true  # Set to 'false' to disable new user registration
```

### Registration Control
- Set `ALLOW_REGISTRATION=false` to block new sign-ups
- When disabled, the sign-up endpoint returns 404 and UI shows "Registration is closed"
- Configured via Better-Auth `disabledPaths` in `src/lib/auth.ts`

## Routing

TanStack Router with file-based routing:
- Routes defined in `src/routes/` directory
- Route tree auto-generated in `src/routeTree.gen.ts`
- Protected routes use server middleware: `server: { middleware: [authMiddleware] }`
- Default preload strategy: `intent`

## Code Style & Patterns

### Component Patterns
- Functional components with TypeScript
- File-based routing with `createFileRoute`
- Server middleware for route protection
- TanStack Query for data fetching with SSR hydration
- Better-Auth hooks for session state
- Loading skeletons for data-fetching components
- Modal dialogs for edit/delete confirmations

### API Patterns
- REST API routes use `createAPIFileRoute` from `@tanstack/react-start/api`
- Authentication via `auth.api.getSession({ headers: getRequestHeaders() })`
- All endpoints return typed JSON responses using `jsonResponse()` from `@/lib/api-error`
- Data isolation: all queries filter by `userId` from session
- Validation using Zod schemas from `@/lib/validations`

### File Naming
- Components: PascalCase (e.g., `Header.tsx`)
- Routes: lowercase (e.g., `dashboard.tsx`, `login.tsx`)
- Utilities: camelCase (e.g., `auth-client.ts`)

### TypeScript
- Strict type checking enabled
- Path alias: `@/*` maps to `./src/*`
- ES2022 target with bundler module resolution

### Styling
- Tailwind CSS 4 with CSS variables
- shadcn/ui new-york style variant
- Zinc as base color
- Dark mode support via `dark:` variants

## Development Notes

- Uses TanStack Start with Vite
- SSR with TanStack Router + Query integration
- Nitro as the server runtime
- Drizzle ORM for type-safe database operations
- Better-Auth handles all authentication flows
- Devtools available in development (Router, Query, and unified TanStack Devtools)

## Active Technologies
- TypeScript 5.7, React 19.2.0 + TanStack Start, TanStack Router 1.132, TanStack Query 5.66, Better-Auth 1.4 (001-data-model)
- PostgreSQL via Drizzle ORM 0.45 (001-data-model)
- TypeScript 5.7 + TanStack Start 1.132, Drizzle ORM 0.45, postgres driver 3.4, Better-Auth 1.4 (002-data-migration)
- PostgreSQL (local target via Drizzle ORM, Supabase source via direct postgres connection) (002-data-migration)

## Recent Changes
- 001-data-model: Added TypeScript 5.7, React 19.2.0 + TanStack Start, TanStack Router 1.132, TanStack Query 5.66, Better-Auth 1.4
