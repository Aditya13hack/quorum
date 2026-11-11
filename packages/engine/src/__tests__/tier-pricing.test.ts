import { describe, it, expect } from 'vitest';
import {
  findActiveTier,
  calculateQuorum,
  isLadderValid,
  projectPriceCurve,
  isBetterThanBATNA,
} from '../tier-pricing.js';

const VALID_LADDER = [
  { label: 'Bronze', minBuyers: 10, priceCents: 35000 },
  { label: 'Silver', minBuyers: 20, priceCents: 32000 },
  { label: 'Gold',   minBuyers: 40, priceCents: 29000 },
];

describe('findActiveTier', () => {
  it('returns null when no tier is unlocked', () => {
    expect(findActiveTier(VALID_LADDER, 5)).toBeNull();
  });

  it('returns the first tier when exactly at minBuyers', () => {
    const tier = findActiveTier(VALID_LADDER, 10);
    expect(tier?.label).toBe('Bronze');
    expect(tier?.priceCents).toBe(35000);
  });

  it('returns higher tier when enough members', () => {
    const tier = findActiveTier(VALID_LADDER, 25);
    expect(tier?.label).toBe('Silver');
  });

  it('returns highest tier when all tiers unlocked', () => {
    const tier = findActiveTier(VALID_LADDER, 50);
    expect(tier?.label).toBe('Gold');
    expect(tier?.priceCents).toBe(29000);
  });

  it('works with exactly one tier', () => {
    const single = [{ label: 'Only', minBuyers: 5, priceCents: 10000 }];
    expect(findActiveTier(single, 5)?.label).toBe('Only');
    expect(findActiveTier(single, 4)).toBeNull();
  });
});

describe('calculateQuorum', () => {
  it('adds safety margin (10%)', () => {
    const tier = { label: 'T', minBuyers: 20, priceCents: 30000 };
    expect(calculateQuorum(tier, 10)).toBe(22); // ceil(20 * 1.1) = 22
  });

  it('rounds up with safety margin', () => {
    const tier = { label: 'T', minBuyers: 15, priceCents: 30000 };
    expect(calculateQuorum(tier, 10)).toBe(17); // ceil(15 * 1.1) = ceil(16.5) = 17
  });

  it('handles 0% safety margin', () => {
    const tier = { label: 'T', minBuyers: 20, priceCents: 30000 };
    expect(calculateQuorum(tier, 0)).toBe(20);
  });
});

describe('isLadderValid', () => {
  it('accepts a valid ladder', () => {
    expect(isLadderValid(VALID_LADDER).valid).toBe(true);
  });

  it('rejects empty ladder', () => {
    const result = isLadderValid([]);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('rejects zero minBuyers', () => {
    const bad = [{ label: 'T', minBuyers: 0, priceCents: 1000 }];
    expect(isLadderValid(bad).valid).toBe(false);
  });

  it('rejects negative priceCents', () => {
    const bad = [{ label: 'T', minBuyers: 10, priceCents: -100 }];
    expect(isLadderValid(bad).valid).toBe(false);
  });

  it('rejects non-decreasing prices', () => {
    const bad = [
      { label: 'A', minBuyers: 10, priceCents: 1000 },
      { label: 'B', minBuyers: 20, priceCents: 1000 }, // same price
    ];
    expect(isLadderValid(bad).valid).toBe(false);
  });

  it('rejects non-increasing minBuyers', () => {
    const bad = [
      { label: 'A', minBuyers: 20, priceCents: 2000 },
      { label: 'B', minBuyers: 20, priceCents: 1000 }, // same minBuyers
    ];
    expect(isLadderValid(bad).valid).toBe(false);
  });
});

describe('projectPriceCurve', () => {
  it('returns empty for no members', () => {
    expect(projectPriceCurve(VALID_LADDER, 0)).toEqual([]);
  });

  it('returns correct step-function curve', () => {
    const curve = projectPriceCurve(VALID_LADDER, 25);
    // 1-9: no tier (omitted), 10-19: Bronze, 20-25: Silver
    expect(curve.length).toBe(16); // 10..25
    expect(curve[0]?.priceCents).toBe(35000); // member 10, Bronze
    expect(curve[10]?.priceCents).toBe(32000); // member 20, Silver
  });
});

describe('isBetterThanBATNA', () => {
  it('returns true when offer < BATNA', () => {
    expect(isBetterThanBATNA(29000, 35000)).toBe(true);
  });

  it('returns false when offer = BATNA', () => {
    expect(isBetterThanBATNA(35000, 35000)).toBe(false);
  });

  it('returns false when offer > BATNA', () => {
    expect(isBetterThanBATNA(40000, 35000)).toBe(false);
  });
});
