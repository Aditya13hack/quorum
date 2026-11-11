import { describe, it, expect, beforeEach } from 'vitest';
import { SimulatedProvider } from '../simulated-provider.js';

describe('SimulatedProvider', () => {
  let provider: SimulatedProvider;

  beforeEach(() => {
    provider = new SimulatedProvider();
    provider.reset();
  });

  it('runs complete lifecycle: createOrder -> authorize -> capture', async () => {
    const orderRes = await provider.createOrder(30000, '4K Monitor', 'idem_1');
    expect(orderRes.orderId).toContain('SIM-ORD-');
    expect(orderRes.provider).toBe('simulated');
    expect(orderRes.approvalUrl).toContain(orderRes.orderId);

    const authRes = await provider.authorizeOrder(orderRes.orderId, 'idem_2');
    expect(authRes.authorizationId).toContain('SIM-AUTH-');
    expect(authRes.status).toBe('CREATED');
    expect(authRes.amountCents).toBe(30000);

    const capRes = await provider.captureAuthorization(authRes.authorizationId, 28000, true, 'idem_3');
    expect(capRes.captureId).toContain('SIM-CAP-');
    expect(capRes.status).toBe('COMPLETED');
    expect(capRes.amountCents).toBe(28000);
    expect(capRes.isPartialCapture).toBe(true);
  });

  it('handles void after authorization', async () => {
    const orderRes = await provider.createOrder(30000, 'Test Order', 'idem_v1');
    const authRes = await provider.authorizeOrder(orderRes.orderId, 'idem_v2');

    const voidRes = await provider.voidAuthorization(authRes.authorizationId, 'idem_v3');
    expect(voidRes.success).toBe(true);

    // Cannot capture after void
    await expect(
      provider.captureAuthorization(authRes.authorizationId, 30000, true, 'idem_v4'),
    ).rejects.toThrow('Cannot capture voided authorization');
  });

  it('handles refund after capture', async () => {
    const orderRes = await provider.createOrder(30000, 'Test Refund', 'idem_r1');
    const authRes = await provider.authorizeOrder(orderRes.orderId, 'idem_r2');
    const capRes = await provider.captureAuthorization(authRes.authorizationId, 30000, true, 'idem_r3');

    const refRes = await provider.refundCapture(capRes.captureId, 30000, 'idem_r4');
    expect(refRes.status).toBe('COMPLETED');
    expect(refRes.amountCents).toBe(30000);
  });

  it('supports failure injection for capture to test resilience', async () => {
    const orderRes = await provider.createOrder(30000, 'Test Fail', 'idem_f1');
    const authRes = await provider.authorizeOrder(orderRes.orderId, 'idem_f2');

    provider.injectFailure(authRes.authorizationId, 'capture');

    const capRes = await provider.captureAuthorization(authRes.authorizationId, 30000, true, 'idem_f3');
    expect(capRes.status).toBe('FAILED');
  });

  it('returns idempotent responses for repeated requests with same key', async () => {
    const res1 = await provider.createOrder(15000, 'Idempotent Test', 'same_key');
    const res2 = await provider.createOrder(15000, 'Idempotent Test', 'same_key');
    expect(res1.orderId).toBe(res2.orderId);
  });

  it('supports seller payouts', async () => {
    const res = await provider.payoutToSeller('supplier@example.com', 50000, 'Supplier fulfillment batch 1', 'idem_p1');
    expect(res.status).toBe('SUCCESS');
    expect(res.payoutId).toContain('SIM-PAY-');
    expect(res.amountCents).toBe(50000);
  });
});
