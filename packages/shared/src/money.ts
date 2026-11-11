/**
 * @module money
 * Pure utility functions for money arithmetic.
 *
 * RULE: All internal amounts are **integer cents** (USD).
 * These helpers convert to/from external representations (dollars, PayPal API format).
 */

/**
 * Convert a dollar amount to integer cents, rounding to the nearest cent.
 *
 * @example toCents(19.99)  // 1999
 * @example toCents(0.005)  // 1  (banker-friendly rounding)
 */
export function toCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Convert integer cents to a human-readable dollar string (e.g., "$19.99").
 *
 * @example toDollars(1999)  // "$19.99"
 * @example toDollars(500)   // "$5.00"
 * @example toDollars(0)     // "$0.00"
 */
export function toDollars(cents: number): string {
  const dollars = (cents / 100).toFixed(2);
  return `$${dollars}`;
}

/**
 * Build the amount object expected by PayPal's REST API.
 *
 * @example toPayPalAmount(1999)  // { currency_code: "USD", value: "19.99" }
 */
export function toPayPalAmount(cents: number): {
  currency_code: string;
  value: string;
} {
  return {
    currency_code: 'USD',
    value: (cents / 100).toFixed(2),
  };
}

/**
 * Parse a PayPal API amount object back to integer cents.
 *
 * @example fromPayPalAmount({ value: "19.99" })  // 1999
 */
export function fromPayPalAmount(amount: { value: string }): number {
  return Math.round(parseFloat(amount.value) * 100);
}

/**
 * Validate that a cents amount is a non-negative integer.
 * Returns `true` if valid, `false` otherwise.
 */
export function validateCentsAmount(cents: number): boolean {
  return Number.isInteger(cents) && cents >= 0;
}

/**
 * Calculate savings when buying at the group price vs. solo price.
 *
 * @returns An object with `savedCents` (absolute) and `savedPct` (0–100 range, 2 decimal precision).
 *
 * @example calculateSavings(5000, 4000)  // { savedCents: 1000, savedPct: 20 }
 */
export function calculateSavings(
  soloPriceCents: number,
  groupPriceCents: number,
): { savedCents: number; savedPct: number } {
  const savedCents = soloPriceCents - groupPriceCents;
  const savedPct =
    soloPriceCents === 0
      ? 0
      : Math.round((savedCents / soloPriceCents) * 10000) / 100;
  return { savedCents, savedPct };
}
