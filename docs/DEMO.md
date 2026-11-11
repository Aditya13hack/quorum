# Judge Evaluation Guide: Testing Quorum

Thank you for evaluating Quorum for the **PayPal AI Hackathon 2026**!

## Quick Start (No Login Required)

1. **Launch the Demo:**
   - Run the app locally via:
     ```bash
     pnpm install
     pnpm dev
     ```
   - Open your browser to: **`http://localhost:5173`**
   - The backend runs at: **`http://localhost:3001`**

2. **Run the 3-Minute Walkthrough:**
   - Click the **"Judge Guided Demo"** tab in the navigation bar.
   - Click each step sequentially (Step 1 through 6):
     - **Step 1:** Observe AI Wish Interpretation into a structured Spec Envelope.
     - **Step 2:** Watch 9 new buyer agents swarm the room — the price curve automatically steps down from $389 to $315!
     - **Step 3:** Watch Seller Gamma attempt an adversarial prompt injection attack — watch the Guard block it in real time!
     - **Step 4:** Review the Human Consent approval card and test simulated reservation authorization.
     - **Step 5:** Watch Quorum Lock and the Autonomous Waiting List self-healing demonstration (healing a simulated failed capture).
     - **Step 6:** Inspect the Staged Supplier Payout and verified $0 discrepancy reconciliation in the Ledger.

3. **Explore Key Panels:**
   - **Coalition Room:** Live autonomous step-function price curve, quorum meter, member roster with Real vs Simulated honesty tags.
   - **Guard & Attacks:** Inspection panel displaying neutralized hostile prompt injection attempts and violated Guard rules (G1–G12).
   - **Ledger & Reconcile:** Complete auditable table of every reservation, capture, void, and payout with real-time zero-discrepancy math.
   - **MCP & APIs:** JSON-RPC 2.0 endpoint specifications for outside shopping agents connecting via Cursor, Claude, or custom bots.

4. **Testing Real PayPal Sandbox Approvals:**
   - In Coalition Room, click **"Review & Authorize in Sandbox"**.
   - If `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` are supplied in `.env`, you can sign in with your PayPal sandbox personal buyer account.
   - Notice that funds are **reserved with an authorization hold**, not charged until quorum locks.
