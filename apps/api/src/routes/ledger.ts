import { Hono } from 'hono';
import type { AppStore } from '../store.js';
import { reconcile } from '@quorum/engine/src/reconciliation.js';

export function createLedgerRouter(store: AppStore) {
  const router = new Hono();

  router.get('/ledger', (c) => {
    const mode = c.req.query('mode') || c.req.header('x-quorum-mode') || 'simulated';
    const state = store.getState(mode);

    const coalitionId = c.req.query('coalitionId');
    const type = c.req.query('type');

    let entries = [...state.ledger];
    if (coalitionId) {
      entries = entries.filter((e) => e.coalitionId === coalitionId);
    }
    if (type) {
      entries = entries.filter((e) => e.type === type);
    }

    // Sort newest first
    entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const reconciliation = reconcile(entries);

    return c.json({
      totalEntries: entries.length,
      reconciliation,
      entries,
    });
  });

  return router;
}
