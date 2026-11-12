import { Hono } from 'hono';
import type { AppStore, DataState } from '../store.js';
import {
  findActiveTier,
  calculateQuorum,
  projectPriceCurve,
} from '@quorum/engine/src/tier-pricing.js';
import { MemberState, CoalitionState, OfferStatus } from '@quorum/shared/src/enums.js';
import type { Membership, Coalition, Product, SellerOffer } from '@quorum/shared/src/types.js';
import { checkSellerNotBuyer } from '@quorum/guard/src/guard.js';

export function createCoalitionRouter(store: AppStore) {
  const router = new Hono();

  // Helper to compute coalition metrics using given state
  function getCoalitionSummary(coalition: Coalition, state: DataState) {
    const id = coalition.id;
    const members = state.memberships.get(id) || [];
    const offers = state.sellerOffers.get(id) || [];
    const product = state.products.get(coalition.productId);

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

    const soloPriceCents = product?.samplePriceCents || coalition.specEnvelope.priceCeilingCents || 40000;
    const savingsCents = Math.max(0, soloPriceCents - currentPriceCents);
    const savingsPct = soloPriceCents > 0 ? Math.round((savingsCents / soloPriceCents) * 100) : 0;

    const quorumTarget = winningOffer && activeTier
      ? calculateQuorum(activeTier, coalition.safetyMarginPct)
      : coalition.quorum;

    return {
      id: coalition.id,
      name: product?.name || coalition.specEnvelope.category || 'Buyer Coalition',
      category: coalition.specEnvelope.category,
      state: coalition.state,
      memberCount: members.length,
      approvedCount: approvedMembers.length,
      quorumTarget,
      isQuorumMet: approvedMembers.length >= quorumTarget,
      currentPriceCents,
      soloPriceCents,
      savingsCents,
      savingsPct,
      deadlineMs: coalition.deadlineMs,
      timeRemainingHours: Math.max(0, Math.round((coalition.deadlineMs - Date.now()) / (3600 * 1000))),
      product,
    };
  }

  // 1. List active coalitions (mode-aware)
  router.get('/coalitions', (c) => {
    const mode = c.req.query('mode') || c.req.header('x-quorum-mode') || 'simulated';
    const state = store.getState(mode);
    const summaries = Array.from(state.coalitions.values()).map((coal) => getCoalitionSummary(coal, state));
    return c.json({ coalitions: summaries });
  });

  // 2. Get specific coalition room details (mode-aware)
  router.get('/coalitions/:id', (c) => {
    const id = c.req.param('id');
    const mode = c.req.query('mode') || c.req.header('x-quorum-mode') || 'simulated';
    const state = store.getState(mode);

    const coalition = state.coalitions.get(id);
    if (!coalition) return c.json({ error: 'Coalition not found' }, 404);

    const members = state.memberships.get(id) || [];
    const offers = state.sellerOffers.get(id) || [];
    const product = state.products.get(coalition.productId);

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

    const soloPriceCents = product?.samplePriceCents || coalition.specEnvelope.priceCeilingCents || 40000;
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

  // 3. Create a brand new coalition dynamically
  router.post('/coalitions', async (c) => {
    try {
      const mode = c.req.query('mode') || c.req.header('x-quorum-mode') || 'simulated';
      const state = store.getState(mode);

      const body = await c.req.json() as {
        name: string;
        category?: string;
        priceCeilingCents: number;
        deadlineHours?: number;
        requiredAttributes?: Record<string, string>;
        creatorUserId?: string;
      };

      if (!body.name || !body.priceCeilingCents) {
        return c.json({ error: 'Name and priceCeilingCents are required' }, 400);
      }

      const category = body.category || 'general';
      const coalitionId = `coalition_${category}_${Date.now()}`;
      const productId = `prod_${category}_${Date.now()}`;

      // Create product
      const product: Product = {
        id: productId,
        name: body.name,
        category,
        attributes: body.requiredAttributes || {},
        samplePriceCents: Math.round(body.priceCeilingCents * 1.05),
        priceSource: 'sample',
      };
      state.products.set(productId, product);

      // Create coalition
      const deadlineMs = Date.now() + (body.deadlineHours || 72) * 3600 * 1000;
      const coalition: Coalition = {
        id: coalitionId,
        productId,
        specEnvelope: {
          category,
          requiredAttributes: body.requiredAttributes || {},
          priceCeilingCents: body.priceCeilingCents,
          deadlineMs,
        },
        state: CoalitionState.COLLECTING,
        quorum: 10,
        safetyMarginPct: 10,
        deadlineMs,
        timeScale: store.timeScale,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.coalitions.set(coalitionId, coalition);

      // Competitive seller tier ladders
      const ceiling = body.priceCeilingCents;
      const alphaOffer: SellerOffer = {
        id: `offer_alpha_${Date.now()}`,
        sellerId: 'seller_alpha',
        coalitionId,
        productId,
        tierLadder: [
          { minBuyers: 5, priceCents: Math.round(ceiling * 0.95) },
          { minBuyers: 10, priceCents: Math.round(ceiling * 0.88) },
          { minBuyers: 25, priceCents: Math.round(ceiling * 0.80) },
        ],
        honorPct: 92,
        deliveryDays: 5,
        hiddenFloorCents: Math.round(ceiling * 0.75),
        notes: `Alpha Tech Supply wholesale volume batch for ${body.name}. Standard shipping included.`,
        status: OfferStatus.ACTIVE,
      };

      const betaOffer: SellerOffer = {
        id: `offer_beta_${Date.now()}`,
        sellerId: 'seller_beta',
        coalitionId,
        productId,
        tierLadder: [
          { minBuyers: 3, priceCents: Math.round(ceiling * 0.97) },
          { minBuyers: 10, priceCents: Math.round(ceiling * 0.90) },
          { minBuyers: 20, priceCents: Math.round(ceiling * 0.84) },
        ],
        honorPct: 96,
        deliveryDays: 2,
        hiddenFloorCents: Math.round(ceiling * 0.78),
        notes: `Beta Express Logistics direct supply with expedited 2-day delivery.`,
        status: OfferStatus.ACTIVE,
      };

      state.sellerOffers.set(coalitionId, [alphaOffer, betaOffer]);

      // Seed creator member
      const initialMember: Membership = {
        coalitionId,
        userId: body.creatorUserId || `buyer_${Math.floor(Math.random() * 900) + 100}`,
        isSimulated: mode !== 'live',
        state: MemberState.APPROVED,
        approvedMaxCents: ceiling,
        simAuthId: mode !== 'live' ? `AUTH-${Date.now().toString().slice(-6)}` : undefined,
        timestamps: {
          joinedAt: new Date().toISOString(),
          approvedAt: mode !== 'live' ? new Date().toISOString() : undefined,
        },
      };
      state.memberships.set(coalitionId, [initialMember]);

      state.auditLog.push({
        id: `audit_create_${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: initialMember.userId,
        actorType: 'member',
        eventType: 'COALITION_CREATED',
        referenceIds: { coalitionId },
        summary: `Created dynamic coalition "${body.name}" with ceiling $${(ceiling / 100).toFixed(2)}.`,
        verdict: 'allowed',
      });

      return c.json({
        coalition,
        product,
        summary: getCoalitionSummary(coalition, state),
      }, 201);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return c.json({ error: message }, 500);
    }
  });

  // 4. Join a coalition (User or Teammate Agent)
  router.post('/coalitions/:id/join', async (c) => {
    const id = c.req.param('id');
    const mode = c.req.query('mode') || c.req.header('x-quorum-mode') || 'simulated';
    const state = store.getState(mode);

    const coalition = state.coalitions.get(id);
    if (!coalition) return c.json({ error: 'Coalition not found' }, 404);

    const body = await c.req.json() as {
      userId: string;
      approvedMaxCents?: number;
      isSimulated?: boolean;
    };

    if (!body.userId) {
      return c.json({ error: 'userId is required' }, 400);
    }

    const members = state.memberships.get(id) || [];
    const existing = members.find((m) => m.userId === body.userId);
    if (existing) {
      return c.json({ message: 'User is already a member', member: existing });
    }

    // Guard G8: Check user is not a seller in this coalition
    const sellerIds = (state.sellerOffers.get(id) || []).map((o) => o.sellerId);
    const sellerVerdict = checkSellerNotBuyer(body.userId, sellerIds);
    if (!sellerVerdict.allowed) {
      return c.json({ error: sellerVerdict.reason }, 403);
    }

    const isSimulated = mode === 'live' ? false : (body.isSimulated ?? false);
    const newMember: Membership = {
      coalitionId: id,
      userId: body.userId,
      isSimulated,
      state: MemberState.APPROVED,
      approvedMaxCents: body.approvedMaxCents || coalition.specEnvelope.priceCeilingCents,
      simAuthId: isSimulated ? `SIM-AUTH-${Date.now().toString().slice(-4)}` : undefined,
      timestamps: {
        joinedAt: new Date().toISOString(),
        approvedAt: isSimulated ? new Date().toISOString() : undefined,
      },
    };

    members.push(newMember);
    state.memberships.set(id, members);

    state.auditLog.push({
      id: `audit_join_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: body.userId,
      actorType: isSimulated ? 'ai' : 'member',
      eventType: 'MEMBER_JOINED',
      referenceIds: { coalitionId: id, userId: body.userId },
      summary: `Participant ${body.userId} joined coalition ${id}. Limit: $${((newMember.approvedMaxCents || 0) / 100).toFixed(2)}.`,
      verdict: 'allowed',
    });

    return c.json({ member: newMember, totalMembers: members.length });
  });

  // 5. Trigger live AI negotiation round
  router.post('/coalitions/:id/negotiate', async (c) => {
    const id = c.req.param('id');
    const mode = c.req.query('mode') || c.req.header('x-quorum-mode') || 'simulated';
    const state = store.getState(mode);

    const coalition = state.coalitions.get(id);
    if (!coalition) return c.json({ error: 'Coalition not found' }, 404);

    const members = state.memberships.get(id) || [];
    const offers = state.sellerOffers.get(id) || [];

    if (offers.length === 0) {
      return c.json({ error: 'No seller offers to negotiate' }, 400);
    }

    const discountCents = 500;
    offers.forEach((offer) => {
      offer.tierLadder.forEach((tier) => {
        tier.priceCents = Math.max(offer.hiddenFloorCents || 20000, tier.priceCents - discountCents);
      });
    });

    const winningOffer = offers[0];
    const message = `Real-time negotiation round complete. Supplier ${winningOffer.sellerId} conceded an extra $5.00/unit across bulk tiers in response to pooled demand (${members.length} buyers).`;

    state.auditLog.push({
      id: `audit_nego_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'QuorumNegotiatorAI',
      actorType: 'ai',
      eventType: 'NEGOTIATION_ROUND_COMPLETED',
      referenceIds: { coalitionId: id },
      summary: message,
      verdict: 'allowed',
    });

    return c.json({
      success: true,
      message,
      offers,
      summary: getCoalitionSummary(coalition, state),
    });
  });

  return router;
}
