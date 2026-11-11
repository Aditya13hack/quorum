import type {
  Product,
  Coalition,
  Membership,
  SellerOffer,
  LedgerEntry,
  AuditEntry,
  Shipment,
} from '@quorum/shared/src/types.js';
import {
  CoalitionState,
  MemberState,
  LedgerEntryType,
  ShipmentStatus,
  OfferStatus,
} from '@quorum/shared/src/enums.js';
import { SimulatedProvider } from '@quorum/payments/src/simulated-provider.js';
import { PayPalSandboxProvider } from '@quorum/payments/src/paypal-provider.js';
import { AIClient } from '@quorum/ai/src/gemini-client.js';

export interface AppStore {
  products: Map<string, Product>;
  coalitions: Map<string, Coalition>;
  memberships: Map<string, Membership[]>; // coalitionId -> members
  sellerOffers: Map<string, SellerOffer[]>; // coalitionId -> offers
  ledger: LedgerEntry[];
  auditLog: AuditEntry[];
  shipments: Map<string, Shipment>; // coalitionId -> shipment
  simulatedProvider: SimulatedProvider;
  paypalProvider?: PayPalSandboxProvider;
  aiClient: AIClient;
  timeScale: number;
}

export function createStore(): AppStore {
  const simulatedProvider = new SimulatedProvider();
  const aiClient = new AIClient({ mode: 'scripted' });

  let paypalProvider: PayPalSandboxProvider | undefined;
  if (process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET) {
    try {
      paypalProvider = new PayPalSandboxProvider({
        clientId: process.env.PAYPAL_CLIENT_ID,
        clientSecret: process.env.PAYPAL_CLIENT_SECRET,
        webhookId: process.env.PAYPAL_WEBHOOK_ID,
      });
    } catch (e) {
      console.warn('PayPalSandboxProvider init failed:', e);
    }
  }

  const store: AppStore = {
    products: new Map(),
    coalitions: new Map(),
    memberships: new Map(),
    sellerOffers: new Map(),
    ledger: [],
    auditLog: [],
    shipments: new Map(),
    simulatedProvider,
    paypalProvider,
    aiClient,
    timeScale: parseInt(process.env.TIME_SCALE || '1440', 10),
  };

  seedStore(store);
  return store;
}

export function seedStore(store: AppStore): void {
  store.products.clear();
  store.coalitions.clear();
  store.memberships.clear();
  store.sellerOffers.clear();
  store.ledger.length = 0;
  store.auditLog.length = 0;
  store.shipments.clear();
  store.simulatedProvider.reset();

  // 1. Hero Product: 27-inch 4K IPS Monitor
  const monitor: Product = {
    id: 'prod_monitor_4k',
    name: '27-inch 4K IPS Pro Monitor',
    category: 'monitors',
    attributes: {
      resolution: '4K',
      panel: 'IPS',
      size: '27-inch',
      refreshRate: '60Hz',
      ports: 'HDMI 2.1, DisplayPort 1.4, USB-C 65W PD',
    },
    samplePriceCents: 38900, // $389 solo price
    channel3PriceCents: 38900,
    priceSource: 'sample',
  };

  // 2. Social Impact Product: Neighborhood Solar & Battery Kit
  const solarKit: Product = {
    id: 'prod_solar_kit',
    name: 'Community Solar Microgrid & Battery Storage Kit',
    category: 'solar',
    attributes: {
      capacity: '5kW Hybrid Inverter + 10kWh LiFePO4',
      panels: '12x 410W Monocrystalline Panels',
      warranty: '25-Year Linear Output Guarantee',
    },
    samplePriceCents: 240000, // $2,400 solo price
    priceSource: 'sample',
  };

  // 3. Small Business Product: Commercial LED Bundle
  const ledBundle: Product = {
    id: 'prod_led_wholesale',
    name: 'Commercial High-Bay LED Fixture Pack (10-Unit)',
    category: 'lighting',
    attributes: {
      lumens: '150W 21000lm 5000K Daylight',
      rating: 'IP65 Waterproof & Dustproof',
    },
    samplePriceCents: 65000, // $650 solo price
    priceSource: 'sample',
  };

  store.products.set(monitor.id, monitor);
  store.products.set(solarKit.id, solarKit);
  store.products.set(ledBundle.id, ledBundle);

  // Seed default monitor coalition:
  const coalitionId = 'coalition_monitor_demo';
  const coalition: Coalition = {
    id: coalitionId,
    productId: monitor.id,
    specEnvelope: {
      category: 'monitors',
      requiredAttributes: { resolution: '4K', panel: 'IPS' },
      acceptableRanges: { sizeInches: { min: 27, max: 28 } },
      priceCeilingCents: 40000,
      acceptableSubstitutes: ['Creator Display', 'Design Monitor'],
      deadlineMs: Date.now() + 48 * 3600 * 1000,
    },
    state: CoalitionState.COLLECTING,
    quorum: 22, // 20 + 10% safety margin
    safetyMarginPct: 10,
    deadlineMs: Date.now() + 48 * 3600 * 1000,
    timeScale: store.timeScale,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.coalitions.set(coalitionId, coalition);

  // Seed Seller Offers
  const alphaOffer: SellerOffer = {
    id: 'offer_alpha_1',
    sellerId: 'seller_alpha',
    coalitionId,
    productId: monitor.id,
    tierLadder: [
      { minBuyers: 10, priceCents: 35000 },
      { minBuyers: 20, priceCents: 31500 },
      { minBuyers: 40, priceCents: 28900 },
    ],
    honorPct: 90,
    deliveryDays: 5,
    hiddenFloorCents: 27500,
    notes: 'Official wholesale batch from Alpha Supply. Fast freight shipping included.',
    status: OfferStatus.ACTIVE,
  };

  const betaOffer: SellerOffer = {
    id: 'offer_beta_1',
    sellerId: 'seller_beta',
    coalitionId,
    productId: monitor.id,
    tierLadder: [
      { minBuyers: 5, priceCents: 36000 },
      { minBuyers: 20, priceCents: 33000 },
      { minBuyers: 35, priceCents: 30500 },
    ],
    honorPct: 95,
    deliveryDays: 2,
    hiddenFloorCents: 29500,
    notes: 'Beta Express guaranteed 2-day delivery with premium packaging.',
    status: OfferStatus.ACTIVE,
  };

  store.sellerOffers.set(coalitionId, [alphaOffer, betaOffer]);

  // Seed 15 simulated members initially (approaching Tier 1 and Tier 2)
  const initialMembers: Membership[] = [];
  for (let i = 1; i <= 15; i++) {
    initialMembers.push({
      coalitionId,
      userId: `sim_buyer_${i}`,
      isSimulated: true,
      state: MemberState.APPROVED,
      approvedMaxCents: 38000,
      simAuthId: `SIM-AUTH-INIT-${i}`,
      timestamps: {
        joinedAt: new Date(Date.now() - (16 - i) * 120000).toISOString(),
        approvedAt: new Date(Date.now() - (16 - i) * 60000).toISOString(),
      },
    });

    store.ledger.push({
      id: `led_init_res_${i}`,
      coalitionId,
      memberId: `sim_buyer_${i}`,
      type: LedgerEntryType.RESERVED,
      amountCents: 35000,
      provider: 'SIMULATED',
      referenceId: `SIM-AUTH-INIT-${i}`,
      createdAt: new Date().toISOString(),
    });
  }

  store.memberships.set(coalitionId, initialMembers);

  store.auditLog.push({
    id: 'audit_init_1',
    timestamp: new Date().toISOString(),
    actor: 'SystemEngine',
    actorType: 'system',
    eventType: 'COALITION_SEEDED',
    referenceIds: { coalitionId },
    summary: 'Seeded initial coalition demo room with 15 simulated buyers and 2 seller offers.',
    verdict: 'allowed',
  });
}
