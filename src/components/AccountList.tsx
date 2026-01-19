import type { AccountWithUnpaidTransactions } from "@/db/queries/accounts";

import { AccountCard } from "./AccountCard";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface AccountListProps {
  accounts: Array<AccountWithUnpaidTransactions>;
  isLoading?: boolean;
  onEdit?: (account: AccountWithUnpaidTransactions) => void;
  onTransactionUpdate?: () => void;
}

export function AccountList({
  accounts,
  isLoading,
  onEdit,
  onTransactionUpdate,
}: AccountListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-6 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">
            Noch keine Konten vorhanden. Erstelle dein erstes Konto, um loszulegen.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {accounts.map((account) => (
        <AccountCard
          key={account.id}
          account={account}
          onEdit={onEdit}
          onTransactionUpdate={onTransactionUpdate}
        />
      ))}
    </div>
  );
}
