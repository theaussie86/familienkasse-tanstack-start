import { Link } from "@tanstack/react-router";
import BetterAuthHeader from "@/integrations/better-auth/header-user";

export default function Header() {
  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="font-semibold text-lg">
            Familienkasse
          </Link>
        </div>
        <BetterAuthHeader />
      </div>
    </header>
  );
}
