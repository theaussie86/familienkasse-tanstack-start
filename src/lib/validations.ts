import { z } from "zod";

// Account validation schemas
export const createAccountSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich").max(100, "Name zu lang"),
});

export const updateAccountSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich").max(100, "Name zu lang").optional(),
  recurringAllowanceEnabled: z.boolean().optional(),
  recurringAllowanceAmount: z
    .number()
    .int("Betrag muss in Cent angegeben werden")
    .min(0, "Betrag muss positiv sein")
    .max(2147483647, "Betrag zu groß")
    .optional(),
});

// Allowance configuration validation
export const allowanceConfigSchema = z.object({
  recurringAllowanceEnabled: z.boolean(),
  recurringAllowanceAmount: z
    .number()
    .int("Betrag muss in Cent angegeben werden")
    .min(0, "Betrag muss positiv sein")
    .max(2147483647, "Betrag zu groß"),
});

// Transaction validation schemas
export const createTransactionSchema = z.object({
  description: z.string().max(500, "Beschreibung zu lang").optional(),
  amount: z
    .number()
    .int("Betrag muss in Cent angegeben werden")
    .min(-2147483648, "Betrag zu klein")
    .max(2147483647, "Betrag zu groß"),
  isPaid: z.boolean().optional().default(false),
});

export const updateTransactionSchema = z.object({
  description: z.string().max(500, "Beschreibung zu lang").optional(),
  amount: z
    .number()
    .int("Betrag muss in Cent angegeben werden")
    .min(-2147483648, "Betrag zu klein")
    .max(2147483647, "Betrag zu groß")
    .optional(),
  isPaid: z.boolean().optional(),
});

// Type exports for use in API routes
export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
export type AllowanceConfigInput = z.infer<typeof allowanceConfigSchema>;
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
