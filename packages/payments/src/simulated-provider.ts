/**
 * @module simulated-provider
 * In-memory payment provider for simulated members, demos, and tests.
 * All IDs are prefixed with "SIM-" to clearly distinguish them.
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
import type { PaymentProviderInterface } from './provider.js';

interface SimOrder {
  orderId: string;
  amountCents: number;
  description: string;
  status: 'CREATED' | 'APPROVED' | 'AUTHORIZED' | 'COMPLETED';
  authorizationId?: string;
}

interface SimAuth {
  authorizationId: string;
  orderId: string;
  amountCents: number;
  status: 'CREATED' | 'CAPTURED' | 'VOIDED';
  captureId?: string;
}

interface SimCapture {
  captureId: string;
  authorizationId: string;
  amountCents: number;
  status: 'COMPLETED' | 'REFUNDED';
  refundId?: string;
}

interface SimRefund {
  refundId: string;
  captureId: string;
  amountCents: number;
}

interface SimPayout {
  payoutId: string;
  recipientEmail: string;
  amountCents: number;
  note: string;
}

let counter = 0;
function simId(prefix: string): string {
  counter++;
  return `SIM-${prefix}-${Date.now()}-${counter}`;
}

export class SimulatedProvider implements PaymentProviderInterface {
  readonly providerType: ProviderType = 'simulated';

  private orders = new Map<string, SimOrder>();
  private auths = new Map<string, SimAuth>();
  private captures = new Map<string, SimCapture>();
  private refunds = new Map<string, SimRefund>();
  private payouts = new Map<string, SimPayout>();
  private failureInjections = new Map<string, Set<string>>();
  private processedIdempotencyKeys = new Map<string, unknown>();

  /**
   * Inject a failure for testing. Next call of the given operation
   * for this key will throw.
   */
  injectFailure(key: string, operation: 'capture' | 'authorize' | 'refund'): void {
    if (!this.failureInjections.has(key)) {
      this.failureInjections.set(key, new Set());
    }
    this.failureInjections.get(key)!.add(operation);
  }

  clearFailures(): void {
    this.failureInjections.clear();
  }

  private checkFailure(key: string, operation: string): boolean {
    const ops = this.failureInjections.get(key);
    if (ops?.has(operation)) {
      ops.delete(operation);
      return true;
    }
    return false;
  }

  getStore() {
    return {
      orders: Object.fromEntries(this.orders),
      auths: Object.fromEntries(this.auths),
      captures: Object.fromEntries(this.captures),
      refunds: Object.fromEntries(this.refunds),
      payouts: Object.fromEntries(this.payouts),
    };
  }

  reset(): void {
    this.orders.clear();
    this.auths.clear();
    this.captures.clear();
    this.refunds.clear();
    this.payouts.clear();
    this.failureInjections.clear();
    this.processedIdempotencyKeys.clear();
  }

  private async delay(): Promise<void> {
    // Simulate realistic API latency (50-200ms)
    const ms = 50 + Math.random() * 150;
    return new Promise((r) => setTimeout(r, ms));
  }

  async createOrder(
    amountCents: number,
    description: string,
    idempotencyKey: string,
  ): Promise<CreateOrderResult> {
    await this.delay();

    // Idempotency check
    const cached = this.processedIdempotencyKeys.get(idempotencyKey);
    if (cached) return cached as CreateOrderResult;

    const orderId = simId('ORD');
    const order: SimOrder = {
      orderId,
      amountCents,
      description,
      status: 'CREATED',
    };
    this.orders.set(orderId, order);

    // In simulation, auto-approve
    order.status = 'APPROVED';

    const result: CreateOrderResult = {
      orderId,
      approvalUrl: `https://sandbox.paypal.com/simulated/approve/${orderId}`,
      provider: 'simulated',
    };
    this.processedIdempotencyKeys.set(idempotencyKey, result);
    return result;
  }

  async authorizeOrder(
    orderId: string,
    idempotencyKey: string,
  ): Promise<AuthorizeResult> {
    await this.delay();

    const cached = this.processedIdempotencyKeys.get(idempotencyKey);
    if (cached) return cached as AuthorizeResult;

    const order = this.orders.get(orderId);
    if (!order) throw new Error(`Order ${orderId} not found`);
    if (order.status !== 'APPROVED') {
      throw new Error(`Order ${orderId} is not in APPROVED state (current: ${order.status})`);
    }

    if (this.checkFailure(orderId, 'authorize')) {
      throw new Error(`[INJECTED FAILURE] Authorization failed for order ${orderId}`);
    }

    const authorizationId = simId('AUTH');
    const auth: SimAuth = {
      authorizationId,
      orderId,
      amountCents: order.amountCents,
      status: 'CREATED',
    };
    this.auths.set(authorizationId, auth);
    order.authorizationId = authorizationId;
    order.status = 'AUTHORIZED';

    const result: AuthorizeResult = {
      authorizationId,
      status: 'CREATED',
      amountCents: order.amountCents,
      provider: 'simulated',
    };
    this.processedIdempotencyKeys.set(idempotencyKey, result);
    return result;
  }

  async getAuthorizationDetails(
    authorizationId: string,
  ): Promise<AuthorizationDetails> {
    await this.delay();

    const auth = this.auths.get(authorizationId);
    if (!auth) throw new Error(`Authorization ${authorizationId} not found`);

    return {
      authorizationId: auth.authorizationId,
      status: auth.status,
      amountCents: auth.amountCents,
    };
  }

  async captureAuthorization(
    authorizationId: string,
    amountCents: number,
    isFinalCapture: boolean,
    idempotencyKey: string,
  ): Promise<CaptureResult> {
    await this.delay();

    const cached = this.processedIdempotencyKeys.get(idempotencyKey);
    if (cached) return cached as CaptureResult;

    const auth = this.auths.get(authorizationId);
    if (!auth) throw new Error(`Authorization ${authorizationId} not found`);
    if (auth.status === 'VOIDED') {
      throw new Error(`Cannot capture voided authorization ${authorizationId}`);
    }
    if (auth.status === 'CAPTURED') {
      throw new Error(`Authorization ${authorizationId} already captured`);
    }
    if (amountCents > auth.amountCents) {
      throw new Error(
        `Capture amount ${amountCents}¢ exceeds authorized amount ${auth.amountCents}¢`,
      );
    }

    if (this.checkFailure(authorizationId, 'capture')) {
      const failResult: CaptureResult = {
        captureId: simId('CAP-FAIL'),
        status: 'FAILED',
        amountCents: 0,
        isPartialCapture: false,
        provider: 'simulated',
      };
      this.processedIdempotencyKeys.set(idempotencyKey, failResult);
      return failResult;
    }

    const captureId = simId('CAP');
    const capture: SimCapture = {
      captureId,
      authorizationId,
      amountCents,
      status: 'COMPLETED',
    };
    this.captures.set(captureId, capture);
    auth.status = 'CAPTURED';
    auth.captureId = captureId;

    const result: CaptureResult = {
      captureId,
      status: 'COMPLETED',
      amountCents,
      isPartialCapture: amountCents < auth.amountCents,
      provider: 'simulated',
    };
    this.processedIdempotencyKeys.set(idempotencyKey, result);
    return result;
  }

  async voidAuthorization(
    authorizationId: string,
    idempotencyKey: string,
  ): Promise<VoidResult> {
    await this.delay();

    const cached = this.processedIdempotencyKeys.get(idempotencyKey);
    if (cached) return cached as VoidResult;

    const auth = this.auths.get(authorizationId);
    if (!auth) throw new Error(`Authorization ${authorizationId} not found`);
    if (auth.status === 'CAPTURED') {
      throw new Error(`Cannot void captured authorization ${authorizationId}`);
    }
    if (auth.status === 'VOIDED') {
      // Already voided — idempotent
      return { success: true, provider: 'simulated' };
    }

    auth.status = 'VOIDED';

    const result: VoidResult = { success: true, provider: 'simulated' };
    this.processedIdempotencyKeys.set(idempotencyKey, result);
    return result;
  }

  async refundCapture(
    captureId: string,
    amountCents: number,
    idempotencyKey: string,
  ): Promise<RefundResult> {
    await this.delay();

    const cached = this.processedIdempotencyKeys.get(idempotencyKey);
    if (cached) return cached as RefundResult;

    const capture = this.captures.get(captureId);
    if (!capture) throw new Error(`Capture ${captureId} not found`);
    if (capture.status === 'REFUNDED') {
      throw new Error(`Capture ${captureId} already refunded`);
    }

    if (this.checkFailure(captureId, 'refund')) {
      throw new Error(`[INJECTED FAILURE] Refund failed for capture ${captureId}`);
    }

    if (amountCents > capture.amountCents) {
      throw new Error(
        `Refund amount ${amountCents}¢ exceeds captured amount ${capture.amountCents}¢`,
      );
    }

    const refundId = simId('REF');
    const refund: SimRefund = { refundId, captureId, amountCents };
    this.refunds.set(refundId, refund);
    capture.status = 'REFUNDED';
    capture.refundId = refundId;

    const result: RefundResult = {
      refundId,
      status: 'COMPLETED',
      amountCents,
      provider: 'simulated',
    };
    this.processedIdempotencyKeys.set(idempotencyKey, result);
    return result;
  }

  async payoutToSeller(
    recipientEmail: string,
    amountCents: number,
    note: string,
    idempotencyKey: string,
  ): Promise<PayoutResult> {
    await this.delay();

    const cached = this.processedIdempotencyKeys.get(idempotencyKey);
    if (cached) return cached as PayoutResult;

    const payoutId = simId('PAY');
    const payout: SimPayout = { payoutId, recipientEmail, amountCents, note };
    this.payouts.set(payoutId, payout);

    const result: PayoutResult = {
      payoutId,
      status: 'SUCCESS',
      amountCents,
      provider: 'simulated',
    };
    this.processedIdempotencyKeys.set(idempotencyKey, result);
    return result;
  }
}
