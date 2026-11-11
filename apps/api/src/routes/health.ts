import { Hono } from 'hono';

export const healthRouter = new Hono();

healthRouter.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    environment: process.env.PAYPAL_ENV || 'sandbox',
    sandboxOnly: true,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime ? process.uptime() : 0),
  });
});

healthRouter.get('/version', (c) => {
  return c.json({
    name: 'Quorum API',
    version: '1.0.0',
    hackathon: 'PayPal AI Hackathon 2026',
    features: [
      'Agentic Commerce Reverse Auctions',
      'Deterministic Safety Guard (G1-G12)',
      'PayPal Authorize-Then-Capture Settlement',
      'Autonomous Waiting-List Self-Healing',
      'Model Context Protocol (MCP) Server for Outside Agents',
      'Real-Time Audit & Ledger Reconciliation',
    ],
  });
});
