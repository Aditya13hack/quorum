/**
 * Unit tests for money utility functions.
 * @module money.test
 */

import { describe, it, expect } from 'vitest';
import {
  toCents,
  toDollars,
  toPayPalAmount,
  fromPayPalAmount,
  validateCentsAmount,
  calculateSavings,
} from '../money.js';

// ─── toCents ─────────────────────────────────────────────────────────

describe('toCents', () => {
  it('converts a whole dollar amount', () => {
    expect(toCents(5)).toBe(500);
  });

  it('converts a fractional dollar amount', () => {
    expect(toCents(19.99)).toBe(1999);
  });

  it('rounds half-cent amounts', () => {
    expect(toCents(0.005)).toBe(1);
    expect(toCents(0.004)).toBe(0);
  });

  it('handles zero', () => {
    expect(toCents(0)).toBe(0);
  });

  it('handles large amounts', () => {
    expect(toCents(999999.99)).toBe(99999999);
  });

  it('handles sub-cent precision via rounding', () => {
    // 1.255 in IEEE 754 is actually 1.254999... → 125.4999... → rounds to 125
    // This is expected floating-point behavior
    expect(toCents(1.255)).toBe(125);
    // But 1.256 rounds up correctly
    expect(toCents(1.256)).toBe(126);
  });
});

// ─── toDollars ───────────────────────────────────────────────────────

describe('toDollars', () => {
  it('formats a typical amount', () => {
    expect(toDollars(1999)).toBe('$19.99');
  });

  it('formats zero cents', () => {
    expect(toDollars(0)).toBe('$0.00');
  });

  it('formats amounts with no fractional cents', () => {
    expect(toDollars(500)).toBe('$5.00');
  });

  it('formats single-digit cents', () => {
    expect(toDollars(5)).toBe('$0.05');
  });

  it('formats large amounts', () => {
    expect(toDollars(99999999)).toBe('$999999.99');
  });
});

// ─── toPayPalAmount ──────────────────────────────────────────────────

describe('toPayPalAmount', () => {
  it('creates the correct PayPal amount object', () => {
    const result = toPayPalAmount(1999);
    expect(result).toEqual({ currency_code: 'USD', value: '19.99' });
  });

  it('always uses two decimal places', () => {
    const result = toPayPalAmount(500);
    expect(result.value).toBe('5.00');
  });

  it('handles zero', () => {
    const result = toPayPalAmount(0);
    expect(result).toEqual({ currency_code: 'USD', value: '0.00' });
  });

  it('always sets currency_code to USD', () => {
    expect(toPayPalAmount(100).currency_code).toBe('USD');
  });
});

// ─── fromPayPalAmount ────────────────────────────────────────────────

describe('fromPayPalAmount', () => {
  it('parses a standard PayPal amount string', () => {
    expect(fromPayPalAmount({ value: '19.99' })).toBe(1999);
  });

  it('parses whole dollar amounts', () => {
    expect(fromPayPalAmount({ value: '5.00' })).toBe(500);
  });

  it('parses zero', () => {
    expect(fromPayPalAmount({ value: '0.00' })).toBe(0);
  });

  it('handles amounts with no decimal (edge case)', () => {
    expect(fromPayPalAmount({ value: '10' })).toBe(1000);
  });

  it('round-trips correctly with toPayPalAmount', () => {
    const cents = 4299;
    const ppAmount = toPayPalAmount(cents);
    expect(fromPayPalAmount(ppAmount)).toBe(cents);
  });
});

// ─── validateCentsAmount ─────────────────────────────────────────────

describe('validateCentsAmount', () => {
  it('accepts zero', () => {
    expect(validateCentsAmount(0)).toBe(true);
  });

  it('accepts positive integers', () => {
    expect(validateCentsAmount(100)).toBe(true);
    expect(validateCentsAmount(1)).toBe(true);
    expect(validateCentsAmount(99999999)).toBe(true);
  });

  it('rejects negative numbers', () => {
    expect(validateCentsAmount(-1)).toBe(false);
    expect(validateCentsAmount(-100)).toBe(false);
  });

  it('rejects non-integers (floats)', () => {
    expect(validateCentsAmount(1.5)).toBe(false);
    expect(validateCentsAmount(0.01)).toBe(false);
  });

  it('rejects NaN and Infinity', () => {
    expect(validateCentsAmount(NaN)).toBe(false);
    expect(validateCentsAmount(Infinity)).toBe(false);
    expect(validateCentsAmount(-Infinity)).toBe(false);
  });
});

// ─── calculateSavings ────────────────────────────────────────────────

describe('calculateSavings', () => {
  it('calculates savings correctly for a 20% discount', () => {
    const result = calculateSavings(5000, 4000);
    expect(result.savedCents).toBe(1000);
    expect(result.savedPct).toBe(20);
  });

  it('calculates savings correctly for a 50% discount', () => {
    const result = calculateSavings(10000, 5000);
    expect(result.savedCents).toBe(5000);
    expect(result.savedPct).toBe(50);
  });

  it('returns zero when prices are equal', () => {
    const result = calculateSavings(5000, 5000);
    expect(result.savedCents).toBe(0);
    expect(result.savedPct).toBe(0);
  });

  it('handles negative savings (group is more expensive)', () => {
    const result = calculateSavings(5000, 6000);
    expect(result.savedCents).toBe(-1000);
    expect(result.savedPct).toBe(-20);
  });

  it('handles zero solo price without division by zero', () => {
    const result = calculateSavings(0, 0);
    expect(result.savedCents).toBe(0);
    expect(result.savedPct).toBe(0);
  });

  it('calculates fractional percentages with 2-decimal precision', () => {
    // 1000 → 667 = 333 saved = 33.30%
    const result = calculateSavings(1000, 667);
    expect(result.savedCents).toBe(333);
    expect(result.savedPct).toBe(33.3);
  });
});
