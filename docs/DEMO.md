# Judge Evaluation Guide: Testing Quorum

Thank you for evaluating Quorum for the **PayPal AI Hackathon 2026**!

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Launch backend (port 3001) and web dashboard (port 5173)
pnpm dev
```

Open **`http://localhost:5173`** in your browser (preferably in an Incognito / Private window to avoid PayPal sandbox session conflicts).

---

## 🎯 4-Step Interactive Evaluation Flow

### Step 1: Simulated Demo Exploration
1. At the top of the screen, note the **"Simulated Demo Active"** mode indicator.
2. Go to the **Coalition Room** tab (`/room`):
   - Inspect the live price curve stepping down as volume increases from 5 to 25 units.
   - Observe how 15 synthetic buyer agents have pooled demand to reduce unit pricing from \$389 down to \$315.
   - Inspect the member roster with transparency badges.
3. Switch to the **Financial Ledger** tab (`/ledger`):
   - Review double-entry accounting records powered by AG Grid.
   - Verify that $\sum(\text{debits}) = \sum(\text{credits})$ with **$0.00 discrepancy**.

### Step 2: Real-Time Demand & Live PayPal Sandbox Authorization
1. In the top banner or navbar toggle, switch to **"Real-Time Mode"** (100% pristine, zero pre-seeded data).
2. Go to the **Demand Aggregation** tab (`/`):
   - Enter: `"100 pieces of Samsung S24 Ultra"` with a \$380 price ceiling.
   - Click **"Compile specification envelope & find active coalition rooms"**.
   - Notice the AI parses your request into a deterministic JSON specification envelope.
3. Click **"Create new room for this wish"**:
   - Quorum instantly spawns a live coalition room and routes you into it.
4. Click **"Join Coalition & Authorize Hold"**:
   - Ensure **"Real PayPal Sandbox"** is active and click **"Authorize in PayPal Sandbox"**.
   - Use the one-click **Copy** buttons in the modal to paste test buyer credentials:
     - **Email:** `sb-anis353857682@personal.example.com`
     - **Password:** `Je<}|8an`
   - Log into PayPal Sandbox, review the \$380 reservation hold, and approve.
   - Click **"I approved in PayPal — Lock authorization"** in Quorum.
   - Notice: **Funds are held, NOT charged**. If the pool fails, the hold voids at \$0 cost.

### Step 3: Adversarial Threat Simulator
1. Switch to the **Safety & Guard** tab (`/audit`).
2. Test our deterministic pure-code rules engine against adversarial attacks:
   - Click **"Simulate Sybil Attack"**: An agent tries to flood the room with duplicate buyer accounts. Intercepted by Guard rule **G7**.
   - Click **"Simulate Price Ceiling Breach"**: A seller offers a price above the buyer's maximum ceiling. Blocked cold by Guard rule **G1**.
   - Click **"Simulate Seller Self-Dealing"**: A seller attempts to join as a buyer to artificially trigger bulk discounts. Intercepted by Guard rule **G8**.
3. Inspect the tamper-evident audit ledger updating live with cryptographic SHA-256 hashes.

### Step 4: Dispatch Outside AI Agents via MCP
1. Switch to the **API & MCP** tab (`/mcp`).
2. Select an outside agent persona (Claude Desktop, Cursor, LangChain, AutoGen).
3. Click **"Dispatch MCP Tool Call"**:
   - Watch Quorum execute a live JSON-RPC 2.0 `join_coalition` call against the protocol.
   - External agents interact seamlessly without needing custom closed SDKs.

---

## 🧪 Automated Test Verification

Quorum includes 158 automated unit and integration tests across 7 packages:

```bash
pnpm test
```
Result: **158 passed (100%)** in < 5 seconds.
