import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { createStore } from './store.js';
import { healthRouter } from './routes/health.js';
import { createCatalogRouter } from './routes/catalog.js';
import { createWishRouter } from './routes/wishes.js';
import { createCoalitionRouter } from './routes/coalitions.js';
import { createPaymentRouter } from './routes/payments.js';
import { createLedgerRouter } from './routes/ledger.js';
import { createAuditRouter } from './routes/audit.js';
import { createScenarioRouter } from './routes/scenarios.js';
import { createMCPRouter } from './routes/mcp.js';
import { createWebhookRouter } from './routes/webhooks.js';

export function createApp() {
  const app = new Hono();
  const store = createStore();

  // Middleware
  app.use('*', logger());
  app.use(
    '*',
    cors({
      origin: '*',
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization', 'PayPal-Request-Id'],
    }),
  );

  // Mount routers
  app.route('/', healthRouter);
  app.route('/api', createCatalogRouter(store));
  app.route('/api/wishes', createWishRouter(store));
  app.route('/api', createCoalitionRouter(store));
  app.route('/api/payments', createPaymentRouter(store));
  app.route('/api', createLedgerRouter(store));
  app.route('/api', createAuditRouter(store));
  app.route('/api/scenario', createScenarioRouter(store));
  app.route('/api', createMCPRouter(store));
  app.route('/api/webhooks', createWebhookRouter(store));

  // Root welcome
  app.get('/', (c) => {
    return c.json({
      name: 'Quorum API',
      description: 'A union for AI shopping agents — PayPal AI Hackathon 2026',
      docs: '/version',
      health: '/health',
      demoState: '/api/coalitions/coalition_monitor_demo',
    });
  });

  return { app, store };
}
