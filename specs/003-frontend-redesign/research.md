# Research: Frontend Redesign with shadcn/ui

**Feature**: 003-frontend-redesign
**Date**: 2026-01-19

## Overview

This document captures research findings for replacing custom Tailwind-styled components with shadcn/ui components in the Familienkasse application.

## 1. shadcn/ui Component Selection

### Decision: Required Components

Based on the functional requirements and existing component analysis, the following shadcn/ui components are required:

| Component | Usage | Install Command |
|-----------|-------|-----------------|
| **Button** | All interactive buttons (submit, cancel, sign-out, add, edit, delete) | `npx shadcn@latest add button` |
| **Card** | Account cards, transaction cards, form containers, login container | `npx shadcn@latest add card` |
| **Dialog** | Edit account modal, controlled dialog flows | `npx shadcn@latest add dialog` |
| **Alert Dialog** | Delete confirmation (account, transaction) | `npx shadcn@latest add alert-dialog` |
| **Input** | All form inputs (name, email, password, amount, description) | `npx shadcn@latest add input` |
| **Label** | Form field labels | `npx shadcn@latest add label` |
| **Badge** | Transaction paid/unpaid status, balance indicators | `npx shadcn@latest add badge` |
| **Skeleton** | Loading states for accounts, transactions | `npx shadcn@latest add skeleton` |
| **Alert** | Error messages, validation feedback | `npx shadcn@latest add alert` |
| **Separator** | Visual dividers (e.g., "Or continue with" in login) | `npx shadcn@latest add separator` |
| **Spinner** | Loading states in buttons | `npx shadcn@latest add spinner` |

### Rationale
- These components cover 100% of the UI elements identified in the specification
- All components are TypeScript-typed and work with Tailwind CSS 4
- The new-york style variant is already configured in `components.json`
- Lucide React icons are already the default icon library

### Alternatives Considered
- **Radix UI directly**: Rejected because shadcn/ui provides better styled defaults and is already configured
- **Headless UI**: Rejected because it requires more custom styling work
- **Custom components**: Rejected because it doesn't provide accessibility benefits of established libraries

## 2. Component Mapping

### Existing Components → shadcn/ui Usage

| Existing Component | shadcn/ui Components Used | Key Changes |
|-------------------|--------------------------|-------------|
| `AccountCard.tsx` | Card, Button | Replace custom border styles with Card component |
| `AccountList.tsx` | Card, Skeleton | Replace custom skeleton divs with Skeleton component |
| `TransactionRow.tsx` | Card, Badge, Button | Replace custom status badges with Badge component |
| `TransactionList.tsx` | Skeleton | Replace custom loading states |
| `TransactionForm.tsx` | Input, Label, Button | Replace custom form inputs |
| `CreateAccountForm.tsx` | Input, Label, Button | Replace custom form inputs |
| `EditAccountDialog.tsx` | Dialog, Input, Label, Button | Replace custom modal with Dialog |
| `DeleteAccountDialog.tsx` | AlertDialog, Button | Replace custom confirm dialog with AlertDialog |
| `Header.tsx` | Button | Replace custom sign-out button |

### Route Components → shadcn/ui Usage

| Route | shadcn/ui Components Used | Key Changes |
|-------|--------------------------|-------------|
| `login.tsx` | Card, Input, Label, Button, Alert, Separator, Spinner | Complete form redesign with Card container |
| `dashboard.tsx` | Card, Button | Replace custom section containers |
| `accounts/$accountId.tsx` | Card, Button, Skeleton | Replace custom containers and loading states |

## 3. Button Variants

### Decision: Button Variant Usage

| Context | Variant | Size |
|---------|---------|------|
| Primary actions (Submit, Save, Create, Sign in) | `default` | `default` |
| Secondary actions (Cancel, Close) | `outline` | `default` |
| Destructive actions (Delete) | `destructive` | `default` |
| Subtle actions (Sign out, Edit) | `ghost` | `sm` |
| Social login (Google) | `outline` | `default` |
| Icon-only buttons (Edit, Delete icons) | `ghost` | `icon` |

### Rationale
- Consistent with shadcn/ui recommended patterns
- Clear visual hierarchy between action types
- Destructive actions are clearly differentiated

## 4. Badge Variants for Transaction Status

### Decision: Status Badge Mapping

| Status | Variant | Text |
|--------|---------|------|
| Paid | `default` (green tint via className) | "Paid" |
| Unpaid | `secondary` (amber tint via className) | "Unpaid" |

### Rationale
- Badge component supports variant overrides via className
- Color coding matches existing UX (green = paid, amber = unpaid)
- Accessible contrast ratios maintained

## 5. Balance Color Coding

### Decision: Balance Display Colors

| Condition | Color Class |
|-----------|-------------|
| Positive balance (> 0) | `text-green-600 dark:text-green-400` |
| Negative balance (< 0) | `text-red-600 dark:text-red-400` |
| Zero balance (= 0) | `text-foreground` (neutral) |

### Rationale
- Matches existing behavior
- Uses Tailwind dark mode variants for accessibility
- Neutral for zero balance per edge case specification

## 6. Form Validation Pattern

### Decision: Inline Validation with Alert

```tsx
{error && (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>{error}</AlertDescription>
  </Alert>
)}
```

### Rationale
- shadcn/ui Alert component with `destructive` variant provides clear error styling
- Consistent with specification requirement FR-006
- Accessible with proper ARIA attributes

## 7. Loading State Pattern

### Decision: Skeleton Composition

For account list loading:
```tsx
<div className="space-y-3">
  {Array.from({ length: 3 }).map((_, i) => (
    <Card key={i}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-6 w-20" />
        </div>
      </CardContent>
    </Card>
  ))}
</div>
```

For button loading:
```tsx
<Button disabled>
  <Spinner />
  Loading...
</Button>
```

### Rationale
- Skeleton provides visual placeholder matching final layout
- Spinner indicates active processing
- Both patterns are accessible and non-jarring

## 8. Installation Order

### Decision: Component Installation Sequence

```bash
npx shadcn@latest add button card input label badge skeleton alert alert-dialog dialog separator spinner
```

### Rationale
- Single command installs all components
- Dependencies are resolved automatically
- Components are placed in `src/components/ui/` per configuration

## 9. Migration Strategy

### Decision: Incremental Refactoring by Page Priority

1. **Phase 1 (P1)**: Dashboard page (`dashboard.tsx`, `AccountCard.tsx`, `AccountList.tsx`)
2. **Phase 2 (P2a)**: Account detail page (`$accountId.tsx`, `TransactionRow.tsx`, `TransactionList.tsx`, `TransactionForm.tsx`)
3. **Phase 2 (P2b)**: Account management (`CreateAccountForm.tsx`, `EditAccountDialog.tsx`, `DeleteAccountDialog.tsx`)
4. **Phase 3 (P3)**: Login page (`login.tsx`)
5. **Final**: Header (`Header.tsx`)

### Rationale
- Matches user story priorities from specification
- Each phase is independently testable
- Reduces risk of regressions by limiting scope per phase
