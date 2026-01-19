import { Link } from "@tanstack/react-router";
import { Pencil, Trash2 } from "lucide-react";
import type { AccountWithBalance } from "@/db/queries/accounts";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { balanceStateClasses, getBalanceState } from "@/lib/balance-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AccountCardProps {
  account: AccountWithBalance;
  onEdit?: (account: AccountWithBalance) => void;
  onDelete?: (account: AccountWithBalance) => void;
}

export function AccountCard({ account, onEdit, onDelete }: AccountCardProps) {
  const balanceState = getBalanceState(account.paidBalance);
  const hasUnpaidDifference = account.paidBalance !== account.balance;

  return (
    <Card className="hover:bg-muted/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/accounts/$accountId"
            params={{ accountId: account.id }}
            className="flex-1 min-w-0"
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
                    title="Edit account"
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
                    title="Delete account"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
