import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { authMiddleware } from "@/lib/middleware";
import { authClient } from "@/lib/auth-client";
import { AccountList } from "@/components/AccountList";
import { CreateAccountForm } from "@/components/CreateAccountForm";
import { EditAccountDialog } from "@/components/EditAccountDialog";
import { DeleteAccountDialog } from "@/components/DeleteAccountDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { AccountWithBalance } from "@/db/queries/accounts";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  server: {
    middleware: [authMiddleware],
  },
});

async function fetchAccounts(): Promise<AccountWithBalance[]> {
  const response = await fetch("/api/accounts");
  if (!response.ok) {
    throw new Error("Konten konnten nicht geladen werden");
  }
  return response.json();
}

function Dashboard() {
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAccount, setEditingAccount] =
    useState<AccountWithBalance | null>(null);
  const [deletingAccount, setDeletingAccount] =
    useState<AccountWithBalance | null>(null);

  const {
    data: accounts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["accounts"],
    queryFn: fetchAccounts,
  });

  const handleAccountCreated = () => {
    setShowCreateForm(false);
    queryClient.invalidateQueries({ queryKey: ["accounts"] });
  };

  const handleAccountUpdated = () => {
    setEditingAccount(null);
    queryClient.invalidateQueries({ queryKey: ["accounts"] });
  };

  const handleAccountDeleted = () => {
    setDeletingAccount(null);
    queryClient.invalidateQueries({ queryKey: ["accounts"] });
  };

  return (
    <div className="flex justify-center py-10 px-4">
      <div className="w-full max-w-2xl space-y-6">
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
              onDelete={setDeletingAccount}
            />
          )}
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

      {deletingAccount && (
        <DeleteAccountDialog
          account={deletingAccount}
          open={!!deletingAccount}
          onOpenChange={(open) => !open && setDeletingAccount(null)}
          onSuccess={handleAccountDeleted}
        />
      )}
    </div>
  );
}
