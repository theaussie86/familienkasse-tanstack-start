import { z } from "zod";

// Account validation schemas
export const createAccountSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
});

export const updateAccountSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long").optional(),
  recurringAllowanceEnabled: z.boolean().optional(),
  recurringAllowanceAmount: z
    .number()
    .int("Amount must be in cents")
    .min(0, "Amount must be positive")
    .max(2147483647, "Amount too large")
    .optional(),
});

// Allowance configuration validation
export const allowanceConfigSchema = z.object({
  recurringAllowanceEnabled: z.boolean(),
  recurringAllowanceAmount: z
    .number()
    .int("Amount must be in cents")
    .min(0, "Amount must be positive")
    .max(2147483647, "Amount too large"),
});

// Transaction validation schemas
export const createTransactionSchema = z.object({
  description: z.string().max(500, "Description too long").optional(),
  amount: z
    .number()
    .int("Amount must be in cents")
    .min(-2147483648, "Amount too small")
    .max(2147483647, "Amount too large"),
  isPaid: z.boolean().optional().default(false),
});

export const updateTransactionSchema = z.object({
  description: z.string().max(500, "Description too long").optional(),
  amount: z
    .number()
    .int("Amount must be in cents")
    .min(-2147483648, "Amount too small")
    .max(2147483647, "Amount too large")
    .optional(),
  isPaid: z.boolean().optional(),
});

// Type exports for use in API routes
export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
export type AllowanceConfigInput = z.infer<typeof allowanceConfigSchema>;
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
