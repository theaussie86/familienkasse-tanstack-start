import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  familienkasseAccount,
  familienkasseTransaction,
  type FamilienkasseAccount,
  type NewFamilienkasseAccount,
} from "@/db/schema";
import { generateId } from "@/lib/id";

export interface AccountWithBalance extends FamilienkasseAccount {
  balance: number;
}

/**
 * Get all accounts for a user with their calculated balances.
 * Balance is computed as the sum of all transaction amounts.
 */
export async function getAccountsWithBalances(
  userId: string
): Promise<AccountWithBalance[]> {
  const results = await db
    .select({
      id: familienkasseAccount.id,
      name: familienkasseAccount.name,
      userId: familienkasseAccount.userId,
      createdAt: familienkasseAccount.createdAt,
      updatedAt: familienkasseAccount.updatedAt,
      balance:
        sql<number>`COALESCE(SUM(${familienkasseTransaction.amount}), 0)`.as(
          "balance"
        ),
    })
    .from(familienkasseAccount)
    .leftJoin(
      familienkasseTransaction,
      eq(familienkasseTransaction.accountId, familienkasseAccount.id)
    )
    .where(eq(familienkasseAccount.userId, userId))
    .groupBy(familienkasseAccount.id)
    .orderBy(familienkasseAccount.name);

  return results.map((r) => ({
    ...r,
    balance: Number(r.balance),
  }));
}

/**
 * Get a single account by ID with its balance.
 * Returns null if account doesn't exist or doesn't belong to the user.
 */
export async function getAccountWithBalance(
  accountId: string,
  userId: string
): Promise<AccountWithBalance | null> {
  const results = await db
    .select({
      id: familienkasseAccount.id,
      name: familienkasseAccount.name,
      userId: familienkasseAccount.userId,
      createdAt: familienkasseAccount.createdAt,
      updatedAt: familienkasseAccount.updatedAt,
      balance:
        sql<number>`COALESCE(SUM(${familienkasseTransaction.amount}), 0)`.as(
          "balance"
        ),
    })
    .from(familienkasseAccount)
    .leftJoin(
      familienkasseTransaction,
      eq(familienkasseTransaction.accountId, familienkasseAccount.id)
    )
    .where(eq(familienkasseAccount.id, accountId))
    .groupBy(familienkasseAccount.id);

  const account = results[0];
  if (!account || account.userId !== userId) {
    return null;
  }

  return {
    ...account,
    balance: Number(account.balance),
  };
}

/**
 * Create a new account for a user.
 */
export async function createAccount(
  userId: string,
  name: string
): Promise<FamilienkasseAccount> {
  const id = generateId();

  const [account] = await db
    .insert(familienkasseAccount)
    .values({
      id,
      name,
      userId,
    })
    .returning();

  return account;
}

/**
 * Update an account's name.
 * Returns null if account doesn't exist or doesn't belong to the user.
 */
export async function updateAccount(
  accountId: string,
  userId: string,
  name: string
): Promise<FamilienkasseAccount | null> {
  const [account] = await db
    .update(familienkasseAccount)
    .set({ name })
    .where(eq(familienkasseAccount.id, accountId))
    .returning();

  if (!account || account.userId !== userId) {
    return null;
  }

  return account;
}

/**
 * Delete an account and all its transactions.
 * Returns true if deleted, false if not found or not owned by user.
 */
export async function deleteAccount(
  accountId: string,
  userId: string
): Promise<boolean> {
  // First verify ownership
  const [existing] = await db
    .select({ userId: familienkasseAccount.userId })
    .from(familienkasseAccount)
    .where(eq(familienkasseAccount.id, accountId));

  if (!existing || existing.userId !== userId) {
    return false;
  }

  await db
    .delete(familienkasseAccount)
    .where(eq(familienkasseAccount.id, accountId));

  return true;
}
