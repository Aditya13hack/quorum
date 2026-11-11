/**
 * @module types
 * Guard-local type definitions.
 * These types are used exclusively by the Guard package and are intentionally
 * decoupled from any runtime-specific or AI-specific packages.
 */

// ─── Guard Verdict ───────────────────────────────────────────────────

/**
 * Every guard rule returns a GuardVerdict indicating whether the action
 * is allowed and why. This is the universal output format for all guard checks.
 */
export interface GuardVerdict {
  /** Rule code, e.g. "G1", "G2", etc. */
  readonly rule: string;
  /** Whether the action is allowed. */
  readonly allowed: boolean;
  /** Human-readable explanation. */
  readonly reason: string;
  /** Optional structured context for logging/debugging. */
  readonly context?: Record<string, unknown>;
}

// ─── Audit Entry ─────────────────────────────────────────────────────

/** Immutable audit record created for every guard verdict. */
export interface AuditEntry {
  /** ISO-8601 timestamp of the audit event. */
  readonly timestamp: string;
  /** The guard verdict that triggered this audit entry. */
  readonly verdict: GuardVerdict;
  /** Who triggered the action (userId, system, AI agent name, etc.). */
  readonly actor: string;
  /** What kind of event this is (e.g. "OFFER_VALIDATION", "JOIN_CHECK"). */
  readonly eventType: string;
}

// ─── Product & Spec ──────────────────────────────────────────────────

/** Minimal product representation for spec-fit checking. */
export interface Product {
  /** Product category (e.g. "electronics", "furniture"). */
  readonly category: string;
  /** Key-value product attributes (e.g. { brand: "Sony", color: "black" }). */
  readonly attributes: Record<string, string>;
  /** Product unit price in integer cents. */
  readonly priceCents: number;
}

/**
 * A spec envelope describes what buyers collectively want.
 * The Guard checks that a proposed product fits within these constraints.
 */
export interface SpecEnvelope {
  /** Required category — product must match. */
  readonly category: string;
  /** Required attribute keys — product must have all of these. */
  readonly requiredAttributes: string[];
  /** Maximum price the coalition is willing to pay, in integer cents. */
  readonly maxPriceCents: number;
}

// ─── Tier/Ladder ─────────────────────────────────────────────────────

/** A single step in a volume-discount ladder. */
export interface TierStep {
  /** Minimum number of units/members to qualify for this tier. */
  readonly minQuantity: number;
  /** Unit price in integer cents at this tier. */
  readonly unitPriceCents: number;
}

// ─── Seller Offer ────────────────────────────────────────────────────

/**
 * Structured seller offer — used by G5 to ensure AI-processed seller notes
 * do not silently alter structured fields.
 */
export interface SellerOffer {
  readonly unitPriceCents: number;
  readonly minQuantity: number;
  readonly maxQuantity: number;
  readonly honorPct: number;
  readonly ladder: TierStep[];
  /** Free-text notes from the seller (the only field AI may influence). */
  readonly notes: string;
}

// ─── Membership ──────────────────────────────────────────────────────

/**
 * Minimal membership info needed by the Guard for authorization checks.
 * The Guard does NOT need the full member model — just enough to validate.
 */
export interface Membership {
  readonly memberId: string;
  readonly payerId: string;
  readonly state: string;
  /** PayPal authorization ID (null if not yet authorized). */
  readonly authorizationId: string | null;
  /** Simulated authorization ID (used in SIMULATED payment provider mode). */
  readonly simAuthorizationId: string | null;
  /** Maximum amount this member approved, in integer cents. */
  readonly approvedMaxCents: number;
}

// ─── Capture Plan ────────────────────────────────────────────────────

/** A single capture instruction within a capture plan. */
export interface CaptureInstruction {
  readonly memberId: string;
  readonly amountCents: number;
}

/**
 * A capture plan describes the set of captures to execute.
 * The Guard checks that the AI-proposed plan matches the engine's computed plan.
 */
export interface CapturePlan {
  readonly instructions: CaptureInstruction[];
  readonly totalCents: number;
}
