import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { familienkasseAccount, familienkasseTransaction, } from "@/db/schema";
import { supabaseAccounts, supabaseTransactions } from "./supabase-schema";
import { createMigrationLog, updateMigrationLog, } from "@/db/queries/migration-log";
/**
 * Create a connection to the Supabase source database.
 */
function createSourceConnection() {
    const connectionString = process.env.SUPABASE_DATABASE_URL;
    if (!connectionString) {
        throw new Error("SUPABASE_DATABASE_URL environment variable is not set.\n" +
            "Get this from: Supabase Dashboard → Project Settings → Database → Connection string → Transaction pooler");
    }
    const client = postgres(connectionString, {
        max: 1,
        idle_timeout: 20,
        connect_timeout: 10,
    });
    return { client, db: drizzle(client) };
}
/**
 * Migrate accounts from Supabase to local database.
 * Uses onConflictDoNothing() for idempotency.
 *
 * @param sourceDb - Connection to source database
 * @param progress - Migration progress tracker
 * @param targetUserId - User ID to assign accounts to (required since Supabase accounts don't have user_id)
 */
export async function migrateAccounts(sourceDb, progress, targetUserId) {
    console.log("Fetching accounts from Supabase...");
    const sourceAccounts = await sourceDb.select().from(supabaseAccounts);
    console.log(`Found ${sourceAccounts.length} accounts in source database`);
    for (const sourceAccount of sourceAccounts) {
        const accountData = {
            id: sourceAccount.id,
            name: sourceAccount.name,
            userId: targetUserId,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const result = await db
            .insert(familienkasseAccount)
            .values(accountData)
            .onConflictDoNothing({ target: familienkasseAccount.id })
            .returning();
        if (result.length > 0) {
            progress.accountsMigrated++;
            console.log(`  ✓ Migrated account: ${sourceAccount.name}`);
        }
        else {
            progress.accountsSkipped++;
            console.log(`  - Skipped account (already exists): ${sourceAccount.name}`);
        }
    }
    // Update migration log
    await updateMigrationLog(progress.logId, {
        accountsMigrated: progress.accountsMigrated,
        accountsSkipped: progress.accountsSkipped,
    });
}
/**
 * Migrate transactions from Supabase to local database.
 * Uses onConflictDoNothing() for idempotency.
 */
export async function migrateTransactions(sourceDb, progress) {
    console.log("Fetching transactions from Supabase...");
    const sourceTransactions = await sourceDb.select().from(supabaseTransactions);
    console.log(`Found ${sourceTransactions.length} transactions in source database`);
    for (const sourceTx of sourceTransactions) {
        const txData = {
            id: sourceTx.id,
            accountId: sourceTx.account_id,
            description: sourceTx.description,
            amount: sourceTx.amount,
            isPaid: sourceTx.is_paid ?? false,
            createdAt: sourceTx.created || new Date(),
        };
        const result = await db
            .insert(familienkasseTransaction)
            .values(txData)
            .onConflictDoNothing({ target: familienkasseTransaction.id })
            .returning();
        if (result.length > 0) {
            progress.transactionsMigrated++;
        }
        else {
            progress.transactionsSkipped++;
        }
    }
    console.log(`  ✓ Migrated ${progress.transactionsMigrated} transactions, skipped ${progress.transactionsSkipped}`);
    // Update migration log
    await updateMigrationLog(progress.logId, {
        transactionsMigrated: progress.transactionsMigrated,
        transactionsSkipped: progress.transactionsSkipped,
    });
}
/**
 * Validate that account balances match the sum of transactions.
 */
export async function validateBalances() {
    console.log("Validating account balances...");
    const errors = [];
    // Get all accounts with their calculated balances
    const accountBalances = await db
        .select({
        id: familienkasseAccount.id,
        name: familienkasseAccount.name,
        calculatedBalance: sql `COALESCE(SUM(${familienkasseTransaction.amount}), 0)`.as("calculated_balance"),
    })
        .from(familienkasseAccount)
        .leftJoin(familienkasseTransaction, eq(familienkasseTransaction.accountId, familienkasseAccount.id))
        .groupBy(familienkasseAccount.id);
    for (const account of accountBalances) {
        const balance = Number(account.calculatedBalance);
        console.log(`  Account "${account.name}": ${balance / 100} EUR`);
    }
    console.log(`  ✓ Validated ${accountBalances.length} accounts`);
    return { valid: errors.length === 0, errors };
}
/**
 * Run the complete migration from Supabase to local database.
 *
 * @param targetUserId - User ID to assign all migrated accounts to
 */
export async function runMigration(targetUserId) {
    const errors = [];
    let sourceClient = null;
    // Create migration log entry
    const log = await createMigrationLog();
    console.log(`Migration started (log ID: ${log.id})`);
    const progress = {
        logId: log.id,
        accountsMigrated: 0,
        accountsSkipped: 0,
        transactionsMigrated: 0,
        transactionsSkipped: 0,
    };
    try {
        // Connect to source database
        console.log("\nConnecting to Supabase source database...");
        const source = createSourceConnection();
        sourceClient = source.client;
        const sourceDb = source.db;
        console.log("Connected to source database");
        // Migrate accounts
        console.log("\n--- Migrating Accounts ---");
        await migrateAccounts(sourceDb, progress, targetUserId);
        // Migrate transactions
        console.log("\n--- Migrating Transactions ---");
        await migrateTransactions(sourceDb, progress);
        // Validate balances
        console.log("\n--- Validating Balances ---");
        const validation = await validateBalances();
        if (!validation.valid) {
            errors.push(...validation.errors);
        }
        // Mark migration as completed
        await updateMigrationLog(log.id, {
            status: "completed",
            completedAt: new Date(),
        });
        console.log("\n=== Migration Completed Successfully ===");
        console.log(`Accounts: ${progress.accountsMigrated} migrated, ${progress.accountsSkipped} skipped`);
        console.log(`Transactions: ${progress.transactionsMigrated} migrated, ${progress.transactionsSkipped} skipped`);
        return {
            success: true,
            accountsMigrated: progress.accountsMigrated,
            accountsSkipped: progress.accountsSkipped,
            transactionsMigrated: progress.transactionsMigrated,
            transactionsSkipped: progress.transactionsSkipped,
            errors,
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push(errorMessage);
        // Mark migration as failed
        await updateMigrationLog(log.id, {
            status: "failed",
            completedAt: new Date(),
            errorMessage,
        });
        console.error("\n=== Migration Failed ===");
        console.error(`Error: ${errorMessage}`);
        return {
            success: false,
            accountsMigrated: progress.accountsMigrated,
            accountsSkipped: progress.accountsSkipped,
            transactionsMigrated: progress.transactionsMigrated,
            transactionsSkipped: progress.transactionsSkipped,
            errors,
        };
    }
    finally {
        // Close source connection
        if (sourceClient) {
            await sourceClient.end();
            console.log("\nClosed source database connection");
        }
    }
}
