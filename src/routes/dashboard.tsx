import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { AlertCircle, Database, Loader2 } from "lucide-react";
import { authMiddleware } from "@/lib/middleware";
import { authClient } from "@/lib/auth-client";
import { AccountList } from "@/components/AccountList";
import { CreateAccountForm } from "@/components/CreateAccountForm";
import { EditAccountDialog } from "@/components/EditAccountDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { AccountWithUnpaidTransactions } from "@/db/queries/accounts";
import type { MigrationResult } from "@/db/migrations/supabase-migration";

// Re-export type for API route
export type { MigrationResult };

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  server: {
    middleware: [authMiddleware],
  },
});

async function fetchAccounts(): Promise<AccountWithUnpaidTransactions[]> {
  const response = await fetch("/api/accounts");
  if (!response.ok) {
    throw new Error("Konten konnten nicht geladen werden");
  }
  return response.json();
}

async function runMigration(): Promise<MigrationResult> {
  const response = await fetch("/api/migrate", { method: "POST" });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Migration fehlgeschlagen");
  }
  return response.json();
}

function Dashboard() {
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAccount, setEditingAccount] =
    useState<AccountWithUnpaidTransactions | null>(null);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);

  const {
    data: accounts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["accounts"],
    queryFn: fetchAccounts,
  });

  const migrationMutation = useMutation({
    mutationFn: runMigration,
    onSuccess: (result) => {
      setMigrationResult(result);
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });

  const handleAccountCreated = () => {
    setShowCreateForm(false);
    queryClient.invalidateQueries({ queryKey: ["accounts"] });
  };

  const handleAccountUpdated = () => {
    setEditingAccount(null);
    queryClient.invalidateQueries({ queryKey: ["accounts"] });
  };

  const handleTransactionUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ["accounts"] });
  };

  return (
    <div className="flex justify-center py-4 sm:py-10 px-4">
      <div className="w-full max-w-2xl space-y-4 sm:space-y-6">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold leading-none tracking-tight">
            Familienkasse
          </h1>
          <p className="text-sm text-muted-foreground">
            Willkommen zurück, {session?.user?.name || "Benutzer"}
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Konten</h2>
            {!showCreateForm && (
              <Button onClick={() => setShowCreateForm(true)}>
                Neues Konto
              </Button>
            )}
          </div>

          {showCreateForm && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Neues Konto erstellen</CardTitle>
              </CardHeader>
              <CardContent>
                <CreateAccountForm
                  onSuccess={handleAccountCreated}
                  onCancel={() => setShowCreateForm(false)}
                />
              </CardContent>
            </Card>
          )}

          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Konten konnten nicht geladen werden. Bitte versuche es erneut.
              </AlertDescription>
            </Alert>
          ) : (
            <AccountList
              accounts={accounts || []}
              isLoading={isLoading}
              onEdit={setEditingAccount}
              onTransactionUpdate={handleTransactionUpdate}
            />
          )}

          {/* Temporary Migration Section - Remove after migration */}
          <Card className="border-dashed border-orange-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Database className="h-4 w-4" />
                Supabase Migration (Temporär)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Migriert Konten und Transaktionen von Supabase zu dieser Datenbank.
              </p>
              <Button
                onClick={() => migrationMutation.mutate()}
                disabled={migrationMutation.isPending}
                variant="outline"
                size="sm"
              >
                {migrationMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Migration läuft...
                  </>
                ) : (
                  "Migration starten"
                )}
              </Button>

              {migrationMutation.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {migrationMutation.error instanceof Error
                      ? migrationMutation.error.message
                      : "Migration fehlgeschlagen"}
                  </AlertDescription>
                </Alert>
              )}

              {migrationResult && (
                <Alert variant={migrationResult.success ? "default" : "destructive"}>
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-medium">
                        {migrationResult.success ? "Migration erfolgreich!" : "Migration fehlgeschlagen"}
                      </p>
                      <ul className="text-xs space-y-0.5">
                        <li>Konten migriert: {migrationResult.accountsMigrated}</li>
                        <li>Konten übersprungen: {migrationResult.accountsSkipped}</li>
                        <li>Transaktionen migriert: {migrationResult.transactionsMigrated}</li>
                        <li>Transaktionen übersprungen: {migrationResult.transactionsSkipped}</li>
                      </ul>
                      {migrationResult.errors.length > 0 && (
                        <ul className="text-xs text-destructive mt-2">
                          {migrationResult.errors.map((err, i) => (
                            <li key={i}>{err}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
          {/* End Temporary Migration Section */}
        </div>
      </div>

      {editingAccount && (
        <EditAccountDialog
          account={editingAccount}
          open={!!editingAccount}
          onOpenChange={(open) => !open && setEditingAccount(null)}
          onSuccess={handleAccountUpdated}
        />
      )}
    </div>
  );
}
