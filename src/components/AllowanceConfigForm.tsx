import { useState, useEffect } from "react";
import type { AllowanceConfig } from "@/db/schema";
import { formatCurrency } from "@/lib/currency";

interface AllowanceConfigFormProps {
  config: AllowanceConfig;
  onChange: (config: AllowanceConfig) => void;
}

export function AllowanceConfigForm({
  config,
  onChange,
}: AllowanceConfigFormProps) {
  const [enabled, setEnabled] = useState(config.recurringAllowanceEnabled);
  const [amountInput, setAmountInput] = useState(
    (config.recurringAllowanceAmount / 100).toFixed(2)
  );

  useEffect(() => {
    setEnabled(config.recurringAllowanceEnabled);
    setAmountInput((config.recurringAllowanceAmount / 100).toFixed(2));
  }, [config]);

  const handleEnabledChange = (newEnabled: boolean) => {
    setEnabled(newEnabled);
    onChange({
      recurringAllowanceEnabled: newEnabled,
      recurringAllowanceAmount: Math.round(parseFloat(amountInput || "0") * 100),
    });
  };

  const handleAmountChange = (value: string) => {
    // Allow only valid decimal inputs
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setAmountInput(value);
      const cents = Math.round(parseFloat(value || "0") * 100);
      onChange({
        recurringAllowanceEnabled: enabled,
        recurringAllowanceAmount: cents >= 0 ? cents : 0,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label
          htmlFor="allowance-enabled"
          className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          Weekly Allowance
        </label>
        <button
          type="button"
          id="allowance-enabled"
          role="switch"
          aria-checked={enabled}
          onClick={() => handleEnabledChange(!enabled)}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${enabled ? "bg-neutral-900 dark:bg-neutral-100" : "bg-neutral-300 dark:bg-neutral-700"}
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white dark:bg-neutral-900 transition-transform
              ${enabled ? "translate-x-6" : "translate-x-1"}
            `}
          />
        </button>
      </div>

      {enabled && (
        <div className="space-y-2">
          <label
            htmlFor="allowance-amount"
            className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Amount per Week
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-neutral-400">
              EUR
            </span>
            <input
              id="allowance-amount"
              type="text"
              inputMode="decimal"
              value={amountInput}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="w-full h-10 pl-12 pr-3 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400"
              placeholder="0.00"
            />
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            This amount will be automatically added every Sunday at midnight.
          </p>
        </div>
      )}

      {!enabled && config.recurringAllowanceAmount > 0 && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Previously configured: {formatCurrency(config.recurringAllowanceAmount)} per week
        </p>
      )}
    </div>
  );
}
