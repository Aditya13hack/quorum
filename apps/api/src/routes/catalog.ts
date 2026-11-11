import { Hono } from 'hono';
import type { AppStore } from '../store.js';

export function createCatalogRouter(store: AppStore) {
  const router = new Hono();

  router.get('/products', (c) => {
    const list = Array.from(store.products.values());
    return c.json({ products: list });
  });

  router.get('/products/:id', (c) => {
    const id = c.req.param('id');
    const product = store.products.get(id);
    if (!product) return c.json({ error: 'Product not found' }, 404);
    return c.json({ product });
  });

  return router;
}
