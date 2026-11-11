/**
 * @module types
 * Payment-specific types used across all payment provider implementations.
 * All money amounts are in integer cents (USD).
 */

// ─── Provider discriminator ─────────────────────────────────────────
export type ProviderType = 'paypal' | 'simulated';

// ─── Order creation ─────────────────────────────────────────────────
export interface CreateOrderResult {
  /** PayPal or simulated order ID. */
  orderId: string;
  /** URL for buyer to approve the order on PayPal (or placeholder for simulated). */
  approvalUrl: string;
  /** Which provider produced this result. */
  provider: ProviderType;
}

// ─── Authorization ──────────────────────────────────────────────────
export interface AuthorizeResult {
  /** Authorization ID returned by the provider. */
  authorizationId: string;
  /** Provider-specific status string. */
  status: string;
  /** Authorized amount in integer cents. */
  amountCents: number;
  /** Which provider produced this result. */
  provider: ProviderType;
}

// ─── Capture ────────────────────────────────────────────────────────
export interface CaptureResult {
  /** Capture ID returned by the provider. */
  captureId: string;
  /** High-level capture status. */
  status: 'COMPLETED' | 'DECLINED' | 'PENDING' | 'FAILED';
  /** Captured amount in integer cents. */
  amountCents: number;
  /** Whether this was a partial capture (less than the full auth). */
  isPartialCapture: boolean;
  /** Which provider produced this result. */
  provider: ProviderType;
}

// ─── Void ───────────────────────────────────────────────────────────
export interface VoidResult {
  /** Whether the void succeeded. */
  success: boolean;
  /** Which provider produced this result. */
  provider: ProviderType;
}

// ─── Refund ─────────────────────────────────────────────────────────
export interface RefundResult {
  /** Refund ID returned by the provider. */
  refundId: string;
  /** Provider-specific status string. */
  status: string;
  /** Refunded amount in integer cents. */
  amountCents: number;
  /** Which provider produced this result. */
  provider: ProviderType;
}

// ─── Payout ─────────────────────────────────────────────────────────
export interface PayoutResult {
  /** Payout batch or item ID. */
  payoutId: string;
  /** Provider-specific status string. */
  status: string;
  /** Payout amount in integer cents. */
  amountCents: number;
  /** Which provider produced this result. */
  provider: ProviderType;
}

// ─── Authorization details (read-only query) ────────────────────────
export interface AuthorizationDetails {
  /** Authorization ID. */
  authorizationId: string;
  /** Current status of the authorization. */
  status: 'CREATED' | 'CAPTURED' | 'DENIED' | 'EXPIRED' | 'VOIDED' | 'PENDING';
  /** Authorized amount in integer cents. */
  amountCents: number;
}

// ─── Audit entry for PayPal provider ────────────────────────────────
export interface AuditEntry {
  /** ISO-8601 timestamp of the API call. */
  timestamp: string;
  /** HTTP method used. */
  method: string;
  /** API endpoint path (no base URL). */
  endpoint: string;
  /** HTTP status code returned. */
  statusCode: number;
  /** Idempotency key used for the request, if any. */
  idempotencyKey?: string;
  /** Sanitized response body (no secrets). */
  responseBody: unknown;
  /** Duration of the call in milliseconds. */
  durationMs: number;
}
