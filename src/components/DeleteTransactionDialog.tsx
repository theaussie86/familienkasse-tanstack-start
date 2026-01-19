import type { FamilienkasseTransaction } from "@/db/schema";
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
import { Spinner } from "@/components/ui/spinner";

interface DeleteTransactionDialogProps {
  transaction: FamilienkasseTransaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteTransactionDialog({
  transaction,
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
}: DeleteTransactionDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Transaktion löschen?</AlertDialogTitle>
          <AlertDialogDescription>
            Diese Transaktion
            {transaction && (
              <span className="font-medium">
                {" "}
                über {formatCurrency(transaction.amount)}
              </span>
            )}{" "}
            wird unwiderruflich gelöscht.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Abbrechen</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Spinner className="mr-2" />
                Wird gelöscht...
              </>
            ) : (
              "Löschen"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
