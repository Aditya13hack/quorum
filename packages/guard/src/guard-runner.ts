/**
 * @module guard-runner
 * Runs multiple guard checks and returns combined results.
 */

import type { GuardVerdict } from './types.js';
import {
  checkPriceLimit,
  checkSpecFit,
  checkLadderValidity,
  checkHonorPct,
  checkNotesDoNotAlterFields,
  checkUniquePayerInCoalition,
  checkSellerNotBuyer,
  checkRateLimit,
  checkValidAuthorization,
  checkCapturePlan,
} from './guard.js';
import type { CapturePlan } from './types.js';

/**
 * Run all offer-related guard checks.
 */
export function runOfferGuard(
  offer: {
    priceCents: number;
    ladder: Array<{ minBuyers: number; priceCents: number }>;
    honorPct: number;
    product: { category: string; attributes: Record<string, string>; priceCents: number };
    originalOffer: Record<string, unknown>;
    processedOffer: Record<string, unknown>;
  },
  memberLimits: Array<{ approvedMaxCents: number }>,
  spec: { category: string; requiredAttributes: string[]; maxPriceCents: number },
  walkawayPriceCents?: number,
): GuardVerdict[] {
  const verdicts: GuardVerdict[] = [];

  // G1 — check price against each member's limit
  for (const member of memberLimits) {
    verdicts.push(checkPriceLimit(offer.priceCents, member.approvedMaxCents));
  }

  // G2 — spec fit
  verdicts.push(checkSpecFit(offer.product, spec));

  // G3 — ladder validity
  verdicts.push(checkLadderValidity(offer.ladder, walkawayPriceCents));

  // G4 — honor percentage
  verdicts.push(checkHonorPct(offer.honorPct));

  // G5 — notes don't alter fields
  verdicts.push(checkNotesDoNotAlterFields(offer.originalOffer, offer.processedOffer));

  return verdicts;
}

/**
 * Run all join-related guard checks.
 */
export function runJoinGuard(
  userId: string,
  payerId: string,
  existingPayerIds: string[],
  sellerIds: string[],
  rateCount: number,
  rateLimit: number,
): GuardVerdict[] {
  return [
    checkUniquePayerInCoalition(payerId, existingPayerIds),
    checkSellerNotBuyer(userId, sellerIds),
    checkRateLimit(payerId, rateCount, rateLimit),
  ];
}

/**
 * Run all capture-related guard checks.
 */
export function runCaptureGuard(
  aiPlan: CapturePlan,
  enginePlan: CapturePlan,
  members: Array<{ authorizationId: string | null; simAuthorizationId: string | null }>,
): GuardVerdict[] {
  const verdicts: GuardVerdict[] = [];

  // G6 — every member in the plan has a valid authorization
  for (const member of members) {
    verdicts.push(checkValidAuthorization(member));
  }

  // G10 — capture plan matches engine
  verdicts.push(checkCapturePlan(aiPlan, enginePlan));

  return verdicts;
}

/**
 * Check if any verdict is blocked.
 */
export function hasBlocked(verdicts: GuardVerdict[]): boolean {
  return verdicts.some((v) => !v.allowed);
}

/**
 * Get all block reasons.
 */
export function getBlockReasons(verdicts: GuardVerdict[]): string[] {
  return verdicts.filter((v) => !v.allowed).map((v) => `[${v.rule}] ${v.reason}`);
}
