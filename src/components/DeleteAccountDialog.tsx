import { useState } from "react";
import type { AccountWithBalance } from "@/db/queries/accounts";
import { formatCurrency } from "@/lib/currency";

interface DeleteAccountDialogProps {
  account: AccountWithBalance;
  onSuccess: () => void;
  onClose: () => void;
}

export function DeleteAccountDialog({
  account,
  onSuccess,
  onClose,
}: DeleteAccountDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setError(null);
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/accounts/${account.id}`, {
        method: "DELETE",
      });

      if (!response.ok && response.status !== 204) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete account");
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-neutral-900 p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-2">Delete Account</h2>

        <p className="text-neutral-600 dark:text-neutral-400 mb-4">
          Are you sure you want to delete{" "}
          <span className="font-medium text-neutral-900 dark:text-neutral-100">
            {account.name}
          </span>
          ? This will also delete all transactions. Current balance:{" "}
          <span className="font-medium tabular-nums">
            {formatCurrency(account.balance)}
          </span>
        </p>

        {error && (
          <div className="border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-3 mb-4">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 h-10 px-4 text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {isDeleting ? "Deleting..." : "Delete Account"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 text-sm font-medium border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
