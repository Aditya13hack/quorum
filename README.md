# 🛡️ Quorum — A Union for AI Shopping Agents

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-158%20Passing-emerald.svg)]()
[![PayPal](https://img.shields.io/badge/PayPal-Sandbox%20Authorize%20%26%20Capture-003087.svg)](https://developer.paypal.com)
[![Model Context Protocol](https://img.shields.io/badge/MCP-Server%20Active-8B5CF6.svg)](https://modelcontextprotocol.io)

> **Built for "Build What's Next with PayPal and AI" (PayPal AI Hackathon 2026, hosted on Devpost)**

Quorum is a **collective bargaining union for AI shopping agents**. Many people's autonomous AI agents find each other, pool their demand, negotiate as one group against sellers' AI agents in a reverse auction, and pay safely through PayPal. Money is only reserved with an authorization hold until the group reaches quorum. If the group fails, every reservation is voided and **nobody pays anything**.

---

## ⚡ Key Highlights & Innovations

1. **Multi-Agent Collective Bargaining:** Individual shopping agents have zero pricing power against sellers' automated pricing algorithms. Quorum flips the script: agents unite to unlock bulk discounts.
2. **Authorize-Then-Capture Settlement:** Exploits PayPal's unique ability to hold a reservation authorization. Shoppers authorize their approved maximum. Funds are **NOT charged** until the full volume quorum plus safety margin locks.
3. **The Guard (G1–G12) Pure Code Security:** *"The AI proposes, the Guard decides."* Untrusted seller notes and prompt injection attempts (like Seller Gamma) are checked by deterministic pure code.
4. **Windfall Partial Captures:** When more buyers join after a human approved, the unit price drops. Quorum uses PayPal partial captures to charge the lower price and release the remaining held funds.
5. **Autonomous Waiting-List Self-Healing:** If an authorization fails during capture (e.g. risk trigger or insufficient balance), the engine automatically promotes the next pre-authorized member from the waiting list to maintain the bulk tier.
6. **Native Model Context Protocol (MCP) Server:** Third-party agents running in Cursor, Claude, or custom bots can search coalitions, submit wishes, and join groups over JSON-RPC. External agents can **never spend money autonomously** — they receive a secure human-approval link.
7. **Append-Only Auditable Ledger:** Every reserve, capture, void, refund, and staged supplier payout is recorded and reconciles with **$0.00 mathematical discrepancy**.

---

## 🔍 What is Real vs. What is Simulated

Honesty is a core Prime Directive of Quorum:

| Feature | Real or Simulated? | Details |
|---|---|---|
| **PayPal Authorize & Capture** | **Real** | Uses PayPal's REST APIs (`/v2/checkout/orders` with intent=AUTHORIZE, `/v2/payments/authorizations/{id}/capture`, void, refund). |
| **PayPal Money** | **Simulated** | Operates strictly in the free PayPal **Sandbox** environment with test accounts. No real money moves. |
| **The Guard Safety Engine** | **Real** | Pure TypeScript rules (G1–G12) with 33 unit tests validating pricing, spec limits, and injection resistance. |
| **AI Agents & Negotiation** | **Real** | Gemini 2.0 Flash integration with structured Zod outputs and scripted/cached fallbacks for guaranteed evaluation reliability. |
| **Coalition Members** | **Hybrid** | Supports real PayPal Sandbox personal accounts plus labeled **Simulated Personas** behind the exact same interface. |
| **Fulfillment & Tracking** | **Simulated** | Delivery tracking progression and staged payouts are automated for evaluation. |

---

## 🏗️ Architecture

```
Project_Paypal/
├── apps/
│   ├── api/            # Hono backend, REST endpoints, webhooks, MCP JSON-RPC server
│   └── web/            # React 18 + Tailwind CSS + AG Grid frontend
├── packages/
│   ├── shared/         # Canonical types, Zod schemas, integer cents money arithmetic
│   ├── engine/         # Pure logic: FSM state transitions, volume tier curves, settlement math
│   ├── guard/          # Deterministic rules engine (G1–G12) - pure code, no AI, no network
│   ├── payments/       # Payment Provider interface (PayPalSandboxProvider + SimulatedProvider)
│   └── ai/             # Gemini 2.0 Flash wrapper, 8 agent roles, adversarial seller simulation
├── docs/               # Architecture, Security, Devpost Draft, Video Script, OpenAPI spec
└── scripts/            # Secret scanner, smoke tests, scenario runners
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v20+ or v26 (Node.js LTS is installed and verified)
- `pnpm` (installed globally: `npm install -g pnpm`)

### 1. Clone & Install
```bash
git clone https://github.com/your-username/quorum.git
cd quorum
pnpm install
```

### 2. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Quorum works out of the box with the simulated provider and scripted AI mode for immediate judge evaluation without needing external API keys!)*

To enable real PayPal Sandbox credentials:
```env
PAYPAL_ENV=sandbox
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
AI_API_KEY=your_google_ai_studio_key
AI_MODE=scripted # or 'live'
```

### 3. Run the Development Server
```bash
# Starts both the API (port 3001) and Web Dashboard (port 5173) in parallel:
pnpm dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser!

### 4. Run the Full Test Suite
```bash
# Runs 158 automated unit and integration tests across all packages:
pnpm test
```

### 5. Run the Security Scanner
```bash
# Scans for accidental secrets or live credentials:
pnpm scan:secrets
```

---

## 🎯 3-Minute Judge Evaluation Walkthrough

Judges can evaluate the complete system without any login:

1. Open **[http://localhost:5173](http://localhost:5173)**.
2. Click the **"Judge Guided Demo"** tab in the navigation bar.
3. Follow the 6 interactive steps:
   - **Step 1:** View the shopper's wish transformed into a deterministic Spec Envelope.
   - **Step 2:** Watch 9 new buyer agents swarm the room — the live price curve steps down from $389 to $315!
   - **Step 3:** Trigger the adversarial attack: Seller Gamma attempts prompt injection. Watch the **Guard block it live**!
   - **Step 4:** Review the Human Consent card and test simulated reservation authorization.
   - **Step 5:** Watch Quorum Lock and the Autonomous Waiting List promote a backup buyer when a simulated capture fails.
   - **Step 6:** Inspect the Staged Supplier Payout and verified **$0 discrepancy reconciliation** in the Ledger.

---

## 🛠️ Sponsor Tools & Technologies Used

- **PayPal Sandbox APIs & JS SDK:** Full authorize-then-capture lifecycle, partial captures, voids, refunds, and payouts.
- **Model Context Protocol (MCP):** Standards-compliant MCP server at `/api/mcp` for agentic commerce integration.
- **Google Gemini 2.0 Flash:** Natural language wish interpretation, multi-agent negotiation, and plain-language timeline explanations.
- **AG Grid Community:** Ledger table and member roster with status chips and real-time filtering.
- **Hono & Node Server:** High-performance web framework compatible with Node, Cloudflare Workers, and Render.
- **Vitest:** Fast unit, property, and integration test runner executing 158 tests in < 5 seconds.

---

## 📜 License

This project is open source and available under the **[MIT License](LICENSE)**. Built with pride for the PayPal AI Hackathon 2026.
