import { Link } from "@tanstack/react-router";
import type { AccountWithBalance } from "@/db/queries/accounts";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

interface AccountCardProps {
  account: AccountWithBalance;
  onEdit?: (account: AccountWithBalance) => void;
  onDelete?: (account: AccountWithBalance) => void;
}

export function AccountCard({ account, onEdit, onDelete }: AccountCardProps) {
  const isNegative = account.balance < 0;

  return (
    <div className="border border-neutral-200 dark:border-neutral-800 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/accounts/$accountId"
          params={{ accountId: account.id }}
          className="flex-1 min-w-0"
        >
          <h3 className="font-medium truncate">{account.name}</h3>
        </Link>

        <div className="flex items-center gap-3">
          <span
            className={cn(
              "text-lg font-semibold tabular-nums",
              isNegative
                ? "text-red-600 dark:text-red-400"
                : "text-neutral-900 dark:text-neutral-100"
            )}
          >
            {formatCurrency(account.balance)}
          </span>

          {(onEdit || onDelete) && (
            <div className="flex items-center gap-1">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(account);
                  }}
                  className="p-1.5 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  title="Edit account"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    <path d="m15 5 4 4" />
                  </svg>
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(account);
                  }}
                  className="p-1.5 text-neutral-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  title="Delete account"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    <line x1="10" x2="10" y1="11" y2="17" />
                    <line x1="14" x2="14" y1="11" y2="17" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
