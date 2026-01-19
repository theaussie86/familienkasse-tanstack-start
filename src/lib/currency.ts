/**
 * Currency formatting utilities for converting cents to Euro display format.
 * All amounts in the database are stored as integers representing cents.
 */

const euroFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
});

/**
 * Format cents as Euro currency string.
 * @param cents - Amount in cents (e.g., 150 = €1.50)
 * @returns Formatted string (e.g., "1,50 €")
 */
export function formatCurrency(cents: number): string {
  return euroFormatter.format(cents / 100);
}

/**
 * Convert Euro amount to cents.
 * @param euros - Amount in Euros (e.g., 1.50)
 * @returns Amount in cents (e.g., 150)
 */
export function eurosToCents(euros: number): number {
  return Math.round(euros * 100);
}

/**
 * Convert cents to Euro amount.
 * @param cents - Amount in cents (e.g., 150)
 * @returns Amount in Euros (e.g., 1.50)
 */
export function centsToEuros(cents: number): number {
  return cents / 100;
}

/**
 * Parse a user-entered string to cents.
 * Handles both "1,50" and "1.50" formats.
 * @param input - User input string
 * @returns Amount in cents or null if invalid
 */
export function parseToCents(input: string): number | null {
  // Replace comma with dot for parsing
  const normalized = input.replace(",", ".").trim();
  const parsed = parseFloat(normalized);

  if (isNaN(parsed)) {
    return null;
  }

  return eurosToCents(parsed);
}
