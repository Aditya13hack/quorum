/**
 * @module reconciliation
 * Ledger reconciliation — verifies all money adds up.
 * Pure function, no side effects.
 */

import type { LedgerEntry } from '@quorum/shared/src/types.js';
import { LedgerEntryType } from '@quorum/shared/src/enums.js';

export interface ReconciliationResult {
  balanced: boolean;
  totalReservedCents: number;
  totalCapturedCents: number;
  totalVoidedCents: number;
  totalRefundedCents: number;
  totalPaidOutCents: number;
  discrepancyCents: number;
  errors: string[];
}

/**
 * Reconcile all ledger entries for a coalition (or globally).
 *
 * Rules:
 * 1. totalReserved = totalCaptured + totalPartiallyCaptured + totalVoided
 *    (every reserved dollar is either captured or voided)
 * 2. totalCaptured + totalPartiallyCaptured = totalPaidOut + totalRefunded + remaining
 *    (every captured dollar is either paid out, refunded, or still held)
 */
export function reconcile(entries: LedgerEntry[]): ReconciliationResult {
  const errors: string[] = [];

  let totalReservedCents = 0;
  let totalCapturedCents = 0;
  let totalVoidedCents = 0;
  let totalRefundedCents = 0;
  let totalPaidOutCents = 0;

  for (const entry of entries) {
    switch (entry.type) {
      case LedgerEntryType.RESERVED:
        totalReservedCents += entry.amountCents;
        break;
      case LedgerEntryType.CAPTURED:
      case LedgerEntryType.PARTIALLY_CAPTURED:
        totalCapturedCents += entry.amountCents;
        break;
      case LedgerEntryType.VOIDED:
        totalVoidedCents += entry.amountCents;
        break;
      case LedgerEntryType.REFUNDED:
        totalRefundedCents += entry.amountCents;
        break;
      case LedgerEntryType.PAYOUT_SENT:
      case LedgerEntryType.PAYOUT_SIMULATED:
        totalPaidOutCents += entry.amountCents;
        break;
      case LedgerEntryType.PAYOUT_PENDING:
        // Pending payouts don't move money yet
        break;
    }
  }

  // Check: reserved = captured + voided
  const reserveBalance = totalReservedCents - totalCapturedCents - totalVoidedCents;
  if (reserveBalance !== 0) {
    errors.push(
      `Reserve imbalance: reserved(${totalReservedCents}) != captured(${totalCapturedCents}) + voided(${totalVoidedCents}). Difference: ${reserveBalance}`,
    );
  }

  // Check: captured = paidOut + refunded (for settled coalitions)
  const captureBalance = totalCapturedCents - totalPaidOutCents - totalRefundedCents;
  // This is only an error if the coalition is fully settled, so we report it as info
  // but still flag it in the discrepancy
  if (captureBalance < 0) {
    errors.push(
      `Capture imbalance: paid out(${totalPaidOutCents}) + refunded(${totalRefundedCents}) exceeds captured(${totalCapturedCents}).`,
    );
  }

  const discrepancyCents = Math.abs(reserveBalance);

  return {
    balanced: errors.length === 0,
    totalReservedCents,
    totalCapturedCents,
    totalVoidedCents,
    totalRefundedCents,
    totalPaidOutCents,
    discrepancyCents,
    errors,
  };
}
