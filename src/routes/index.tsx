import { createFileRoute, Link } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { data: session } = authClient.useSession();

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">Familienkasse</h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400">
          Willkommen bei der Familienkasse-Anwendung.
        </p>

        <div className="pt-4">
          {session?.user ? (
            <Link
              to="/dashboard"
              className="inline-flex h-10 px-6 items-center justify-center rounded-md bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200 font-medium transition-colors"
            >
              Zum Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex h-10 px-6 items-center justify-center rounded-md bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200 font-medium transition-colors"
            >
              Anmelden
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
