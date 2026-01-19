import { createFileRoute } from "@tanstack/react-router";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth";
import {
  getAccountsWithUnpaidTransactions,
  createAccount,
} from "@/db/queries/accounts";
import {
  unauthorized,
  badRequest,
  jsonResponse,
  internalError,
} from "@/lib/api-error";
import { createAccountSchema } from "@/lib/validations";

export const Route = createFileRoute("/api/accounts/")({
  server: {
    handlers: {
      // GET /api/accounts - List all accounts with balances
      GET: async () => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });

          if (!session?.user?.id) {
            return unauthorized();
          }

          const accounts = await getAccountsWithUnpaidTransactions(session.user.id);
          return jsonResponse(accounts);
        } catch (error) {
          console.error("Error fetching accounts:", error);
          return internalError();
        }
      },

      // POST /api/accounts - Create a new account
      POST: async ({ request }) => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });

          if (!session?.user?.id) {
            return unauthorized();
          }

          const body = await request.json();
          const parsed = createAccountSchema.safeParse(body);

          if (!parsed.success) {
            return badRequest(parsed.error.errors[0]?.message || "Invalid input");
          }

          const account = await createAccount(session.user.id, parsed.data.name);
          return jsonResponse(account, 201);
        } catch (error) {
          console.error("Error creating account:", error);
          return internalError();
        }
      },
    },
  },
});
