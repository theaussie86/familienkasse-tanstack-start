CREATE TABLE "familienkasse_account" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "familienkasse_transaction" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"description" text,
	"amount" integer NOT NULL,
	"is_paid" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "familienkasse_account" ADD CONSTRAINT "familienkasse_account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "familienkasse_transaction" ADD CONSTRAINT "familienkasse_transaction_account_id_familienkasse_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."familienkasse_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "familienkasse_account_userId_idx" ON "familienkasse_account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "familienkasse_transaction_accountId_idx" ON "familienkasse_transaction" USING btree ("account_id");