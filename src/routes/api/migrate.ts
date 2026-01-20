import { createFileRoute } from "@tanstack/react-router";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth";
import { runMigration } from "@/db/migrations/supabase-migration";
import { unauthorized, internalError, jsonResponse } from "@/lib/api-error";

export const Route = createFileRoute("/api/migrate")({
  server: {
    handlers: {
      POST: async () => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });

          if (!session?.user?.id) {
            return unauthorized();
          }

          // Check if SUPABASE_DATABASE_URL is set
          if (!process.env.SUPABASE_DATABASE_URL) {
            return jsonResponse(
              {
                success: false,
                error: "SUPABASE_DATABASE_URL is not configured",
              },
              400
            );
          }

          console.log(
            `Starting migration for user ${session.user.id} (${session.user.email})`
          );

          const result = await runMigration(session.user.id);

          return jsonResponse(result);
        } catch (error) {
          console.error("Migration error:", error);
          return internalError();
        }
      },
    },
  },
});
