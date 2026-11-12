/**
 * @module tier-pricing
 *
 * Tier-based (volume-discount) pricing logic.
 *
 * A "ladder" is an array of `TierStep` entries sorted by ascending
 * `minBuyers`. As more buyers join, the per-unit price drops. The engine
 * picks the best tier the current member count qualifies for.
 */

// ─── Types ──────────────────────────────────────────────────────────────────

/** One step on a tiered-pricing ladder. */
export interface TierStep {
  /** Human-readable label (e.g. "Tier 1 – Bronze"). */
  readonly label?: string;
  /** Minimum number of buyers required to unlock this tier (inclusive). */
  readonly minBuyers: number;
  /** Per-unit price in **integer cents** at this tier. */
  readonly priceCents: number;
}

// ─── Functions ──────────────────────────────────────────────────────────────

/**
 * Find the best tier the current `memberCount` qualifies for.
 *
 * Returns the tier with the **highest** `minBuyers` that `memberCount`
 * still meets (i.e., the cheapest unlocked tier).
 *
 * @returns The active tier, or `null` if no tier is unlocked yet.
 */
export function findActiveTier(
  ladder: readonly TierStep[],
  memberCount: number,
): TierStep | null {
  let best: TierStep | null = null;

  for (const step of ladder) {
    if (memberCount >= step.minBuyers) {
      if (best === null || step.minBuyers > best.minBuyers) {
        best = step;
      }
    }
  }

  return best;
}

/**
 * Calculate the quorum target: the number of approved members we need
 * before locking the coalition.
 *
 * Formula: `ceil(minBuyers * (1 + safetyMarginPct / 100))`
 *
 * @param tier             The current tier step.
 * @param safetyMarginPct  Safety margin as a percentage (e.g. 10 for 10 %).
 * @returns Quorum target (integer).
 */
export function calculateQuorum(
  tier: TierStep,
  safetyMarginPct: number,
): number {
  return Math.ceil(tier.minBuyers * (1 + safetyMarginPct / 100));
}

/**
 * Validate that a pricing ladder is well-formed.
 *
 * Rules:
 * 1. At least one step.
 * 2. No negative or zero `minBuyers` values.
 * 3. No negative or zero `priceCents` values.
 * 4. When sorted by `minBuyers`, minimums must strictly increase.
 * 5. When sorted by `minBuyers`, prices must strictly decrease.
 *
 * @returns An object with `valid: true` if all rules pass, or `valid: false`
 *          plus an `errors` array describing every violation.
 */
export function isLadderValid(
  ladder: readonly TierStep[],
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Rule 1
  if (ladder.length === 0) {
    errors.push('Ladder must have at least one tier step.');
    return { valid: false, errors };
  }

  // Rules 2 & 3
  for (let i = 0; i < ladder.length; i++) {
    const step = ladder[i]!;
    if (step.minBuyers <= 0) {
      errors.push(
        `Tier "${step.label}" has invalid minBuyers (${step.minBuyers}): must be > 0.`,
      );
    }
    if (step.priceCents <= 0) {
      errors.push(
        `Tier "${step.label}" has invalid priceCents (${step.priceCents}): must be > 0.`,
      );
    }
  }

  // Sort a copy by minBuyers for monotonicity checks
  const sorted = [...ladder].sort((a, b) => a.minBuyers - b.minBuyers);

  // Rules 4 & 5
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]!;
    const curr = sorted[i]!;

    if (curr.minBuyers <= prev.minBuyers) {
      errors.push(
        `Tiers "${prev.label}" and "${curr.label}" have non-increasing minBuyers `
        + `(${prev.minBuyers} → ${curr.minBuyers}).`,
      );
    }

    if (curr.priceCents >= prev.priceCents) {
      errors.push(
        `Tiers "${prev.label}" → "${curr.label}": price must decrease `
        + `(${prev.priceCents} → ${curr.priceCents}).`,
      );
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Project the price curve: for each integer member count from 1 to
 * `maxMembers`, determine the per-unit price.
 *
 * Points where no tier is unlocked yet are omitted from the output.
 *
 * @returns Array of `{ members, priceCents }` for charting.
 */
export function projectPriceCurve(
  ladder: readonly TierStep[],
  maxMembers: number,
): Array<{ members: number; priceCents: number }> {
  const curve: Array<{ members: number; priceCents: number }> = [];

  for (let m = 1; m <= maxMembers; m++) {
    const tier = findActiveTier(ladder, m);
    if (tier) {
      curve.push({ members: m, priceCents: tier.priceCents });
    }
  }

  return curve;
}

/**
 * Check whether the offered group price beats the buyer's
 * Best Alternative To a Negotiated Agreement (BATNA).
 *
 * @param offerPriceCents  The group price being offered.
 * @param batnaPriceCents  The best alternative price the buyer has.
 * @returns `true` if the offer is **strictly better** (cheaper) than the BATNA.
 */
export function isBetterThanBATNA(
  offerPriceCents: number,
  batnaPriceCents: number,
): boolean {
  return offerPriceCents < batnaPriceCents;
}
