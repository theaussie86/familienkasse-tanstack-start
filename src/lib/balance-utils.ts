/**
 * Balance state utilities for color coding account balances
 */

export type BalanceState = "positive" | "negative" | "zero";

/**
 * Determine balance state from amount (in cents)
 */
export function getBalanceState(balance: number): BalanceState {
  if (balance > 0) return "positive";
  if (balance < 0) return "negative";
  return "zero";
}

/**
 * CSS class mappings for balance states
 */
export const balanceStateClasses: Record<BalanceState, string> = {
  positive: "text-green-600 dark:text-green-400",
  negative: "text-red-600 dark:text-red-400",
  zero: "text-foreground",
};
