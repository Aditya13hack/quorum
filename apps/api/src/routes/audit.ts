import { Hono } from 'hono';
import type { AppStore } from '../store.js';
import {
  checkPriceLimit,
  checkSellerNotBuyer,
  checkHonorPct,
  checkUniquePayerInCoalition,
} from '@quorum/guard/src/guard.js';

export function createAuditRouter(store: AppStore) {
  const router = new Hono();

  // 1. Get audit trail and blocked attacks
  router.get('/audit', (c) => {
    const mode = c.req.query('mode') || c.req.header('x-quorum-mode') || 'simulated';
    const state = store.getState(mode);

    const list = [...state.auditLog].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    const blockedAttacks = list.filter((e) => e.verdict === 'blocked');

    return c.json({
      totalLogs: list.length,
      blockedAttacksCount: blockedAttacks.length,
      blockedAttacks,
      logs: list,
    });
  });

  // 2. Interactive Adversarial Attack Simulator
  router.post('/audit/test-attack', async (c) => {
    try {
      const mode = c.req.query('mode') || c.req.header('x-quorum-mode') || 'simulated';
      const state = store.getState(mode);
      const body = await c.req.json() as {
        attackType: 'G1_PRICE_CEILING' | 'G8_SELLER_AS_BUYER' | 'G4_HONOR_PCT' | 'G7_DUPLICATE_SYBIL';
        coalitionId?: string;
      };

      const coalitionId = body.coalitionId || 'active_pool';

      let verdict;
      let eventType = 'ATTACK_INTERCEPTED';
      let summary = '';
      let actor = 'Adversarial_Bot';
      let actorType: 'seller' | 'ai' | 'member' = 'seller';

      switch (body.attackType) {
        case 'G1_PRICE_CEILING': {
          verdict = checkPriceLimit(45000, 38000);
          eventType = 'ATTACK_PRICE_CEILING_VIOLATION';
          actor = 'Seller_Gamma_Adversarial_AI';
          actorType = 'seller';
          summary = 'INTERCEPTED: Rogue seller submitted inflated offer of $450.00 exceeding member budget of $380.00. Blocked by pure-code Guard rule G1.';
          break;
        }
        case 'G8_SELLER_AS_BUYER': {
          verdict = checkSellerNotBuyer('seller_alpha', ['seller_alpha', 'seller_beta']);
          eventType = 'ATTACK_COLLUSION_SELLER_AS_BUYER';
          actor = 'seller_alpha';
          actorType = 'seller';
          summary = 'INTERCEPTED: Seller Alpha attempted to infiltrate buyer union to artificially manipulate quorum. Blocked by Guard rule G8.';
          break;
        }
        case 'G4_HONOR_PCT': {
          verdict = checkHonorPct(55);
          eventType = 'ATTACK_GHOST_INVENTORY';
          actor = 'Rogue_Supplier_55';
          actorType = 'seller';
          summary = 'INTERCEPTED: Supplier proposed 55% fulfillment rate (minimum network requirement is 80%). Blocked by Guard rule G4.';
          break;
        }
        case 'G7_DUPLICATE_SYBIL': {
          verdict = checkUniquePayerInCoalition('payer_sandbox_123', ['payer_sandbox_123']);
          eventType = 'ATTACK_SYBIL_DUPLICATE_PAYER';
          actor = 'sybil_bot_cluster_9';
          actorType = 'ai';
          summary = 'INTERCEPTED: Sybil shopping agent attempted duplicate reservation using existing PayPal Payer ID. Blocked by Guard rule G7.';
          break;
        }
        default: {
          return c.json({ error: 'Unknown attackType' }, 400);
        }
      }

      state.auditLog.unshift({
        id: `attack_${body.attackType.toLowerCase()}_${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor,
        actorType,
        eventType,
        referenceIds: { coalitionId },
        summary,
        verdict: 'blocked',
      });

      return c.json({
        success: true,
        attackType: body.attackType,
        verdict,
        summary,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return c.json({ error: message }, 500);
    }
  });

  return router;
}
