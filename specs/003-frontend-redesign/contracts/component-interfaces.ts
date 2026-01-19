/**
 * Component Interface Contracts for Frontend Redesign
 *
 * These interfaces define the contracts between components after
 * the shadcn/ui migration. Implementations must conform to these
 * interfaces to maintain feature parity.
 *
 * @feature 003-frontend-redesign
 * @date 2026-01-19
 */

import type { AccountWithBalance } from "@/db/queries/accounts";
import type { FamilienkasseTransaction } from "@/db/schema";

// ============================================================================
// Account Components
// ============================================================================

/**
 * AccountCard displays a single account with its balance and action buttons.
 * No interface changes from current implementation.
 */
export interface AccountCardProps {
  /** The account to display */
  account: AccountWithBalance;
  /** Called when edit button is clicked */
  onEdit?: (account: AccountWithBalance) => void;
  /** Called when delete button is clicked */
  onDelete?: (account: AccountWithBalance) => void;
}

/**
 * AccountList displays a list of accounts with loading state support.
 * No interface changes from current implementation.
 */
export interface AccountListProps {
  /** List of accounts to display */
  accounts: AccountWithBalance[];
  /** Whether the list is currently loading */
  isLoading: boolean;
  /** Called when an account's edit button is clicked */
  onEdit: (account: AccountWithBalance) => void;
  /** Called when an account's delete button is clicked */
  onDelete: (account: AccountWithBalance) => void;
}

/**
 * CreateAccountForm provides the form for creating new accounts.
 * No interface changes from current implementation.
 */
export interface CreateAccountFormProps {
  /** Called after successful account creation */
  onSuccess: () => void;
  /** Called when user cancels the form */
  onCancel: () => void;
}

/**
 * EditAccountDialog provides a modal for editing account details.
 * INTERFACE CHANGED: Now uses controlled open state pattern.
 */
export interface EditAccountDialogProps {
  /** The account being edited */
  account: AccountWithBalance;
  /** Whether the dialog is open */
  open: boolean;
  /** Called when dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** Called after successful account update */
  onSuccess: () => void;
}

/**
 * DeleteAccountDialog provides a confirmation modal for account deletion.
 * INTERFACE CHANGED: Now uses controlled open state pattern.
 */
export interface DeleteAccountDialogProps {
  /** The account to be deleted */
  account: AccountWithBalance;
  /** Whether the dialog is open */
  open: boolean;
  /** Called when dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** Called after successful account deletion */
  onSuccess: () => void;
}

// ============================================================================
// Transaction Components
// ============================================================================

/**
 * TransactionRow displays a single transaction with status and actions.
 * No interface changes from current implementation.
 */
export interface TransactionRowProps {
  /** The transaction to display */
  transaction: FamilienkasseTransaction;
  /** Called after any transaction update (status toggle or delete) */
  onUpdate: () => void;
  /** Called when delete is requested (for AlertDialog pattern) */
  onDeleteRequest?: (transaction: FamilienkasseTransaction) => void;
}

/**
 * TransactionList displays a list of transactions with loading state.
 * No interface changes from current implementation.
 */
export interface TransactionListProps {
  /** List of transactions to display */
  transactions: FamilienkasseTransaction[];
  /** Whether the list is currently loading */
  isLoading: boolean;
  /** Called after any transaction update */
  onUpdate: () => void;
}

/**
 * TransactionForm provides the form for creating new transactions.
 * No interface changes from current implementation.
 */
export interface TransactionFormProps {
  /** The account ID to create the transaction for */
  accountId: string;
  /** Called after successful transaction creation */
  onSuccess: () => void;
  /** Called when user cancels the form */
  onCancel: () => void;
}

/**
 * DeleteTransactionDialog provides a confirmation modal for transaction deletion.
 * NEW COMPONENT: Replaces window.confirm() pattern.
 */
export interface DeleteTransactionDialogProps {
  /** The transaction to be deleted (null when closed) */
  transaction: FamilienkasseTransaction | null;
  /** Whether the dialog is open */
  open: boolean;
  /** Called when dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** Called when user confirms deletion */
  onConfirm: () => void;
  /** Whether deletion is in progress */
  isDeleting: boolean;
}

// ============================================================================
// Shared Types
// ============================================================================

/**
 * Balance state for color coding
 */
export type BalanceState = "positive" | "negative" | "zero";

/**
 * Transaction payment status
 */
export type TransactionStatus = "paid" | "unpaid";

/**
 * Utility to determine balance state from amount
 */
export function getBalanceState(balance: number): BalanceState {
  if (balance > 0) return "positive";
  if (balance < 0) return "negative";
  return "zero";
}

/**
 * CSS class mappings for balance states
 */
export const balanceStateClasses: Record<BalanceState, string> = {
  positive: "text-green-600 dark:text-green-400",
  negative: "text-red-600 dark:text-red-400",
  zero: "text-foreground",
};

/**
 * Badge variant mappings for transaction status
 */
export const transactionStatusBadge: Record<
  TransactionStatus,
  { variant: "default" | "secondary"; className: string }
> = {
  paid: {
    variant: "default",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30",
  },
  unpaid: {
    variant: "secondary",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30",
  },
};
