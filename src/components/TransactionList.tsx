import { useState } from "react";

import type { FamilienkasseTransaction } from "@/db/schema";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteTransactionDialog } from "./DeleteTransactionDialog";
import { TransactionRow } from "./TransactionRow";

interface TransactionListProps {
  transactions: Array<FamilienkasseTransaction>;
  isLoading?: boolean;
  onUpdate: () => void;
}

export function TransactionList({
  transactions,
  isLoading,
  onUpdate,
}: TransactionListProps) {
  const [deletingTransaction, setDeletingTransaction] =
    useState<FamilienkasseTransaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!deletingTransaction) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/accounts/${deletingTransaction.accountId}/transactions/${deletingTransaction.id}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        setDeletingTransaction(null);
        onUpdate();
      }
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-5 w-12" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">
            Noch keine Transaktionen vorhanden. Füge deine erste Transaktion hinzu, um loszulegen.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {transactions.map((transaction) => (
          <TransactionRow
            key={transaction.id}
            transaction={transaction}
            onUpdate={onUpdate}
            onDeleteRequest={setDeletingTransaction}
          />
        ))}
      </div>

      <DeleteTransactionDialog
        transaction={deletingTransaction}
        open={!!deletingTransaction}
        onOpenChange={(open) => !open && setDeletingTransaction(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </>
  );
}
