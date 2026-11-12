import { Hono } from 'hono';
import type { AppStore } from '../store.js';
import { interpretWish } from '@quorum/ai/src/roles/wish-interpreter.js';
import { matchSpecToCoalitions } from '@quorum/ai/src/roles/matcher.js';

export function createWishRouter(store: AppStore) {
  const router = new Hono();

  router.post('/interpret', async (c) => {
    try {
      const mode = c.req.query('mode') || c.req.header('x-quorum-mode') || 'simulated';
      const state = store.getState(mode);

      const body = await c.req.json() as {
        text: string;
        maxPriceCents?: number;
        deadlineHours?: number;
      };

      if (!body.text) {
        return c.json({ error: 'Wish text is required' }, 400);
      }

      const userMaxPriceCents = body.maxPriceCents || 40000;
      const interpretation = await interpretWish(
        store.aiClient,
        body.text,
        userMaxPriceCents,
        body.deadlineHours || 72,
      );

      // Check for matching coalitions in current state
      const openCoalitions = Array.from(state.coalitions.values());
      const match = await matchSpecToCoalitions(
        store.aiClient,
        interpretation.specEnvelope,
        openCoalitions,
      );

      return c.json({
        interpretation,
        match,
        openCoalitionsCount: openCoalitions.length,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return c.json({ error: message }, 500);
    }
  });

  return router;
}
