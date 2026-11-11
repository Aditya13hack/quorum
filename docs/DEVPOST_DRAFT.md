# Devpost Submission Draft: Quorum

## Project Title
**Quorum — A Union for AI Shopping Agents**

## Elevator Pitch
Many people's AI agents find each other, pool their demand, negotiate as one group against sellers' AI agents in a reverse auction, and pay through PayPal. Money is only reserved until the group succeeds. If the group fails, nobody pays anything.

---

## Inspiration
One person buying one item alone has zero bargaining power. As e-commerce shifts to autonomous AI agents shopping on behalf of consumers, individual agents will face sophisticated seller AI pricing engines. Buying in volume has always commanded steep discounts, but coordinating dozens of strangers in real time has historically been impossible. 

We asked: **What if individual AI agents joined forces?** 
Quorum is an autonomous collective bargaining union for shopping agents. It pools distributed demand into a single coalition, runs multi-round reverse auctions against suppliers, and uses PayPal's authorize-then-capture flow to ensure shoppers only pay if the volume tier is guaranteed.

---

## What It Does
1. **Shopper Defines Wish & Limits:** The user tells their AI agent what they want (e.g. "27-inch 4K IPS monitor under $400, wait up to 3 days"). The AI interprets this into a deterministic Spec Envelope.
2. **Coalition Pooling & Reverse Auction:** The agent discovers or forms an open coalition. Competing seller agents submit volume-tiered pricing ladders ("$350 at 10 buyers, $315 at 20 buyers, $289 at 40 buyers").
3. **The Guard Protects Shoppers:** The AI *proposes*, but deterministic pure code (The Guard, Rules G1–G12) checks every single proposal. Adversarial seller attempts to inject malicious prompt instructions or exceed buyer limits are blocked cold.
4. **Human-in-the-Loop Explicit Consent:** No agent can spend money autonomously. When the final deal is ready, the user reviews a clear card and authorizes with PayPal. Funds are held in reservation (authorization hold) — **NOT charged**.
5. **Quorum Lock & Partial Capture:** When the quorum threshold (plus safety margin) is reached, the deal locks. Every member is charged the lower negotiated price via **partial capture**, releasing excess held funds.
6. **Autonomous Waiting-List Self-Healing:** If an authorization fails during capture, the engine autonomously promotes the next pre-authorized member from the waiting list, keeping the bulk tier alive.
7. **Staged Supplier Payouts & Reconciliation:** Suppliers receive staged payouts (50% on shipment dispatch, 50% on verified delivery). The ledger reconciles to exactly $0.00 difference.

---

## How We Built It
- **Monorepo Architecture (pnpm workspaces):** Clean separation across `@quorum/shared`, `@quorum/engine`, `@quorum/guard`, `@quorum/payments`, `@quorum/ai`, `apps/api`, and `apps/web`.
- **Pure Logic Engine:** Deterministic state machine tables, volume tier math, settlement planning, and reconciliation with zero external network dependencies.
- **Deterministic Guard (G1–G12):** Hard boundary protecting users against prompt injection, limit overruns, duplicate payers, and unauthorized capture plans.
- **PayPal Sandbox Provider:** Complete implementation of Orders (intent=AUTHORIZE), Authorize, Partial Capture, Void, Refund, and Payouts.
- **AI Agent Network:** Gemini 2.0 Flash integration with structured JSON outputs and deterministic scripted fallbacks for guaranteed demo reliability.
- **Model Context Protocol (MCP):** Native JSON-RPC MCP server exposing tools (`search_coalitions`, `create_wish`, `join_coalition`, `get_human_approval_link`) allowing outside AI agents (Claude, Cursor, custom bots) to participate safely.
- **Interactive Web App:** React 18 + Tailwind CSS + AG Grid Community featuring an autonomous step-function price curve, live quorum meter, auditable ledger, and judge scenario controls.

---

## Challenges We Overcame
- **Capture-time Attrition:** If even one buyer's payment fails at the final moment of quorum, the entire volume discount could collapse. We solved this with a 10% safety margin, an autonomous waiting-list promotion algorithm, and seller honor clauses.
- **Prompt Injection Defense:** Seller notes are untrusted text. We strictly isolated text fields from structured numbers and enforced Guard rule G5 to ensure AI summaries never modify pricing fields.
- **Guaranteed Demo Reliability:** Hackathon demos often fail due to live API rate limits. We built three switchable AI modes (`live`, `cached`, `scripted`) and a dedicated 3-minute guided evaluation runner.

---

## Accomplishments We're Proud Of
- 158 automated unit and integration tests passing with 0 errors across the monorepo.
- 100% adherence to the "Human Consent" Prime Directive: AI agents cannot bypass user approval.
- An append-only auditable ledger with real-time mathematical reconciliation.
- Complete MCP server enabling multi-agent ecosystem interoperability.

---

## What's Next for Quorum
- PayPal Marketplace multi-party payee routing for zero platform fund-holding.
- Real carrier tracking integrations (FedEx, UPS, DHL) for automatic delivery escrow release.
- Recurring community coalitions for neighborhood solar microgrids and small business wholesale staples.
