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
    __root.tsx         - Root layout with devtools
    index.tsx          - Home page
    login.tsx          - Login page
    dashboard.tsx      - Protected dashboard
    /api/auth/$.ts     - Better-Auth catch-all API route
  /components          - React components
    Header.tsx         - Main header component
    /ui                - shadcn/ui components
  /db                  - Database layer
    index.ts           - Drizzle client setup
    schema.ts          - Database schema (user, session, account, verification)
  /lib                 - Utility libraries
    auth.ts            - Better-Auth server config
    auth-client.ts     - Better-Auth client
    middleware.ts      - Auth middleware
    utils.ts           - Utility functions (cn)
  /integrations
    /tanstack-query    - Query provider and devtools
    /better-auth       - Auth UI components
  /styles.css          - Global styles
  router.tsx           - Router configuration
  routeTree.gen.ts     - Generated route tree (auto-generated)
/drizzle               - Migration files
/public                - Static assets
```

## Key Files

- **vite.config.ts** - Vite configuration with TanStack Start, Tailwind, and Nitro plugins
- **drizzle.config.ts** - Drizzle Kit configuration for migrations
- **components.json** - shadcn/ui configuration (new-york style, zinc base)
- **tsconfig.json** - TypeScript configuration with `@/*` path alias

## Database Schema

The database schema (in `src/db/schema.ts`) includes Better-Auth tables:
- **user** - User profiles (id, name, email, emailVerified, image)
- **session** - User sessions with expiration
- **account** - OAuth accounts and credentials
- **verification** - Email verification tokens

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
```

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
