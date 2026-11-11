import { Hono } from 'hono';
import type { AppStore } from '../store.js';
import { seedStore } from '../store.js';
import { MemberState, CoalitionState, LedgerEntryType } from '@quorum/shared/src/enums.js';
import type { Membership } from '@quorum/shared/src/types.js';
import { generateSellerBids } from '@quorum/ai/src/roles/negotiator.js';
import { checkLadderValidity, checkHonorPct } from '@quorum/guard/src/guard.js';

export function createScenarioRouter(store: AppStore) {
  const router = new Hono();

  // Reset demo
  router.post('/reset', (c) => {
    seedStore(store);
    return c.json({ success: true, message: 'Demo scenario reset to initial state.' });
  });

  // Step through scenario
  router.post('/step', async (c) => {
    const body = await c.req.json() as { step: number; coalitionId?: string };
    const coalitionId = body.coalitionId || 'coalition_monitor_demo';
    const coalition = store.coalitions.get(coalitionId);
    if (!coalition) return c.json({ error: 'Coalition not found' }, 404);

    const members = store.memberships.get(coalitionId) || [];

    switch (body.step) {
      case 1: {
        // Step 1: Wish formulated and interpreted
        return c.json({
          step: 1,
          title: 'Wish & Spec Envelope Created',
          description: 'AI interpreted the shopper wish: "27-inch 4K IPS monitor under $400". Formed open coalition.',
          currentMembers: members.length,
          coalitionState: coalition.state,
        });
      }

      case 2: {
        // Step 2: Burst of new buyers join coalition
        for (let i = 16; i <= 24; i++) {
          if (!members.find((m) => m.userId === `sim_buyer_${i}`)) {
            const m: Membership = {
              coalitionId,
              userId: `sim_buyer_${i}`,
              isSimulated: true,
              state: MemberState.APPROVED,
              approvedMaxCents: 38000,
              simAuthId: `SIM-AUTH-BURST-${i}`,
              timestamps: { joinedAt: new Date().toISOString() },
            };
            members.push(m);
            store.ledger.push({
              id: `led_burst_${i}`,
              coalitionId,
              memberId: `sim_buyer_${i}`,
              type: LedgerEntryType.RESERVED,
              amountCents: 31500,
              provider: 'SIMULATED',
              referenceId: `SIM-AUTH-BURST-${i}`,
              createdAt: new Date().toISOString(),
            });
          }
        }
        store.memberships.set(coalitionId, members);

        return c.json({
          step: 2,
          title: 'Buyer Coalition Expands to 24 Members',
          description: 'Buyer agents joined in volume. Tier 2 unlocked: price drops to $315 (saving $74/unit)!',
          currentMembers: members.length,
          unlockedPriceCents: 31500,
        });
      }

      case 3: {
        // Step 3: Negotiation & Malicious Seller Gamma blocked
        const bids = generateSellerBids(2, members.length);
        const gamma = bids.find((b) => b.sellerId === 'seller_gamma')!;

        // Guard blocks Gamma
        const g3 = checkLadderValidity(gamma.ladder);
        const g4 = checkHonorPct(gamma.honorPct);

        store.auditLog.push({
          id: `audit_gamma_blocked_${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'seller_gamma',
          actorType: 'seller',
          eventType: 'ADVERSARIAL_BID_BLOCKED',
          referenceIds: { coalitionId, sellerId: 'seller_gamma' },
          summary: `🛡️ Guard blocked Seller Gamma. Violations: [G3] Non-decreasing price ladder, [G4] Honor percentage ${gamma.honorPct}% < 80%. Attempted Prompt Injection: "${gamma.notes}"`,
          verdict: 'blocked',
        });

        return c.json({
          step: 3,
          title: 'Adversarial Prompt Injection Blocked by Guard',
          description: 'Seller Gamma attempted to inject malicious prompt instructions and submit non-decreasing prices. Deterministic Guard G3/G4 blocked it immediately.',
          blockedSeller: gamma.sellerName,
          guardVerdicts: [g3, g4],
        });
      }

      case 4: {
        // Step 4: Real PayPal Sandbox Approval
        return c.json({
          step: 4,
          title: 'Buyer Approval & Safe Reservation',
          description: 'Shopper reviews final offer card ($315) and authorizes via PayPal Sandbox. Funds reserved safely with PayPal authorization hold.',
        });
      }

      case 5: {
        // Step 5: Quorum lock & waiting list healing demo
        coalition.state = CoalitionState.LOCKED;

        // Simulate 1 failed capture that is healed by waitlist
        const waitlistMember: Membership = {
          coalitionId,
          userId: 'waitlist_backup_buyer_1',
          isSimulated: true,
          state: MemberState.WAITLISTED,
          approvedMaxCents: 35000,
          simAuthId: 'SIM-AUTH-WAITLIST-1',
          waitlistPosition: 0,
          timestamps: { joinedAt: new Date().toISOString() },
        };
        members.push(waitlistMember);

        // Inject capture failure for sim_buyer_1
        store.simulatedProvider.injectFailure('SIM-AUTH-INIT-1', 'capture');

        // Execute heal: replace sim_buyer_1 with waitlistMember
        waitlistMember.state = MemberState.APPROVED;

        store.auditLog.push({
          id: `audit_heal_${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'SettlementEngine',
          actorType: 'system',
          eventType: 'WAITLIST_HEAL_PROMOTION',
          referenceIds: { failedMember: 'sim_buyer_1', promotedMember: waitlistMember.userId },
          summary: 'sim_buyer_1 capture failed (risk/insufficient balance simulation). Autonomous waiting list promoted waitlist_backup_buyer_1 to maintain volume tier.',
          verdict: 'allowed',
        });

        return c.json({
          step: 5,
          title: 'Quorum Locked & Waiting List Auto-Healing',
          description: 'sim_buyer_1 capture simulated failure. The autonomous waiting list immediately promoted waitlist_backup_buyer_1, keeping the coalition whole.',
          healed: true,
          promotedMember: waitlistMember.userId,
        });
      }

      case 6: {
        // Step 6: Fulfillment & staged payouts
        coalition.state = CoalitionState.SETTLED;

        store.auditLog.push({
          id: `audit_settle_${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'SystemEngine',
          actorType: 'system',
          eventType: 'COALITION_FULLY_SETTLED',
          referenceIds: { coalitionId },
          summary: 'All units delivered. Staged payout 2 (50%) sent to supplier. Full ledger reconciled with 0 discrepancy.',
          verdict: 'allowed',
        });

        return c.json({
          step: 6,
          title: 'Fulfillment & Final Settlement Complete',
          description: 'Tracked shipment completed. Final supplier payout issued. Ledger fully reconciles.',
          coalitionState: CoalitionState.SETTLED,
        });
      }

      default:
        return c.json({ error: 'Invalid step' }, 400);
    }
  });

  return router;
}
