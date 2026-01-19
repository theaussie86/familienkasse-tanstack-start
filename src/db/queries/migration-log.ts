import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { migrationLog, type MigrationLog } from "@/db/schema";
import { generateId } from "@/lib/id";

export interface MigrationLogUpdate {
  status?: "running" | "completed" | "failed";
  completedAt?: Date;
  accountsMigrated?: number;
  accountsSkipped?: number;
  transactionsMigrated?: number;
  transactionsSkipped?: number;
  errorMessage?: string | null;
}

/**
 * Create a new migration log entry.
 * Called at the start of a migration run.
 */
export async function createMigrationLog(): Promise<MigrationLog> {
  const id = generateId();

  const [log] = await db
    .insert(migrationLog)
    .values({
      id,
      startedAt: new Date(),
      status: "running",
    })
    .returning();

  return log;
}

/**
 * Update an existing migration log entry.
 * Called during and at the end of a migration run.
 */
export async function updateMigrationLog(
  logId: string,
  update: MigrationLogUpdate
): Promise<MigrationLog | null> {
  const [log] = await db
    .update(migrationLog)
    .set(update)
    .where(eq(migrationLog.id, logId))
    .returning();

  return log || null;
}

/**
 * Get the latest migration log entry.
 * Useful for checking the status of the last migration.
 */
export async function getLatestMigrationLog(): Promise<MigrationLog | null> {
  const [log] = await db
    .select()
    .from(migrationLog)
    .orderBy(desc(migrationLog.startedAt))
    .limit(1);

  return log || null;
}

/**
 * Get a migration log by ID.
 */
export async function getMigrationLog(logId: string): Promise<MigrationLog | null> {
  const [log] = await db
    .select()
    .from(migrationLog)
    .where(eq(migrationLog.id, logId));

  return log || null;
}
