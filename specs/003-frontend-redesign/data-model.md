# Data Model: Frontend Redesign with shadcn/ui

**Feature**: 003-frontend-redesign
**Date**: 2026-01-19

## Overview

This document defines the component props interfaces and data structures for the frontend redesign. Since this is a UI refactoring feature, the "data model" focuses on component interfaces rather than database entities.

## 1. Existing Data Types (No Changes)

These types from the existing codebase remain unchanged:

```typescript
// From @/db/queries/accounts
interface AccountWithBalance {
  id: string;
  name: string;
  userId: string;
  balance: number; // cents
  recurringAllowanceEnabled: boolean;
  recurringAllowanceAmount: number; // cents
  createdAt: Date;
  updatedAt: Date;
}

// From @/db/schema
interface FamilienkasseTransaction {
  id: string;
  accountId: string;
  description: string | null;
  amount: number; // cents
  isPaid: boolean;
  createdAt: Date;
}
```

## 2. Component Props Interfaces

### 2.1 AccountCard Component

```typescript
interface AccountCardProps {
  account: AccountWithBalance;
  onEdit?: (account: AccountWithBalance) => void;
  onDelete?: (account: AccountWithBalance) => void;
}
```

**No changes to interface** - Only internal implementation changes to use shadcn/ui components.

### 2.2 AccountList Component

```typescript
interface AccountListProps {
  accounts: AccountWithBalance[];
  isLoading: boolean;
  onEdit: (account: AccountWithBalance) => void;
  onDelete: (account: AccountWithBalance) => void;
}
```

**No changes to interface** - Internal implementation changes for Card and Skeleton usage.

### 2.3 TransactionRow Component

```typescript
interface TransactionRowProps {
  transaction: FamilienkasseTransaction;
  onUpdate: () => void;
}
```

**No changes to interface** - Internal changes for Badge and Button usage.

### 2.4 TransactionList Component

```typescript
interface TransactionListProps {
  transactions: FamilienkasseTransaction[];
  isLoading: boolean;
  onUpdate: () => void;
}
```

**No changes to interface** - Internal Skeleton implementation changes.

### 2.5 TransactionForm Component

```typescript
interface TransactionFormProps {
  accountId: string;
  onSuccess: () => void;
  onCancel: () => void;
}
```

**No changes to interface** - Form inputs replaced with shadcn/ui Input, Label, Button.

### 2.6 CreateAccountForm Component

```typescript
interface CreateAccountFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}
```

**No changes to interface** - Form inputs replaced with shadcn/ui components.

### 2.7 EditAccountDialog Component

```typescript
interface EditAccountDialogProps {
  account: AccountWithBalance;
  onSuccess: () => void;
  onClose: () => void;
}
```

**Interface change**: `onClose` behavior integrated with Dialog's `onOpenChange`.

```typescript
// New usage pattern
interface EditAccountDialogProps {
  account: AccountWithBalance;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}
```

### 2.8 DeleteAccountDialog Component

```typescript
// Current interface
interface DeleteAccountDialogProps {
  account: AccountWithBalance;
  onSuccess: () => void;
  onClose: () => void;
}

// New interface (using AlertDialog pattern)
interface DeleteAccountDialogProps {
  account: AccountWithBalance;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}
```

### 2.9 Delete Transaction Confirmation

Currently uses `window.confirm()`. Will be replaced with AlertDialog:

```typescript
interface DeleteTransactionDialogProps {
  transaction: FamilienkasseTransaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
}
```

**New component** required to replace `window.confirm()` in `TransactionRow.tsx`.

## 3. UI State Types

### 3.1 Balance Display State

```typescript
type BalanceState = 'positive' | 'negative' | 'zero';

function getBalanceState(balance: number): BalanceState {
  if (balance > 0) return 'positive';
  if (balance < 0) return 'negative';
  return 'zero';
}
```

### 3.2 Transaction Status

```typescript
type TransactionStatus = 'paid' | 'unpaid';

// Maps to Badge variant
const statusToBadgeVariant: Record<TransactionStatus, string> = {
  paid: 'default', // with green tinting
  unpaid: 'secondary', // with amber tinting
};
```

## 4. Form State Types

### 4.1 Login Form State

```typescript
interface LoginFormState {
  email: string;
  password: string;
  name: string; // Only for sign-up
  isSignUp: boolean;
  error: string;
  loading: boolean;
}
```

### 4.2 Transaction Form State

```typescript
interface TransactionFormState {
  amount: string; // User input (e.g., "10,50")
  description: string;
  isPaid: boolean;
  isSubmitting: boolean;
  error: string | null;
}
```

### 4.3 Account Form State

```typescript
interface AccountFormState {
  name: string;
  isSubmitting: boolean;
  error: string | null;
}
```

## 5. Component Relationships

```
Dashboard (route)
├── AccountList
│   └── AccountCard (×N)
│       ├── Card (shadcn)
│       └── Button (edit, delete) (shadcn)
├── CreateAccountForm
│   ├── Input (shadcn)
│   ├── Label (shadcn)
│   └── Button (shadcn)
├── EditAccountDialog
│   ├── Dialog (shadcn)
│   ├── Input (shadcn)
│   ├── Label (shadcn)
│   └── Button (shadcn)
└── DeleteAccountDialog
    └── AlertDialog (shadcn)

Account Detail (route)
├── TransactionList
│   └── TransactionRow (×N)
│       ├── Card (shadcn)
│       ├── Badge (status) (shadcn)
│       └── Button (delete) (shadcn)
├── TransactionForm
│   ├── Input (shadcn)
│   ├── Label (shadcn)
│   └── Button (shadcn)
└── DeleteTransactionDialog (new)
    └── AlertDialog (shadcn)

Login (route)
├── Card (shadcn)
├── Input (×3) (shadcn)
├── Label (×3) (shadcn)
├── Button (×2) (shadcn)
├── Alert (error) (shadcn)
├── Separator (shadcn)
└── Spinner (loading) (shadcn)

Header
└── Button (sign-out) (shadcn)
```

## 6. Breaking Changes

### 6.1 Dialog Components

The `EditAccountDialog` and `DeleteAccountDialog` components will change their prop interface to use the controlled Dialog pattern from shadcn/ui:

**Before**:
```tsx
<EditAccountDialog
  account={editingAccount}
  onSuccess={handleAccountUpdated}
  onClose={() => setEditingAccount(null)}
/>
```

**After**:
```tsx
<EditAccountDialog
  account={editingAccount}
  open={!!editingAccount}
  onOpenChange={(open) => !open && setEditingAccount(null)}
  onSuccess={handleAccountUpdated}
/>
```

### 6.2 Transaction Delete Confirmation

**Before**: Uses `window.confirm()` in `TransactionRow.tsx`
**After**: Uses new `DeleteTransactionDialog` component with proper AlertDialog

This requires state management changes in `TransactionList.tsx` or `$accountId.tsx` to track which transaction is being deleted.
