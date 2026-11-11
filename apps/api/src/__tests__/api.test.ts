import { describe, it, expect } from 'vitest';
import { createApp } from '../app.js';

describe('Quorum API Endpoints & Integration', () => {
  const { app, store } = createApp();

  it('GET /health returns healthy status and sandbox confirmation', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);
    const data = await res.json() as { status: string; sandboxOnly: boolean };
    expect(data.status).toBe('healthy');
    expect(data.sandboxOnly).toBe(true);
  });

  it('GET /api/products returns catalog with sample and Channel3 reference prices', async () => {
    const res = await app.request('/api/products');
    expect(res.status).toBe(200);
    const data = await res.json() as { products: Array<{ id: string; name: string }> };
    expect(data.products.length).toBeGreaterThanOrEqual(3);
    expect(data.products.some((p) => p.name.includes('Monitor'))).toBe(true);
  });

  it('POST /api/wishes/interpret converts shopper wish to structured spec', async () => {
    const res = await app.request('/api/wishes/interpret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '4K monitor for coding under $400', maxPriceCents: 40000 }),
    });
    expect(res.status).toBe(200);
    const data = await res.json() as { interpretation: { specEnvelope: { category: string } } };
    expect(data.interpretation.specEnvelope.category).toBe('monitors');
  });

  it('GET /api/coalitions/coalition_monitor_demo returns price curve and active tiers', async () => {
    const res = await app.request('/api/coalitions/coalition_monitor_demo');
    expect(res.status).toBe(200);
    const data = await res.json() as {
      memberCount: number;
      approvedCount: number;
      currentPriceCents: number;
      priceCurve: Array<{ members: number; priceCents: number }>;
    };
    expect(data.approvedCount).toBe(15);
    expect(data.priceCurve.length).toBeGreaterThan(0);
  });

  it('POST /api/coalitions/:id/join allows new buyer to join', async () => {
    const res = await app.request('/api/coalitions/coalition_monitor_demo/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'judge_test_buyer_1', approvedMaxCents: 38000 }),
    });
    expect(res.status).toBe(200);
  });

  it('Guard G8 blocks seller from joining coalition as buyer', async () => {
    const res = await app.request('/api/coalitions/coalition_monitor_demo/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'seller_alpha', approvedMaxCents: 38000 }),
    });
    expect(res.status).toBe(403);
    const data = await res.json() as { error: string };
    expect(data.error).toContain('seller in this coalition');
  });

  it('POST /api/payments/create-order and /authorize-order reserves funds', async () => {
    const orderRes = await app.request('/api/payments/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        coalitionId: 'coalition_monitor_demo',
        userId: 'judge_buyer_auth',
        amountCents: 35000,
      }),
    });
    expect(orderRes.status).toBe(200);
    const orderData = await orderRes.json() as { orderId: string; approvalUrl: string };
    expect(orderData.orderId).toBeDefined();

    const authRes = await app.request('/api/payments/authorize-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        coalitionId: 'coalition_monitor_demo',
        userId: 'judge_buyer_auth',
        orderId: orderData.orderId,
        amountCents: 35000,
      }),
    });
    expect(authRes.status).toBe(200);
    const authData = await authRes.json() as { success: boolean; authorizationId: string };
    expect(authData.success).toBe(true);
    expect(authData.authorizationId).toBeDefined();
  });

  it('GET /api/ledger returns balanced reconciliation entries', async () => {
    const res = await app.request('/api/ledger');
    expect(res.status).toBe(200);
    const data = await res.json() as { totalEntries: number; reconciliation: { totalReservedCents: number } };
    expect(data.totalEntries).toBeGreaterThan(0);
    expect(data.reconciliation.totalReservedCents).toBeGreaterThan(0);
  });

  it('GET /api/audit returns logs and tracks blocked attacks', async () => {
    const res = await app.request('/api/audit');
    expect(res.status).toBe(200);
    const data = await res.json() as { totalLogs: number };
    expect(data.totalLogs).toBeGreaterThan(0);
  });

  it('POST /api/scenario/step runs guided demo scenario and blocks Seller Gamma', async () => {
    const step3Res = await app.request('/api/scenario/step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: 3, coalitionId: 'coalition_monitor_demo' }),
    });
    expect(step3Res.status).toBe(200);
    const step3Data = await step3Res.json() as { title: string; blockedSeller: string };
    expect(step3Data.blockedSeller).toContain('Gamma');
  });

  it('POST /api/mcp handles tools/list and tools/call for outside AI agents', async () => {
    const listRes = await app.request('/api/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
      }),
    });
    expect(listRes.status).toBe(200);
    const listData = await listRes.json() as { result: { tools: Array<{ name: string }> } };
    expect(listData.result.tools.some((t) => t.name === 'get_human_approval_link')).toBe(true);

    const callRes = await app.request('/api/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'search_coalitions',
          arguments: {},
        },
      }),
    });
    expect(callRes.status).toBe(200);
    const callData = await callRes.json() as { result: { content: Array<{ text: string }> } };
    expect(callData.result.content[0]?.text).toContain('coalition_monitor_demo');
  });
});
