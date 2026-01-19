import { useState } from "react";
import { parseToCents } from "@/lib/currency";

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
        <div className="border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-3">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="space-y-2">
        <label
          htmlFor="amount"
          className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          Amount (€) *
        </label>
        <input
          id="amount"
          type="text"
          inputMode="decimal"
          value={amountStr}
          onChange={(e) => setAmountStr(e.target.value)}
          placeholder="e.g., 10,50 or -5,00"
          className="w-full h-10 px-3 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400"
          required
        />
        <p className="text-xs text-neutral-500">
          Use positive for deposits, negative for withdrawals
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="description"
          className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          Description
        </label>
        <input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Weekly allowance"
          className="w-full h-10 px-3 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400"
          maxLength={500}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="isPaid"
          type="checkbox"
          checked={isPaid}
          onChange={(e) => setIsPaid(e.target.checked)}
          className="h-4 w-4 border-neutral-300 dark:border-neutral-700"
        />
        <label
          htmlFor="isPaid"
          className="text-sm text-neutral-700 dark:text-neutral-300"
        >
          Already paid
        </label>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 h-10 px-4 text-sm font-medium bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? "Creating..." : "Add Transaction"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="h-10 px-4 text-sm font-medium border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
