import { Hono } from 'hono';
import type { AppStore } from '../store.js';
import {
  findActiveTier,
  calculateQuorum,
  projectPriceCurve,
} from '@quorum/engine/src/tier-pricing.js';
import { MemberState, CoalitionState } from '@quorum/shared/src/enums.js';
import type { Membership } from '@quorum/shared/src/types.js';
import { checkSellerNotBuyer, checkRateLimit } from '@quorum/guard/src/guard.js';

export function createCoalitionRouter(store: AppStore) {
  const router = new Hono();

  router.get('/coalitions', (c) => {
    return c.json({ coalitions: Array.from(store.coalitions.values()) });
  });

  router.get('/coalitions/:id', (c) => {
    const id = c.req.param('id');
    const coalition = store.coalitions.get(id);
    if (!coalition) return c.json({ error: 'Coalition not found' }, 404);

    const members = store.memberships.get(id) || [];
    const offers = store.sellerOffers.get(id) || [];
    const product = store.products.get(coalition.productId);

    // Active winning offer (lowest price ladder)
    const winningOffer = offers[0];
    const approvedMembers = members.filter(
      (m) => m.state === MemberState.APPROVED && (m.authorizationId || m.simAuthId),
    );

    const activeTier = winningOffer
      ? findActiveTier(winningOffer.tierLadder, approvedMembers.length)
      : null;

    const currentPriceCents = activeTier
      ? activeTier.priceCents
      : (winningOffer ? winningOffer.tierLadder[0]?.priceCents ?? product?.samplePriceCents ?? 40000 : 40000);

    const priceCurve = winningOffer
      ? projectPriceCurve(winningOffer.tierLadder, 50)
      : [];

    const quorumTarget = winningOffer && activeTier
      ? calculateQuorum(activeTier, coalition.safetyMarginPct)
      : coalition.quorum;

    const soloPriceCents = product?.samplePriceCents || 38900;
    const savingsCents = soloPriceCents - currentPriceCents;
    const savingsPct = Math.round((savingsCents / soloPriceCents) * 100);

    return c.json({
      coalition,
      product,
      members,
      memberCount: members.length,
      approvedCount: approvedMembers.length,
      quorumTarget,
      isQuorumMet: approvedMembers.length >= quorumTarget,
      currentPriceCents,
      soloPriceCents,
      savingsCents,
      savingsPct,
      activeTier,
      offers,
      priceCurve,
    });
  });

  router.post('/coalitions/:id/join', async (c) => {
    const id = c.req.param('id');
    const coalition = store.coalitions.get(id);
    if (!coalition) return c.json({ error: 'Coalition not found' }, 404);

    const body = await c.req.json() as {
      userId: string;
      approvedMaxCents?: number;
      isSimulated?: boolean;
    };

    if (!body.userId) {
      return c.json({ error: 'userId is required' }, 400);
    }

    const members = store.memberships.get(id) || [];
    const existing = members.find((m) => m.userId === body.userId);
    if (existing) {
      return c.json({ message: 'User is already a member', member: existing });
    }

    // Guard G8: Check user is not a seller in this coalition
    const sellerIds = (store.sellerOffers.get(id) || []).map((o) => o.sellerId);
    const sellerVerdict = checkSellerNotBuyer(body.userId, sellerIds);
    if (!sellerVerdict.allowed) {
      return c.json({ error: sellerVerdict.reason }, 403);
    }

    const newMember: Membership = {
      coalitionId: id,
      userId: body.userId,
      isSimulated: body.isSimulated ?? false,
      state: MemberState.INTERESTED,
      approvedMaxCents: body.approvedMaxCents || coalition.specEnvelope.priceCeilingCents,
      timestamps: {
        joinedAt: new Date().toISOString(),
      },
    };

    members.push(newMember);
    store.memberships.set(id, members);

    store.auditLog.push({
      id: `audit_join_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: body.userId,
      actorType: body.isSimulated ? 'ai' : 'member',
      eventType: 'MEMBER_JOINED',
      referenceIds: { coalitionId: id, userId: body.userId },
      summary: `Member ${body.userId} joined coalition ${id}. Limit: ${newMember.approvedMaxCents}¢.`,
      verdict: 'allowed',
    });

    return c.json({ member: newMember });
  });

  return router;
}
