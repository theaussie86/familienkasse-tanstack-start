import { useState, useEffect } from "react";
import type { AllowanceConfig } from "@/db/schema";
import { formatCurrency } from "@/lib/currency";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    const normalizedValue = value.replace(",", ".");

    if (normalizedValue === "" || /^\d*\.?\d{0,2}$/.test(normalizedValue)) {
      setAmountInput(normalizedValue);
      const cents = Math.round(parseFloat(normalizedValue || "0") * 100);
      onChange({
        recurringAllowanceEnabled: enabled,
        recurringAllowanceAmount: cents >= 0 ? cents : 0,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="allowance-enabled">Weekly Allowance</Label>
        <button
          type="button"
          id="allowance-enabled"
          role="switch"
          aria-checked={enabled}
          onClick={() => handleEnabledChange(!enabled)}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${enabled ? "bg-primary" : "bg-input"}
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-background transition-transform
              ${enabled ? "translate-x-6" : "translate-x-1"}
            `}
          />
        </button>
      </div>

      {enabled && (
        <div className="grid gap-2">
          <Label htmlFor="allowance-amount">Amount per Week</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              EUR
            </span>
            <Input
              id="allowance-amount"
              type="text"
              inputMode="decimal"
              value={amountInput}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="pl-12"
              placeholder="0.00"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            This amount will be automatically added every Sunday at midnight.
          </p>
        </div>
      )}

      {!enabled && config.recurringAllowanceAmount > 0 && (
        <p className="text-xs text-muted-foreground">
          Previously configured: {formatCurrency(config.recurringAllowanceAmount)} per week
        </p>
      )}
    </div>
  );
}
