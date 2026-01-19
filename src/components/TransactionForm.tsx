import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { parseToCents } from "@/lib/currency";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";

interface TransactionFormProps {
  accountId: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function TransactionForm({
  accountId,
  onSuccess,
  onCancel,
}: TransactionFormProps) {
  const [description, setDescription] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amount = parseToCents(amountStr);
    if (amount === null) {
      setError("Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/accounts/${accountId}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description || undefined,
          amount,
          isPaid,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create transaction");
      }

      setDescription("");
      setAmountStr("");
      setIsPaid(false);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-2">
        <Label htmlFor="amount">Amount (*)</Label>
        <Input
          id="amount"
          type="text"
          inputMode="decimal"
          value={amountStr}
          onChange={(e) => setAmountStr(e.target.value)}
          placeholder="e.g., 10,50 or -5,00"
          required
        />
        <p className="text-xs text-muted-foreground">
          Use positive for deposits, negative for withdrawals
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Weekly allowance"
          maxLength={500}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="isPaid"
          type="checkbox"
          checked={isPaid}
          onChange={(e) => setIsPaid(e.target.checked)}
          className="h-4 w-4 rounded border-input"
        />
        <Label htmlFor="isPaid" className="font-normal">
          Already paid
        </Label>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? (
            <>
              <Spinner className="mr-2" />
              Creating...
            </>
          ) : (
            "Add Transaction"
          )}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
