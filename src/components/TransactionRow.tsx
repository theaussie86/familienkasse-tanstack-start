import { useState } from "react";
import type { FamilienkasseTransaction } from "@/db/schema";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

interface TransactionRowProps {
  transaction: FamilienkasseTransaction;
  onUpdate: () => void;
}

export function TransactionRow({ transaction, onUpdate }: TransactionRowProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isNegative = transaction.amount < 0;
  const formattedDate = new Date(transaction.createdAt).toLocaleDateString(
    "de-DE",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  );

  const handleTogglePaid = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(
        `/api/accounts/${transaction.accountId}/transactions/${transaction.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPaid: !transaction.isPaid }),
        }
      );

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error("Failed to update transaction:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/accounts/${transaction.accountId}/transactions/${transaction.id}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="border border-neutral-200 dark:border-neutral-800 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-lg font-semibold tabular-nums",
                isNegative
                  ? "text-red-600 dark:text-red-400"
                  : "text-green-600 dark:text-green-400"
              )}
            >
              {formatCurrency(transaction.amount)}
            </span>
            <button
              onClick={handleTogglePaid}
              disabled={isUpdating}
              className={cn(
                "text-xs px-2 py-0.5 border transition-colors",
                transaction.isPaid
                  ? "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                  : "border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400",
                isUpdating && "opacity-50"
              )}
            >
              {transaction.isPaid ? "Paid" : "Unpaid"}
            </button>
          </div>
          {transaction.description && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate mt-1">
              {transaction.description}
            </p>
          )}
          <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
            {formattedDate}
          </p>
        </div>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50"
        >
          {isDeleting ? "..." : "Delete"}
        </button>
      </div>
    </div>
  );
}
