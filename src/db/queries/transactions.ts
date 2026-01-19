import { eq, desc, sql, and } from "drizzle-orm";
import { db } from "@/db";
import {
  familienkasseTransaction,
  familienkasseAccount,
  type FamilienkasseTransaction,
} from "@/db/schema";
import { generateId } from "@/lib/id";

export interface CreateTransactionInput {
  accountId: string;
  description?: string;
  amount: number;
  isPaid?: boolean;
}

export interface UpdateTransactionInput {
  description?: string;
  amount?: number;
  isPaid?: boolean;
}

export interface TransactionListResult {
  transactions: FamilienkasseTransaction[];
  total: number;
}

/**
 * Verify that an account belongs to a user.
 */
export async function verifyAccountOwnership(
  accountId: string,
  userId: string
): Promise<boolean> {
  const [account] = await db
    .select({ userId: familienkasseAccount.userId })
    .from(familienkasseAccount)
    .where(eq(familienkasseAccount.id, accountId));

  return account?.userId === userId;
}

/**
 * List transactions for an account with pagination.
 */
export async function listTransactions(
  accountId: string,
  userId: string,
  limit = 50,
  offset = 0
): Promise<TransactionListResult | null> {
  // Verify ownership first
  const isOwner = await verifyAccountOwnership(accountId, userId);
  if (!isOwner) {
    return null;
  }

  // Get total count
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(familienkasseTransaction)
    .where(eq(familienkasseTransaction.accountId, accountId));

  // Get paginated transactions
  const transactions = await db
    .select()
    .from(familienkasseTransaction)
    .where(eq(familienkasseTransaction.accountId, accountId))
    .orderBy(desc(familienkasseTransaction.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    transactions,
    total: Number(count),
  };
}

/**
 * Get a single transaction by ID.
 */
export async function getTransaction(
  transactionId: string,
  userId: string
): Promise<FamilienkasseTransaction | null> {
  const [transaction] = await db
    .select({
      transaction: familienkasseTransaction,
      accountUserId: familienkasseAccount.userId,
    })
    .from(familienkasseTransaction)
    .innerJoin(
      familienkasseAccount,
      eq(familienkasseTransaction.accountId, familienkasseAccount.id)
    )
    .where(eq(familienkasseTransaction.id, transactionId));

  if (!transaction || transaction.accountUserId !== userId) {
    return null;
  }

  return transaction.transaction;
}

/**
 * Create a new transaction for an account.
 */
export async function createTransaction(
  userId: string,
  input: CreateTransactionInput
): Promise<FamilienkasseTransaction | null> {
  // Verify ownership first
  const isOwner = await verifyAccountOwnership(input.accountId, userId);
  if (!isOwner) {
    return null;
  }

  const id = generateId();

  const [transaction] = await db
    .insert(familienkasseTransaction)
    .values({
      id,
      accountId: input.accountId,
      description: input.description || null,
      amount: input.amount,
      isPaid: input.isPaid ?? false,
    })
    .returning();

  return transaction;
}

/**
 * Update an existing transaction.
 */
export async function updateTransaction(
  transactionId: string,
  userId: string,
  input: UpdateTransactionInput
): Promise<FamilienkasseTransaction | null> {
  // First verify ownership via the account
  const existing = await getTransaction(transactionId, userId);
  if (!existing) {
    return null;
  }

  const updateData: Partial<FamilienkasseTransaction> = {};
  if (input.description !== undefined) updateData.description = input.description;
  if (input.amount !== undefined) updateData.amount = input.amount;
  if (input.isPaid !== undefined) updateData.isPaid = input.isPaid;

  if (Object.keys(updateData).length === 0) {
    return existing;
  }

  const [updated] = await db
    .update(familienkasseTransaction)
    .set(updateData)
    .where(eq(familienkasseTransaction.id, transactionId))
    .returning();

  return updated;
}

/**
 * Delete a transaction.
 */
export async function deleteTransaction(
  transactionId: string,
  userId: string
): Promise<boolean> {
  // First verify ownership via the account
  const existing = await getTransaction(transactionId, userId);
  if (!existing) {
    return false;
  }

  await db
    .delete(familienkasseTransaction)
    .where(eq(familienkasseTransaction.id, transactionId));

  return true;
}
