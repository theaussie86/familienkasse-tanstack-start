import { createFileRoute } from "@tanstack/react-router";
import { authMiddleware } from "@/lib/middleware";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  server: {
    middleware: [authMiddleware],
  },
});

function Dashboard() {
  const { data: session } = authClient.useSession();

  return (
    <div className="flex justify-center py-10 px-4">
      <div className="w-full max-w-md p-6 space-y-6">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold leading-none tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            This is a protected route. Only authenticated users can see this.
          </p>
        </div>

        <div className="border border-neutral-200 dark:border-neutral-800 p-4 space-y-3">
          <h2 className="text-sm font-medium">Your Profile</h2>

          <div className="flex items-center gap-3">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt=""
                className="h-12 w-12 rounded-full"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
                <span className="text-lg font-medium text-neutral-600 dark:text-neutral-400">
                  {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{session?.user?.name}</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                {session?.user?.email}
              </p>
            </div>
          </div>
        </div>

        <div className="border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4">
          <p className="text-sm text-green-700 dark:text-green-400">
            Authentication is working! Your email is:{" "}
            <strong>{session?.user?.email}</strong>
          </p>
        </div>

        <button
          onClick={() => authClient.signOut()}
          className="w-full h-9 px-4 text-sm font-medium border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
