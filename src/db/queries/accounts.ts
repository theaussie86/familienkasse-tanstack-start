import { eq, sql, and } from "drizzle-orm";
import { db } from "@/db";
import {
  familienkasseAccount,
  familienkasseTransaction,
  type FamilienkasseAccount,
  type UpdateFamilienkasseAccount,
} from "@/db/schema";
import { generateId } from "@/lib/id";

export interface AccountWithBalance extends FamilienkasseAccount {
  balance: number; // Total balance (all transactions)
  paidBalance: number; // Actual balance (only paid transactions)
}

export interface UpdateAccountInput {
  name?: string;
  recurringAllowanceEnabled?: boolean;
  recurringAllowanceAmount?: number;
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
      recurringAllowanceEnabled: familienkasseAccount.recurringAllowanceEnabled,
      recurringAllowanceAmount: familienkasseAccount.recurringAllowanceAmount,
      createdAt: familienkasseAccount.createdAt,
      updatedAt: familienkasseAccount.updatedAt,
      balance:
        sql<number>`COALESCE(SUM(${familienkasseTransaction.amount}), 0)`.as(
          "balance"
        ),
      paidBalance:
        sql<number>`COALESCE(SUM(CASE WHEN ${familienkasseTransaction.isPaid} THEN ${familienkasseTransaction.amount} ELSE 0 END), 0)`.as(
          "paid_balance"
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
    paidBalance: Number(r.paidBalance),
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
      recurringAllowanceEnabled: familienkasseAccount.recurringAllowanceEnabled,
      recurringAllowanceAmount: familienkasseAccount.recurringAllowanceAmount,
      createdAt: familienkasseAccount.createdAt,
      updatedAt: familienkasseAccount.updatedAt,
      balance:
        sql<number>`COALESCE(SUM(${familienkasseTransaction.amount}), 0)`.as(
          "balance"
        ),
      paidBalance:
        sql<number>`COALESCE(SUM(CASE WHEN ${familienkasseTransaction.isPaid} THEN ${familienkasseTransaction.amount} ELSE 0 END), 0)`.as(
          "paid_balance"
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
    paidBalance: Number(account.paidBalance),
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
 * Update an account's fields including recurring allowance configuration.
 * Returns null if account doesn't exist or doesn't belong to the user.
 */
export async function updateAccount(
  accountId: string,
  userId: string,
  updates: UpdateAccountInput
): Promise<FamilienkasseAccount | null> {
  // First verify ownership
  const [existing] = await db
    .select({ userId: familienkasseAccount.userId })
    .from(familienkasseAccount)
    .where(eq(familienkasseAccount.id, accountId));

  if (!existing || existing.userId !== userId) {
    return null;
  }

  // Build update object with only provided fields
  const updateData: UpdateFamilienkasseAccount = {};
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.recurringAllowanceEnabled !== undefined) {
    updateData.recurringAllowanceEnabled = updates.recurringAllowanceEnabled;
  }
  if (updates.recurringAllowanceAmount !== undefined) {
    updateData.recurringAllowanceAmount = updates.recurringAllowanceAmount;
  }

  if (Object.keys(updateData).length === 0) {
    // No updates provided, return current account
    const [account] = await db
      .select()
      .from(familienkasseAccount)
      .where(eq(familienkasseAccount.id, accountId));
    return account;
  }

  const [account] = await db
    .update(familienkasseAccount)
    .set(updateData)
    .where(eq(familienkasseAccount.id, accountId))
    .returning();

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

/**
 * Get all accounts with recurring allowance enabled and amount > 0.
 * Used by the weekly allowance cron job.
 */
export async function getAccountsWithAllowanceEnabled(): Promise<FamilienkasseAccount[]> {
  const accounts = await db
    .select()
    .from(familienkasseAccount)
    .where(
      and(
        eq(familienkasseAccount.recurringAllowanceEnabled, true),
        sql`${familienkasseAccount.recurringAllowanceAmount} > 0`
      )
    );

  return accounts;
}
