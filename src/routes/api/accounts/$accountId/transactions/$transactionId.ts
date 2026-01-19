import { createFileRoute } from "@tanstack/react-router";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth";
import {
  getTransaction,
  updateTransaction,
  deleteTransaction,
} from "@/db/queries/transactions";
import {
  unauthorized,
  badRequest,
  notFound,
  jsonResponse,
  internalError,
} from "@/lib/api-error";
import { updateTransactionSchema } from "@/lib/validations";

export const Route = createFileRoute(
  "/api/accounts/$accountId/transactions/$transactionId"
)({
  server: {
    handlers: {
      // GET /api/accounts/:accountId/transactions/:transactionId
      GET: async ({ params }) => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });

          if (!session?.user?.id) {
            return unauthorized();
          }

          const { transactionId } = params;
          const transaction = await getTransaction(transactionId, session.user.id);

          if (!transaction) {
            return notFound("Transaction not found");
          }

          return jsonResponse(transaction);
        } catch (error) {
          console.error("Error fetching transaction:", error);
          return internalError();
        }
      },

      // PATCH /api/accounts/:accountId/transactions/:transactionId
      PATCH: async ({ request, params }) => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });

          if (!session?.user?.id) {
            return unauthorized();
          }

          const { transactionId } = params;
          const body = await request.json();
          const parsed = updateTransactionSchema.safeParse(body);

          if (!parsed.success) {
            return badRequest(parsed.error.errors[0]?.message || "Invalid input");
          }

          const transaction = await updateTransaction(
            transactionId,
            session.user.id,
            parsed.data
          );

          if (!transaction) {
            return notFound("Transaction not found");
          }

          return jsonResponse(transaction);
        } catch (error) {
          console.error("Error updating transaction:", error);
          return internalError();
        }
      },

      // DELETE /api/accounts/:accountId/transactions/:transactionId
      DELETE: async ({ params }) => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });

          if (!session?.user?.id) {
            return unauthorized();
          }

          const { transactionId } = params;
          const deleted = await deleteTransaction(transactionId, session.user.id);

          if (!deleted) {
            return notFound("Transaction not found");
          }

          return new Response(null, { status: 204 });
        } catch (error) {
          console.error("Error deleting transaction:", error);
          return internalError();
        }
      },
    },
  },
});
