import { useState } from "react";
import type { AccountWithBalance } from "@/db/queries/accounts";
import { formatCurrency } from "@/lib/currency";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle } from "lucide-react";

interface DeleteAccountDialogProps {
  account: AccountWithBalance;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteAccountDialog({
  account,
  open,
  onOpenChange,
  onSuccess,
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
        throw new Error(data.message || "Konto konnte nicht gelöscht werden");
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten");
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Konto löschen?</AlertDialogTitle>
          <AlertDialogDescription>
            Möchtest du{" "}
            <span className="font-medium text-foreground">{account.name}</span>{" "}
            wirklich löschen? Alle Transaktionen werden ebenfalls gelöscht.
            Aktueller Kontostand:{" "}
            <span className="font-medium tabular-nums">
              {formatCurrency(account.balance)}
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Abbrechen</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Spinner className="mr-2" />
                Wird gelöscht...
              </>
            ) : (
              "Konto löschen"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
