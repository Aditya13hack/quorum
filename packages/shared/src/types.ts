/**
 * @module types
 * Core TypeScript interfaces for every domain entity in Quorum.
 *
 * These are the canonical shapes — Zod schemas in `schemas.ts` mirror them
 * and are the runtime validators.
 */

import type {
  CoalitionState,
  MemberState,
  LedgerEntryType,
  UserType,
  OfferStatus,
  ShipmentStatus,
  PaymentProvider,
} from './enums.js';

// ─── Users ───────────────────────────────────────────────────────────

export interface User {
  id: string;
  type: UserType;
  displayName: string;
  /** Whether this user was auto-generated for simulation / demo purposes. */
  isSimulated: boolean;
  /** PayPal sandbox payer ID (if linked). */
  sandboxPayerId?: string;
  createdAt: string; // ISO-8601
}

// ─── Products ────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  category: string;
  attributes: Record<string, string>;
  /** Baseline price in cents used when no Channel-3 price is available. */
  samplePriceCents: number;
  /** Price in cents sourced from a Channel-3 provider (e.g., Amazon scrape). */
  channel3PriceCents?: number;
  /** Which price source is considered authoritative. */
  priceSource: 'channel3' | 'sample';
}

// ─── Wishes ──────────────────────────────────────────────────────────

export interface SpecEnvelope {
  category: string;
  requiredAttributes: Record<string, string>;
  acceptableRanges: Record<string, { min?: number; max?: number }>;
  priceCeilingCents: number;
  acceptableSubstitutes: string[];
  deadlineMs: number;
}

export interface Wish {
  id: string;
  ownerId: string;
  text: string;
  spec: SpecEnvelope;
  status: string;
}

// ─── Coalitions ──────────────────────────────────────────────────────

export interface Coalition {
  id: string;
  productId: string;
  specEnvelope: SpecEnvelope;
  state: CoalitionState;
  /** Minimum number of members needed to unlock the deal. */
  quorum: number;
  /** Extra percentage added above quorum for safety (e.g., 10 = +10%). */
  safetyMarginPct: number;
  /** Wall-clock deadline for the coalition (epoch ms). */
  deadlineMs: number;
  /** Time-scale factor (1 = real time, 1440 = 1 min ≈ 1 day). */
  timeScale: number;
  chosenOfferId?: string;
  finalTierIndex?: number;
  finalPriceCents?: number;
  /** Seller honor percentage for the winning offer. */
  honorPct?: number;
  createdAt: string; // ISO-8601
  updatedAt: string; // ISO-8601
}

// ─── Memberships ─────────────────────────────────────────────────────

export interface Membership {
  coalitionId: string;
  userId: string;
  isSimulated: boolean;
  state: MemberState;
  /** Max price (cents) the member approved for auto-capture. */
  approvedMaxCents?: number;
  /** PayPal authorization ID from Order authorize call. */
  authorizationId?: string;
  /** Simulated authorization ID (when using SIMULATED provider). */
  simAuthId?: string;
  /** Position on waitlist (0-based); undefined when not waitlisted. */
  waitlistPosition?: number;
  timestamps: {
    joinedAt: string;
    approvedAt?: string;
    capturedAt?: string;
    deliveredAt?: string;
    refundedAt?: string;
  };
}

// ─── Seller offers ───────────────────────────────────────────────────

export interface TierStep {
  /** Minimum number of buyers needed to activate this tier. */
  minBuyers: number;
  /** Per-unit price in cents at this tier. */
  priceCents: number;
}

export interface SellerOffer {
  id: string;
  sellerId: string;
  coalitionId?: string;
  productId: string;
  tierLadder: TierStep[];
  /** Percentage of buyers the seller commits to fulfilling. */
  honorPct: number;
  /** Estimated delivery in calendar days. */
  deliveryDays: number;
  /** Seller's hidden floor price in cents (never shown to buyers). */
  hiddenFloorCents: number;
  /** Free-text notes from the seller. */
  notes: string;
  status: OfferStatus;
}

// ─── Negotiation ─────────────────────────────────────────────────────

export interface NegotiationMessage {
  id: string;
  coalitionId: string;
  round: number;
  from: string;
  payload: Record<string, unknown>;
  sanitizedNote?: string;
  guardVerdict?: string;
}

// ─── Payments ────────────────────────────────────────────────────────

export interface PaymentRecord {
  id: string;
  memberId: string;
  coalitionId: string;
  orderId?: string;
  authorizationId?: string;
  captureId?: string;
  refundId?: string;
  payoutId?: string;
  amountCents: number;
  provider: 'paypal' | 'simulated';
  status: string;
  idempotencyKey: string;
  createdAt: string; // ISO-8601
}

// ─── Shipments ───────────────────────────────────────────────────────

export interface ShipmentEvent {
  timestamp: string;
  location?: string;
  description: string;
}

export interface Shipment {
  id: string;
  coalitionId: string;
  trackingNumber?: string;
  status: ShipmentStatus;
  events: ShipmentEvent[];
  timestamps: {
    createdAt: string;
    shippedAt?: string;
    deliveredAt?: string;
  };
}

// ─── Audit log ───────────────────────────────────────────────────────

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorType: 'system' | 'member' | 'seller' | 'admin' | 'ai';
  eventType: string;
  referenceIds: Record<string, string>;
  summary: string;
  verdict: 'allowed' | 'blocked' | null;
}

// ─── Ledger ──────────────────────────────────────────────────────────

export interface LedgerEntry {
  id: string;
  coalitionId: string;
  memberId: string;
  type: LedgerEntryType;
  amountCents: number;
  provider: string;
  referenceId: string;
  createdAt: string; // ISO-8601
}

// ─── Scenarios (demo / testing) ──────────────────────────────────────

export interface ScenarioRun {
  id: string;
  scenarioId: string;
  stepsExecuted: number;
  results: Record<string, unknown>;
  startedAt: string; // ISO-8601
  completedAt?: string; // ISO-8601
}
