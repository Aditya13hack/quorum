/**
 * @module schemas
 * Zod schemas that mirror every interface in `types.ts`.
 * These are the **runtime** validators — use them at API boundaries.
 *
 * Convention: schema name = `zXxx` (e.g., `zUser`, `zCoalition`).
 * Validator wrappers: `validateXxx(data)` returns the parsed result or throws.
 */

import { z } from 'zod';
import {
  CoalitionState,
  MemberState,
  LedgerEntryType,
  UserType,
  OfferStatus,
  ShipmentStatus,
} from './enums.js';

// ─── Helpers ─────────────────────────────────────────────────────────

/** Non-negative integer (used for all cent amounts). */
const centsAmount = z.number().int().nonnegative();

/** ISO-8601 datetime string. */
const isoDatetime = z.string().datetime({ offset: true }).or(z.string().datetime());

// ─── User ────────────────────────────────────────────────────────────

export const zUser = z.object({
  id: z.string().min(1),
  type: z.nativeEnum(UserType),
  displayName: z.string().min(1),
  isSimulated: z.boolean(),
  sandboxPayerId: z.string().optional(),
  createdAt: isoDatetime,
});

// ─── Product ─────────────────────────────────────────────────────────

export const zProduct = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  attributes: z.record(z.string(), z.string()),
  samplePriceCents: centsAmount,
  channel3PriceCents: centsAmount.optional(),
  priceSource: z.enum(['channel3', 'sample']),
});

// ─── SpecEnvelope ────────────────────────────────────────────────────

export const zSpecEnvelope = z.object({
  category: z.string().min(1),
  requiredAttributes: z.record(z.string(), z.string()),
  acceptableRanges: z.record(
    z.string(),
    z.object({ min: z.number().optional(), max: z.number().optional() }),
  ),
  priceCeilingCents: centsAmount,
  acceptableSubstitutes: z.array(z.string()),
  deadlineMs: z.number().int().positive(),
});

// ─── Wish ────────────────────────────────────────────────────────────

export const zWish = z.object({
  id: z.string().min(1),
  ownerId: z.string().min(1),
  text: z.string().min(1),
  spec: zSpecEnvelope,
  status: z.string().min(1),
});

// ─── Coalition ───────────────────────────────────────────────────────

export const zCoalition = z.object({
  id: z.string().min(1),
  productId: z.string().min(1),
  specEnvelope: zSpecEnvelope,
  state: z.nativeEnum(CoalitionState),
  quorum: z.number().int().positive(),
  safetyMarginPct: z.number().nonnegative(),
  deadlineMs: z.number().int().positive(),
  timeScale: z.number().positive(),
  chosenOfferId: z.string().optional(),
  finalTierIndex: z.number().int().nonnegative().optional(),
  finalPriceCents: centsAmount.optional(),
  honorPct: z.number().min(0).max(100).optional(),
  createdAt: isoDatetime,
  updatedAt: isoDatetime,
});

// ─── TierStep ────────────────────────────────────────────────────────

export const zTierStep = z.object({
  minBuyers: z.number().int().positive(),
  priceCents: centsAmount,
});

// ─── Membership ──────────────────────────────────────────────────────

export const zMembership = z.object({
  coalitionId: z.string().min(1),
  userId: z.string().min(1),
  isSimulated: z.boolean(),
  state: z.nativeEnum(MemberState),
  approvedMaxCents: centsAmount.optional(),
  authorizationId: z.string().optional(),
  simAuthId: z.string().optional(),
  waitlistPosition: z.number().int().nonnegative().optional(),
  timestamps: z.object({
    joinedAt: isoDatetime,
    approvedAt: isoDatetime.optional(),
    capturedAt: isoDatetime.optional(),
    deliveredAt: isoDatetime.optional(),
    refundedAt: isoDatetime.optional(),
  }),
});

// ─── SellerOffer ─────────────────────────────────────────────────────

export const zSellerOffer = z.object({
  id: z.string().min(1),
  sellerId: z.string().min(1),
  coalitionId: z.string().optional(),
  productId: z.string().min(1),
  tierLadder: z.array(zTierStep).min(1),
  honorPct: z.number().min(0).max(100),
  deliveryDays: z.number().int().positive(),
  hiddenFloorCents: centsAmount,
  notes: z.string(),
  status: z.nativeEnum(OfferStatus),
});

// ─── NegotiationMessage ──────────────────────────────────────────────

export const zNegotiationMessage = z.object({
  id: z.string().min(1),
  coalitionId: z.string().min(1),
  round: z.number().int().nonnegative(),
  from: z.string().min(1),
  payload: z.record(z.string(), z.unknown()),
  sanitizedNote: z.string().optional(),
  guardVerdict: z.string().optional(),
});

// ─── PaymentRecord ───────────────────────────────────────────────────

export const zPaymentRecord = z.object({
  id: z.string().min(1),
  memberId: z.string().min(1),
  coalitionId: z.string().min(1),
  orderId: z.string().optional(),
  authorizationId: z.string().optional(),
  captureId: z.string().optional(),
  refundId: z.string().optional(),
  payoutId: z.string().optional(),
  amountCents: centsAmount,
  provider: z.enum(['paypal', 'simulated']),
  status: z.string().min(1),
  idempotencyKey: z.string().min(1),
  createdAt: isoDatetime,
});

// ─── Shipment ────────────────────────────────────────────────────────

export const zShipmentEvent = z.object({
  timestamp: isoDatetime,
  location: z.string().optional(),
  description: z.string().min(1),
});

export const zShipment = z.object({
  id: z.string().min(1),
  coalitionId: z.string().min(1),
  trackingNumber: z.string().optional(),
  status: z.nativeEnum(ShipmentStatus),
  events: z.array(zShipmentEvent),
  timestamps: z.object({
    createdAt: isoDatetime,
    shippedAt: isoDatetime.optional(),
    deliveredAt: isoDatetime.optional(),
  }),
});

// ─── AuditEntry ──────────────────────────────────────────────────────

export const zAuditEntry = z.object({
  id: z.string().min(1),
  timestamp: isoDatetime,
  actor: z.string().min(1),
  actorType: z.enum(['system', 'member', 'seller', 'admin', 'ai']),
  eventType: z.string().min(1),
  referenceIds: z.record(z.string(), z.string()),
  summary: z.string(),
  verdict: z.enum(['allowed', 'blocked']).nullable(),
});

// ─── LedgerEntry ─────────────────────────────────────────────────────

export const zLedgerEntry = z.object({
  id: z.string().min(1),
  coalitionId: z.string().min(1),
  memberId: z.string().min(1),
  type: z.nativeEnum(LedgerEntryType),
  amountCents: centsAmount,
  provider: z.string().min(1),
  referenceId: z.string().min(1),
  createdAt: isoDatetime,
});

// ─── ScenarioRun ─────────────────────────────────────────────────────

export const zScenarioRun = z.object({
  id: z.string().min(1),
  scenarioId: z.string().min(1),
  stepsExecuted: z.number().int().nonnegative(),
  results: z.record(z.string(), z.unknown()),
  startedAt: isoDatetime,
  completedAt: isoDatetime.optional(),
});

// ─── Validator functions ─────────────────────────────────────────────
// Each returns the fully-typed, parsed data or throws a ZodError.

export function validateUser(data: unknown) {
  return zUser.parse(data);
}

export function validateProduct(data: unknown) {
  return zProduct.parse(data);
}

export function validateWish(data: unknown) {
  return zWish.parse(data);
}

export function validateCoalition(data: unknown) {
  return zCoalition.parse(data);
}

export function validateMembership(data: unknown) {
  return zMembership.parse(data);
}

export function validateSellerOffer(data: unknown) {
  return zSellerOffer.parse(data);
}

export function validateNegotiationMessage(data: unknown) {
  return zNegotiationMessage.parse(data);
}

export function validatePaymentRecord(data: unknown) {
  return zPaymentRecord.parse(data);
}

export function validateShipment(data: unknown) {
  return zShipment.parse(data);
}

export function validateAuditEntry(data: unknown) {
  return zAuditEntry.parse(data);
}

export function validateLedgerEntry(data: unknown) {
  return zLedgerEntry.parse(data);
}

export function validateScenarioRun(data: unknown) {
  return zScenarioRun.parse(data);
}
