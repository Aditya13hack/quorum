/**
 * @module guard
 * Deterministic rules engine — NO AI, NO network.
 * Validates every AI proposal and every money action.
 */

import type { GuardVerdict, CapturePlan, CaptureInstruction } from './types.js';
import { MIN_HONOR_PCT, MAX_HONOR_PCT } from '@quorum/shared/src/constants.js';

// ─── G1: Price limit check ──────────────────────────────────────────

export function checkPriceLimit(
  offerPriceCents: number,
  memberApprovedMaxCents: number,
): GuardVerdict {
  const allowed = offerPriceCents <= memberApprovedMaxCents;
  return {
    rule: 'G1',
    allowed,
    reason: allowed
      ? `Price ${offerPriceCents}¢ is within member limit of ${memberApprovedMaxCents}¢.`
      : `Price ${offerPriceCents}¢ exceeds member limit of ${memberApprovedMaxCents}¢.`,
    context: { offerPriceCents, memberApprovedMaxCents },
  };
}

// ─── G2: Spec fit ───────────────────────────────────────────────────

export function checkSpecFit(
  product: { category: string; attributes: Record<string, string>; priceCents: number },
  spec: { category: string; requiredAttributes: string[]; maxPriceCents: number },
): GuardVerdict {
  if (product.category !== spec.category) {
    return {
      rule: 'G2',
      allowed: false,
      reason: `Category mismatch: product is "${product.category}", spec requires "${spec.category}".`,
      context: { productCategory: product.category, specCategory: spec.category },
    };
  }

  for (const attr of spec.requiredAttributes) {
    if (!(attr in product.attributes)) {
      return {
        rule: 'G2',
        allowed: false,
        reason: `Missing required attribute: "${attr}".`,
        context: { missingAttribute: attr },
      };
    }
  }

  if (product.priceCents > spec.maxPriceCents) {
    return {
      rule: 'G2',
      allowed: false,
      reason: `Product price ${product.priceCents}¢ exceeds spec ceiling of ${spec.maxPriceCents}¢.`,
      context: { productPrice: product.priceCents, specCeiling: spec.maxPriceCents },
    };
  }

  return { rule: 'G2', allowed: true, reason: 'Product fits spec envelope.' };
}

// ─── G3: Ladder validity ────────────────────────────────────────────

export function checkLadderValidity(
  ladder: Array<{ minBuyers: number; priceCents: number }>,
  walkawayPriceCents?: number,
): GuardVerdict {
  if (ladder.length === 0) {
    return { rule: 'G3', allowed: false, reason: 'Ladder must have at least one tier.' };
  }

  for (let i = 0; i < ladder.length; i++) {
    const step = ladder[i]!;
    if (step.minBuyers <= 0) {
      return { rule: 'G3', allowed: false, reason: `Tier ${i}: minBuyers must be > 0, got ${step.minBuyers}.` };
    }
    if (step.priceCents <= 0) {
      return { rule: 'G3', allowed: false, reason: `Tier ${i}: priceCents must be > 0, got ${step.priceCents}.` };
    }
  }

  const sorted = [...ladder].sort((a, b) => a.minBuyers - b.minBuyers);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i]!.minBuyers <= sorted[i - 1]!.minBuyers) {
      return { rule: 'G3', allowed: false, reason: `Non-increasing minBuyers: ${sorted[i - 1]!.minBuyers} → ${sorted[i]!.minBuyers}.` };
    }
    if (sorted[i]!.priceCents >= sorted[i - 1]!.priceCents) {
      return { rule: 'G3', allowed: false, reason: `Non-decreasing prices: ${sorted[i - 1]!.priceCents}¢ → ${sorted[i]!.priceCents}¢.` };
    }
  }

  if (walkawayPriceCents != null) {
    const maxPrice = sorted[0]!.priceCents;
    if (maxPrice > walkawayPriceCents * 10) {
      return { rule: 'G3', allowed: false, reason: `Tier price ${maxPrice}¢ exceeds 10x walkaway price ${walkawayPriceCents}¢.` };
    }
  }

  return { rule: 'G3', allowed: true, reason: 'Tier ladder is well-formed.' };
}

// ─── G4: Honor percentage ───────────────────────────────────────────

export function checkHonorPct(honorPct: number): GuardVerdict {
  const allowed = honorPct >= MIN_HONOR_PCT && honorPct <= MAX_HONOR_PCT;
  return {
    rule: 'G4',
    allowed,
    reason: allowed
      ? `Honor percentage ${honorPct}% is within range [${MIN_HONOR_PCT}%, ${MAX_HONOR_PCT}%].`
      : `Honor percentage ${honorPct}% is outside allowed range [${MIN_HONOR_PCT}%, ${MAX_HONOR_PCT}%].`,
    context: { honorPct, min: MIN_HONOR_PCT, max: MAX_HONOR_PCT },
  };
}

// ─── G5: Structured fields only ─────────────────────────────────────

export function checkNotesDoNotAlterFields(
  original: Record<string, unknown>,
  afterAI: Record<string, unknown>,
  notesFieldName = 'notes',
): GuardVerdict {
  for (const key of Object.keys(original)) {
    if (key === notesFieldName) continue;
    const origVal = JSON.stringify(original[key]);
    const newVal = JSON.stringify(afterAI[key]);
    if (origVal !== newVal) {
      return {
        rule: 'G5',
        allowed: false,
        reason: `Structured field "${key}" was altered by AI processing (${origVal} → ${newVal}). Only "${notesFieldName}" may change.`,
        context: { field: key, original: original[key], modified: afterAI[key] },
      };
    }
  }
  return { rule: 'G5', allowed: true, reason: 'No structured fields were altered.' };
}

// ─── G6: Valid authorization ────────────────────────────────────────

export function checkValidAuthorization(member: {
  authorizationId: string | null;
  simAuthorizationId: string | null;
}): GuardVerdict {
  const hasAuth = member.authorizationId != null || member.simAuthorizationId != null;
  return {
    rule: 'G6',
    allowed: hasAuth,
    reason: hasAuth
      ? 'Member has a valid authorization.'
      : 'Member has no valid authorization — cannot count toward quorum.',
  };
}

// ─── G7: One account per coalition ──────────────────────────────────

export function checkUniquePayerInCoalition(
  payerId: string,
  existingPayerIds: string[],
): GuardVerdict {
  const isDuplicate = existingPayerIds.includes(payerId);
  return {
    rule: 'G7',
    allowed: !isDuplicate,
    reason: isDuplicate
      ? `Payer "${payerId}" already exists in this coalition.`
      : 'Payer is unique in this coalition.',
  };
}

// ─── G8: Seller not buyer ───────────────────────────────────────────

export function checkSellerNotBuyer(
  userId: string,
  sellerIds: string[],
): GuardVerdict {
  const isSeller = sellerIds.includes(userId);
  return {
    rule: 'G8',
    allowed: !isSeller,
    reason: isSeller
      ? `User "${userId}" is a seller in this coalition and cannot join as a buyer.`
      : 'User is not a seller in this coalition.',
  };
}

// ─── G9: State transition ───────────────────────────────────────────

export function checkStateTransition(
  allowedTransitions: Record<string, readonly string[]>,
  from: string,
  to: string,
): GuardVerdict {
  const allowed = allowedTransitions[from];
  if (!allowed) {
    return { rule: 'G9', allowed: false, reason: `Unknown state: "${from}".` };
  }
  const valid = allowed.includes(to);
  return {
    rule: 'G9',
    allowed: valid,
    reason: valid
      ? `Transition ${from} → ${to} is valid.`
      : `Transition ${from} → ${to} is not allowed. Valid targets: ${allowed.join(', ') || '(none — terminal state)'}.`,
  };
}

// ─── G10: Capture plan validation ───────────────────────────────────

export function checkCapturePlan(
  aiPlan: CapturePlan,
  enginePlan: CapturePlan,
): GuardVerdict {
  // Same total
  if (aiPlan.totalCents !== enginePlan.totalCents) {
    return {
      rule: 'G10',
      allowed: false,
      reason: `Capture plan total mismatch: AI=${aiPlan.totalCents}¢ vs engine=${enginePlan.totalCents}¢.`,
    };
  }

  // Same members and amounts (order may differ)
  const aiMap = new Map(aiPlan.instructions.map((i) => [i.memberId, i.amountCents]));
  const engineMap = new Map(enginePlan.instructions.map((i) => [i.memberId, i.amountCents]));

  if (aiMap.size !== engineMap.size) {
    return {
      rule: 'G10',
      allowed: false,
      reason: `Capture plan member count mismatch: AI=${aiMap.size} vs engine=${engineMap.size}.`,
    };
  }

  for (const [memberId, amount] of aiMap) {
    const engineAmount = engineMap.get(memberId);
    if (engineAmount === undefined) {
      return {
        rule: 'G10',
        allowed: false,
        reason: `AI plan includes member "${memberId}" not in engine plan.`,
      };
    }
    if (amount !== engineAmount) {
      return {
        rule: 'G10',
        allowed: false,
        reason: `Amount mismatch for member "${memberId}": AI=${amount}¢ vs engine=${engineAmount}¢.`,
      };
    }
  }

  return { rule: 'G10', allowed: true, reason: 'Capture plan matches engine computation.' };
}

// ─── G11: Rate limit ────────────────────────────────────────────────

export function checkRateLimit(
  key: string,
  count: number,
  limit: number,
): GuardVerdict {
  const allowed = count < limit;
  return {
    rule: 'G11',
    allowed,
    reason: allowed
      ? `Rate limit OK for "${key}": ${count}/${limit}.`
      : `Rate limit exceeded for "${key}": ${count} >= ${limit}.`,
    context: { key, count, limit },
  };
}

// ─── G12: Audit entry creator ───────────────────────────────────────

export function createAuditEntry(
  verdict: GuardVerdict,
  actor: string,
  eventType: string,
) {
  return {
    timestamp: new Date().toISOString(),
    verdict,
    actor,
    eventType,
  };
}
