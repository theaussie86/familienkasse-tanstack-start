import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

/**
 * Create a connection to the Supabase source database for migration.
 * Uses the transaction pooler (Supavisor) for efficient connection handling.
 *
 * Note: This client should only be used during migration operations.
 * It connects to the READ-ONLY source database.
 */
export function createSupabaseClient() {
  const connectionString = process.env.SUPABASE_DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "SUPABASE_DATABASE_URL environment variable is not set. " +
        "Get this from: Supabase Dashboard → Project Settings → Database → Connection string → Transaction pooler"
    );
  }

  const client = postgres(connectionString, {
    max: 1, // Limit connections for migration script
    idle_timeout: 20,
    connect_timeout: 10,
  });

  return drizzle(client);
}

/**
 * Close the Supabase connection pool.
 * Call this after migration is complete.
 */
export async function closeSupabaseClient(client: ReturnType<typeof postgres>) {
  await client.end();
}
