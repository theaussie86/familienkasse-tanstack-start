import { Link } from "@tanstack/react-router";
import BetterAuthHeader from "@/integrations/better-auth/header-user";
import { Home, LayoutDashboard } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-semibold text-lg">
            Familienkasse
          </Link>
          <nav className="hidden sm:flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              activeProps={{ className: "text-neutral-900 dark:text-neutral-100 font-medium" }}
              activeOptions={{ exact: true }}
            >
              <Home size={16} />
              Home
            </Link>
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              activeProps={{ className: "text-neutral-900 dark:text-neutral-100 font-medium" }}
            >
              <LayoutDashboard size={16} />
              Dashboard
            </Link>
          </nav>
        </div>
        <BetterAuthHeader />
      </div>
    </header>
  );
}
