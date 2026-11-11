/**
 * @module paypal-provider
 * PayPal Sandbox provider — real PayPal API calls using sandbox credentials.
 * Uses plain fetch (works in Cloudflare Workers runtime).
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
import { PAYPAL_SANDBOX_API_BASE, PAYPAL_LIVE_API_BASE } from '@quorum/shared/src/constants.js';

interface PayPalConfig {
  clientId: string;
  clientSecret: string;
  webhookId?: string;
  baseUrl?: string;
}

export class PayPalSandboxProvider implements PaymentProviderInterface {
  readonly providerType: ProviderType = 'paypal';

  private readonly config: Required<Omit<PayPalConfig, 'webhookId'>> & { webhookId?: string };
  private accessToken: string | null = null;
  private tokenExpiresAt = 0;

  constructor(config: PayPalConfig) {
    const baseUrl = config.baseUrl ?? PAYPAL_SANDBOX_API_BASE;

    // HARD BLOCK: Never allow live PayPal
    if (baseUrl === PAYPAL_LIVE_API_BASE || baseUrl.includes('api-m.paypal.com') && !baseUrl.includes('sandbox')) {
      throw new Error(
        '🚫 SAFETY BLOCK: Live PayPal API detected! Quorum ONLY works with sandbox. ' +
        'Set PAYPAL_ENV=sandbox and use the sandbox API URL.',
      );
    }

    this.config = {
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      baseUrl,
      webhookId: config.webhookId,
    };
  }

  // ─── OAuth token management ─────────────────────────────────────────

  private async getAccessToken(): Promise<string> {
    // Cache token until 60s before expiry
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 60_000) {
      return this.accessToken;
    }

    const auth = Buffer.from(
      `${this.config.clientId}:${this.config.clientSecret}`,
    ).toString('base64');

    const res = await fetch(`${this.config.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!res.ok) {
      throw new Error(`PayPal OAuth failed: ${res.status} ${await res.text()}`);
    }

    const data = (await res.json()) as { access_token: string; expires_in: number };
    this.accessToken = data.access_token;
    this.tokenExpiresAt = Date.now() + data.expires_in * 1000;
    return this.accessToken;
  }

  private async request(
    method: string,
    path: string,
    body?: unknown,
    idempotencyKey?: string,
  ): Promise<unknown> {
    const token = await this.getAccessToken();
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    if (idempotencyKey) {
      headers['PayPal-Request-Id'] = idempotencyKey;
    }

    const res = await fetch(`${this.config.baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`PayPal API error ${method} ${path}: ${res.status} ${errorText}`);
    }

    // Some endpoints return 204 No Content
    if (res.status === 204) return {};

    return res.json();
  }

  // ─── PaymentProviderInterface implementation ─────────────────────────

  async createOrder(
    amountCents: number,
    description: string,
    idempotencyKey: string,
  ): Promise<CreateOrderResult> {
    const amount = (amountCents / 100).toFixed(2);

    const data = await this.request('POST', '/v2/checkout/orders', {
      intent: 'AUTHORIZE',
      purchase_units: [
        {
          amount: { currency_code: 'USD', value: amount },
          description,
        },
      ],
    }, idempotencyKey) as { id: string; links: Array<{ rel: string; href: string }> };

    const approvalLink = data.links?.find((l) => l.rel === 'approve' || l.rel === 'payer-action');

    return {
      orderId: data.id,
      approvalUrl: approvalLink?.href ?? `https://www.sandbox.paypal.com/checkoutnow?token=${data.id}`,
      provider: 'paypal',
    };
  }

  async authorizeOrder(
    orderId: string,
    idempotencyKey: string,
  ): Promise<AuthorizeResult> {
    const data = await this.request(
      'POST',
      `/v2/checkout/orders/${orderId}/authorize`,
      {},
      idempotencyKey,
    ) as {
      purchase_units: Array<{
        payments: {
          authorizations: Array<{
            id: string;
            status: string;
            amount: { value: string };
          }>;
        };
      }>;
    };

    const auth = data.purchase_units?.[0]?.payments?.authorizations?.[0];
    if (!auth) throw new Error(`No authorization returned for order ${orderId}`);

    return {
      authorizationId: auth.id,
      status: auth.status,
      amountCents: Math.round(parseFloat(auth.amount.value) * 100),
      provider: 'paypal',
    };
  }

  async getAuthorizationDetails(
    authorizationId: string,
  ): Promise<AuthorizationDetails> {
    const data = await this.request(
      'GET',
      `/v2/payments/authorizations/${authorizationId}`,
    ) as { id: string; status: string; amount: { value: string } };

    return {
      authorizationId: data.id,
      status: data.status as AuthorizationDetails['status'],
      amountCents: Math.round(parseFloat(data.amount.value) * 100),
    };
  }

  async captureAuthorization(
    authorizationId: string,
    amountCents: number,
    isFinalCapture: boolean,
    idempotencyKey: string,
  ): Promise<CaptureResult> {
    const amount = (amountCents / 100).toFixed(2);

    const data = await this.request(
      'POST',
      `/v2/payments/authorizations/${authorizationId}/capture`,
      {
        amount: { currency_code: 'USD', value: amount },
        final_capture: isFinalCapture,
      },
      idempotencyKey,
    ) as { id: string; status: string; amount: { value: string } };

    return {
      captureId: data.id,
      status: data.status as CaptureResult['status'],
      amountCents: Math.round(parseFloat(data.amount.value) * 100),
      isPartialCapture: !isFinalCapture,
      provider: 'paypal',
    };
  }

  async voidAuthorization(
    authorizationId: string,
    idempotencyKey: string,
  ): Promise<VoidResult> {
    await this.request(
      'POST',
      `/v2/payments/authorizations/${authorizationId}/void`,
      {},
      idempotencyKey,
    );

    return { success: true, provider: 'paypal' };
  }

  async refundCapture(
    captureId: string,
    amountCents: number,
    idempotencyKey: string,
  ): Promise<RefundResult> {
    const amount = (amountCents / 100).toFixed(2);

    const data = await this.request(
      'POST',
      `/v2/payments/captures/${captureId}/refund`,
      {
        amount: { currency_code: 'USD', value: amount },
      },
      idempotencyKey,
    ) as { id: string; status: string };

    return {
      refundId: data.id,
      status: data.status,
      amountCents,
      provider: 'paypal',
    };
  }

  async payoutToSeller(
    recipientEmail: string,
    amountCents: number,
    note: string,
    idempotencyKey: string,
  ): Promise<PayoutResult> {
    const amount = (amountCents / 100).toFixed(2);

    const data = await this.request(
      'POST',
      '/v1/payments/payouts',
      {
        sender_batch_header: {
          sender_batch_id: idempotencyKey,
          email_subject: 'Quorum Coalition Payment',
          email_message: note,
        },
        items: [
          {
            recipient_type: 'EMAIL',
            amount: { currency: 'USD', value: amount },
            receiver: recipientEmail,
            note,
            sender_item_id: `${idempotencyKey}-0`,
          },
        ],
      },
      idempotencyKey,
    ) as { batch_header: { payout_batch_id: string; batch_status: string } };

    return {
      payoutId: data.batch_header.payout_batch_id,
      status: data.batch_header.batch_status,
      amountCents,
      provider: 'paypal',
    };
  }
}
