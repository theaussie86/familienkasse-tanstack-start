import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * READ-ONLY Supabase source database schema.
 * This schema mirrors the existing Supabase tables for migration purposes.
 * DO NOT use these tables for writes.
 */

// Supabase accounts table (source)
export const supabaseAccounts = pgTable("familienkasse_accounts", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
});

// Supabase transactions table (source)
export const supabaseTransactions = pgTable("familienkasse_transactions", {
  id: uuid("id").primaryKey(),
  account_id: uuid("account_id").notNull(),
  description: text("description"),
  amount: integer("amount").notNull(),
  is_paid: boolean("is_paid").default(false),
  created: timestamp("created", { withTimezone: true }),
});

// Type exports for migration
export type SupabaseAccount = typeof supabaseAccounts.$inferSelect;
export type SupabaseTransaction = typeof supabaseTransactions.$inferSelect;
