import { describe, it, expect } from 'vitest';
import { PayPalSandboxProvider } from '../paypal-provider.js';

describe('PayPalSandboxProvider', () => {
  it('throws an error if configured with live PayPal URL', () => {
    expect(() => {
      new PayPalSandboxProvider({
        clientId: 'dummy-client',
        clientSecret: 'dummy-secret',
        baseUrl: 'https://api-m.paypal.com',
      });
    }).toThrow('SAFETY BLOCK: Live PayPal API detected');
  });

  it('initializes cleanly with sandbox configuration', () => {
    const provider = new PayPalSandboxProvider({
      clientId: 'sandbox-client-id',
      clientSecret: 'sandbox-client-secret',
    });
    expect(provider.providerType).toBe('paypal');
  });
});
