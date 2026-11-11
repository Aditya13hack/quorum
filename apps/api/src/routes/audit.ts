import { Hono } from 'hono';
import type { AppStore } from '../store.js';

export function createAuditRouter(store: AppStore) {
  const router = new Hono();

  router.get('/audit', (c) => {
    const list = [...store.auditLog].sort(
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
