CREATE TABLE "migration_log" (
	"id" text PRIMARY KEY NOT NULL,
	"started_at" timestamp NOT NULL,
	"completed_at" timestamp,
	"status" text NOT NULL,
	"accounts_migrated" integer DEFAULT 0 NOT NULL,
	"accounts_skipped" integer DEFAULT 0 NOT NULL,
	"transactions_migrated" integer DEFAULT 0 NOT NULL,
	"transactions_skipped" integer DEFAULT 0 NOT NULL,
	"error_message" text
);
--> statement-breakpoint
ALTER TABLE "familienkasse_account" ADD COLUMN "recurring_allowance_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "familienkasse_account" ADD COLUMN "recurring_allowance_amount" integer DEFAULT 0 NOT NULL;