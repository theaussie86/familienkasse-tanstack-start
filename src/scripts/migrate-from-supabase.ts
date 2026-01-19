/**
 * CLI script for migrating data from Supabase to local PostgreSQL.
 *
 * Usage: npx tsx src/scripts/migrate-from-supabase.ts [user-id]
 *
 * Prerequisites:
 * 1. Set SUPABASE_DATABASE_URL environment variable in .env.local
 * 2. Ensure local DATABASE_URL is configured in .env.local
 * 3. Run database migrations: npm run db:migrate
 * 4. Have at least one user in the target database
 */

import { config } from "dotenv";

// Load environment variables from .env.local BEFORE any other imports
config({ path: ".env.local" });

// Dynamic import to ensure env vars are loaded first
async function main() {
  const { runMigration } = await import("@/db/migrations/supabase-migration");
  const { db } = await import("@/db");
  const { user } = await import("@/db/schema");

  console.log("========================================");
  console.log("  Supabase to Local PostgreSQL Migration");
  console.log("========================================\n");

  // Check environment variables
  if (!process.env.DATABASE_URL) {
    console.error("Error: DATABASE_URL environment variable is not set.");
    console.error("This should point to your target PostgreSQL database.");
    process.exit(1);
  }

  if (!process.env.SUPABASE_DATABASE_URL) {
    console.error("Error: SUPABASE_DATABASE_URL environment variable is not set.");
    console.error("");
    console.error("To get your Supabase connection string:");
    console.error("1. Go to your Supabase project dashboard");
    console.error("2. Navigate to Project Settings → Database");
    console.error("3. Copy the 'Connection string' under 'Transaction pooler'");
    console.error("4. Add it to your .env.local file:");
    console.error("");
    console.error("   SUPABASE_DATABASE_URL=postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres");
    console.error("");
    process.exit(1);
  }

  // Get target user ID from argument or find first user
  let targetUserId = process.argv[2];

  if (!targetUserId) {
    console.log("No user ID provided, looking up users in target database...");
    const users = await db.select({ id: user.id, email: user.email }).from(user).limit(5);

    if (users.length === 0) {
      console.error("Error: No users found in target database.");
      console.error("Please create a user first by logging into the application.");
      process.exit(1);
    }

    if (users.length === 1) {
      targetUserId = users[0].id;
      console.log(`Using user: ${users[0].email} (${targetUserId})`);
    } else {
      console.log("\nMultiple users found:");
      users.forEach((u, i) => console.log(`  ${i + 1}. ${u.email} (${u.id})`));
      console.error("\nPlease specify user ID as argument:");
      console.error("  npx tsx src/scripts/migrate-from-supabase.ts <user-id>");
      process.exit(1);
    }
  }

  console.log(`\nMigrating accounts to user: ${targetUserId}\n`);

  try {
    const result = await runMigration(targetUserId);

    if (result.success) {
      console.log("\n========================================");
      console.log("  Migration Summary");
      console.log("========================================");
      console.log(`  Accounts migrated:    ${result.accountsMigrated}`);
      console.log(`  Accounts skipped:     ${result.accountsSkipped}`);
      console.log(`  Transactions migrated: ${result.transactionsMigrated}`);
      console.log(`  Transactions skipped: ${result.transactionsSkipped}`);

      if (result.errors.length > 0) {
        console.log("\n  Warnings:");
        result.errors.forEach((err) => console.log(`    - ${err}`));
      }

      console.log("\n  Status: SUCCESS");
      console.log("========================================\n");
      process.exit(0);
    } else {
      console.error("\n========================================");
      console.error("  Migration Failed");
      console.error("========================================");
      console.error("\n  Errors:");
      result.errors.forEach((err) => console.error(`    - ${err}`));
      console.error("\n========================================\n");
      process.exit(1);
    }
  } catch (error) {
    console.error("\n========================================");
    console.error("  Unexpected Error");
    console.error("========================================");
    console.error(error);
    console.error("========================================\n");
    process.exit(1);
  }
}

main();
