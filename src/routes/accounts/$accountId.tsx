import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { authMiddleware } from "@/lib/middleware";
import type { AccountWithBalance } from "@/db/queries/accounts";
import type { FamilienkasseTransaction } from "@/db/schema";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { getBalanceState, balanceStateClasses } from "@/lib/balance-utils";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionList } from "@/components/TransactionList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/accounts/$accountId")({
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
    throw new Error("Konto konnte nicht geladen werden");
  }
  return response.json();
}

async function fetchTransactions(
  accountId: string
): Promise<TransactionListResult> {
  const response = await fetch(`/api/accounts/${accountId}/transactions`);
  if (!response.ok) {
    throw new Error("Transaktionen konnten nicht geladen werden");
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
        <div className="w-full max-w-2xl space-y-4">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    );
  }

  if (accountError || !account) {
    return (
      <div className="flex justify-center py-10 px-4">
        <div className="w-full max-w-2xl space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Konto nicht gefunden oder kein Zugriff.
            </AlertDescription>
          </Alert>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück zum Dashboard
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const balanceState = getBalanceState(account.balance);

  return (
    <div className="flex justify-center py-10 px-4">
      <div className="w-full max-w-2xl space-y-6">
        <div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück zum Dashboard
            </Link>
          </Button>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">{account.name}</h1>
          <p
            className={cn(
              "text-3xl font-bold tabular-nums",
              balanceStateClasses[balanceState]
            )}
          >
            {formatCurrency(account.balance)}
          </p>
          {account.recurringAllowanceEnabled && account.recurringAllowanceAmount > 0 && (
            <p className="text-sm text-muted-foreground">
              Wöchentliches Taschengeld: {formatCurrency(account.recurringAllowanceAmount)}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Transaktionen</h2>
            {!showForm && (
              <Button onClick={() => setShowForm(true)}>Transaktion hinzufügen</Button>
            )}
          </div>

          {showForm && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Neue Transaktion</CardTitle>
              </CardHeader>
              <CardContent>
                <TransactionForm
                  accountId={accountId}
                  onSuccess={handleTransactionChange}
                  onCancel={() => setShowForm(false)}
                />
              </CardContent>
            </Card>
          )}

          {transactionsError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Transaktionen konnten nicht geladen werden.</AlertDescription>
            </Alert>
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
