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
      setError("Bitte gib einen gültigen Betrag ein");
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
        throw new Error(data.message || "Transaktion konnte nicht erstellt werden");
      }

      setDescription("");
      setAmountStr("");
      setIsPaid(false);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten");
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
        <Label htmlFor="amount">Betrag (*)</Label>
        <Input
          id="amount"
          type="text"
          inputMode="decimal"
          value={amountStr}
          onChange={(e) => setAmountStr(e.target.value)}
          placeholder="z.B. 10,50 oder -5,00"
          required
        />
        <p className="text-xs text-muted-foreground">
          Positiv für Einzahlungen, negativ für Auszahlungen
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Beschreibung</Label>
        <Input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="z.B. Wöchentliches Taschengeld"
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
          Bereits bezahlt
        </Label>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? (
            <>
              <Spinner className="mr-2" />
              Wird erstellt...
            </>
          ) : (
            "Transaktion hinzufügen"
          )}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Abbrechen
          </Button>
        )}
      </div>
    </form>
  );
}
