import { createFileRoute } from "@tanstack/react-router";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth";
import {
  getAccountWithBalance,
  updateAccount,
  deleteAccount,
} from "@/db/queries/accounts";
import {
  unauthorized,
  notFound,
  badRequest,
  jsonResponse,
  internalError,
} from "@/lib/api-error";
import { updateAccountSchema } from "@/lib/validations";

export const Route = createFileRoute("/api/accounts/$accountId/")({
  server: {
    handlers: {
      // GET /api/accounts/:accountId - Get a single account with balance
      GET: async ({ params }) => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });

          if (!session?.user?.id) {
            return unauthorized();
          }

          const account = await getAccountWithBalance(
            params.accountId,
            session.user.id
          );

          if (!account) {
            return notFound("Account not found");
          }

          return jsonResponse(account);
        } catch (error) {
          console.error("Error fetching account:", error);
          return internalError();
        }
      },

      // PATCH /api/accounts/:accountId - Update an account
      PATCH: async ({ request, params }) => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });

          if (!session?.user?.id) {
            return unauthorized();
          }

          const body = await request.json();
          const parsed = updateAccountSchema.safeParse(body);

          if (!parsed.success) {
            return badRequest(parsed.error.errors[0]?.message || "Invalid input");
          }

          const account = await updateAccount(
            params.accountId,
            session.user.id,
            parsed.data
          );

          if (!account) {
            return notFound("Account not found");
          }

          return jsonResponse(account);
        } catch (error) {
          console.error("Error updating account:", error);
          return internalError();
        }
      },

      // DELETE /api/accounts/:accountId - Delete an account
      DELETE: async ({ params }) => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });

          if (!session?.user?.id) {
            return unauthorized();
          }

          const deleted = await deleteAccount(params.accountId, session.user.id);

          if (!deleted) {
            return notFound("Account not found");
          }

          return new Response(null, { status: 204 });
        } catch (error) {
          console.error("Error deleting account:", error);
          return internalError();
        }
      },
    },
  },
});
