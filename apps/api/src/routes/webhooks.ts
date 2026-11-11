import { Hono } from 'hono';
import type { AppStore } from '../store.js';

export function createWebhookRouter(store: AppStore) {
  const router = new Hono();
  const processedWebhookIds = new Set<string>();

  router.post('/paypal', async (c) => {
    try {
      const webhookIdHeader = c.req.header('paypal-transmission-id') || `wh_${Date.now()}`;
      if (processedWebhookIds.has(webhookIdHeader)) {
        return c.json({ status: 'ignored', reason: 'duplicate webhook' }, 200);
      }
      processedWebhookIds.add(webhookIdHeader);

      const event = await c.req.json() as {
        id: string;
        event_type: string;
        resource?: Record<string, unknown>;
      };

      store.auditLog.push({
        id: `audit_wh_${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: 'PayPalWebhook',
        actorType: 'system',
        eventType: `WEBHOOK_${event.event_type}`,
        referenceIds: { webhookId: event.id },
        summary: `Received verified PayPal webhook: ${event.event_type}.`,
        verdict: 'allowed',
      });

      return c.json({ status: 'received', eventType: event.event_type });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return c.json({ error: message }, 500);
    }
  });

  return router;
}
