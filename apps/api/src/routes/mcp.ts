import { Hono } from 'hono';
import type { AppStore } from '../store.js';
import { interpretWish } from '@quorum/ai/src/roles/wish-interpreter.js';
import { MemberState } from '@quorum/shared/src/enums.js';
import type { Membership } from '@quorum/shared/src/types.js';

export function createMCPRouter(store: AppStore) {
  const router = new Hono();

  // MCP JSON-RPC protocol endpoint (mode-aware)
  router.post('/mcp', async (c) => {
    try {
      const mode = c.req.query('mode') || c.req.header('x-quorum-mode') || 'simulated';
      const state = store.getState(mode);

      const body = await c.req.json() as {
        jsonrpc: string;
        id: string | number;
        method: string;
        params?: Record<string, unknown>;
      };

      if (body.method === 'tools/list') {
        return c.json({
          jsonrpc: '2.0',
          id: body.id,
          result: {
            tools: [
              {
                name: 'search_coalitions',
                description: 'Search open Quorum buyer coalitions by category or keyword to pool volume discounts.',
                inputSchema: {
                  type: 'object',
                  properties: {
                    category: { type: 'string', description: 'Product category (e.g. "monitors", "smartphones", "solar")' },
                  },
                },
              },
              {
                name: 'create_wish',
                description: 'Convert plain language shopping request into a structured spec envelope with buyer price ceiling.',
                inputSchema: {
                  type: 'object',
                  properties: {
                    wishText: { type: 'string', description: 'What you want to buy' },
                    maxPriceCents: { type: 'number', description: 'Hard price ceiling in integer cents' },
                  },
                  required: ['wishText', 'maxPriceCents'],
                },
              },
              {
                name: 'join_coalition',
                description: 'Join an existing buyer coalition as an autonomous agent. Requires an agent identifier and price limit.',
                inputSchema: {
                  type: 'object',
                  properties: {
                    coalitionId: { type: 'string' },
                    agentId: { type: 'string' },
                    maxPriceCents: { type: 'number' },
                  },
                  required: ['coalitionId', 'agentId'],
                },
              },
              {
                name: 'get_human_approval_link',
                description: 'CRITICAL SAFETY: Agents cannot approve payments directly. Call this to generate a secure human authorization link for your user to approve in PayPal Sandbox.',
                inputSchema: {
                  type: 'object',
                  properties: {
                    coalitionId: { type: 'string' },
                    agentId: { type: 'string' },
                    amountCents: { type: 'number' },
                  },
                  required: ['coalitionId', 'agentId', 'amountCents'],
                },
              },
            ],
          },
        });
      }

      if (body.method === 'tools/call') {
        const params = body.params as { name: string; arguments?: Record<string, unknown> };

        if (params.name === 'search_coalitions') {
          const list = Array.from(state.coalitions.values()).map((coalition) => {
            const product = state.products.get(coalition.productId);
            const members = state.memberships.get(coalition.id) || [];
            return {
              coalitionId: coalition.id,
              productName: product?.name || coalition.specEnvelope.category,
              category: coalition.specEnvelope.category,
              currentMemberCount: members.length,
              quorumTarget: coalition.quorum,
              priceCeilingCents: coalition.specEnvelope.priceCeilingCents,
              state: coalition.state,
            };
          });

          return c.json({
            jsonrpc: '2.0',
            id: body.id,
            result: { content: [{ type: 'text', text: JSON.stringify(list, null, 2) }] },
          });
        }

        if (params.name === 'create_wish') {
          const args = params.arguments as { wishText: string; maxPriceCents: number };
          const res = await interpretWish(store.aiClient, args.wishText, args.maxPriceCents);
          return c.json({
            jsonrpc: '2.0',
            id: body.id,
            result: { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] },
          });
        }

        if (params.name === 'join_coalition') {
          const args = params.arguments as { coalitionId: string; agentId: string; maxPriceCents?: number };
          const coalition = state.coalitions.get(args.coalitionId);
          if (!coalition) {
            return c.json({
              jsonrpc: '2.0',
              id: body.id,
              error: { code: -32000, message: `Coalition ${args.coalitionId} not found` },
            });
          }

          const members = state.memberships.get(args.coalitionId) || [];
          const ceiling = args.maxPriceCents || coalition.specEnvelope.priceCeilingCents;

          const newMember: Membership = {
            coalitionId: args.coalitionId,
            userId: args.agentId,
            isSimulated: mode !== 'live',
            state: MemberState.APPROVED,
            approvedMaxCents: ceiling,
            simAuthId: `MCP-AUTH-${Date.now().toString().slice(-4)}`,
            timestamps: {
              joinedAt: new Date().toISOString(),
              approvedAt: new Date().toISOString(),
            },
          };
          members.push(newMember);
          state.memberships.set(args.coalitionId, members);

          state.auditLog.unshift({
            id: `audit_mcp_${Date.now()}`,
            timestamp: new Date().toISOString(),
            actor: args.agentId,
            actorType: 'ai',
            eventType: 'MCP_AGENT_JOINED',
            referenceIds: { coalitionId: args.coalitionId },
            summary: `Autonomous MCP Agent "${args.agentId}" joined pool via JSON-RPC protocol with ceiling $${(ceiling / 100).toFixed(2)}.`,
            verdict: 'allowed',
          });

          return c.json({
            jsonrpc: '2.0',
            id: body.id,
            result: {
              content: [{
                type: 'text',
                text: `Agent "${args.agentId}" successfully connected via MCP to coalition "${args.coalitionId}". Current pool size: ${members.length} agents.`,
              }],
            },
          });
        }

        if (params.name === 'get_human_approval_link') {
          const args = params.arguments as { coalitionId: string; agentId: string; amountCents: number };
          const provider = (mode === 'live' && store.paypalProvider) ? store.paypalProvider : store.simulatedProvider;
          const orderRes = await provider.createOrder(
            args.amountCents,
            `MCP Autonomous Agent Approval for ${args.agentId}`,
            `mcp_${args.coalitionId}_${args.agentId}_${Date.now()}`,
          );

          return c.json({
            jsonrpc: '2.0',
            id: body.id,
            result: {
              content: [{
                type: 'text',
                text: `Human approval URL: ${orderRes.approvalUrl}\nInstruct your human user to open this link to authorize the reservation in PayPal. Funds will NOT be captured until coalition achieves quorum.`,
              }],
            },
          });
        }

        return c.json({
          jsonrpc: '2.0',
          id: body.id,
          error: { code: -32601, message: `Unknown tool: ${params.name}` },
        });
      }

      return c.json({
        jsonrpc: '2.0',
        id: body.id,
        error: { code: -32600, message: 'Invalid Request' },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return c.json({ error: message }, 500);
    }
  });

  return router;
}
