import { describe, it, expect } from 'vitest';
import { LedgerEntryType } from '@quorum/shared/src/enums.js';
import type { LedgerEntry } from '@quorum/shared/src/types.js';
import { reconcile } from '../reconciliation.js';

function entry(type: LedgerEntryType, amount: number): LedgerEntry {
  return {
    id: `led-${Math.random()}`,
    coalitionId: 'c1',
    memberId: 'm1',
    type,
    amountCents: amount,
    provider: 'simulated',
    referenceId: 'ref-1',
    createdAt: new Date().toISOString(),
  };
}

describe('reconcile', () => {
  it('reports balanced when reserved = captured + voided', () => {
    const entries = [
      entry(LedgerEntryType.RESERVED, 10000),
      entry(LedgerEntryType.CAPTURED, 8000),
      entry(LedgerEntryType.VOIDED, 2000),
    ];
    const result = reconcile(entries);
    expect(result.balanced).toBe(true);
    expect(result.discrepancyCents).toBe(0);
  });

  it('reports imbalanced when reserved != captured + voided', () => {
    const entries = [
      entry(LedgerEntryType.RESERVED, 10000),
      entry(LedgerEntryType.CAPTURED, 7000),
    ];
    const result = reconcile(entries);
    expect(result.balanced).toBe(false);
    expect(result.discrepancyCents).toBe(3000);
  });

  it('handles full lifecycle: reserve → capture → payout', () => {
    const entries = [
      entry(LedgerEntryType.RESERVED, 5000),
      entry(LedgerEntryType.CAPTURED, 5000),
      entry(LedgerEntryType.PAYOUT_SENT, 5000),
    ];
    const result = reconcile(entries);
    expect(result.balanced).toBe(true);
    expect(result.totalPaidOutCents).toBe(5000);
  });

  it('handles void-only (coalition failed)', () => {
    const entries = [
      entry(LedgerEntryType.RESERVED, 5000),
      entry(LedgerEntryType.VOIDED, 5000),
    ];
    const result = reconcile(entries);
    expect(result.balanced).toBe(true);
  });

  it('handles partial capture + void', () => {
    const entries = [
      entry(LedgerEntryType.RESERVED, 10000),
      entry(LedgerEntryType.PARTIALLY_CAPTURED, 8000),
      entry(LedgerEntryType.VOIDED, 2000),
    ];
    const result = reconcile(entries);
    expect(result.balanced).toBe(true);
  });
});
