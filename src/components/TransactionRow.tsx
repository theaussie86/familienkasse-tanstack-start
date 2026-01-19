import { useState } from "react";
import { Trash2 } from "lucide-react";
import type { FamilienkasseTransaction } from "@/db/schema";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { transactionStatusBadge } from "@/lib/transaction-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TransactionRowProps {
  transaction: FamilienkasseTransaction;
  onUpdate: () => void;
  onDeleteRequest?: (transaction: FamilienkasseTransaction) => void;
}

export function TransactionRow({
  transaction,
  onUpdate,
  onDeleteRequest,
}: TransactionRowProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const isNegative = transaction.amount < 0;
  const formattedDate = new Date(transaction.createdAt).toLocaleDateString(
    "de-DE",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  );

  const status = transaction.isPaid ? "paid" : "unpaid";
  const badgeStyle = transactionStatusBadge[status];

  const handleTogglePaid = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(
        `/api/accounts/${transaction.accountId}/transactions/${transaction.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPaid: !transaction.isPaid }),
        }
      );

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error("Failed to update transaction:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-lg font-semibold tabular-nums",
                  isNegative
                    ? "text-red-600 dark:text-red-400"
                    : "text-green-600 dark:text-green-400"
                )}
              >
                {formatCurrency(transaction.amount)}
              </span>
              <Badge
                variant={badgeStyle.variant}
                className={cn(badgeStyle.className, "cursor-pointer", isUpdating && "opacity-50")}
                onClick={handleTogglePaid}
              >
                {transaction.isPaid ? "Bezahlt" : "Offen"}
              </Badge>
            </div>
            {transaction.description && (
              <p className="text-sm text-muted-foreground truncate mt-1">
                {transaction.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">{formattedDate}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDeleteRequest?.(transaction)}
            className="hover:text-destructive"
            title="Transaktion löschen"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
