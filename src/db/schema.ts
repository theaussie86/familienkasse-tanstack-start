import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  index,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)]
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)]
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
);

// Familienkasse tables
export const familienkasseAccount = pgTable(
  "familienkasse_account",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    recurringAllowanceEnabled: boolean("recurring_allowance_enabled")
      .notNull()
      .default(false),
    recurringAllowanceAmount: integer("recurring_allowance_amount")
      .notNull()
      .default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("familienkasse_account_userId_idx").on(table.userId)]
);

export const familienkasseTransaction = pgTable(
  "familienkasse_transaction",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id")
      .notNull()
      .references(() => familienkasseAccount.id, { onDelete: "cascade" }),
    description: text("description"),
    amount: integer("amount").notNull(),
    isPaid: boolean("is_paid").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("familienkasse_transaction_accountId_idx").on(table.accountId),
  ]
);

// Migration log table for tracking migration runs
export const migrationLog = pgTable("migration_log", {
  id: text("id").primaryKey(),
  startedAt: timestamp("started_at").notNull(),
  completedAt: timestamp("completed_at"),
  status: text("status").notNull(), // 'running', 'completed', 'failed'
  accountsMigrated: integer("accounts_migrated").notNull().default(0),
  accountsSkipped: integer("accounts_skipped").notNull().default(0),
  transactionsMigrated: integer("transactions_migrated").notNull().default(0),
  transactionsSkipped: integer("transactions_skipped").notNull().default(0),
  errorMessage: text("error_message"),
});

// Type exports for Familienkasse entities
export type FamilienkasseAccount = typeof familienkasseAccount.$inferSelect;
export type NewFamilienkasseAccount = typeof familienkasseAccount.$inferInsert;
export type UpdateFamilienkasseAccount = Partial<
  Omit<NewFamilienkasseAccount, "id" | "userId" | "createdAt">
>;
export type FamilienkasseTransaction =
  typeof familienkasseTransaction.$inferSelect;
export type NewFamilienkasseTransaction =
  typeof familienkasseTransaction.$inferInsert;

// Migration log types
export type MigrationLog = typeof migrationLog.$inferSelect;
export type NewMigrationLog = typeof migrationLog.$inferInsert;

// Allowance configuration subset for UI
export type AllowanceConfig = Pick<
  FamilienkasseAccount,
  "recurringAllowanceEnabled" | "recurringAllowanceAmount"
>;
