/**
 * @module enums
 * All status enums used across the Quorum system.
 * These are the single source of truth for every state machine.
 */

// ─── Coalition lifecycle ─────────────────────────────────────────────
export enum CoalitionState {
  COLLECTING = 'COLLECTING',
  NEGOTIATING = 'NEGOTIATING',
  OFFER_READY = 'OFFER_READY',
  APPROVING = 'APPROVING',
  LOCKED = 'LOCKED',
  CAPTURING = 'CAPTURING',
  FULFILLING = 'FULFILLING',
  SETTLED = 'SETTLED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  FAILED_AT_CAPTURE = 'FAILED_AT_CAPTURE',
}

// ─── Member lifecycle ────────────────────────────────────────────────
export enum MemberState {
  INTERESTED = 'INTERESTED',
  LIMITS_SET = 'LIMITS_SET',
  MATCHED = 'MATCHED',
  OFFER_SHOWN = 'OFFER_SHOWN',
  APPROVED = 'APPROVED',
  CAPTURED = 'CAPTURED',
  DELIVERED = 'DELIVERED',
  REFUNDED = 'REFUNDED',
  RELEASED = 'RELEASED',
  DECLINED = 'DECLINED',
  DROPPED = 'DROPPED',
  EXPIRED_NO_ANSWER = 'EXPIRED_NO_ANSWER',
  WAITLISTED = 'WAITLISTED',
  FAILED_AUTH = 'FAILED_AUTH',
  FAILED_CAPTURE = 'FAILED_CAPTURE',
  REAPPROVAL_REQUIRED = 'REAPPROVAL_REQUIRED',
}

// ─── Ledger entry types ──────────────────────────────────────────────
export enum LedgerEntryType {
  RESERVED = 'RESERVED',
  CAPTURED = 'CAPTURED',
  PARTIALLY_CAPTURED = 'PARTIALLY_CAPTURED',
  VOIDED = 'VOIDED',
  REFUNDED = 'REFUNDED',
  PAYOUT_PENDING = 'PAYOUT_PENDING',
  PAYOUT_SENT = 'PAYOUT_SENT',
  PAYOUT_SIMULATED = 'PAYOUT_SIMULATED',
}

// ─── User approval mode ─────────────────────────────────────────────
export enum ApprovalMode {
  ASK_EACH_TIME = 'ASK_EACH_TIME',
  AUTO_WITHIN_LIMITS = 'AUTO_WITHIN_LIMITS',
}

// ─── AI interaction mode ─────────────────────────────────────────────
export enum AIMode {
  LIVE = 'LIVE',
  CACHED = 'CACHED',
  SCRIPTED = 'SCRIPTED',
}

// ─── Payment provider ────────────────────────────────────────────────
export enum PaymentProvider {
  PAYPAL = 'PAYPAL',
  SIMULATED = 'SIMULATED',
}

// ─── User type ───────────────────────────────────────────────────────
export enum UserType {
  BUYER = 'BUYER',
  SELLER = 'SELLER',
}

// ─── Seller offer status ─────────────────────────────────────────────
export enum OfferStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  WON = 'WON',
}

// ─── Shipment status ─────────────────────────────────────────────────
export enum ShipmentStatus {
  PENDING = 'PENDING',
  SHIPPED = 'SHIPPED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  RETURNED = 'RETURNED',
}
