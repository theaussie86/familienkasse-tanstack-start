import { createFileRoute } from "@tanstack/react-router";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth";
import { unauthorized, jsonResponse, internalError } from "@/lib/api-error";
import { processWeeklyAllowances } from "@/tasks/allowance/weekly";

export const Route = createFileRoute("/api/cron/weekly-allowance")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });

          if (!session?.user?.id) {
            return unauthorized();
          }

          // Parse request body for dryRun option
          let dryRun = false;
          try {
            const body = await request.json();
            dryRun = body?.dryRun === true;
          } catch {
            // No body or invalid JSON, use defaults
          }

          console.log(
            `[api/cron/weekly-allowance] Manual trigger by user ${session.user.id}${dryRun ? " (dry run)" : ""}`
          );

          const result = await processWeeklyAllowances(dryRun);

          return jsonResponse({
            success: result.success,
            accountsProcessed: result.accountsProcessed,
            accountsSkipped: result.accountsSkipped,
            errors: result.errors,
            dryRun,
          });
        } catch (error) {
          console.error("[api/cron/weekly-allowance] Error:", error);
          return internalError();
        }
      },
    },
  },
});
