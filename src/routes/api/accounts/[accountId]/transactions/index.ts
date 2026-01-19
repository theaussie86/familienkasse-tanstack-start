import { createAPIFileRoute } from "@tanstack/react-start/api";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth";
import { listTransactions, createTransaction } from "@/db/queries/transactions";
import {
  unauthorized,
  badRequest,
  notFound,
  jsonResponse,
  internalError,
} from "@/lib/api-error";
import { createTransactionSchema } from "@/lib/validations";

export const APIRoute = createAPIFileRoute(
  "/api/accounts/$accountId/transactions"
)({
  // GET /api/accounts/:accountId/transactions - List transactions
  GET: async ({ request, params }) => {
    try {
      const headers = getRequestHeaders();
      const session = await auth.api.getSession({ headers });

      if (!session?.user?.id) {
        return unauthorized();
      }

      const { accountId } = params;
      const url = new URL(request.url);
      const limit = Math.min(
        parseInt(url.searchParams.get("limit") || "50", 10),
        100
      );
      const offset = parseInt(url.searchParams.get("offset") || "0", 10);

      const result = await listTransactions(
        accountId,
        session.user.id,
        limit,
        offset
      );

      if (!result) {
        return notFound("Account not found");
      }

      return jsonResponse(result);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return internalError();
    }
  },

  // POST /api/accounts/:accountId/transactions - Create transaction
  POST: async ({ request, params }) => {
    try {
      const headers = getRequestHeaders();
      const session = await auth.api.getSession({ headers });

      if (!session?.user?.id) {
        return unauthorized();
      }

      const { accountId } = params;
      const body = await request.json();
      const parsed = createTransactionSchema.safeParse(body);

      if (!parsed.success) {
        return badRequest(parsed.error.errors[0]?.message || "Invalid input");
      }

      const transaction = await createTransaction(session.user.id, {
        accountId,
        ...parsed.data,
      });

      if (!transaction) {
        return notFound("Account not found");
      }

      return jsonResponse(transaction, 201);
    } catch (error) {
      console.error("Error creating transaction:", error);
      return internalError();
    }
  },
});
