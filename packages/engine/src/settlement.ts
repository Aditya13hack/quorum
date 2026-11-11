/**
 * @module settlement
 * Settlement/capture planning logic.
 * Pure functions — no network, no side effects.
 */

import type { Membership, TierStep, LedgerEntry } from '@quorum/shared/src/types.js';
import { MemberState } from '@quorum/shared/src/enums.js';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CaptureInstruction {
  memberId: string;
  authorizationId: string;
  amountCents: number;
  isPartialCapture: boolean;
}

export interface CapturePlan {
  captures: CaptureInstruction[];
  waitlistPromotions: string[];
  totalCaptureCents: number;
}

export interface AbortPlan {
  refundCaptureIds: string[];
  voidAuthorizationIds: string[];
}

// ─── Functions ──────────────────────────────────────────────────────────────

/**
 * Create a capture plan from the locked coalition state.
 *
 * Each approved member is captured at `finalPriceCents`. If `finalPriceCents`
 * is less than a member's `approvedMaxCents`, it's a partial capture.
 */
export function createCapturePlan(
  members: Membership[],
  finalPriceCents: number,
): CapturePlan {
  const approved = members.filter(
    (m) => m.state === MemberState.APPROVED && (m.authorizationId || m.simAuthId),
  );

  const captures: CaptureInstruction[] = approved.map((m) => ({
    memberId: m.userId,
    authorizationId: (m.authorizationId || m.simAuthId)!,
    amountCents: finalPriceCents,
    isPartialCapture: finalPriceCents < (m.approvedMaxCents ?? finalPriceCents),
  }));

  return {
    captures,
    waitlistPromotions: [],
    totalCaptureCents: captures.reduce((sum, c) => sum + c.amountCents, 0),
  };
}

/**
 * Handle a failed capture by promoting from the waiting list.
 * Returns a new plan with the failed member removed and a waitlist
 * member promoted (if available).
 */
export function handleFailedCapture(
  currentPlan: CapturePlan,
  failedMemberId: string,
  waitlist: Membership[],
  finalPriceCents: number,
): CapturePlan {
  // Remove the failed capture
  const remainingCaptures = currentPlan.captures.filter(
    (c) => c.memberId !== failedMemberId,
  );

  const promotions = [...currentPlan.waitlistPromotions];

  // Try to promote from waitlist
  const sortedWaitlist = [...waitlist]
    .filter((m) => m.state === MemberState.WAITLISTED && (m.authorizationId || m.simAuthId))
    .sort((a, b) => (a.waitlistPosition ?? 999) - (b.waitlistPosition ?? 999));

  if (sortedWaitlist.length > 0) {
    const promoted = sortedWaitlist[0]!;
    remainingCaptures.push({
      memberId: promoted.userId,
      authorizationId: (promoted.authorizationId || promoted.simAuthId)!,
      amountCents: finalPriceCents,
      isPartialCapture: finalPriceCents < (promoted.approvedMaxCents ?? finalPriceCents),
    });
    promotions.push(promoted.userId);
  }

  return {
    captures: remainingCaptures,
    waitlistPromotions: promotions,
    totalCaptureCents: remainingCaptures.reduce((sum, c) => sum + c.amountCents, 0),
  };
}

/**
 * Determine whether the coalition should abort capture.
 *
 * Abort if: successful captures < tier.minBuyers * (honorPct / 100)
 */
export function shouldAbort(
  successfulCaptureCount: number,
  tierMinBuyers: number,
  honorPct: number,
): boolean {
  const minimumHonor = Math.ceil(tierMinBuyers * (honorPct / 100));
  return successfulCaptureCount < minimumHonor;
}

/**
 * Create an abort plan: refund all completed captures and void all
 * remaining authorizations.
 */
export function createAbortPlan(
  capturedIds: string[],
  openAuthorizationIds: string[],
): AbortPlan {
  return {
    refundCaptureIds: [...capturedIds],
    voidAuthorizationIds: [...openAuthorizationIds],
  };
}
