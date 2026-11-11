# Quorum — Complete Build Specification for the AI Coding Agent

> **Quorum is a union for AI shopping agents.** Many people's AI agents find each other, pool their demand, negotiate as one group against sellers' AI agents, and pay through PayPal. Money is only reserved until the group succeeds. If the group fails, nobody pays anything.

**Project:** Quorum
**Built for:** "Build What's Next with PayPal and AI" (PayPal AI Hackathon 2026, hosted on Devpost)
**Document date:** November 10, 2026
**Audience:** You, the AI coding agent. You will build the whole project from this document.
**Human owner:** Not necessarily a developer. They will do only the things you ask, step by step, in plain language.

---

## 0. Read this first

### 0.1 Your job

Build Quorum end to end: backend, AI agents, PayPal integration, frontend, seller page, API, MCP server, tests, deployment, documentation, and the assets needed to submit to the hackathon. The result must be a **working, hosted, open-source prototype** that judges can open and use.

You are expected to work fast and alone. Where you need something only a human can do (create an account, copy a key, click a button on a PayPal login screen, record a video), follow the **Human Action Protocol in Section 13**.

### 0.2 Prime directives (never break these)

1. **The deadline is fixed.** Submissions close at **12:00 PM Pacific on November 12, 2026**, which is **1:30 AM IST on November 13, 2026**. Today is November 10. Plan a code freeze on the afternoon of November 12 (India time) so there is buffer for the video and submission.
2. **Sandbox only. No real money, ever.** Use only PayPal's sandbox environment and only sandbox (test) accounts. Never ask the human for their real PayPal login, real card, or real bank details. Never point the code at PayPal's live environment.
3. **A human always approves spending.** The AI negotiates, but no money is reserved without the human's explicit approval of the final price. If the human does not answer before the timer ends, that counts as **no**. Silence never means yes.
4. **Limits are enforced by code, not by AI instructions.** The buyer's price limit, spec limit, and deadline are checked by deterministic code (the "Guard", Section 6.5). AI output is treated as a *proposal*. Never rely on a prompt to enforce a rule.
5. **Verify before you trust.** Your memory of PayPal, Cloudflare, Gemini, and sponsor tools may be outdated. Before writing code for each of them, read the current official documentation. Treat every API name, endpoint, field, limit, and model name in this document as a **hint to verify**, not as a fact.
6. **A thin vertical slice that works beats a wide build that doesn't.** Get one complete flow working end to end first (wish → coalition → offer → approve → reserve → charge → ledger), deploy it early, then widen.
7. **Be honest.** Everything simulated must be labeled as simulated in the UI and README. Never present sample prices or fake members as real. Never claim savings that are not computed from real or clearly labeled sample data.
8. **Keep it free.** Use only free tiers. If something would cost money, stop and ask the human before using it.
9. **No secrets in the repo.** Keys go in environment secrets and are never committed. Never print secrets in logs.
10. **No third-party trademarks in the product or demo.** Use generic product names (for example "27-inch 4K monitor"), not brand names, in the UI and video. Do not use copyrighted music or images.
11. **Never stall silently.** If you are blocked on a human action, say exactly what you need, then keep working on other tasks that do not depend on it.
12. **Make everything reproducible.** Another developer must be able to clone the repo, follow the README, and run it.

### 0.3 How to read this document

- **MUST** means required. **SHOULD** means do it unless you have a strong reason. **MAY** means optional.
- **Verify** means: read the current official docs before relying on it.
- Items are marked **P0** (must exist for the submission), **P1** (should exist), **P2** (nice to have). If time runs short, cut from the bottom (Section 14.3).
- No code is provided on purpose. This document tells you *what* to build, *how it must behave*, and *what to be careful about*. You choose the code.

### 0.4 Your first message to the human

Before building, reply with:

1. A summary of your understanding of Quorum in about ten lines.
2. The list of human actions needed right now (from Section 13), in order of urgency.
3. The first three things you will do while waiting.

Then start Phase 0 (Section 14).

---

## 1. The hackathon (context and constraints)

### 1.1 Basics

- **Name:** Build What's Next with PayPal and AI. Hosted on Devpost (paypalaihackathon.devpost.com). Global online hackathon.
- **Dates:** Submissions opened October 1, 2026. They close **November 12, 2026, 12:00 PM Pacific**. Judging runs about **December 1 to 15**. Winners are announced around December 21.
- **Important consequence:** judges will test the project *weeks after* the deadline. The hosted demo **MUST stay online and working through at least December 15, 2026**, without anyone touching it.

### 1.2 What the rules require

The project must:

- Meaningfully use at least one PayPal technology, API, SDK, product, or developer capability (using the free sandbox).
- Meaningfully use AI (any model or tool is allowed, as long as PayPal integration is central).
- Show a working prototype or proof of concept. A mockup or static prototype does **not** count.
- Be documented well enough for judges to evaluate it.

The submission must include:

- **Text description** of features and functionality.
- **Functional demo:** a hosted demo URL, or complete setup and run instructions in the repo. We will provide both.
- **Tools description:** which AI tools and services were used and how.
- **Public code repository** (GitHub) with all source, assets, and instructions, **public and open source, with a license file visible** at the top of the repo.
- **Demo video under 3 minutes**, uploaded publicly to YouTube, showing the project working. It must not contain third-party trademarks or copyrighted music or material without permission.

### 1.3 How projects are judged

Judges score: **technical implementation, design, potential impact, innovation, and presentation.**

Prizes (verify on the Devpost page): Grand prizes of $12,000, $8,000, and $5,000. Five special awards of $5,000 each: **Most Creative, Most Impactful, Best Demo Delivery, Best Use of PayPal + AI, Best Use of Agentic Commerce.** Separate sponsor awards are listed for AG Grid, APIMatic, Bryntum, Channel3, and Render (one source says Render offers credits instead of a cash award; verify).

### 1.4 What this means for how you build

- **Working beats impressive.** A flawless 3-minute demo of a smaller scope beats a broad but flaky build.
- **Design counts.** The interface must look polished, modern, and clear on desktop and mobile.
- **Presentation counts.** The live coalition screen must be visually compelling in a screen recording.
- **Aim at the special awards.** Quorum is strongest for *Best Use of Agentic Commerce* and *Best Use of PayPal + AI*, with a strong story for *Most Impactful* (community buying) and *Most Creative*.
- **Sponsor tools help only if used for real.** Using more sponsor tools does not raise the main score. Use only the ones we planned (Section 9), use them genuinely, and name them in the README and submission.

---

## 2. What Quorum is, in plain English

### 2.1 The problem

One person buying one thing alone has no bargaining power. As shopping becomes automated, a person's AI agent will face sellers' AI agents, which will be better resourced. Buying in bulk gets real discounts, but organizing dozens of strangers is so much work that nobody does it.

### 2.2 The idea

**Quorum has AI do the organizing and the bargaining.**

1. You tell your AI agent what you want and your limits: "27-inch 4K monitor, at most $400, I can wait three days."
2. Your agent finds other people's agents that want the same thing. Together they form a **coalition** with a countdown timer.
3. Sellers' AI agents compete in a reverse auction. They publish **volume tiers**: "$340 each if 20 people join, $310 if 40 join." The coalition's agent pushes for the best deal. The coalition's walk-away point is the best price a person could get shopping alone.
4. When a final offer is ready, **each person sees it and decides.** Approving means *reserving* money in PayPal (an authorization). No money moves yet.
5. If enough people approve (the **quorum**), PayPal **charges** everyone at the final price and the seller gets paid. If not, every reservation is released and nobody pays.

A good analogy: a union for shoppers, or a group-buy club run by AI that never sleeps.

### 2.3 Why it is different

Most hackathon teams will build one agent that shops for one person. Quorum reverses the lens: **agents join forces.** It uses PayPal for what PayPal is uniquely good at: holding a reservation on a buyer's funding source, then charging only when conditions are met. The AI does the matching, negotiating, planning, and fraud checking. Deterministic code keeps it safe.

### 2.4 Who it is for

It is a two-sided platform.

- **Buyers (the main users):** get lower prices without effort. Their agent works for them and stays inside their limits.
- **Sellers:** get guaranteed demand (reserved payments exist before they commit stock), bigger single orders, and lower marketing cost.
- **Social impact use:** neighbors pooling money for a community solar kit, or small shop owners pooling wholesale orders.

**Business model (for the README roadmap, not built):** a small, fixed, openly shown fee to the seller per successful coalition. It must never depend on the negotiated price, so the platform has no incentive to push prices up.

### 2.5 What is real and what is simulated in this hackathon build

**Real:**

- PayPal's actual API software and approval screens, running in PayPal's **sandbox** (fake money).
- The reserve, charge, release, refund, and payout logic.
- The AI models and the negotiation.
- The application, its code, and its live interface.

**Simulated (always labeled):**

- All money (sandbox money).
- All buyer and seller accounts (sandbox test accounts).
- Most coalition members. Only a few (3 to 5) are *real sandbox buyers* who approve payments on PayPal's real sandbox screen. The others are **persona agents** that use a "simulated PayPal" adapter behind the same interface.
- Seller businesses and (mostly) product catalogs. Prices are real only if they come from the Channel3 API; otherwise they are labeled sample data.
- Delivery and shipping events.

### 2.6 Scope: what to build now vs. the vision

Build now: everything in Sections 3 to 12 marked P0 or P1. The vision (real sellers, real shipping integrations, legal and licensing work, recurring coalitions, many categories) belongs only in the README roadmap.

---

## 3. Core concepts (glossary)

Use these words consistently in code, UI, and docs.

- **Wish:** what a buyer types in plain language ("a 4K monitor under $400").
- **Spec envelope:** the structured version of a wish: category, required attributes, acceptable ranges, price ceiling, and which substitutes are acceptable. Coalitions form around a spec envelope, not around free text.
- **Member:** a buyer who has joined a coalition. A member can be **real** (a human using a real PayPal sandbox buyer account) or **simulated** (a persona agent).
- **Coalition:** a group of members whose spec envelopes overlap, with a goal, a deadline, and a quorum.
- **Tier ladder:** a seller's offer as steps: minimum number of buyers → price per unit. Example: 20 buyers → $340, 40 buyers → $310.
- **Quorum:** the minimum number of approved members needed to reach the tier being offered.
- **Safety margin:** extra approved members required beyond the quorum before the group locks (default 10%), because some charges can fail at the last moment.
- **Waiting list:** extra members who have already approved and reserved funds, who can fill a spot if someone's charge fails.
- **Walk-away price (BATNA):** the best price a member could get shopping alone. The coalition never accepts a deal worse than this.
- **Authorization (reservation):** PayPal holds the buyer's money without moving it. Also called "reserve".
- **Capture (charge):** PayPal actually takes the reserved money.
- **Void (release):** PayPal cancels the reservation. Nobody is charged.
- **Partial capture:** charging less than the reserved amount. This lets the price go down after people approved.
- **Lock:** the moment a coalition stops accepting changes and starts charging.
- **Guard:** the deterministic rules engine that checks every AI proposal and every money action (Section 6.5).
- **Approval mode:** "Ask me each time" (the agent shows every offer) or "Auto within my limits" (the agent works alone but still stops for the final approval before money is reserved).
- **Demo clock:** a configurable speed-up so a coalition that takes days in real life can finish in about a minute in a demo.

---

## 4. How it works: step-by-step user journeys

### 4.1 Buyer journey (the main flow)

1. **Open the app.** The home page explains Quorum in one screen and offers two buttons: "Try as a buyer (real PayPal sandbox)" and "Watch the guided demo".
2. **Make a wish.** The buyer types what they want in plain language.
3. **Set limits.** The buyer sets: maximum price they will pay, how long they will wait (deadline), minimum quality or must-have attributes, and **approval mode**. The interface explains that the AI cannot go past these limits.
4. **The AI interprets the wish.** It produces a spec envelope and shows it back in plain language ("27 inch, 4K, IPS, under $400 — OK?"). The buyer can correct it.
5. **Matching.** The system finds an open coalition whose spec fits, or creates a new one. The buyer sees how many others are in it and the current price curve.
6. **Watching and negotiating.** The coalition room shows live: the member count versus quorum, the price tier reached, seller bids, a plain-language negotiation timeline, the countdown, and "you save $X compared to buying alone".
7. **Final offer.** When the sellers' best-and-final offer is ready, the buyer gets an **approval card** (rules in 4.3).
8. **Approve.** The buyer approves with the PayPal sandbox button. This **reserves** the money. Nothing is charged yet.
9. **Quorum or not.**
   - If the group reaches its quorum plus safety margin before the deadline, the coalition **locks**. Every member is charged the final price. The buyer gets a receipt.
   - If not, every reservation is released automatically and the buyer is told nothing was charged.
10. **Fulfillment.** The seller adds a tracking number. Delivery events (simulated) move the order along. The buyer can see status and can request a refund if the item is wrong or never arrives.

### 4.2 Seller journey (P1; can be a simple page)

1. Seller creates an **offer**: product (from the fixed catalog), tier ladder, honor clause (Section 5.6), shipping cost included, delivery time, and a hidden minimum acceptable price (the "floor").
2. Seller sees which coalitions match their product and how many committed buyers exist at each tier.
3. After lock, the seller sees orders, marks them shipped with a tracking number, and sees payout status.

In the demo, most sellers are simulated by AI **seller agents** configured with a floor and a ladder. One seller agent is deliberately **malicious** to demonstrate the Guard (Section 8).

### 4.3 The approval rules (very important)

When the final offer is ready, the buyer sees: final unit price, what they save compared to buying alone, how many members are in, quorum progress, the deadline, and the maximum amount that will be reserved. They can:

- **Approve:** PayPal reserves the money. This tap is the buyer's consent.
- **Reject:** the buyer leaves the coalition. Nothing is charged. The group continues without them.
- **Adjust limits:** for example "I'll wait for $300". The buyer's agent negotiates again within the new limits.
- **Do nothing:** when the approval timer ends, it counts as **reject**.

Price direction rules:

- **Price goes down** after the buyer approved (more people joined): the buyer is charged the lower price. Partial capture handles this. They never pay more than they approved.
- **Price goes up** after the buyer approved (people left): the buyer's approval does **not** cover the higher price. They are asked again. If they do not re-approve in time, they are removed, nothing is charged, and the coalition recalculates for the others.
- **Someone leaves before lock:** the group gets smaller and the tier may change. Everyone is notified. Anyone whose limit is now exceeded is dropped automatically. Only approved members count toward the quorum.

### 4.4 What the system outputs

For a **buyer**: the interpreted spec, a coalition room with live status, plain-language explanations of each negotiation step, an approval card, a receipt (price paid, savings, PayPal transaction IDs), fulfillment status, and refund status.

For a **seller**: ladder performance, committed order counts per tier, order list, shipping updates, payout status.

For a **judge or reviewer**: a guided demo page, a ledger of every reservation/charge/release/refund/payout, an audit log of every AI decision and Guard verdict, and a visible record of the attack that the Guard blocked.

For a **developer or outside agent**: a documented REST API (OpenAPI file), a generated SDK, a Postman collection, and an MCP server so another AI agent can search coalitions, make a wish, and join. An outside agent can **never approve a payment itself**: it receives an approval link for its human.

For the **hackathon submission**: the repo, the hosted URL, the video script, the text description, the tools description, and testing instructions (Section 18).

---

## 5. The money flow (PayPal in detail)

> Everything in this section is guidance to **verify against current PayPal docs** before coding. PayPal's documentation sites are listed in Section 21.

### 5.1 Principles

- Use PayPal's **authorize-then-capture** pattern: reserve first, charge later.
- All money amounts are stored as **integer cents** internally. Convert to PayPal's string format at the boundary. Currency is **USD only**.
- Prices shown to buyers are **tax-inclusive with flat shipping included** (sample data, no tax logic).
- Every PayPal call from the server MUST use an **idempotency key** (PayPal's request-ID header) so retries never double-act.
- Every PayPal call and response summary is written to the audit log.

### 5.2 Per-member lifecycle in PayPal terms

1. **Create the order.** When a real member approves the final offer, the server creates a PayPal order with intent **authorize**, for the member's **approved maximum** (the price they were shown, USD, tax-inclusive, shipping included).
2. **Buyer approves in PayPal.** The buyer approves on PayPal's sandbox screen, using PayPal's JavaScript SDK (read the current SDK v6 docs; the flow differs from older versions). The server must **never** trust the browser to say "approved". It confirms with PayPal.
3. **Authorize.** The server authorizes the approved order and stores the **authorization ID**. This reserves the money. Nothing is charged.
4. **Reservation window.** PayPal's rules (verify): an authorization is valid for up to 29 days, with a 3-day "honor period" in which the funds are best protected, and re-authorization is possible after that. **Design rule: a coalition must lock and capture within the honor period.** Maximum real-mode coalition window: 3 days. Sandbox authorizations may not expire, so do not rely on sandbox behavior to test expiry.
5. **Capture.** At lock, capture each authorization for the **final** price. If the final price is lower than the authorized amount, use **partial capture** and mark it as the final capture so the remainder is released. Never capture more than the approved amount.
6. **Void.** If the quorum fails, the member leaves before lock, or the deadline passes, **void** the authorization.
7. **Refund.** After capture, refunds use the refund endpoint (full or partial) against the capture.

### 5.3 What can go wrong at capture time

PayPal states a capture can fail because of risk checks or insufficient funds. At the moment of quorum, a few captures out of many can fail. The **Settlement logic** MUST handle it in this order:

1. **Retry once** after a short delay (same idempotency key logic; verify retry rules).
2. **Promote from the waiting list:** capture a waiting-list member who already holds a reservation.
3. **Honor clause:** if the final approved-and-captured count is still below the tier threshold but at or above the seller's honor percentage (default 90% of the threshold, agreed in the seller's offer), the seller honors the tier price.
4. **Abort cleanly:** if the tier still cannot be held, the coalition **fails at capture**. Refund every capture that already succeeded in full, void every authorization that is still open, mark the coalition `FAILED_AT_CAPTURE`, and tell every member exactly what happened ("nobody was charged; refunds issued"). Offer members a one-tap re-approval into a new coalition at the new, higher price. Do **not** silently charge anyone a different price, and do **not** try to patch prices after some members were already captured.
5. This abort path should be rare because of the safety margin, the waiting list, the retry, and the honor clause. It MUST still exist, be tested, and be demonstrable from the admin scenario controls.

Before capturing, the engine SHOULD re-check each authorization's status with PayPal (verify the "get authorization details" call) so that obviously dead reservations are replaced from the waiting list *before* any money moves.

The demo MUST show step 2 working (one capture fails, the waiting list heals it). The abort path (step 4) MUST be shown in a test or admin demo, not necessarily in the 3-minute video.

### 5.4 Where the money goes (three options, in priority order)

**DECISION to make in Phase 1, time-boxed to 90 minutes total:**

- **Option A (preferred, if available): PayPal's marketplace setup.** Each order names the seller as payee, and the platform takes a fee. This means the platform never holds buyer money. It needs seller onboarding and PayPal partner enablement; verify whether the sandbox allows it. Community reports say some developers had to ask PayPal support to enable it. If it does not work within the time-box, move to B.
- **Option B (expected fallback): platform as merchant, then Payouts.** Buyers pay the platform's sandbox business account. After lock and delivery steps, the platform pays the supplier with the **Payouts** API. Payouts may need to be enabled by PayPal support for the sandbox business account (the human requests this; see Section 13). This is fine for a demo. The README MUST state honestly that in real life this means the platform touches funds and has legal and licensing implications, and that Option A is the production design.
- **Option C (last resort): simulated supplier settlement.** Show the supplier payment as a clearly labeled simulation in the ledger.

Record which option you ended up with in the README.

### 5.5 Staged supplier payout (build in Option B or C)

Do not pay the supplier everything at once. Default schedule: **50% when the seller marks the order shipped, 50% when delivery is confirmed.** Delivery confirmation in the hackathon build is a simulated event (a scripted or admin-triggered "delivered" webhook). If the seller never ships before a deadline, the remaining funds go back to buyers via refunds. In Option A, if staged release is not possible, say so honestly in the README (check whether PayPal offers delayed disbursement for your setup).

### 5.6 Seller honor clause

In a seller's offer, the seller may state: "I honor the tier price if at least N% of the tier threshold is reached" (default 90%). This reduces the chance that one failed charge breaks the deal. The Guard MUST verify every use of the honor clause.

### 5.7 Money safety invariants (enforced in code and tested)

1. Never capture more than the member's approved amount.
2. Never capture a member who has not approved and holds a valid authorization.
3. Never capture before the coalition is locked and the final tier is determined.
4. Never capture the same authorization twice (idempotency plus a database uniqueness rule).
5. Every non-lock outcome (fail, expire, cancel, leave) ends with a void for every open authorization.
6. The ledger always reconciles: total reserved, captured, voided, refunded, paid out must add up, per coalition and overall. Build a reconciliation check and run it in tests and in the admin page.
7. Every money action has an audit log entry linking it to the decision that caused it.

### 5.8 Webhooks

Register a PayPal webhook for the deployed URL (the human does this once you give them the URL; Section 13). Verify the signature of every webhook. Deduplicate by event ID. Handle at least the events for: order approved, authorization created, authorization voided, capture completed, capture denied or pending, capture refunded, and payout batch results (verify exact names). Webhooks update the ledger; they never override the engine's decisions without being logged.

---

## 6. The AI system

### 6.1 One principle: the AI proposes, the code decides

AI is used for understanding language, matching, negotiating, planning, explaining, and spotting suspicious patterns. AI **never** holds authority over money or limits. Every AI output is a structured proposal that goes through the Guard before anything happens. If the AI is wrong, slow, rate-limited, or attacked, the worst case is a bad proposal that the Guard rejects.

### 6.2 The agents (roles)

Build these as separate, small, well-defined AI roles. Each has a fixed input schema, a fixed output schema, and a deterministic fallback.

1. **Wish Interpreter.** Turns free text plus limits into a spec envelope (category, attributes, ranges, price ceiling, acceptable substitutes, deadline). Also writes the plain-language "did I understand you?" summary. Fallback: a form-based spec picker over the fixed catalog.
2. **Matcher.** Decides whether a spec envelope fits an existing coalition or needs a new one, and may suggest "would you accept model B for $20 less?" to merge near-matching groups. In the demo catalog, matching is mostly deterministic attribute scoring; AI is used for tie-breaks and the merge suggestions. No vector database is needed.
3. **Buyer Agent (one per real member; personas for simulated members).** Represents one member. Holds that member's limits (limits live in the database, **not** in the prompt as the source of truth). Reads structured offers, decides accept/hold/counter *within limits*, and drafts the explanation shown to the member.
4. **Coalition Agent (the negotiator).** Represents the whole group in the reverse auction. Knows the group's size, the combined limits, and the walk-away price. Requests quotes, compares tier ladders, and asks for improvements.
5. **Seller Agents (simulated suppliers).** Each has a hidden floor and a tier ladder strategy. They bid, counter, and issue best-and-final offers. One of them is **adversarial** (see Section 8).
6. **Settlement Agent.** At lock time it proposes the capture plan: which authorizations to capture at what amount, how to handle a failed capture, and when to promote the waiting list. It proposes; the Guard validates; the engine executes the PayPal calls. This is the place where AI and PayPal tools meet (see 9.6 on the PayPal Agent Toolkit).
7. **Explainer.** Writes short, plain-language messages for members and for the live timeline ("Seller B dropped to $329 because 12 more people joined"). P2: member-selectable language (English, Hindi, Spanish) to support accessibility and the impact story.
8. **Risk Analyst.** Reads join patterns and flags anomalies (duplicate accounts, bursts of joins, suspicious sellers) with a short explanation. The flags feed the Guard; they do not act alone.

### 6.3 Structured input and output (MUST)

- Every AI call uses a defined **schema** for output (validated with a schema library such as Zod). If the output fails validation, retry up to two times with the validation error included, then use the **deterministic fallback**.
- Use low temperature. Ask for short outputs.
- Keep prompts minimal: only the data that role needs. Never put secrets, keys, or full member profiles in prompts.
- Free-text from outside the system (seller notes, member wishes) is **untrusted data**. Pass it inside clearly delimited data fields. Never place it in the instruction part of a prompt. Never let it change which tools or actions are available.

### 6.4 The negotiation protocol

Negotiation is a bounded, structured exchange, not an open chat.

1. **Request for quotes (RFQ):** the Coalition Agent sends sellers the spec envelope, current member count, and deadline.
2. **Bids:** each seller replies with a tier ladder (minimum buyers → unit price), delivery time, an honor percentage, and an optional short note. The note is untrusted text.
3. **Counter round:** the Coalition Agent asks selected sellers for improvements, citing the walk-away price and competing ladders.
4. **Best and final:** sellers submit last ladders.
5. **Selection:** the Coalition Agent proposes the winning ladder and the expected price at the expected member count.
6. **Guard check, then offer to members.**

Rules:

- Maximum **three rounds**. Each round has a time limit (short in demo mode).
- The negotiation transcript (structured fields plus the sanitized notes) is stored and shown in the UI as a readable timeline.
- If a seller does not respond or responds invalidly, drop that seller from the round.
- If no ladder beats the walk-away price, the coalition **waits** (while collecting more members) or expires. It never accepts a worse-than-solo deal.

### 6.5 The Guard (deterministic rules; MUST be pure code with unit tests)

The Guard is a library of checks with no AI inside. At minimum:

- **G1.** No offer price may exceed any approving member's **approved maximum**. A member whose limit is exceeded by an offer is dropped from the count, not charged.
- **G2.** The offered product must fit the spec envelope (attributes and acceptable substitutes).
- **G3.** The tier ladder must be well-formed: minimums increase while prices decrease; no negative or zero values; prices within sane bounds relative to the walk-away price.
- **G4.** The honor percentage must be within an allowed range (for example 80% to 100%).
- **G5.** Seller notes must never alter any structured field. Only structured fields are used for decisions.
- **G6.** Only members with a **valid, unexpired authorization** (or a simulated equivalent) count toward quorum.
- **G7.** One real PayPal account (payer identifier) counts as one member in a coalition.
- **G8.** Sellers cannot join as buyers in their own coalition.
- **G9.** No capture, void, refund, or payout happens unless the engine's state machine allows that transition and the invariants in 5.7 hold.
- **G10.** The Settlement Agent's capture plan must equal the engine's own computed plan or be a valid reordering of it (promotion from the waiting list). Any plan that touches an amount or a member outside the computed set is rejected.
- **G11.** Rate limits: maximum joins per account and per IP in a time window; maximum AI calls per coalition.
- **G12.** Every Guard verdict (allow or block) is written to the audit log with the reason.

### 6.6 AI modes (MUST implement all three)

- **live:** real AI calls to the model provider.
- **cached:** the same input gets the same stored output (cache key is a hash of the schema plus the input). Cuts cost and rate-limit risk.
- **scripted:** pre-recorded structured outputs for the guided demo scenario. This guarantees the demo works even if the AI service is down or rate-limited. The UI must show a small "scripted demo" label when in this mode, so we remain honest.

Behavior on failure: on 429 (rate limit) or timeouts, back off and retry; after the limit, fall back to cache, then to the deterministic strategy, then to scripted outputs where available.

### 6.7 Model provider (free)

- Use a **provider-agnostic wrapper** so the model can be swapped by a configuration change.
- Default: Google's Gemini API **free tier** via an AI Studio key. Verify which models are currently free and their rate limits (they are per project and shown in AI Studio, and they change). Put the model name in configuration, never hard-coded.
- Free-tier prompts may be used by the provider to improve its products. Therefore send **only fake or sample data**, never real personal data.
- PayPal says it provides access to some AI sponsor tools. If the human obtains better free access that way, the wrapper makes switching easy.

### 6.8 Evaluation of the AI parts (SHOULD)

Create a small test set (about 20 wishes, several malicious seller notes, several edge cases like impossible limits). Run it in tests with the scripted/cached modes, and record pass rates in the docs.

---

## 7. Coalition lifecycle and state machines

### 7.1 Coalition states

1. `COLLECTING`: open, members joining, a countdown running.
2. `NEGOTIATING`: RFQ and bid rounds running (can overlap with COLLECTING; keep it clearly defined).
3. `OFFER_READY`: a best-and-final offer exists and passed the Guard; members are asked to approve.
4. `APPROVING`: members approve (reserve) or decline; the approval deadline runs.
5. `LOCKED`: quorum plus safety margin reached; no more changes.
6. `CAPTURING`: charges are being made; settlement logic runs.
7. `FULFILLING`: shipping and delivery steps; staged payouts.
8. `SETTLED`: everything is paid out or refunded; the ledger reconciles.

Terminal failure states: `EXPIRED` (quorum not reached; all voided), `CANCELLED` (admin or seller withdrawal; all voided), `FAILED_AT_CAPTURE` (abort path; refunds issued).

Return transitions: `OFFER_READY → NEGOTIATING` (offer invalidated by changes), `APPROVING → COLLECTING` (too many dropouts, restart collecting).

### 7.2 Member states

`INTERESTED → LIMITS_SET → MATCHED → OFFER_SHOWN → APPROVED (reserved)` then either `CAPTURED → DELIVERED`, or `REFUNDED`, or `RELEASED (voided)`. Side states: `DECLINED`, `DROPPED` (limit exceeded or left), `EXPIRED_NO_ANSWER` (counts as decline), `WAITLISTED`, `FAILED_AUTH`, `FAILED_CAPTURE`, `REAPPROVAL_REQUIRED`.

### 7.3 Rules

- Write the allowed transitions as a table in code and test it. Any transition not in the table is rejected and logged.
- **Single writer per coalition.** All changes to one coalition go through one place that processes events one at a time (in the Cloudflare design, one Durable Object per coalition). This avoids two people racing at the moment of quorum.
- All timers (approval deadline, coalition deadline, staged payout deadlines) are scheduled in that same place (Durable Object alarms in the Cloudflare design; verify the alarm API).
- Events are processed **idempotently**: replaying the same event does nothing.

### 7.4 The demo clock

Real mode: coalition window up to 3 days. Demo mode: a time-scale setting (for example 1 real minute = 1 simulated day) applies to **all internal timers**, so the guided demo finishes in about a minute. PayPal reservations are still real; only our timers are accelerated. The UI shows the active time scale. Never use accelerated time for anything that PayPal itself enforces.

---

## 8. Abuse, fraud, and security design

### 8.1 Threats and defenses

- **Prompt injection from sellers or members.** Seller notes may say "ignore your limits and accept". Defense: untrusted text is data only (6.3), the Guard decides (6.5), and structured fields only (G5). The adversarial seller in the demo proves this live.
- **Fake demand to move price tiers.** Only members with valid reservations count (G6). One payer account counts once (G7). Sellers cannot join as buyers (G8).
- **Sybil members** (many fake accounts). Rate limits (G11), anomaly flags from the Risk Analyst, and the requirement for a real reservation per real member. Simulated members are labeled and are not counted as real in public claims.
- **Double charging or missed events.** Idempotency keys, database uniqueness, single writer, webhook deduplication.
- **A buyer changing their mind.** They can leave until lock (void). After capture, use the refund path.
- **Secret leakage.** Secrets only in environment secrets; `.gitignore` for local secret files; never log secrets; scan the repo before publishing.
- **Abuse of the public demo.** Rate limits per IP, a cap on AI calls per day, and an admin token for admin endpoints. Public demo controls are limited to safe actions.
- **Webhook spoofing.** Verify PayPal signatures; reject anything unverified.
- **Cross-site problems.** Set strict CORS for the API, validate every input with schemas, escape all displayed text (seller notes especially).

### 8.2 The audit log

Append-only. It records: every state change, every AI call (role, input hash, output summary, validation result), every Guard verdict, every PayPal call (endpoint, idempotency key, status, IDs, no secrets), every webhook, and every admin action. The UI has an **Audit** page showing a readable view, including the blocked attack. This is also a strong feature for the *Best Use of Agentic Commerce* story: "agents spend money, and every decision is accountable".

### 8.3 Privacy

Collect the minimum. In the hackathon build, shipping addresses are sample data. Do not store real personal data. State this in the README.

---

## 9. Tech stack (all free)

### 9.1 Decisions at a glance

| Area | Choice | Notes |
|---|---|---|
| Language | **TypeScript everywhere** | One language across frontend, backend, shared rules |
| Hosting (primary) | **Cloudflare**: Workers (API), Durable Objects (one per coalition), D1 (SQL), Pages or Workers static assets (frontend) | Free tier, no sleeping, no database expiry. Verify current free limits |
| Hosting (fallback) | **Render** free web service, one Node service, SQLite re-seeded at every start | Sleeps after idle, wakes in about a minute, files are lost on restart, free Postgres expires after 30 days. Use only if Cloudflare proves unworkable |
| API framework | Hono (or similar small Workers-friendly router) | Verify it works in the Workers runtime |
| Frontend | React + Vite + Tailwind | Polished, responsive, light and dark |
| Live updates | Server-Sent Events or WebSockets through the coalition's Durable Object; fall back to polling every 2 seconds | Choose whichever works within free limits |
| Validation | Zod (or equivalent) | For AI outputs, API inputs, config |
| Tables | AG Grid Community (free edition) | The ledger and roster |
| Timeline | Bryntum (only if a free trial or hackathon license is usable) | Otherwise a simple custom timeline |
| Charts | A small chart library (for example Recharts) | Price curve, quorum meter |
| AI | Provider wrapper; default Gemini free tier | Section 6.7 |
| Payments | PayPal sandbox: Orders (authorize/capture/void), refunds, Payouts (if enabled), webhooks, JS SDK v6, Agent Toolkit/MCP | Section 5 and 9.6 |
| Real prices | Channel3 API | Walk-away price benchmark; fall back to labeled sample data |
| API contract | OpenAPI file, SDK generated with APIMatic | Section 9.5 |
| Outside-agent access | Our own MCP server | Section 9.7 |
| API testing | Postman collection (free plan) | Section 9.5 |
| Tests | Vitest (unit), Playwright (end to end), GitHub Actions (CI) | Free for public repos |
| Repo and license | Public GitHub repository, **MIT license**, visible in the repo's About section | Required by the rules |
| Package manager | pnpm workspaces | Monorepo |

### 9.2 Repository layout (guidance)

Organize the monorepo so the important logic can be tested without any cloud service:

- `apps/web`: the React frontend.
- `apps/api`: the Cloudflare Worker, the coalition Durable Object, routes, webhooks, SSE.
- `packages/shared`: types, schemas, status enums, money helpers (integer cents), constants.
- `packages/engine`: **pure logic**: tier pricing, state machine tables, quorum and margin math, waiting-list logic, settlement planning, ledger reconciliation. No network and no cloud APIs inside.
- `packages/guard`: the Guard rules (pure code).
- `packages/ai`: the provider wrapper, role prompts, schemas, caching, scripted mode, deterministic fallbacks.
- `packages/payments`: a **payment provider interface** with two implementations: `PayPalSandboxProvider` and `SimulatedProvider` (details in 9.3).
- `packages/mcp`: the MCP server definition.
- `packages/sdk`: the generated SDK (output of APIMatic) if used.
- `scripts`: seeding, PayPal smoke test, reconciliation check, demo scenario runner, repo secret scan.
- `e2e`: Playwright tests.
- `docs`: ARCHITECTURE, DEMO, SECURITY notes, DEVPOST draft, API docs, OpenAPI file, Postman collection.

Rule: `engine`, `guard`, and `shared` MUST NOT import anything runtime-specific. This is what makes a fallback to Render cheap.

### 9.3 The payment provider interface (MUST)

The engine talks to payments only through one interface with these capabilities: create an order for approval, authorize an approved order, get authorization status, capture (full or partial), void, refund a capture, and pay out to a seller. Two implementations:

- **PayPalSandboxProvider:** calls PayPal's sandbox. Used for real members.
- **SimulatedProvider:** keeps fake records with clearly prefixed fake IDs (for example `SIM-...`). Used for simulated members. It supports **failure injection** (for example "this member's capture fails") for the demo and tests.

The UI shows a **Real** or **Simulated** badge on every member and ledger row. Both providers go through exactly the same engine code.

### 9.4 Cloudflare design notes (verify all of this)

- One **Durable Object per coalition** is the single writer of that coalition's state and owns its timers (alarms). It processes events one at a time.
- Free-plan Durable Objects use the SQLite storage backend. Free-plan D1 and request limits exist and reset daily (UTC). D1 queries fail once a daily limit is exceeded, so **avoid chatty queries and polling**; batch writes; keep projections small.
- Free-plan Workers have per-request limits (CPU time and the number of outbound requests per invocation). **Do not make dozens of PayPal calls inside one request.** Process captures and voids in small batches, driven by alarms or repeated invocations, and make the process resumable and idempotent. Verify the exact current limits first and design to them.
- Use only web-standard APIs available in the Workers runtime. Call PayPal and the AI provider with plain HTTP requests unless an SDK is confirmed to work in Workers.
- Cache the PayPal access token until shortly before it expires.
- Static frontend: follow Cloudflare's currently recommended approach for hosting a Vite app next to a Worker (verify; Cloudflare has been merging Pages into Workers).
- Put a health endpoint and a version endpoint in the API.

**Fallback decision rule (DECISION D2):** if by the end of Phase 2 (Section 14) the engine running on Cloudflare is not stable, switch the hosting layer to Render (one Node service, in-process timers, SQLite re-seeded at startup). Because `engine`, `guard`, `shared`, `ai`, and `payments` are runtime-neutral, this costs hours, not days. If you switch to Render, also add a free uptime ping so the demo does not sleep, and warn judges in the README about the first-load delay (verify Render's terms).

### 9.5 Sponsor tools: exactly how we use them

Use only these, and use them for real. Name each one in the README and the submission's tools section.

1. **Channel3 (P1):** product search/price data. Use it to fetch real prices for the demo catalog items and compute each coalition's walk-away price and the "you save" number. If access is not available quickly, use clearly labeled sample prices.
2. **AG Grid Community (P1):** the live ledger (reservations, charges, voids, refunds, payouts) and the member roster, with sorting, filtering, status chips, and CSV export.
3. **APIMatic (P1):** write an OpenAPI description of Quorum's public API. Use APIMatic to generate a client SDK (and an MCP server if their tools support it) from it. Verify what their free offering allows. If it is not usable in time, hand-write the SDK stub and say so honestly.
4. **Bryntum (P2):** a timeline/Gantt-style view of a coalition's stages and delivery schedule. Verify the license for hackathon use before adding it. If unclear within one hour, build a simple custom timeline instead.
5. **Postman (P2, free):** a collection covering the public API and the PayPal sandbox smoke flow, with example environments and a short usage note.
6. **Render:** only if the fallback in 9.4 is used.

**Not used on purpose:** Elastic, Kernel, Astropods, Zapier. Do not add them unless the human asks and there is a natural, free use.

### 9.6 PayPal tools: exactly how we use them

- **Orders (authorize), capture, void, refund:** the core flow (Section 5).
- **JavaScript SDK (v6):** the buyer's approval button in the browser.
- **Webhooks:** keep the ledger accurate and detect out-of-band changes.
- **Payouts:** supplier payments (Option B). Requires enablement.
- **Marketplace/multiparty features:** Option A, time-boxed.
- **PayPal Agent Toolkit and MCP server (P1):** read the current quickstarts. Use them so that the Settlement Agent's PayPal actions are expressed as **agent tools** with a guarded wrapper: the AI may *request* "capture X for member Y", the Guard validates, and only then is the PayPal tool executed. If the toolkit cannot run inside the Workers runtime, run it in a small separate Node process or only in the documented outside-agent demo, and describe this honestly. Time-box this investigation to 60 minutes. The aim is to show real "agent plus PayPal tools" usage without giving the AI unchecked authority.

### 9.7 Our own MCP server (P1)

Expose a small MCP server so an outside AI agent can participate: search open coalitions, create a wish, join a coalition with limits, get the current offer, get status, and get an **approval link** for its human. It MUST **not** be able to approve or pay on the human's behalf. Verify Cloudflare's current support for hosting remote MCP servers. Document how to connect to it in the README.

---

## 10. Architecture, data model, and API

### 10.1 How the pieces fit (in words)

- The **browser** runs the React app, shows the coalition room, and loads PayPal's JS SDK for the approval button. It talks to the **API Worker** with plain HTTP and receives live updates from the coalition's channel.
- The **API Worker** validates requests, loads or creates the right **CoalitionRoom Durable Object**, and forwards events to it. It also serves webhooks, the MCP endpoint, and admin endpoints.
- The **CoalitionRoom** holds the authoritative state: members, approvals, offers, waiting list, timers, and the settlement progress. It calls the **AI layer** (through the Guard) and the **payment provider interface**, and writes to the audit log and ledger projection.
- **D1** stores shared data: users, catalog, seller offers, ledger projection, audit log, webhook dedupe records, AI cache, and scenario runs.
- **External services:** PayPal sandbox, the AI model provider, and Channel3.

### 10.2 Main data entities (guidance, not a schema)

- **User:** id, type (buyer or seller), display name, real or simulated flag, sandbox payer identifier (hashed or masked), created time.
- **Product (catalog):** id, generic name, category, attributes, sample price or Channel3 price with a source label.
- **Wish and SpecEnvelope:** id, owner, text, structured spec, limits (max price, deadline, must-haves, approval mode), status.
- **Coalition:** id, product or spec, state, quorum, safety margin, deadlines, time scale, chosen offer id, final tier and price, honor percentage.
- **Membership:** coalition, user, real or simulated, state, approved maximum (cents), authorization id (or simulated id), waiting-list position, timestamps.
- **SellerOffer:** id, seller, coalition or product, tier ladder, honor percentage, delivery time, hidden floor, notes (untrusted), status.
- **NegotiationMessage:** coalition, round, from, structured payload, sanitized note, Guard verdict.
- **Payment records:** order id, authorization id, capture id, refund id, payout id; amounts in cents; provider (PayPal or simulated); status; related idempotency key.
- **Shipment:** order, tracking number, status, simulated delivery events, timestamps.
- **AuditEntry:** time, actor (system, member, seller, admin, AI role), event type, reference ids, summary, verdict.
- **WebhookSeen:** event id, type, processed time.
- **AICacheEntry:** hash, role, output.
- **ScenarioRun:** scenario id, steps executed, results.

### 10.3 API surface (guidance)

Design clean REST endpoints and publish them as an OpenAPI file. Suggested set:

| Purpose | Notes |
|---|---|
| Health and version | Public |
| Catalog list and detail | Public |
| Create wish (text + limits) | Returns interpreted spec for confirmation |
| Confirm spec and find or create coalition | Returns coalition id |
| Get coalition (state, members, price curve, offers, timeline) | Public view of the room |
| Live event stream for a coalition | Server-Sent Events or WebSocket |
| Update my limits / approval mode | Member only |
| Get my approval card | Member only |
| Start PayPal approval (create order) | Server creates the order |
| Complete PayPal approval (authorize) | Server confirms with PayPal; never trusts the browser |
| Decline or leave | Member only; voids if needed |
| Request refund | After capture, within rules |
| Seller: create or edit offer | Seller token |
| Seller: view orders; mark shipped with tracking | Seller token |
| Ledger list (filterable) | Public in the demo, read only |
| Audit log list | Public in the demo, read only |
| PayPal webhook receiver | Signature verified; deduplicated |
| Admin: scenario controls (inject failed capture, malicious bid, member drop, fast-forward, reset) | Admin token |
| Admin: reconciliation report | Admin token |
| MCP endpoint | Section 9.7 |

Rules: validate every input; return clear errors; never return secrets; rate limit everything public.

---

## 11. User interface specification

The design must feel modern, calm, and trustworthy, and be legible in a screen recording. Light and dark mode. Responsive down to phone width. Accessible: keyboard operable, sufficient contrast, labels on every control, screen-reader-friendly status updates. Use generic product names and no third-party logos. Spend real effort here: design is a judging criterion.

### 11.1 Screens

1. **Home.** One-sentence explanation, a small animated example of the price dropping as people join, and two buttons: "Try as a buyer (PayPal sandbox)" and "Watch the guided demo". A short "what is real, what is simulated" note.
2. **Wish.** A text box, example wishes as chips, limits form (max price, wait time, must-haves, approval mode), and a clear sentence: "Your agent cannot go past these limits."
3. **Spec confirmation.** The interpreted spec in plain language with editable fields.
4. **Coalition room (the hero screen).**
   - A **live price curve**: price on one axis, number of members on the other, tiers as steps, a marker for the current position and the quorum.
   - A **quorum meter** with the safety margin shown.
   - **Roster** of members (AG Grid), with Real/Simulated badges and states.
   - **Seller bids** panel with structured offers.
   - **Negotiation timeline** in plain language (the Explainer's output).
   - **Countdown** (with the demo clock label if active).
   - **Savings versus buying alone** (with the source: Channel3 or sample).
   - **Approval card** when the final offer is ready.
5. **Approval and checkout.** The final price, savings, maximum to be reserved, deadline, and the buttons: Approve (PayPal), Reject, Adjust limits. A clear sentence: "Approving reserves money. You are only charged if the group succeeds."
6. **Receipt and order status.** Price paid, PayPal transaction IDs, shipping status, a refund button when allowed.
7. **Ledger.** AG Grid table of reservations, charges, voids, refunds, payouts, with filters, status chips, and totals.
8. **Timeline view.** Stages of the coalition and delivery (Bryntum or a simple custom view).
9. **Seller console.** Offer editor (ladder, honor percentage, floor), matching coalitions, orders, mark shipped.
10. **Audit and Guard.** Readable audit log; a highlighted panel showing blocked attacks with the reason.
11. **Guided demo page.** Buttons that run the scripted scenario step by step with short captions, including the safe scenario controls (fail one capture, send a malicious bid, drop a member, fast-forward). This is what judges will use.
12. **Developers page.** How an outside agent joins through MCP, links to the OpenAPI file, the SDK, and the Postman collection.

### 11.2 UI copy rules

- Always say what is reserved versus charged.
- Always label Simulated items.
- Never imply the AI can spend money by itself.
- Keep plain language. Short sentences. No jargon on buyer screens.

---

## 12. Demo data and scenarios

### 12.1 Catalog (generic names only, no brands)

- **Category 1, consumer hero:** "27-inch 4K IPS monitor" with three generic models (Model A, B, C) that differ slightly in specs. This shows the spec envelope and acceptable substitutes. Fetch real reference prices from Channel3 if available; otherwise use sample prices labeled "sample".
- **Category 2, social impact:** "Neighborhood solar and battery kit" for a block or community co-op. Labeled sample prices.
- **Category 3 (P2):** "Wholesale staples bundle for small shops". Labeled sample prices.

Prices are USD, tax-inclusive, shipping included.

### 12.2 Sellers

- **Seller Alpha:** honest, aggressive tiers (large discount at high volume).
- **Seller Beta:** honest, moderate tiers, faster delivery.
- **Seller Gamma:** **adversarial.** Its bid note contains a manipulation attempt (for example, text telling the buyer's agent to ignore its limits or to accept a price over the limit), and one of its ladders is malformed. The Guard MUST block it and the UI MUST show why.

### 12.3 Members

- **3 to 5 real members:** real sandbox buyer accounts used by the human (and ideally a teammate or a judge). Each makes a real PayPal sandbox approval.
- **About 30 to 40 simulated personas:** varied limits (some too low to ever join at the current tier), varied approval modes, varied deadlines. They use the SimulatedProvider and carry a Simulated badge.

### 12.4 The guided scenario (also the video storyline)

Build a **scenario runner** that executes these steps deterministically (scripted AI mode available) and can also be stepped manually by a judge:

1. **Wish and spec:** the buyer types a wish and limits; the Wish Interpreter shows the spec; the buyer confirms.
2. **Coalition forms:** personas join in bursts; the price curve steps down; the quorum meter climbs.
3. **Negotiation:** RFQ, bids, counter round, best and final. Seller Gamma's malicious bid is **blocked by the Guard**, shown in the timeline and the Audit page.
4. **Offer and approval:** the approval card appears. A real buyer approves through the **real PayPal sandbox screen**. The ledger shows a reservation.
5. **Lock and capture:** quorum plus margin reached; the coalition locks. One simulated member's capture is **injected to fail**; the waiting list fills the spot; charges complete. The ledger shows captures and a partial capture where the price dropped.
6. **Fulfillment:** seller marks shipped with tracking; staged payout 50%; simulated delivery; second payout; the ledger reconciles to zero difference.
7. **Refund (P1):** a buyer reports a problem; the refund path runs.
8. **Outside agent (P1):** an external agent connects over MCP, joins a coalition, and receives an approval link; it cannot pay by itself.
9. **Impact cameo (P1):** the same engine runs a community solar coalition.

Also provide scenario controls for: fail a capture, malicious bid, member leaves, price-up reapproval, deadline expiry (everyone voided), and the abort path (refunds).

---

## 13. Human Action Protocol (how to ask the human for things)

### 13.1 Rules

1. **Ask in one clear batch**, ordered by urgency. Do not drip-feed requests.
2. For each item give: **what**, **why**, **exact steps** (click by click, in plain language), and **what to send back** (and how).
3. **Never ask for real PayPal credentials or real cards.** Only sandbox keys and test accounts.
4. **Secrets:** prefer that the human puts secrets into the environment through a command or a local file you create, not into the chat. If the chat is the only way, remind them these are sandbox/test keys and should be rotated after the hackathon. Never commit them.
5. **Verify everything you receive** with a small smoke test (for example, "fetch a sandbox access token"). Tell the human clearly whether it worked.
6. **While waiting, keep building** using the SimulatedProvider, scripted AI mode, and sample data.
7. If the human says "done", verify rather than assume.
8. Keep a visible **Human Actions tracker** (a file in the repo's docs folder) with each item's status.

### 13.2 The list of human actions

Items **marked URGENT** must be done as early as possible because they depend on third parties.

- **HA-1 (URGENT): Create a free PayPal Developer account.** Takes about 5 minutes. A sandbox with one test business account and one test personal account is created automatically.
- **HA-2 (URGENT): Create a sandbox app and copy the Client ID and Secret** (sandbox, not live).
- **HA-3 (URGENT): Create sandbox accounts:** 3 to 5 personal (buyer) accounts and 1 extra business (seller/supplier) account. Send back the test emails. Passwords go only in the human's own password notes. Check each buyer account has a sandbox balance.
- **HA-4 (URGENT): Ask PayPal to enable Payouts** on the sandbox business account (contact PayPal support or the hackathon's support channel; include the sandbox business account ID). PayPal staff have offered to enable Payouts for sandbox accounts on request.
- **HA-5 (URGENT, optional): Ask whether marketplace/partner features (payee and platform fee) can be enabled in the sandbox.** Needed only for Option A.
- **HA-6: Create a free Cloudflare account** and an API token with the minimum permissions needed for Workers, D1, Durable Objects, and Pages (you give the exact permissions list). Or log in with Cloudflare's command-line tool on the machine you run on.
- **HA-7: Create the public GitHub repository** (or grant access), choose the MIT license, and confirm the repo's About section shows the license.
- **HA-8: Create a free Google AI Studio account and API key** for the Gemini free tier.
- **HA-9: Get Channel3 API access** (check the sponsor's Devpost page for a free key or code).
- **HA-10: AG Grid Community** needs no key (just confirm the edition).
- **HA-11 (P2): Bryntum trial or hackathon license** (check the sponsor page and license terms).
- **HA-12 (P1): APIMatic account** (check the sponsor page for free access) so the SDK can be generated.
- **HA-13 (P2): Postman account** (free) if you want it to import the collection and publish docs.
- **HA-14: Register the PayPal webhook.** After the first deploy, you give the human the deployed URL and the events to subscribe to. They create the webhook in the PayPal developer dashboard and send back the **Webhook ID**.
- **HA-15: Real sandbox approvals.** During testing and recording, the human logs in to a sandbox buyer account in the browser to approve a payment on PayPal's screen. Give them a tested script of what to click.
- **HA-16: Record the demo video** (under 3 minutes, own voice or captions, no copyrighted music) following the script in Section 18.
- **HA-17: Upload the video to YouTube as Public** and send you the link.
- **HA-18: Submit on Devpost** before the deadline, using the prepared text, links, and testing instructions.

---

## 14. Build plan

The deadline is roughly two and a half days away. Work in phases with **gates**. Do not move on until a gate passes, unless a gate is blocked by a human action (then continue in parallel with simulated pieces and come back).

### 14.1 Phases

**Phase 0 — Foundations (about 1 to 2 hours)**
Read the official docs (Section 21) for PayPal sandbox, Orders, authorization and capture, JS SDK v6, webhooks, Payouts, the PayPal Agent Toolkit and MCP, Cloudflare Workers, Durable Objects, D1, and the AI provider. Create the monorepo, linting, formatting, CI, license, `.gitignore`, `.env.example`, and a secret scanner script. Deploy a trivial API and frontend to Cloudflare with a health endpoint. Send the human the first batch of Human Actions.
*Gate:* public URL serves the frontend and a health check; CI passes; repo is public with MIT license; the app refuses to start unless the PayPal environment is "sandbox".

**Phase 1 — PayPal smoke test and money-option decision (time-box 90 minutes, in parallel)**
With the sandbox keys, write a script that runs: get token → create order (authorize) → (human approves once in the browser) → authorize → partial capture → void a second authorization → refund a capture. Also test Payouts and the marketplace features. Decide Option A, B, or C and record it as DECISION D1 in the docs.
*Gate:* smoke script passes for the chosen option, or the fallback is documented.

**Phase 2 — Engine and simulation (core)**
Build `shared`, `engine`, `guard`, the state machine tables, the SimulatedProvider, the CoalitionRoom Durable Object, persistence, seeding, and the ledger projection. Include the demo clock. Unit-test tier pricing, state transitions, quorum plus margin, waiting-list promotion, partial capture math, idempotency, the Guard rules, and money invariants.
*Gate:* an automated test runs a 40-member simulated coalition from COLLECTING to SETTLED, including a failed capture healed by the waiting list and the abort path, and reconciliation is exact. The engine is deployed and stable on Cloudflare, or DECISION D2 (switch to Render) is made.

**Phase 3 — AI layer**
Build the provider wrapper, schemas, the eight roles, caching, scripted mode, deterministic fallbacks, and the adversarial seller. Add the AI test set.
*Gate:* the scripted scenario runs end to end; the injection test passes (malicious note changes nothing); at least one live AI run succeeds; failures degrade gracefully.

**Phase 4 — Real PayPal inside the flow**
Add the real browser approval button and the server-side order and authorization endpoints. Plug the PayPalSandboxProvider into the engine. Add capture, void, refund, and webhook handling with signature verification.
*Gate:* in the **hosted** app, a real sandbox buyer approves, the reservation appears, the coalition locks, the charge completes, and the ledger shows real PayPal IDs.

**Phase 5 — Frontend**
Build all screens in Section 11, with the coalition room first. Polish, responsive layout, light/dark, accessibility.
*Gate:* end-to-end tests pass for the guided scenario; a stranger can complete the demo with no explanation.

**Phase 6 — Seller, fulfillment, payouts, refunds**
Seller console, shipment events, staged payouts (per the chosen option), refund path, and the abort path in the UI.
*Gate:* a full coalition goes through shipping, both payout stages, and reconciles.

**Phase 7 — Integrations and ecosystem**
Channel3 prices; AG Grid ledger and roster; OpenAPI file; APIMatic SDK; Postman collection; MCP server and its documentation; PayPal Agent Toolkit usage; Bryntum timeline if licensed.
*Gate:* each integration is demonstrable and documented, or explicitly marked "not used" with the reason.

**Phase 8 — Hardening**
Rate limits, error and empty states, free-tier limit checks, load test with 40+ members, security review (Section 8), secret scan, repeat reconciliation, and three timed rehearsals of the guided demo to confirm it fits well under 3 minutes.
*Gate:* no failing tests; a fresh-browser dry run works; limits are within the free tiers.

**Phase 9 — Documentation and submission assets**
Write the public README, architecture notes, security notes, demo guide, Devpost text draft, tools description, video script, and judge testing instructions (Section 17 and 18).
*Gate:* a developer who has never seen the project can clone, configure, and run it from the README alone.

**Phase 10 — Freeze (afternoon of November 12, India time)**
Final deploy, tag a release, verify the hosted app and webhook, confirm the video can be recorded, and hand the human the submission pack. Stop changing code. Only fix demo-breaking bugs after this point, and check the official rules about edits after submission.
*Gate:* the human has the video, YouTube link, and all submission fields ready with hours to spare before 1:30 AM IST on November 13.

### 14.2 Suggested timing

- **Day 1 (Nov 10):** Phases 0 to 3, plus all urgent human actions.
- **Day 2 (Nov 11):** Phases 4 to 7.
- **Day 3 (Nov 12):** Phases 8 and 9 in the morning; Phase 10 in the afternoon (India time).

If you are ahead, deepen quality (polish, accessibility, more tests). If you are behind, cut using 14.3.

### 14.3 Priorities and the cut list

**P0 (must exist):** engine and state machine; real PayPal authorize, capture, void in the hosted app; at least one real AI negotiation loop with Guard; coalition room UI with live price curve; approval flow with the human-approval rules; ledger; scripted guided scenario; hosting that stays up; public README; license; submission assets.

**P1 (should exist):** simulated members and waiting-list healing demo; Payouts or simulated supplier settlement; seller console; staged payout; refund path; adversarial seller and the Audit page; Channel3; AG Grid; OpenAPI and APIMatic SDK; MCP server; PayPal Agent Toolkit usage.

**P2 (nice to have):** Bryntum timeline; Postman collection; multi-language Explainer; Option A marketplace setup; the third catalog category; extra anomaly checks.

**Cut order if time runs out:** P2 items first (bottom up), then reduce P1 depth. Never cut the guided scenario, the hosting stability, or the honesty labels.

---

## 15. Testing and quality

### 15.1 Required test layers

- **Unit tests (Vitest):** money math in integer cents and rounding; tier pricing; quorum plus margin; waiting-list logic; every row of the state-transition tables (allowed and forbidden); every Guard rule (G1 to G12); settlement planning; reconciliation; idempotency behavior.
- **Property-style tests:** for random coalitions (random limits, random joins and leaves, random capture failures) the money invariants in 5.7 always hold.
- **Integration tests:** the engine plus the SimulatedProvider, including failure injection, the abort path, deadline expiry, and price-up re-approval.
- **PayPal sandbox smoke test (script, needs keys):** token, create order, authorize, partial capture, void, refund, and (if enabled) a payout. Run before every deploy once the keys exist.
- **End-to-end tests (Playwright):** the guided scenario in a browser using the SimulatedProvider and scripted AI; a separate manual checklist for the real PayPal approval.
- **Adversarial tests:** malicious seller notes, malformed ladders, duplicate payer accounts, burst joins, replayed webhooks, forged webhooks, over-limit offers. Every one MUST be blocked and logged.
- **AI evaluation:** the test set from 6.8 in cached or scripted mode.
- **Load test:** at least 40 members joining quickly and a full lock; confirm free-tier limits are not exceeded.
- **Accessibility check:** keyboard navigation, contrast, labels, status announcements.
- **Fresh clone test:** clone the repo into an empty folder, follow only the README, and run it.
- **Judge dry run:** open the hosted URL in a fresh browser with no login; complete the guided demo; then complete a real sandbox approval as a buyer.

### 15.2 CI

Use GitHub Actions on every push: install, lint, type check, unit and integration tests, secret scan, and build. Show a CI badge in the README.

---

## 16. Deployment, configuration, and secrets

### 16.1 Configuration (names only; no values in the repo)

Provide an `.env.example` and document each variable. Suggested names (adapt as needed):

- `PAYPAL_ENV` (**must be "sandbox"**; the app refuses to start otherwise)
- `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`
- `PAYPAL_WEBHOOK_ID`
- `PAYPAL_PLATFORM_MERCHANT_ID` (or email), `PAYPAL_PARTNER_ATTRIBUTION_ID` (only for Option A)
- `AI_PROVIDER`, `AI_MODEL`, `AI_API_KEY`
- `AI_MODE` (`live`, `cached`, or `scripted`), `MAX_AI_CALLS_PER_DAY`
- `CHANNEL3_API_KEY`
- `ADMIN_TOKEN`, `SELLER_DEMO_TOKEN`
- `PUBLIC_BASE_URL`
- `DEMO_MODE`, `TIME_SCALE`
- `RATE_LIMIT_*` settings

### 16.2 Secrets handling

- Local: a git-ignored secrets file. Cloudflare: the platform's secrets mechanism. Never in source, logs, test snapshots, or screenshots.
- Run the secret scanner before the repo is made public and before every release.

### 16.3 Deployment steps (guidance)

1. Deploy the API Worker, Durable Object bindings, D1 database (with migrations and seed), and the frontend.
2. Set secrets.
3. Run the health and version checks.
4. Give the human the URL for webhook registration (HA-14); store the webhook ID; send a test webhook and verify the signature path works.
5. Run the PayPal smoke test and the Playwright suite against the hosted URL.
6. Record the deployed version in the README.

### 16.4 Staying online through December 15

- Prefer storage with no expiry. Do not rely on trial tokens or temporary databases that expire before mid-December.
- Make sure nothing needs a restart or manual action. Seed data must load automatically and safely.
- Add per-IP and daily limits so a flood of judge traffic or AI calls cannot exhaust the free quotas. When the AI quota is exhausted, switch automatically to cached or scripted mode and show the label.
- After submission, do not change the deployment unless something is broken and the official rules allow it.

---

## 17. Deliverables (what the final output must contain)

1. **Hosted app** (stable URL), with the guided demo available without any login.
2. **Public GitHub repo** with MIT license, visible in the About section, with a clear description and topics.
3. **Public README.md for the repo** (not this file): what Quorum is, a screenshot or GIF, what is real and what is simulated, the money-flow option used and why, architecture overview, how to run locally step by step, how to run tests, environment variables, how to deploy, how judges can test it, the tools used and how, honest limitations, and the roadmap (including regulatory notes and the marketplace-setup production design).
4. **docs folder:** architecture, security notes (threats and defenses), demo guide, Human Actions tracker, decision log (D1, D2, and others), OpenAPI file, Postman collection, AI evaluation results.
5. **Source for all modules** listed in 9.2, with tests and CI.
6. **SDK and MCP server** (as far as the tools allow) and instructions for connecting an outside agent.
7. **Seed data and the scenario runner** so the demo is reproducible.
8. **Submission pack** (Section 18).

---

## 18. Submission pack (prepare these for the human)

### 18.1 Devpost text description (draft in `docs/DEVPOST_DRAFT.md`)

Use these sections, in plain, confident language:

- **Inspiration:** the lone-agent problem; shoppers have no leverage; a union for AI agents.
- **What it does:** the user flow in five sentences, the human-approval promise, and the "nobody pays if the group fails" guarantee.
- **How we built it:** PayPal authorize-then-capture, the engine, the Guard, the agents, the hybrid real/simulated design, Cloudflare hosting.
- **Challenges:** capture failures at quorum time, prompt injection from sellers, free-tier limits, the marketplace permission question.
- **Accomplishments:** a deterministic Guard around AI money decisions, the waiting-list healing, the staged payout, the MCP access for outside agents.
- **What we learned:** why AI should propose and code should decide.
- **What's next:** real sellers via PayPal's marketplace setup, real fulfillment integrations, recurring coalitions, community co-ops and small shop wholesale groups, regulatory review.
- **Tools used:** a table of every tool and exactly how it is used: PayPal sandbox APIs and SDK, PayPal Agent Toolkit/MCP, the AI model, Cloudflare, Channel3, AG Grid, APIMatic, Bryntum (if used), Postman (if used), GitHub Actions.
- **Impact:** community buying, small shops, fairness for individuals in an agent economy.

### 18.2 Testing instructions for judges (put in the Devpost "testing" field, not necessarily the public repo)

- The hosted URL.
- "Click **Watch the guided demo**; no login needed."
- "To try a real PayPal sandbox approval, click **Try as a buyer** and sign in with this sandbox test account" followed by the sandbox buyer test email and password. (These are test accounts only. The human decides where to publish them.)
- A clear note that most members are simulated and labeled, and that all money is sandbox money.
- What to look at: the price curve, the Guard blocking the malicious bid, the waiting list healing a failed capture, the ledger and audit log, and the MCP developer page.

### 18.3 Demo video script (under 3 minutes; target 2:40)

- **0:00 to 0:15 — Hook:** "One AI agent shopping alone has no leverage. Quorum is a union for AI shopping agents."
- **0:15 to 0:50 — Wish and coalition:** the wish and limits; the spec; the coalition filling; the price curve stepping down.
- **0:50 to 1:20 — Negotiation and safety:** sellers bidding; the malicious bid blocked by the Guard; "AI proposes, code decides."
- **1:20 to 1:55 — Real PayPal moment:** the approval card; approving on the real PayPal sandbox screen; "reserved, not charged".
- **1:55 to 2:20 — Lock and money:** quorum reached; one charge fails; the waiting list heals it; charges complete; ledger shows real PayPal IDs.
- **2:20 to 2:40 — Impact and openness:** the community solar coalition; an outside agent joining over MCP.
- **2:40 to 3:00 — Close:** "Sandbox money, real PayPal flows, humans in control. Open source, MIT."

Video rules: show the app working in a browser; narrate with the human's own voice or use captions; **no copyrighted music**; no third-party logos or brand names; sensitive data blurred; keep under 3 minutes; upload to YouTube as **Public**.

### 18.4 Repository About settings

Short description, topics (for example `paypal`, `ai-agents`, `agentic-commerce`, `cloudflare-workers`, `mcp`), the live demo URL, and the license showing.

---

## 19. Definition of Done (acceptance checklist)

The project is done only when **all P0 items and as many P1 items as time allows** pass:

- [ ] Hosted app loads on a fresh browser, no login needed for the guided demo.
- [ ] The guided scenario runs end to end in under 3 minutes and works in scripted AI mode.
- [ ] A real sandbox buyer can approve on PayPal's sandbox screen in the hosted app and the reservation appears in the ledger with real PayPal IDs.
- [ ] Capture, partial capture, void, and refund all work through the engine in the sandbox.
- [ ] Rejecting or ignoring the approval never charges anyone.
- [ ] A lower final price charges the lower amount; a higher price requires re-approval.
- [ ] A failed capture is healed by the waiting list; the abort path refunds and voids correctly.
- [ ] The malicious seller bid is blocked by the Guard and shown in the Audit page.
- [ ] The ledger reconciles exactly in every scenario.
- [ ] All Guard rules and money invariants are unit tested; CI is green.
- [ ] The app refuses to start unless PayPal is in sandbox mode.
- [ ] Simulated items are labeled everywhere.
- [ ] No secrets in the repo (scan passes).
- [ ] Public repo, MIT license visible, README complete and tested from a fresh clone.
- [ ] Sponsor tools used are documented honestly.
- [ ] Demo stays within free-tier limits and has automatic fallbacks.
- [ ] The human has the video script, test instructions, Devpost draft, and a deployed URL well before the deadline.

---

## 20. Pitfalls to avoid (and known risks)

1. **Trusting memory of PayPal APIs.** Verify every endpoint and field in the current docs.
2. **Letting the AI enforce limits.** Limits belong in code. Always.
3. **Capturing too early.** Never capture before lock; never capture beyond the approved amount.
4. **Too many outbound calls in one request** on the free Workers plan. Batch and resume.
5. **Polling too much** against D1 and Durable Object free limits.
6. **Silent demo failures.** Always have cached and scripted fallbacks, and show the label.
7. **Faking realism.** Do not hide that members are simulated or that prices are sample data.
8. **Brand names and logos** in the UI or the video.
9. **Letting free resources expire** before mid-December (databases, tokens, trials).
10. **Over-adding sponsor tools.** Use fewer, use them well.
11. **Real approvals need a human.** Each real buyer approval needs a person to sign in on PayPal's sandbox page. Do not try to bypass this. Keep real buyers few (3 to 5).
12. **Marketplace permissions may be unavailable.** That is why Options B and C exist. Do not burn more than the time-box.
13. **Sandbox balance or funding problems** for test buyers. Check balances early.
14. **Time zones.** The deadline is 12:00 PM Pacific on November 12 = 1:30 AM IST on November 13. Aim to be done many hours earlier.
15. **Unverified claims in docs.** If you did not test it, do not claim it.

---

## 21. Appendix

### 21.1 Official documentation to read first

- PayPal Developer docs: https://developer.paypal.com/
- PayPal REST API reference: https://developer.paypal.com/api/rest/
- PayPal Checkout and JS SDK v6: https://developer.paypal.com/checkout/ and https://developer.paypal.com/sdk/js/
- PayPal Developer Dashboard (sandbox accounts and apps): https://developer.paypal.com/dashboard/
- Getting started with the sandbox: https://github.com/paypaldev/getting-started-with-paypal-sandbox
- Payouts: https://developer.paypal.com/docs/payouts/
- Webhooks: https://developer.paypal.com/api/webhooks/overview
- Disputes (optional, future): https://developer.paypal.com/platforms/disputes/overview
- PayPal AI docs: https://docs.paypal.ai/
- PayPal AI Toolkit: https://github.com/paypal/AI-Toolkit
- Agent Toolkit quickstart: https://docs.paypal.ai/developer/tools/ai/agent-toolkit-quickstart
- MCP server quickstart: https://docs.paypal.ai/developer/tools/ai/mcp-quickstart
- Agent tools reference: https://docs.paypal.ai/developer/tools/ai/agent-tools-ref
- Cloudflare Workers, Durable Objects, D1, and MCP hosting docs (find the current pages)
- Google AI Studio and the Gemini API docs (current free models and limits)
- Sponsor pages: https://paypalaihackathon.devpost.com/details/aggrid, /apimatic, /bryntum, /channel3, /render, /postman

### 21.2 PayPal API hints (verify every one before use)

These are from memory and may be outdated.

- Sandbox API base host: `api-m.sandbox.paypal.com`. Authenticate with OAuth using the sandbox Client ID and Secret.
- Create order with intent AUTHORIZE: `POST /v2/checkout/orders`.
- Authorize an approved order: `POST /v2/checkout/orders/{id}/authorize`.
- Authorization details: `GET /v2/payments/authorizations/{id}`.
- Capture: `POST /v2/payments/authorizations/{id}/capture` (supports an amount and a final-capture flag).
- Void: `POST /v2/payments/authorizations/{id}/void`.
- Reauthorize: `POST /v2/payments/authorizations/{id}/reauthorize`.
- Refund: `POST /v2/payments/captures/{id}/refund`.
- Payouts: `POST /v1/payments/payouts` (may need enablement).
- Webhook signature verification: PayPal's verify-webhook-signature call, or local verification per the docs.
- Idempotency: the `PayPal-Request-Id` header.
- Webhook event names to expect (verify): order approved, authorization created, authorization voided, capture completed, capture denied, capture pending, capture refunded, payouts batch success or denied.
- Marketplace/multiparty (Option A): the order's purchase unit can name a payee and platform fees; this needs partner enablement and seller onboarding.

### 21.3 Status vocabulary (use these exact names in code and UI)

- Coalition: `COLLECTING`, `NEGOTIATING`, `OFFER_READY`, `APPROVING`, `LOCKED`, `CAPTURING`, `FULFILLING`, `SETTLED`, `EXPIRED`, `CANCELLED`, `FAILED_AT_CAPTURE`.
- Member: `INTERESTED`, `LIMITS_SET`, `MATCHED`, `OFFER_SHOWN`, `APPROVED`, `CAPTURED`, `DELIVERED`, `REFUNDED`, `RELEASED`, `DECLINED`, `DROPPED`, `EXPIRED_NO_ANSWER`, `WAITLISTED`, `FAILED_AUTH`, `FAILED_CAPTURE`, `REAPPROVAL_REQUIRED`.
- Ledger entry types: `RESERVED`, `CAPTURED`, `PARTIALLY_CAPTURED`, `VOIDED`, `REFUNDED`, `PAYOUT_PENDING`, `PAYOUT_SENT`, `PAYOUT_SIMULATED`.

### 21.4 Decision log (keep in `docs/DECISIONS.md`)

- **D1:** money flow option (A, B, or C) and why.
- **D2:** hosting (Cloudflare or Render fallback) and why.
- **D3:** Bryntum used or not, and why.
- **D4:** APIMatic SDK/MCP generation used or hand-written, and why.
- **D5:** PayPal Agent Toolkit usage (where it runs) and why.
- **D6:** AI provider and model, and the free-tier limits observed.

---

**End of specification.** Start with Section 0.4: reply to the human with your summary, the urgent Human Actions, and your first three steps.
