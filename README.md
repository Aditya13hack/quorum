# 🛡️ Quorum — An Autonomous Buyer Union Protocol for AI Shopping Agents

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-158%20Passing-emerald.svg)]()
[![PayPal](https://img.shields.io/badge/PayPal-Sandbox%20Orders%20v2%20%26%20Payouts-003087.svg)](https://developer.paypal.com)
[![Model Context Protocol](https://img.shields.io/badge/MCP-Server%20Active%20(JSON--RPC%202.0)-8B5CF6.svg)](https://modelcontextprotocol.io)
[![AG Grid](https://img.shields.io/badge/AG%20Grid-Interactive%20Ledger-E0234E.svg)](https://www.ag-grid.com/)

> **Submission for "Build What's Next with PayPal and AI" (PayPal AI Hackathon 2026)**

---

## 💡 The Core Problem

Autonomous AI shopping agents are rapidly proliferating. However, **every agent shops completely alone**. 

When an individual consumer or an isolated AI agent buys hardware, batteries, or office supplies, they get stuck paying single-unit retail markups. Wholesale bulk discounts have historically been reserved for enterprise procurement teams with massive balance sheets.

```
THE BROKEN PARADIGM (Current Commerce):
[Shopping Agent A] ───> Single-unit retail markup ($389) ───> Buys Alone
[Shopping Agent B] ───> Single-unit retail markup ($389) ───> Buys Alone
[Shopping Agent C] ───> Single-unit retail markup ($389) ───> Buys Alone

THE QUORUM PROTOCOL (Autonomous Buyer Union):
[Shopping Agent A] ┐
[Shopping Agent B] ┼──> [Quorum Protocol] ──> [Dynamic Reverse Auction] ──> Wholesale Tier ($315)
[Shopping Agent C] ┘                                                                 │
                                                                                     ▼
                                                                        PayPal Orders v2 Escrow Hold
                                                                        ($0 Upfront Buyer Risk)
```

**Quorum** flips the script: disparate AI agents pool their collective demand in real time, form reverse-auction coalitions against wholesale suppliers, and settle guaranteed group transactions through PayPal.

---

## ⚡ Key Architectural Innovations

### 1. Zero-Risk PayPal Authorization Holds (`intent: 'AUTHORIZE'`)
An AI agent can **never spend money autonomously**. When a buyer joins a coalition, Quorum creates an authorization hold via the **PayPal Orders v2 API** (`intent: 'AUTHORIZE'`). 
- **$0 upfront charge:** Funds are reserved on the buyer's PayPal account.
- **Auto-voiding protection:** If the pool fails to reach the required volume quorum before the deadline, all authorizations void automatically at **zero cost** to buyers.
- **Windfall partial captures:** When additional members join and unlock lower price tiers, buyers are charged the lower price upon capture, releasing excess reserved funds.

### 2. Pure-Code Guard Engine (`AI proposes, Pure Code decides`)
Financial safety in agentic commerce cannot rely on probabilistic LLM prompts. If an AI hallucinates a bid or colludes with a supplier, real funds are lost. Quorum enforces an unbending architectural invariant:

```
┌────────────────────────────────────────┐       ┌─────────────────────────────────────────┐
│     AI Engine (Probabilistic Proposal) │       │     Guard Engine (Pure Code Invariant)  │
│  - Natural language wish extraction    │ ────> │  - Rule G1: Hard price ceiling check    │
│  - Semantic category & spec matching   │       │  - Rule G4: Supplier honor rate filter  │
│  - Dynamic counter-offer suggestions   │       │  - Rule G7: Sybil attack interception   │
└────────────────────────────────────────┘       │  - Rule G8: Conflict-of-interest check  │
                                                 └─────────────────────────────────────────┘
```

Eight non-bypassable programmatic rules (G1–G8) validate every payload before it touches the state machine or payment rails. Every decision is committed into a SHA-256 hash-chained audit log.

### 3. Open Interoperability via Model Context Protocol (MCP)
Quorum exposes a native JSON-RPC 2.0 MCP server (`/api/mcp`). External shopping bots running in **Claude Desktop**, **Cursor**, **LangChain**, or **AutoGen** can autonomously discover coalitions and join buyer pools using standard tools.

### 4. Two-Sided PayPal Settlement Architecture
When a coalition reaches quorum and the aggregation horizon closes:
1. **Consumer Leg:** Quorum executes partial captures on all buyer authorization holds via PayPal Orders v2.
2. **Supplier Leg:** Quorum automatically dispatches a 50% milestone dispatch deposit to the winning supplier via PayPal Payouts, holding the remaining 50% in escrow until verified delivery.
3. **Double-Entry Ledger:** Reconciles all debits and credits with guaranteed **$0.00 mathematical discrepancy**.

---

## 🏗️ Repository Structure

Quorum is architected as a modular TypeScript monorepo using pnpm workspaces:

```
quorum/
├── apps/
│   ├── api/             # Hono backend, REST endpoints, PayPal SDK integration, MCP server
│   └── web/             # React 18 + Vite + Tailwind CSS + AG Grid dashboard
├── packages/
│   ├── shared/          # Canonical schemas, domain types, integer cents money math
│   ├── engine/          # FSM state machines, volume tier curves, settlement math, reconciliation
│   ├── guard/           # Pure-code deterministic rules engine (G1–G8) — zero external dependencies
│   ├── payments/        # Unified PaymentProviderInterface (PayPalSandboxProvider + SimulatedProvider)
│   └── ai/              # Groq / Gemini client, natural language wish interpreter, spec matcher
├── docs/                # Architecture diagrams, OpenAPI 3.0 specification, demo scripts
└── scripts/             # Automated credential validators and security scanners
```

---

## 🔍 Real vs. Simulated Integrity Matrix

Quorum maintains strict technical honesty about its operational environments:

| Component | Status | Operational Details |
|---|---|---|
| **PayPal Authorize & Capture** | **Real** | Uses live PayPal REST APIs (`/v2/checkout/orders` with `intent: 'AUTHORIZE'`, `/v2/checkout/orders/{id}/authorize`, capture, void, and payouts). |
| **PayPal Money** | **Sandbox** | Operates strictly in PayPal's sandbox environment (`api-m.sandbox.paypal.com`) with test accounts. No real fiat is charged. |
| **Deterministic Guard Engine** | **Real** | 100% pure TypeScript rules (G1–G8) backed by 33 dedicated security unit tests. |
| **AI Demand Formulation** | **Real** | Groq API (Llama 3.3 70B & GPT-OSS-120B) with Gemini 2.0 Flash fallback for structured JSON extraction. |
| **MCP JSON-RPC 2.0 Server** | **Real** | Exposes `list_coalitions` and `join_coalition` for outside agents. |
| **Financial Ledger Reconciliation** | **Real** | Double-entry balanced ledger verifying $\sum(\text{debits}) = \sum(\text{credits})$ to $0.00. |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v20+ or v22 LTS
- `pnpm` (install via `npm install -g pnpm`)

### 1. Clone & Install
```bash
git clone https://github.com/Aditya13hack/quorum.git
cd quorum
pnpm install
```

### 2. Environment Configuration
The repository includes a ready-to-run `.env.example`. Copy it to `.env`:
```bash
cp .env.example .env
```

To connect live PayPal Sandbox credentials, populate the variables:
```env
PAYPAL_ENV=sandbox
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
AI_API_KEY=your_groq_or_gemini_api_key
AI_MODE=live
```
*(Quorum also runs immediately out-of-the-box in simulated mode if external API keys are omitted).*

### 3. Start Development Servers
```bash
# Starts both the backend API (port 3001) and web dashboard (port 5173) in parallel:
pnpm dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser!

### 4. Run the Full Test Suite
```bash
# Executes 158 automated unit and integration tests across all 7 workspace packages:
pnpm test
```

---

## 🎯 Testing & Evaluation Guide for Judges

The application features a **Mode Switcher** in the top navigation bar:

### Mode A: "Simulated Demo" Mode
- Pre-seeded with an active 4K monitor coalition, 15 synthetic buyer agents, and a complete financial ledger.
- Ideal for immediately seeing volume tier steps, dynamic price curves, and balanced ledger math without entering credentials.

### Mode B: "Real-Time (Blank)" Mode
- Pristine live sandbox environment with **zero synthetic data**.
- **Demand Formulation:** Type `"100 pieces of Samsung S24 Ultra"` with a \$380 ceiling. Click **"Compile specification envelope"** to watch the AI parse it into a structured envelope.
- **Live Room Creation:** Click **"Create new room for this wish"** to spawn a fresh reverse-auction coalition.
- **Genuine PayPal Sandbox Hold:** Click **"Join Coalition & Authorize Hold"** with **"Real PayPal Sandbox"** active. The genuine PayPal Sandbox checkout modal will open.

#### Sandbox Test Buyer Credentials:
- **Email:** `sb-anis353857682@personal.example.com`
- **Password:** `Je<}|8an`
*(Use the convenient one-click "Copy" buttons in the checkout modal. For best results, use an Incognito window to avoid active developer cookie collisions).*

### Mode C: Adversarial Threat Simulator (`Safety & Guard` tab)
Judges can test our deterministic Guard engine directly:
- Click **"Simulate Sybil Attack"** (G7): Attempts to flood the coalition with duplicate buyer identities. Intercepted cold.
- Click **"Simulate Price Ceiling Breach"** (G1): Submits an offer exceeding the buyer's maximum price limit. Blocked immediately.
- Click **"Simulate Seller Self-Dealing"** (G8): An adversarial supplier attempts to inflate volume by joining as a buyer. Intercepted by Guard G8.

### Mode D: Outside Agent Dispatcher (`API & MCP` tab)
- Select an outside AI persona (Claude Desktop, Cursor, LangChain, AutoGen).
- Click **"Dispatch MCP Tool Call"** to execute a live JSON-RPC `join_coalition` call against the protocol.

---

## 🛠️ Tech Stack & Integrations

- **Payments:** PayPal Orders v2 API (`intent: 'AUTHORIZE'`), PayPal Sandbox, PayPal Payouts Batch API
- **AI & Reasoning:** Groq Cloud (Llama 3.3 70B & GPT-OSS-120B), Google Gemini 2.0 Flash
- **Agent Interoperability:** Model Context Protocol (MCP JSON-RPC 2.0)
- **Frontend:** React 18, Vite, Tailwind CSS, AG Grid Community, Lucide React
- **Backend:** Node.js, Hono, `@hono/node-server`
- **Quality & Testing:** Vitest, TypeScript 5.5, pnpm workspaces (158 automated tests)

---

## 📜 License

This project is licensed under the **[MIT License](LICENSE)**. Built for the PayPal AI Hackathon 2026.
