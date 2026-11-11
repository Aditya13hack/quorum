/**
 * @module provider
 * Abstract payment provider interface.
 *
 * Every payment backend (PayPal sandbox, simulated, etc.) implements this
 * contract so the engine can swap providers without changing business logic.
 */

import type {
  CreateOrderResult,
  AuthorizeResult,
  AuthorizationDetails,
  CaptureResult,
  VoidResult,
  RefundResult,
  PayoutResult,
  ProviderType,
} from './types.js';

/**
 * Payment provider contract.
 *
 * All methods accept an `idempotencyKey` that MUST be forwarded to the
 * underlying payment system to guarantee at-most-once semantics.
 */
export interface PaymentProviderInterface {
  /** Discriminator so callers can branch on provider type. */
  readonly providerType: ProviderType;

  /**
   * Create an order (intent=AUTHORIZE) and return the approval URL
   * the buyer must visit to authorize the payment.
   */
  createOrder(
    amountCents: number,
    description: string,
    idempotencyKey: string,
  ): Promise<CreateOrderResult>;

  /**
   * Authorize a previously-approved order, placing a hold on the buyer's funds.
   */
  authorizeOrder(
    orderId: string,
    idempotencyKey: string,
  ): Promise<AuthorizeResult>;

  /**
   * Query the current details of an authorization.
   */
  getAuthorizationDetails(
    authorizationId: string,
  ): Promise<AuthorizationDetails>;

  /**
   * Capture (some or all) funds from an authorization.
   *
   * @param isFinalCapture  If `true`, the remaining balance is automatically released.
   */
  captureAuthorization(
    authorizationId: string,
    amountCents: number,
    isFinalCapture: boolean,
    idempotencyKey: string,
  ): Promise<CaptureResult>;

  /**
   * Void an authorization, releasing the hold on the buyer's funds.
   */
  voidAuthorization(
    authorizationId: string,
    idempotencyKey: string,
  ): Promise<VoidResult>;

  /**
   * Refund a previously captured payment.
   */
  refundCapture(
    captureId: string,
    amountCents: number,
    idempotencyKey: string,
  ): Promise<RefundResult>;

  /**
   * Pay out the seller via PayPal (or simulate it).
   */
  payoutToSeller(
    recipientEmail: string,
    amountCents: number,
    note: string,
    idempotencyKey: string,
  ): Promise<PayoutResult>;
}
