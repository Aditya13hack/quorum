/**
 * @module quorum-math
 * Quorum threshold and waiting-list logic.
 * Pure functions — no side effects.
 */

import type { Membership } from '@quorum/shared/src/types.js';
import { MemberState } from '@quorum/shared/src/enums.js';

/**
 * Calculate the quorum target including safety margin.
 * Formula: ceil(tierMinBuyers * (1 + safetyMarginPct / 100))
 */
export function calculateQuorumTarget(
  tierMinBuyers: number,
  safetyMarginPct: number,
): number {
  return Math.ceil(tierMinBuyers * (1 + safetyMarginPct / 100));
}

/**
 * Check whether the quorum (including safety margin) has been met.
 */
export function isQuorumMet(approvedCount: number, target: number): boolean {
  return approvedCount >= target;
}

/**
 * Calculate waitlist position.
 * Positive = spots needed to reach quorum. Negative/zero = how far into the waitlist.
 */
export function waitlistInfo(
  currentApproved: number,
  target: number,
): { spotsNeeded: number; isWaitlisted: boolean } {
  const spotsNeeded = target - currentApproved;
  return {
    spotsNeeded: Math.max(0, spotsNeeded),
    isWaitlisted: currentApproved > target,
  };
}

/**
 * Select members from the waitlist to promote, ordered by position.
 */
export function promoteFromWaitlist(
  waitlist: Membership[],
  slotsNeeded: number,
): Membership[] {
  return [...waitlist]
    .filter((m) => m.state === MemberState.WAITLISTED)
    .sort((a, b) => (a.waitlistPosition ?? 999) - (b.waitlistPosition ?? 999))
    .slice(0, slotsNeeded);
}

/**
 * Count members in a specific state.
 */
export function countByState(members: Membership[], state: MemberState): number {
  return members.filter((m) => m.state === state).length;
}

/**
 * Get all approved members with valid authorizations.
 */
export function getApprovedWithAuth(members: Membership[]): Membership[] {
  return members.filter(
    (m) =>
      m.state === MemberState.APPROVED &&
      (m.authorizationId != null || m.simAuthId != null),
  );
}
