import type { AccountWithBalance } from "@/db/queries/accounts";

import { AccountCard } from "./AccountCard";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface AccountListProps {
  accounts: Array<AccountWithBalance>;
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
            No accounts yet. Create your first account to get started.
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
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
