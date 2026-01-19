import { useState, useEffect } from "react";
import type { AccountWithBalance } from "@/db/queries/accounts";
import type { AllowanceConfig } from "@/db/schema";
import { AllowanceConfigForm } from "./AllowanceConfigForm";

interface EditAccountDialogProps {
  account: AccountWithBalance;
  onSuccess: () => void;
  onClose: () => void;
}

export function EditAccountDialog({
  account,
  onSuccess,
  onClose,
}: EditAccountDialogProps) {
  const [name, setName] = useState(account.name);
  const [allowanceConfig, setAllowanceConfig] = useState<AllowanceConfig>({
    recurringAllowanceEnabled: account.recurringAllowanceEnabled,
    recurringAllowanceAmount: account.recurringAllowanceAmount,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(account.name);
    setAllowanceConfig({
      recurringAllowanceEnabled: account.recurringAllowanceEnabled,
      recurringAllowanceAmount: account.recurringAllowanceAmount,
    });
  }, [account.name, account.recurringAllowanceEnabled, account.recurringAllowanceAmount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    // Check if anything changed
    const nameChanged = name.trim() !== account.name;
    const allowanceEnabledChanged =
      allowanceConfig.recurringAllowanceEnabled !== account.recurringAllowanceEnabled;
    const allowanceAmountChanged =
      allowanceConfig.recurringAllowanceAmount !== account.recurringAllowanceAmount;

    if (!nameChanged && !allowanceEnabledChanged && !allowanceAmountChanged) {
      onClose();
      return;
    }

    setIsSubmitting(true);

    try {
      const updatePayload: Record<string, unknown> = {};
      if (nameChanged) {
        updatePayload.name = name.trim();
      }
      if (allowanceEnabledChanged) {
        updatePayload.recurringAllowanceEnabled = allowanceConfig.recurringAllowanceEnabled;
      }
      if (allowanceAmountChanged) {
        updatePayload.recurringAllowanceAmount = allowanceConfig.recurringAllowanceAmount;
      }

      const response = await fetch(`/api/accounts/${account.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update account");
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
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
        <h2 className="text-lg font-semibold mb-4">Edit Account</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-3">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="edit-name"
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Account Name *
            </label>
            <input
              id="edit-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400"
              maxLength={100}
              required
              autoFocus
            />
          </div>

          <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4">
            <AllowanceConfigForm
              config={allowanceConfig}
              onChange={setAllowanceConfig}
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-10 px-4 text-sm font-medium bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 text-sm font-medium border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
