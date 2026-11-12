import { Hono } from 'hono';
import type { AppStore } from '../store.js';

export function createAuditRouter(store: AppStore) {
  const router = new Hono();

  router.get('/audit', (c) => {
    const mode = c.req.query('mode') || c.req.header('x-quorum-mode') || 'simulated';
    const state = store.getState(mode);

    const list = [...state.auditLog].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    const blockedAttacks = list.filter((e) => e.verdict === 'blocked');

    return c.json({
      totalLogs: list.length,
      blockedAttacksCount: blockedAttacks.length,
      blockedAttacks,
      logs: list,
    });
  });

  return router;
}
