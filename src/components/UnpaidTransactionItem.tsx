import { useState } from "react";
import type { FamilienkasseTransaction } from "@/db/schema";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface UnpaidTransactionItemProps {
  transaction: FamilienkasseTransaction;
  onUpdate: () => void;
}

export function UnpaidTransactionItem({
  transaction,
  onUpdate,
}: UnpaidTransactionItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const isNegative = transaction.amount < 0;
  const formattedDate = new Date(transaction.createdAt).toLocaleDateString(
    "de-DE",
    {
      day: "2-digit",
      month: "2-digit",
    }
  );

  const handleMarkPaid = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(
        `/api/accounts/${transaction.accountId}/transactions/${transaction.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPaid: true }),
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
    <div className="flex items-center justify-between gap-3 py-2.5 px-3 hover:bg-muted/50 rounded-md transition-colors min-h-[44px]">
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <span className="text-sm text-muted-foreground tabular-nums shrink-0">
          {formattedDate}
        </span>
        <span
          className={cn(
            "text-base font-medium tabular-nums shrink-0",
            isNegative
              ? "text-red-600 dark:text-red-400"
              : "text-green-600 dark:text-green-400"
          )}
        >
          {formatCurrency(transaction.amount)}
        </span>
        {transaction.description && (
          <span className="text-sm text-muted-foreground truncate">
            {transaction.description}
          </span>
        )}
      </div>
      <Badge
        variant="outline"
        className={cn(
          "cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-3 py-1.5 text-sm shrink-0",
          isUpdating && "opacity-50 pointer-events-none"
        )}
        onClick={handleMarkPaid}
      >
        {isUpdating ? "..." : "Bezahlen"}
      </Badge>
    </div>
  );
}
