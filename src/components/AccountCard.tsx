import { Link } from "@tanstack/react-router";
import { Pencil, Trash2 } from "lucide-react";
import type { AccountWithUnpaidTransactions } from "@/db/queries/accounts";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { balanceStateClasses, getBalanceState } from "@/lib/balance-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UnpaidTransactionItem } from "./UnpaidTransactionItem";

interface AccountCardProps {
  account: AccountWithUnpaidTransactions;
  onEdit?: (account: AccountWithUnpaidTransactions) => void;
  onDelete?: (account: AccountWithUnpaidTransactions) => void;
  onTransactionUpdate?: () => void;
}

export function AccountCard({
  account,
  onEdit,
  onDelete,
  onTransactionUpdate,
}: AccountCardProps) {
  const balanceState = getBalanceState(account.paidBalance);
  const hasUnpaidDifference = account.paidBalance !== account.balance;
  const hasUnpaidTransactions = account.unpaidTransactions.length > 0;

  return (
    <Card className="transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/accounts/$accountId"
            params={{ accountId: account.id }}
            className="flex-1 min-w-0 hover:underline"
          >
            <h3 className="font-medium truncate">{account.name}</h3>
          </Link>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span
                className={cn(
                  "text-lg font-semibold tabular-nums",
                  balanceStateClasses[balanceState]
                )}
              >
                {formatCurrency(account.paidBalance)}
              </span>
              {hasUnpaidDifference && (
                <span className="text-sm text-muted-foreground ml-2 tabular-nums">
                  (Soll: {formatCurrency(account.balance)})
                </span>
              )}
            </div>

            {(onEdit || onDelete) && (
              <div className="flex items-center gap-1">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(account);
                    }}
                    title="Konto bearbeiten"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(account);
                    }}
                    className="hover:text-destructive"
                    title="Konto löschen"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {hasUnpaidTransactions && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground mb-2">
              Offene Transaktionen ({account.unpaidTransactions.length})
            </p>
            <div className="space-y-1">
              {account.unpaidTransactions.map((transaction) => (
                <UnpaidTransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  onUpdate={onTransactionUpdate || (() => {})}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
