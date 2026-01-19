import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { db } from "@/db";

/**
 * Check if registration is allowed via environment variable.
 * Defaults to true if not set.
 */
export function isRegistrationAllowed(): boolean {
  return process.env.ALLOW_REGISTRATION !== "false";
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [tanstackStartCookies()],
  advanced: {
    disabledPaths: isRegistrationAllowed() ? [] : ["/sign-up/email"],
  },
});
