# Quorum Architecture & Technical Specification

Quorum is a multi-agent collective bargaining protocol built for **"Build What's Next with PayPal and AI"** (PayPal AI Hackathon 2026).

```mermaid
flowchart TD
    subgraph Clients
        Web["React 18 Web App\n(Tailwind + AG Grid)"]
        ExternalAgent["Third-Party AI Agents\n(Cursor / Claude / Custom)"]
    end

    subgraph "API & Coordinator (apps/api)"
        HonoAPI["Hono REST API & Webhooks"]
        MCPEndpoint["Model Context Protocol (MCP) Server"]
    end

    subgraph "Pure Domain Core (No Network Deps)"
        Guard["The Guard (G1–G12)\nDeterministic Safety Rules"]
        Engine["Engine\nState Machines • Tier Math • Settlement"]
        Shared["Shared Types & Schemas\n(Integer Cents • Zod)"]
    end

    subgraph "AI & Payments"
        AILayer["AI Layer\nGemini 2.0 Flash • 8 Roles • Scripted Fallback"]
        Payments["Payments Adapter\nPayPal Sandbox • Simulated Provider"]
    end

    Clients --> HonoAPI
    ExternalAgent --> MCPEndpoint
    HonoAPI --> Guard
    MCPEndpoint --> Guard
    Guard --> Engine
    Engine --> Payments
    Engine --> AILayer
    Payments --> PayPal["PayPal Sandbox API\n(Authorize • Capture • Void • Payout)"]
```

## Package Directory

| Package | Purpose |
|---|---|
| `packages/shared` | Types, Zod schemas, status enums, constants, and integer-cents money arithmetic. |
| `packages/engine` | Pure business logic: Coalition & Member finite-state machines, volume tier pricing, quorum math, settlement planning, waiting list promotion, demo clock, and ledger reconciliation. |
| `packages/guard` | Pure deterministic safety rules (G1–G12). Validates all AI proposals and money operations. Zero AI, zero network. |
| `packages/payments` | Payment Provider Interface with `PayPalSandboxProvider` (REST API with OAuth token caching & idempotency) and `SimulatedProvider` (with failure injection). |
| `packages/ai` | Gemini 2.0 Flash provider wrapper, 8 specialized agent roles, adversarial seller simulation, low-temperature schema validation, and scripted fallback. |
| `apps/api` | Fast backend server serving REST endpoints, PayPal webhooks, judge scenario runner, and native Model Context Protocol (MCP) server. |
| `apps/web` | React 18 + Tailwind CSS + AG Grid frontend featuring autonomous price curve, quorum meter, member roster, auditable ledger, and judge console. |

## Money Safety Invariants

1. **Integer Cents Only:** No floating-point rounding errors. All internal monetary calculations use integer cents (USD).
2. **Authorize-Then-Capture:** Money is placed on authorization hold when human approves. No funds move until quorum locks.
3. **Partial Capture for Windfalls:** If volume increases after approval and price drops, buyers are charged the lower final price via partial capture. The remainder is automatically released.
4. **Autonomous Self-Healing:** The waiting list heals capture-time card failures without human intervention.
5. **Exact Reconciliation:** Every reserve, capture, void, refund, and staged payout must reconcile to exactly $0.00 difference.
