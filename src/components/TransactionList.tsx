import type { FamilienkasseTransaction } from "@/db/schema";
import { TransactionRow } from "./TransactionRow";

interface TransactionListProps {
  transactions: FamilienkasseTransaction[];
  isLoading?: boolean;
  onUpdate: () => void;
}

export function TransactionList({
  transactions,
  isLoading,
  onUpdate,
}: TransactionListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="border border-neutral-200 dark:border-neutral-800 p-4 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-800 rounded" />
                <div className="h-3 w-24 bg-neutral-200 dark:bg-neutral-800 rounded" />
              </div>
              <div className="h-5 w-20 bg-neutral-200 dark:bg-neutral-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="border border-dashed border-neutral-300 dark:border-neutral-700 p-8 text-center">
        <p className="text-neutral-500 dark:text-neutral-400">
          No transactions yet. Add your first transaction to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((transaction) => (
        <TransactionRow
          key={transaction.id}
          transaction={transaction}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}
