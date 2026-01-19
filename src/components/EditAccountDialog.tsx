import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import type { AccountWithBalance } from "@/db/queries/accounts";
import type { AllowanceConfig } from "@/db/schema";
import { AllowanceConfigForm } from "./AllowanceConfigForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";

interface EditAccountDialogProps {
  account: AccountWithBalance;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditAccountDialog({
  account,
  open,
  onOpenChange,
  onSuccess,
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
    setError(null);
  }, [account.name, account.recurringAllowanceEnabled, account.recurringAllowanceAmount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    const nameChanged = name.trim() !== account.name;
    const allowanceEnabledChanged =
      allowanceConfig.recurringAllowanceEnabled !== account.recurringAllowanceEnabled;
    const allowanceAmountChanged =
      allowanceConfig.recurringAllowanceAmount !== account.recurringAllowanceAmount;

    if (!nameChanged && !allowanceEnabledChanged && !allowanceAmountChanged) {
      onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Account</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-2">
            <Label htmlFor="edit-name">Account Name *</Label>
            <Input
              id="edit-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              required
              autoFocus
            />
          </div>

          <Separator />

          <AllowanceConfigForm
            config={allowanceConfig}
            onChange={setAllowanceConfig}
          />

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
