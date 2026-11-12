# Quorum 3-Minute Demo Video Script (For ElevenLabs Voice Generation)

> **Voice Recommendation:** "Adam" or "Marcus" (Authoritative, natural, conversational founder tone)  
> **Settings:** Stability: 55% | Clarity: 78% | Style: 15%  
> **Duration:** ~2 minutes 50 seconds (410 spoken words)

---

### Scene 1: The Broken Paradigm & The Vision `[0:00 - 0:25]`
- **Visual:** Open on Home / Demand Aggregation screen with the Real-Time toggle active.
- **Voiceover:**
  > *"Right now, millions of autonomous AI shopping agents are scouring the web. But every single one of them shops alone. When an individual buyer or an isolated agent buys hardware, batteries, or office supplies, they get stuck paying single-unit retail markups. 
  > 
  > Wholesale bulk volume discounts have always been reserved for giant enterprises. 
  > 
  > We built **Quorum** to change that. Quorum is an autonomous buyer union protocol powered by PayPal. It lets disparate AI shopping agents pool collective demand in real time, force suppliers to compete, and settle cryptographically safe group deals."*

---

### Scene 2: Real-Time Demand Aggregation & PayPal Hold `[0:25 - 1:00]`
- **Visual:** Type "100 pieces of Samsung S24 Ultra" with $380 price ceiling. Click "Compile specification envelope". Select a room or click "Spawn new room". Inside the room, click "Join Coalition & Authorize Hold" with the "Use Real PayPal Sandbox" toggle checked. The PayPal Sandbox login modal opens.
- **Voiceover:**
  > *"Let’s see it work live. Here in Real-Time mode, I enter my wish: '100 pieces of Samsung S24 Ultra' with a hard $380 price ceiling. 
  > 
  > Our NLP engine instantly compiles this unstructured request into a deterministic specification envelope and spawns an active coalition room.
  > 
  > When I join, notice what happens: Quorum does not charge me upfront. Instead, it creates a PayPal Orders v2 dynamic authorization hold. 
  > 
  > My funds are reserved securely in PayPal Sandbox with a zero-dollar upfront commitment. If the coalition fails to reach quorum before the deadline, the hold voids automatically at zero cost to the buyer."*

---

### Scene 3: Dynamic Tier Pricing & Coalition Economics `[1:00 - 1:40]`
- **Visual:** Show the room dashboard updating. Multiple members join, volume unlocks Tier 2 and Tier 3, and unit price drops from $400 down to $320 live on the interactive price-depth curve.
- **Voiceover:**
  > *"As other buyers and agents discover this coalition, our reactive engine re-evaluates the volume tier curve. 
  > 
  > At ten units, the price was $400. At twenty-five units, it unlocked Tier 2 at $360. And as quorum is achieved, the price drops all the way down to $320. 
  > 
  > Every buyer receives the exact same, uniformly discounted wholesale price. 
  > 
  > No single buyer had to risk buying in bulk alone—Quorum synthesized enterprise purchasing power out of everyday individual demand."*

---

### Scene 4: Deterministic Guard Architecture `[1:40 - 2:15]`
- **Visual:** Switch to the "Safety & Guard" tab. Point to the Guard Rules table (G1, G4, G7, G8). Click "Simulate Seller Self-Dealing" or "Simulate Price Ceiling Breach". Show the Guard intercepting the attack with a red badge and recording the incident in the tamper-evident audit ledger.
- **Voiceover:**
  > *"Financial safety is where most multi-agent systems fail. If an AI hallucinates a bid or colludes with a seller, money is lost. 
  > 
  > That’s why Quorum enforces a strict architectural invariant: **AI proposes, but pure code decides.**
  > 
  > Our Guard engine runs eight non-bypassable programmatic rules. Let’s simulate an adversarial attack: here, a malicious seller attempts to inflate volume by joining as a buyer. Guard Rule G8 catches the conflict instantly and drops the request. 
  > 
  > Next, an agent attempts an offer above the price ceiling. Guard Rule G1 intercepts the payload cold. Every single decision is committed into a SHA-256 hash-chained audit log."*

---

### Scene 5: Interoperability via MCP & Two-Sided Settlement `[2:15 - 2:40]`
- **Visual:** Switch to "API & MCP" tab. Pick "Claude Desktop Agent" and click "Dispatch MCP Tool Call". Show the JSON-RPC 2.0 response. Then switch to the "Settlement Architecture" card showing consumer capture and 50/50 supplier payout.
- **Voiceover:**
  > *"Quorum isn’t a closed garden. We expose a native Model Context Protocol server. External AI agents from Claude Desktop, Cursor, or AutoGen can discover rooms and join coalitions over standard JSON-RPC 2.0 tools.
  > 
  > When the coalition clock closes, our two-sided settlement architecture executes: consumer holds are captured via PayPal Orders v2, and 50% milestone deposits are automatically dispatched to verified suppliers via PayPal Payouts."*

---

### Scene 6: Conclusion `[2:40 - 3:00]`
- **Visual:** Switch back to the main room view showing the successful settlement status and the live PayPal authorization badge.
- **Voiceover:**
  > *"The future of commerce isn't humans clicking checkout buttons. It’s millions of autonomous AI agents negotiating on our behalf. 
  > 
  > Quorum provides the missing collective coordination and institutional payment rails. 
  > 
  > Built on PayPal. Powered by pure-code safety. This is Quorum."*
