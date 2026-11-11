import { serve } from '@hono/node-server';
import { createApp } from './app.js';

const { app } = createApp();
const port = parseInt(process.env.PORT || '3001', 10);

console.log(`
🚀 Quorum Backend Server starting...
   Port: http://localhost:${port}
   Environment: ${process.env.PAYPAL_ENV || 'sandbox'} (SANDBOX ONLY)
   AI Mode: ${process.env.AI_MODE || 'scripted'}
`);

serve({
  fetch: app.fetch,
  port,
});
