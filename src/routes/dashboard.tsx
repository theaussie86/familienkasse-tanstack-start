import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authMiddleware } from "@/lib/middleware";
import { authClient } from "@/lib/auth-client";
import { AccountList } from "@/components/AccountList";
import { CreateAccountForm } from "@/components/CreateAccountForm";
import { EditAccountDialog } from "@/components/EditAccountDialog";
import { DeleteAccountDialog } from "@/components/DeleteAccountDialog";
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
    throw new Error("Failed to fetch accounts");
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
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold leading-none tracking-tight">
              Familienkasse
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Welcome back, {session?.user?.name || "User"}
            </p>
          </div>
          <button
            onClick={() => authClient.signOut()}
            className="h-9 px-4 text-sm font-medium border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            Sign out
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Accounts</h2>
            {!showCreateForm && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="h-9 px-4 text-sm font-medium bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
              >
                New Account
              </button>
            )}
          </div>

          {showCreateForm && (
            <div className="border border-neutral-200 dark:border-neutral-800 p-4">
              <h3 className="text-sm font-medium mb-3">Create New Account</h3>
              <CreateAccountForm
                onSuccess={handleAccountCreated}
                onCancel={() => setShowCreateForm(false)}
              />
            </div>
          )}

          {error ? (
            <div className="border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
              <p className="text-sm text-red-700 dark:text-red-400">
                Failed to load accounts. Please try again.
              </p>
            </div>
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
          onSuccess={handleAccountUpdated}
          onClose={() => setEditingAccount(null)}
        />
      )}

      {deletingAccount && (
        <DeleteAccountDialog
          account={deletingAccount}
          onSuccess={handleAccountDeleted}
          onClose={() => setDeletingAccount(null)}
        />
      )}
    </div>
  );
}
