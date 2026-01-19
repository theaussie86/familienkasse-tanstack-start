import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authMiddleware } from "@/lib/middleware";
import type { AccountWithBalance } from "@/db/queries/accounts";
import type { FamilienkasseTransaction } from "@/db/schema";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionList } from "@/components/TransactionList";

export const Route = createFileRoute("/accounts/accountId")({
  component: AccountDetail,
  server: {
    middleware: [authMiddleware],
  },
});

interface TransactionListResult {
  transactions: FamilienkasseTransaction[];
  total: number;
}

async function fetchAccount(accountId: string): Promise<AccountWithBalance> {
  const response = await fetch(`/api/accounts/${accountId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch account");
  }
  return response.json();
}

async function fetchTransactions(
  accountId: string
): Promise<TransactionListResult> {
  const response = await fetch(`/api/accounts/${accountId}/transactions`);
  if (!response.ok) {
    throw new Error("Failed to fetch transactions");
  }
  return response.json();
}

function AccountDetail() {
  const { accountId } = Route.useParams();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const {
    data: account,
    isLoading: accountLoading,
    error: accountError,
  } = useQuery({
    queryKey: ["account", accountId],
    queryFn: () => fetchAccount(accountId),
  });

  const {
    data: transactionsData,
    isLoading: transactionsLoading,
    error: transactionsError,
  } = useQuery({
    queryKey: ["transactions", accountId],
    queryFn: () => fetchTransactions(accountId),
  });

  const handleTransactionChange = () => {
    queryClient.invalidateQueries({ queryKey: ["account", accountId] });
    queryClient.invalidateQueries({ queryKey: ["transactions", accountId] });
    queryClient.invalidateQueries({ queryKey: ["accounts"] });
    setShowForm(false);
  };

  if (accountLoading) {
    return (
      <div className="flex justify-center py-10 px-4">
        <div className="w-full max-w-2xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-800 rounded" />
            <div className="h-12 w-32 bg-neutral-200 dark:bg-neutral-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (accountError || !account) {
    return (
      <div className="flex justify-center py-10 px-4">
        <div className="w-full max-w-2xl">
          <div className="border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
            <p className="text-sm text-red-700 dark:text-red-400">
              Account not found or you don't have access.
            </p>
          </div>
          <Link
            to="/dashboard"
            className="inline-block mt-4 text-sm text-neutral-600 dark:text-neutral-400 hover:underline"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isNegative = account.balance < 0;

  return (
    <div className="flex justify-center py-10 px-4">
      <div className="w-full max-w-2xl space-y-6">
        <div>
          <Link
            to="/dashboard"
            className="text-sm text-neutral-600 dark:text-neutral-400 hover:underline"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">{account.name}</h1>
          <p
            className={cn(
              "text-3xl font-bold tabular-nums",
              isNegative
                ? "text-red-600 dark:text-red-400"
                : "text-neutral-900 dark:text-neutral-100"
            )}
          >
            {formatCurrency(account.balance)}
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Transactions</h2>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="h-9 px-4 text-sm font-medium bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
              >
                Add Transaction
              </button>
            )}
          </div>

          {showForm && (
            <div className="border border-neutral-200 dark:border-neutral-800 p-4">
              <h3 className="text-sm font-medium mb-4">New Transaction</h3>
              <TransactionForm
                accountId={accountId}
                onSuccess={handleTransactionChange}
                onCancel={() => setShowForm(false)}
              />
            </div>
          )}

          {transactionsError ? (
            <div className="border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
              <p className="text-sm text-red-700 dark:text-red-400">
                Failed to load transactions.
              </p>
            </div>
          ) : (
            <TransactionList
              transactions={transactionsData?.transactions || []}
              isLoading={transactionsLoading}
              onUpdate={handleTransactionChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}
