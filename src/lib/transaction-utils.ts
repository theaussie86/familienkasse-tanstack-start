/**
 * Transaction status utilities for Badge styling
 */

export type TransactionStatus = "paid" | "unpaid";

/**
 * Badge variant and class mappings for transaction status
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
