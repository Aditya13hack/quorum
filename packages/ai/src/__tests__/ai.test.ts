import { describe, it, expect } from 'vitest';
import { AIClient } from '../gemini-client.js';
import { interpretWish } from '../roles/wish-interpreter.js';
import { generateSellerBids } from '../roles/negotiator.js';
import { checkLadderValidity, checkHonorPct } from '@quorum/guard/src/guard.js';
import { explainEvent } from '../roles/explainer.js';
import { analyzeJoinRisk } from '../roles/risk-analyst.js';

describe('AI Layer - Roles and Safety', () => {
  const client = new AIClient({ mode: 'scripted' });

  it('interprets plain language wish into spec envelope', async () => {
    const res = await interpretWish(client, 'I need a 27 inch 4K monitor under 400 dollars', 40000);
    expect(res.specEnvelope.category).toBe('monitors');
    expect(res.specEnvelope.priceCeilingCents).toBe(40000);
    expect(res.specEnvelope.requiredAttributes.resolution).toBe('4K');
  });

  it('generates seller bids where honest sellers pass guard checks', () => {
    const bids = generateSellerBids(1, 10);
    const alpha = bids.find((b) => b.sellerId === 'seller_alpha')!;
    const ladderVerdict = checkLadderValidity(alpha.ladder);
    const honorVerdict = checkHonorPct(alpha.honorPct);

    expect(ladderVerdict.allowed).toBe(true);
    expect(honorVerdict.allowed).toBe(true);
  });

  it('detects and blocks adversarial Seller Gamma via the Guard', () => {
    const bids = generateSellerBids(1, 10);
    const gamma = bids.find((b) => b.sellerId === 'seller_gamma')!;

    // Seller Gamma has non-decreasing prices (G3) and honorPct 75% < 80% (G4)
    const ladderVerdict = checkLadderValidity(gamma.ladder);
    const honorVerdict = checkHonorPct(gamma.honorPct);

    expect(ladderVerdict.allowed).toBe(false);
    expect(honorVerdict.allowed).toBe(false);
    expect(gamma.notes).toContain('SYSTEM OVERRIDE');
  });

  it('generates plain English explanation messages for key events', async () => {
    const msg = await explainEvent(client, { eventType: 'PRICE_DROPPED', newPriceCents: 31500 });
    expect(msg).toContain('315.00');
  });

  it('risk analyst flags high burst activity', () => {
    const res = analyzeJoinRisk(45, false);
    expect(res.flagged).toBe(true);
    expect(res.anomalyReasons[0]).toContain('High burst');
  });
});
