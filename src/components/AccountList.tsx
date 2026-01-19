import type { AccountWithBalance } from "@/db/queries/accounts";
import { AccountCard } from "./AccountCard";

interface AccountListProps {
  accounts: AccountWithBalance[];
  isLoading?: boolean;
  onEdit?: (account: AccountWithBalance) => void;
  onDelete?: (account: AccountWithBalance) => void;
}

export function AccountList({
  accounts,
  isLoading,
  onEdit,
  onDelete,
}: AccountListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="border border-neutral-200 dark:border-neutral-800 p-4 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="h-5 w-32 bg-neutral-200 dark:bg-neutral-800 rounded" />
              <div className="h-6 w-24 bg-neutral-200 dark:bg-neutral-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="border border-dashed border-neutral-300 dark:border-neutral-700 p-8 text-center">
        <p className="text-neutral-500 dark:text-neutral-400">
          No accounts yet. Create your first account to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {accounts.map((account) => (
        <AccountCard
          key={account.id}
          account={account}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
