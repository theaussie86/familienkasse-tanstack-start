var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  account: () => account,
  familienkasseAccount: () => familienkasseAccount,
  familienkasseTransaction: () => familienkasseTransaction,
  migrationLog: () => migrationLog,
  session: () => session,
  user: () => user,
  verification: () => verification
});
import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  index
} from "drizzle-orm/pg-core";
var user, session, account, verification, familienkasseAccount, familienkasseTransaction, migrationLog;
var init_schema = __esm({
  "src/db/schema.ts"() {
    "use strict";
    user = pgTable("user", {
      id: text("id").primaryKey(),
      name: text("name").notNull(),
      email: text("email").notNull().unique(),
      emailVerified: boolean("email_verified").default(false).notNull(),
      image: text("image"),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => /* @__PURE__ */ new Date()).notNull()
    });
    session = pgTable(
      "session",
      {
        id: text("id").primaryKey(),
        expiresAt: timestamp("expires_at").notNull(),
        token: text("token").notNull().unique(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => /* @__PURE__ */ new Date()).notNull(),
        ipAddress: text("ip_address"),
        userAgent: text("user_agent"),
        userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" })
      },
      (table) => [index("session_userId_idx").on(table.userId)]
    );
    account = pgTable(
      "account",
      {
        id: text("id").primaryKey(),
        accountId: text("account_id").notNull(),
        providerId: text("provider_id").notNull(),
        userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
        accessToken: text("access_token"),
        refreshToken: text("refresh_token"),
        idToken: text("id_token"),
        accessTokenExpiresAt: timestamp("access_token_expires_at"),
        refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
        scope: text("scope"),
        password: text("password"),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => /* @__PURE__ */ new Date()).notNull()
      },
      (table) => [index("account_userId_idx").on(table.userId)]
    );
    verification = pgTable(
      "verification",
      {
        id: text("id").primaryKey(),
        identifier: text("identifier").notNull(),
        value: text("value").notNull(),
        expiresAt: timestamp("expires_at").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => /* @__PURE__ */ new Date()).notNull()
      },
      (table) => [index("verification_identifier_idx").on(table.identifier)]
    );
    familienkasseAccount = pgTable(
      "familienkasse_account",
      {
        id: text("id").primaryKey(),
        name: text("name").notNull(),
        userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
        recurringAllowanceEnabled: boolean("recurring_allowance_enabled").notNull().default(false),
        recurringAllowanceAmount: integer("recurring_allowance_amount").notNull().default(0),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => /* @__PURE__ */ new Date()).notNull()
      },
      (table) => [index("familienkasse_account_userId_idx").on(table.userId)]
    );
    familienkasseTransaction = pgTable(
      "familienkasse_transaction",
      {
        id: text("id").primaryKey(),
        accountId: text("account_id").notNull().references(() => familienkasseAccount.id, { onDelete: "cascade" }),
        description: text("description"),
        amount: integer("amount").notNull(),
        isPaid: boolean("is_paid").default(false).notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull()
      },
      (table) => [
        index("familienkasse_transaction_accountId_idx").on(table.accountId)
      ]
    );
    migrationLog = pgTable("migration_log", {
      id: text("id").primaryKey(),
      startedAt: timestamp("started_at").notNull(),
      completedAt: timestamp("completed_at"),
      status: text("status").notNull(),
      // 'running', 'completed', 'failed'
      accountsMigrated: integer("accounts_migrated").notNull().default(0),
      accountsSkipped: integer("accounts_skipped").notNull().default(0),
      transactionsMigrated: integer("transactions_migrated").notNull().default(0),
      transactionsSkipped: integer("transactions_skipped").notNull().default(0),
      errorMessage: text("error_message")
    });
  }
});

// src/db/index.ts
var db_exports = {};
__export(db_exports, {
  db: () => db
});
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
var connectionString, client, db;
var init_db = __esm({
  "src/db/index.ts"() {
    "use strict";
    init_schema();
    connectionString = process.env.DATABASE_URL;
    client = postgres(connectionString);
    db = drizzle(client, { schema: schema_exports });
  }
});

// src/db/migrations/supabase-schema.ts
import {
  pgTable as pgTable2,
  text as text2,
  timestamp as timestamp2,
  boolean as boolean2,
  integer as integer2,
  uuid
} from "drizzle-orm/pg-core";
var supabaseAccounts, supabaseTransactions;
var init_supabase_schema = __esm({
  "src/db/migrations/supabase-schema.ts"() {
    "use strict";
    supabaseAccounts = pgTable2("familienkasse_accounts", {
      id: uuid("id").primaryKey(),
      name: text2("name").notNull()
    });
    supabaseTransactions = pgTable2("familienkasse_transactions", {
      id: uuid("id").primaryKey(),
      account_id: uuid("account_id").notNull(),
      description: text2("description"),
      amount: integer2("amount").notNull(),
      is_paid: boolean2("is_paid").default(false),
      created: timestamp2("created", { withTimezone: true })
    });
  }
});

// src/lib/id.ts
function generateId() {
  return crypto.randomUUID();
}
var init_id = __esm({
  "src/lib/id.ts"() {
    "use strict";
  }
});

// src/db/queries/migration-log.ts
import { eq, desc } from "drizzle-orm";
async function createMigrationLog() {
  const id = generateId();
  const [log] = await db.insert(migrationLog).values({
    id,
    startedAt: /* @__PURE__ */ new Date(),
    status: "running"
  }).returning();
  return log;
}
async function updateMigrationLog(logId, update) {
  const [log] = await db.update(migrationLog).set(update).where(eq(migrationLog.id, logId)).returning();
  return log || null;
}
var init_migration_log = __esm({
  "src/db/queries/migration-log.ts"() {
    "use strict";
    init_db();
    init_schema();
    init_id();
  }
});

// src/db/migrations/supabase-migration.ts
var supabase_migration_exports = {};
__export(supabase_migration_exports, {
  migrateAccounts: () => migrateAccounts,
  migrateTransactions: () => migrateTransactions,
  runMigration: () => runMigration,
  validateBalances: () => validateBalances
});
import { drizzle as drizzle2 } from "drizzle-orm/postgres-js";
import postgres2 from "postgres";
import { eq as eq2, sql } from "drizzle-orm";
function createSourceConnection() {
  const connectionString2 = process.env.SUPABASE_DATABASE_URL;
  if (!connectionString2) {
    throw new Error(
      "SUPABASE_DATABASE_URL environment variable is not set.\nGet this from: Supabase Dashboard \u2192 Project Settings \u2192 Database \u2192 Connection string \u2192 Transaction pooler"
    );
  }
  const client2 = postgres2(connectionString2, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10
  });
  return { client: client2, db: drizzle2(client2) };
}
async function migrateAccounts(sourceDb, progress, targetUserId) {
  console.log("Fetching accounts from Supabase...");
  const sourceAccounts = await sourceDb.select().from(supabaseAccounts);
  console.log(`Found ${sourceAccounts.length} accounts in source database`);
  for (const sourceAccount of sourceAccounts) {
    const accountData = {
      id: sourceAccount.id,
      name: sourceAccount.name,
      userId: targetUserId,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    const result = await db.insert(familienkasseAccount).values(accountData).onConflictDoNothing({ target: familienkasseAccount.id }).returning();
    if (result.length > 0) {
      progress.accountsMigrated++;
      console.log(`  \u2713 Migrated account: ${sourceAccount.name}`);
    } else {
      progress.accountsSkipped++;
      console.log(`  - Skipped account (already exists): ${sourceAccount.name}`);
    }
  }
  await updateMigrationLog(progress.logId, {
    accountsMigrated: progress.accountsMigrated,
    accountsSkipped: progress.accountsSkipped
  });
}
async function migrateTransactions(sourceDb, progress) {
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
      createdAt: sourceTx.created || /* @__PURE__ */ new Date()
    };
    const result = await db.insert(familienkasseTransaction).values(txData).onConflictDoNothing({ target: familienkasseTransaction.id }).returning();
    if (result.length > 0) {
      progress.transactionsMigrated++;
    } else {
      progress.transactionsSkipped++;
    }
  }
  console.log(
    `  \u2713 Migrated ${progress.transactionsMigrated} transactions, skipped ${progress.transactionsSkipped}`
  );
  await updateMigrationLog(progress.logId, {
    transactionsMigrated: progress.transactionsMigrated,
    transactionsSkipped: progress.transactionsSkipped
  });
}
async function validateBalances() {
  console.log("Validating account balances...");
  const errors = [];
  const accountBalances = await db.select({
    id: familienkasseAccount.id,
    name: familienkasseAccount.name,
    calculatedBalance: sql`COALESCE(SUM(${familienkasseTransaction.amount}), 0)`.as(
      "calculated_balance"
    )
  }).from(familienkasseAccount).leftJoin(
    familienkasseTransaction,
    eq2(familienkasseTransaction.accountId, familienkasseAccount.id)
  ).groupBy(familienkasseAccount.id);
  for (const account2 of accountBalances) {
    const balance = Number(account2.calculatedBalance);
    console.log(`  Account "${account2.name}": ${balance / 100} EUR`);
  }
  console.log(`  \u2713 Validated ${accountBalances.length} accounts`);
  return { valid: errors.length === 0, errors };
}
async function runMigration(targetUserId) {
  const errors = [];
  let sourceClient = null;
  const log = await createMigrationLog();
  console.log(`Migration started (log ID: ${log.id})`);
  const progress = {
    logId: log.id,
    accountsMigrated: 0,
    accountsSkipped: 0,
    transactionsMigrated: 0,
    transactionsSkipped: 0
  };
  try {
    console.log("\nConnecting to Supabase source database...");
    const source = createSourceConnection();
    sourceClient = source.client;
    const sourceDb = source.db;
    console.log("Connected to source database");
    console.log("\n--- Migrating Accounts ---");
    await migrateAccounts(sourceDb, progress, targetUserId);
    console.log("\n--- Migrating Transactions ---");
    await migrateTransactions(sourceDb, progress);
    console.log("\n--- Validating Balances ---");
    const validation = await validateBalances();
    if (!validation.valid) {
      errors.push(...validation.errors);
    }
    await updateMigrationLog(log.id, {
      status: "completed",
      completedAt: /* @__PURE__ */ new Date()
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
      errors
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    errors.push(errorMessage);
    await updateMigrationLog(log.id, {
      status: "failed",
      completedAt: /* @__PURE__ */ new Date(),
      errorMessage
    });
    console.error("\n=== Migration Failed ===");
    console.error(`Error: ${errorMessage}`);
    return {
      success: false,
      accountsMigrated: progress.accountsMigrated,
      accountsSkipped: progress.accountsSkipped,
      transactionsMigrated: progress.transactionsMigrated,
      transactionsSkipped: progress.transactionsSkipped,
      errors
    };
  } finally {
    if (sourceClient) {
      await sourceClient.end();
      console.log("\nClosed source database connection");
    }
  }
}
var init_supabase_migration = __esm({
  "src/db/migrations/supabase-migration.ts"() {
    "use strict";
    init_db();
    init_schema();
    init_supabase_schema();
    init_migration_log();
  }
});

// src/scripts/migrate-from-supabase.ts
import { config } from "dotenv";
config({ path: ".env.local" });
async function main() {
  const { runMigration: runMigration2 } = await Promise.resolve().then(() => (init_supabase_migration(), supabase_migration_exports));
  const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
  const { user: user2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  console.log("========================================");
  console.log("  Supabase to Local PostgreSQL Migration");
  console.log("========================================\n");
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
    console.error("2. Navigate to Project Settings \u2192 Database");
    console.error("3. Copy the 'Connection string' under 'Transaction pooler'");
    console.error("4. Add it to your .env.local file:");
    console.error("");
    console.error("   SUPABASE_DATABASE_URL=postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres");
    console.error("");
    process.exit(1);
  }
  let targetUserId = process.argv[2];
  if (!targetUserId) {
    console.log("No user ID provided, looking up users in target database...");
    const users = await db2.select({ id: user2.id, email: user2.email }).from(user2).limit(5);
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
  console.log(`
Migrating accounts to user: ${targetUserId}
`);
  try {
    const result = await runMigration2(targetUserId);
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
