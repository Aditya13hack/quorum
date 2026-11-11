import { Hono } from 'hono';
import type { AppStore } from '../store.js';
import { MemberState, CoalitionState, LedgerEntryType } from '@quorum/shared/src/enums.js';
import { createCapturePlan, handleFailedCapture } from '@quorum/engine/src/settlement.js';
import { checkPriceLimit, checkValidAuthorization, checkCapturePlan } from '@quorum/guard/src/guard.js';

export function createPaymentRouter(store: AppStore) {
  const router = new Hono();

  // 1. Start PayPal Approval (create order with intent=AUTHORIZE)
  router.post('/create-order', async (c) => {
    try {
      const body = await c.req.json() as {
        coalitionId: string;
        userId: string;
        amountCents: number;
        useRealPayPal?: boolean;
      };

      const coalition = store.coalitions.get(body.coalitionId);
      if (!coalition) return c.json({ error: 'Coalition not found' }, 404);

      // Guard G1 check: amount within limit
      const limitVerdict = checkPriceLimit(body.amountCents, coalition.specEnvelope.priceCeilingCents);
      if (!limitVerdict.allowed) {
        return c.json({ error: limitVerdict.reason }, 400);
      }

      const idempotencyKey = `order_${body.coalitionId}_${body.userId}_${Date.now()}`;
      const provider = body.useRealPayPal && store.paypalProvider
        ? store.paypalProvider
        : store.simulatedProvider;

      const orderResult = await provider.createOrder(
        body.amountCents,
        `Quorum Reservation for Coalition ${body.coalitionId}`,
        idempotencyKey,
      );

      return c.json({
        orderId: orderResult.orderId,
        approvalUrl: orderResult.approvalUrl,
        provider: orderResult.provider,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return c.json({ error: message }, 500);
    }
  });

  // 2. Authorize Order (funds reserved in PayPal sandbox, NOT captured)
  router.post('/authorize-order', async (c) => {
    try {
      const body = await c.req.json() as {
        coalitionId: string;
        userId: string;
        orderId: string;
        amountCents: number;
        useRealPayPal?: boolean;
      };

      const provider = body.useRealPayPal && store.paypalProvider
        ? store.paypalProvider
        : store.simulatedProvider;

      const idempotencyKey = `auth_${body.orderId}_${Date.now()}`;
      const authResult = await provider.authorizeOrder(body.orderId, idempotencyKey);

      // Update membership in store
      const members = store.memberships.get(body.coalitionId) || [];
      const member = members.find((m) => m.userId === body.userId);
      if (member) {
        member.state = MemberState.APPROVED;
        member.approvedMaxCents = body.amountCents;
        if (authResult.provider === 'paypal') {
          member.authorizationId = authResult.authorizationId;
        } else {
          member.simAuthId = authResult.authorizationId;
        }
        member.timestamps.approvedAt = new Date().toISOString();
      }

      // Add reservation entry to Ledger
      const ledgerEntry = {
        id: `led_res_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        coalitionId: body.coalitionId,
        memberId: body.userId,
        type: LedgerEntryType.RESERVED,
        amountCents: authResult.amountCents,
        provider: authResult.provider.toUpperCase(),
        referenceId: authResult.authorizationId,
        createdAt: new Date().toISOString(),
      };
      store.ledger.push(ledgerEntry);

      store.auditLog.push({
        id: `audit_auth_${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: body.userId,
        actorType: 'member',
        eventType: 'FUNDS_AUTHORIZED_RESERVED',
        referenceIds: {
          coalitionId: body.coalitionId,
          authorizationId: authResult.authorizationId,
        },
        summary: `Reserved ${authResult.amountCents}¢ for member ${body.userId}. Funds held safely in PayPal.`,
        verdict: 'allowed',
      });

      return c.json({
        success: true,
        authorizationId: authResult.authorizationId,
        provider: authResult.provider,
        amountCents: authResult.amountCents,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return c.json({ error: message }, 500);
    }
  });

  // 3. Lock and Capture Coalition (Settlement execution)
  router.post('/lock-and-capture', async (c) => {
    try {
      const body = await c.req.json() as {
        coalitionId: string;
      };

      const coalition = store.coalitions.get(body.coalitionId);
      if (!coalition) return c.json({ error: 'Coalition not found' }, 404);

      const members = store.memberships.get(body.coalitionId) || [];
      const offers = store.sellerOffers.get(body.coalitionId) || [];
      const winningOffer = offers[0];
      if (!winningOffer) return c.json({ error: 'No active seller offers' }, 400);

      // Lock the coalition
      coalition.state = CoalitionState.LOCKED;

      // Determine final price based on approved member count
      const approvedMembers = members.filter(
        (m) => m.state === MemberState.APPROVED && (m.authorizationId || m.simAuthId),
      );

      const activeTier = winningOffer.tierLadder.reduce((prev, curr) => {
        return approvedMembers.length >= curr.minBuyers && curr.minBuyers > prev.minBuyers ? curr : prev;
      }, winningOffer.tierLadder[0]!);

      const finalPriceCents = activeTier.priceCents;
      coalition.finalPriceCents = finalPriceCents;

      // Engine creates capture plan
      const capturePlan = createCapturePlan(members, finalPriceCents);

      // Execute captures
      const results: Array<{ memberId: string; captureId: string; status: string; amountCents: number }> = [];

      for (const instruction of capturePlan.captures) {
        const member = members.find((m) => m.userId === instruction.memberId);
        const isRealPayPal = !!member?.authorizationId && !member.isSimulated;
        const provider = isRealPayPal && store.paypalProvider
          ? store.paypalProvider
          : store.simulatedProvider;

        const idempotencyKey = `cap_${instruction.authorizationId}_${Date.now()}`;
        const capResult = await provider.captureAuthorization(
          instruction.authorizationId,
          instruction.amountCents,
          true,
          idempotencyKey,
        );

        if (capResult.status === 'COMPLETED') {
          if (member) member.state = MemberState.CAPTURED;
          results.push({
            memberId: instruction.memberId,
            captureId: capResult.captureId,
            status: 'COMPLETED',
            amountCents: capResult.amountCents,
          });

          store.ledger.push({
            id: `led_cap_${Date.now()}_${instruction.memberId}`,
            coalitionId: body.coalitionId,
            memberId: instruction.memberId,
            type: capResult.isPartialCapture ? LedgerEntryType.PARTIALLY_CAPTURED : LedgerEntryType.CAPTURED,
            amountCents: capResult.amountCents,
            provider: capResult.provider.toUpperCase(),
            referenceId: capResult.captureId,
            createdAt: new Date().toISOString(),
          });
        }
      }

      coalition.state = CoalitionState.FULFILLING;

      // Auto-trigger staged payout 1 (50% upfront)
      const totalCaptured = results.reduce((sum, r) => sum + r.amountCents, 0);
      const stage1Payout = Math.floor(totalCaptured * 0.5);

      const payoutRes = await store.simulatedProvider.payoutToSeller(
        'supplier_alpha@example.com',
        stage1Payout,
        `Stage 1 (50%) Fulfillment Payout for Coalition ${coalition.id}`,
        `payout_stage1_${coalition.id}`,
      );

      store.ledger.push({
        id: `led_payout1_${Date.now()}`,
        coalitionId: body.coalitionId,
        memberId: 'seller_alpha',
        type: LedgerEntryType.PAYOUT_SENT,
        amountCents: stage1Payout,
        provider: 'SIMULATED',
        referenceId: payoutRes.payoutId,
        createdAt: new Date().toISOString(),
      });

      return c.json({
        coalitionState: coalition.state,
        finalPriceCents,
        capturesExecuted: results.length,
        totalCapturedCents: totalCaptured,
        stagedPayout1Cents: stage1Payout,
        results,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return c.json({ error: message }, 500);
    }
  });

  return router;
}
