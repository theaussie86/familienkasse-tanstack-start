# Quickstart: Frontend Redesign with shadcn/ui

**Feature**: 003-frontend-redesign
**Date**: 2026-01-19

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database running (for testing)
- Environment variables configured (`.env` file)

## Setup Steps

### 1. Install shadcn/ui Components

The project already has shadcn/ui configured in `components.json`. Install required components:

```bash
npx shadcn@latest add button card input label badge skeleton alert alert-dialog dialog separator spinner
```

This installs components to `src/components/ui/`.

### 2. Verify Installation

After installation, verify the following files exist:

```
src/components/ui/
├── alert-dialog.tsx
├── alert.tsx
├── badge.tsx
├── button.tsx
├── card.tsx
├── dialog.tsx
├── input.tsx
├── label.tsx
├── separator.tsx
├── skeleton.tsx
└── spinner.tsx
```

### 3. Start Development Server

```bash
npm run dev
```

The app runs at `http://localhost:3000`.

### 4. Verify shadcn/ui Theme

The project uses:
- **Style**: new-york
- **Base color**: zinc
- **Dark mode**: CSS variables

Check `src/styles.css` includes shadcn/ui CSS variables.

## Development Workflow

### Component Refactoring Order

Follow the priority order from the spec:

1. **P1 - Dashboard** (highest priority)
   - `src/routes/dashboard.tsx`
   - `src/components/AccountCard.tsx`
   - `src/components/AccountList.tsx`

2. **P2a - Account Detail**
   - `src/routes/accounts/$accountId.tsx`
   - `src/components/TransactionRow.tsx`
   - `src/components/TransactionList.tsx`
   - `src/components/TransactionForm.tsx`

3. **P2b - Account Management**
   - `src/components/CreateAccountForm.tsx`
   - `src/components/EditAccountDialog.tsx`
   - `src/components/DeleteAccountDialog.tsx`

4. **P3 - Authentication**
   - `src/routes/login.tsx`

5. **Final - Header**
   - `src/components/Header.tsx`

### Testing Each Component

After refactoring each component:

1. Run the development server
2. Navigate to the relevant page
3. Verify visual appearance matches shadcn/ui styling
4. Test all interactions (clicks, form submissions, dialogs)
5. Test dark mode toggle
6. Test responsive behavior (resize browser)

### Running Tests

```bash
npm run test        # Run all tests
npm run lint        # Check code style
npm run build       # Verify production build
```

## Common Patterns

### Using Button

```tsx
import { Button } from "@/components/ui/button";

// Primary action
<Button>Save</Button>

// Secondary action
<Button variant="outline">Cancel</Button>

// Destructive action
<Button variant="destructive">Delete</Button>

// Loading state
<Button disabled>
  <Spinner />
  Loading...
</Button>
```

### Using Card

```tsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Account Name</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content here */}
  </CardContent>
</Card>
```

### Using Dialog

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit Account</DialogTitle>
    </DialogHeader>
    {/* Form content */}
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button type="submit">Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Using AlertDialog for Confirmations

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

<AlertDialog open={isOpen} onOpenChange={setIsOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete Account?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Using Badge for Status

```tsx
import { Badge } from "@/components/ui/badge";

// Paid status (green tint)
<Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
  Paid
</Badge>

// Unpaid status (amber tint)
<Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
  Unpaid
</Badge>
```

### Using Skeleton for Loading

```tsx
import { Skeleton } from "@/components/ui/skeleton";

// Loading card
<Card>
  <CardContent className="p-4">
    <div className="flex justify-between">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-6 w-20" />
    </div>
  </CardContent>
</Card>
```

### Using Form Inputs

```tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

<div className="grid gap-2">
  <Label htmlFor="name">Account Name</Label>
  <Input
    id="name"
    value={name}
    onChange={(e) => setName(e.target.value)}
    placeholder="Enter account name"
  />
</div>
```

## Troubleshooting

### Components not styled correctly

1. Verify `src/styles.css` has shadcn/ui CSS variables
2. Check Tailwind configuration in `vite.config.ts`
3. Ensure `cn()` utility from `@/lib/utils` is used for class merging

### Dark mode not working

1. Check `dark:` variants are applied to custom classes
2. Verify `darkMode: 'class'` in Tailwind config
3. Test by toggling system dark mode preference

### Dialog not closing

1. Use controlled `open` and `onOpenChange` props
2. Call `onOpenChange(false)` in success callbacks
3. Check for event propagation issues with `e.stopPropagation()`

## Files Reference

| File | Purpose |
|------|---------|
| `components.json` | shadcn/ui configuration |
| `src/styles.css` | Global styles with CSS variables |
| `src/lib/utils.ts` | `cn()` utility for class merging |
| `src/components/ui/*` | shadcn/ui base components |
