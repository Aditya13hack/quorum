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
  OfferStatus,
} from '@quorum/shared/src/enums.js';
import { SimulatedProvider } from '@quorum/payments/src/simulated-provider.js';
import { PayPalSandboxProvider } from '@quorum/payments/src/paypal-provider.js';
import { AIClient } from '@quorum/ai/src/gemini-client.js';

export interface DataState {
  products: Map<string, Product>;
  coalitions: Map<string, Coalition>;
  memberships: Map<string, Membership[]>; // coalitionId -> members
  sellerOffers: Map<string, SellerOffer[]>; // coalitionId -> offers
  ledger: LedgerEntry[];
  auditLog: AuditEntry[];
  shipments: Map<string, Shipment>; // coalitionId -> shipment
}

export function createEmptyDataState(): DataState {
  return {
    products: new Map(),
    coalitions: new Map(),
    memberships: new Map(),
    sellerOffers: new Map(),
    ledger: [],
    auditLog: [],
    shipments: new Map(),
  };
}

export interface AppStore {
  // Direct access maps (pointing to simulated for backward-compatibility with tests)
  products: Map<string, Product>;
  coalitions: Map<string, Coalition>;
  memberships: Map<string, Membership[]>;
  sellerOffers: Map<string, SellerOffer[]>;
  ledger: LedgerEntry[];
  auditLog: AuditEntry[];
  shipments: Map<string, Shipment>;

  // Dual isolated stores
  simulated: DataState;
  live: DataState; // 100% clean, 0 fake data, only real-time actions

  simulatedProvider: SimulatedProvider;
  paypalProvider?: PayPalSandboxProvider;
  aiClient: AIClient;
  timeScale: number;
  getState: (mode?: string) => DataState;
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

  const simulated = createEmptyDataState();
  const live = createEmptyDataState(); // Starts 100% clean and blank!

  const store: AppStore = {
    // Reference simulated state directly for root access
    products: simulated.products,
    coalitions: simulated.coalitions,
    memberships: simulated.memberships,
    sellerOffers: simulated.sellerOffers,
    ledger: simulated.ledger,
    auditLog: simulated.auditLog,
    shipments: simulated.shipments,

    simulated,
    live,

    simulatedProvider,
    paypalProvider,
    aiClient,
    timeScale: parseInt(process.env.TIME_SCALE || '1440', 10),
    getState: (mode?: string) => {
      if (mode === 'live' || mode === 'real') {
        return live;
      }
      return simulated;
    },
  };

  seedSimulatedState(simulated, store.timeScale);
  return store;
}

export function seedSimulatedState(state: DataState, timeScale: number): void {
  state.products.clear();
  state.coalitions.clear();
  state.memberships.clear();
  state.sellerOffers.clear();
  state.ledger.length = 0;
  state.auditLog.length = 0;
  state.shipments.clear();

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
    samplePriceCents: 38900,
    channel3PriceCents: 38900,
    priceSource: 'sample',
  };

  // 2. Solar Microgrid Kit
  const solarKit: Product = {
    id: 'prod_solar_kit',
    name: 'Community Solar Microgrid & Battery Storage Kit',
    category: 'solar',
    attributes: {
      capacity: '5kW Hybrid Inverter + 10kWh LiFePO4',
      panels: '12x 410W Monocrystalline Panels',
      warranty: '25-Year Linear Output Guarantee',
    },
    samplePriceCents: 240000,
    priceSource: 'sample',
  };

  // 3. Commercial LED Bundle
  const ledBundle: Product = {
    id: 'prod_led_wholesale',
    name: 'Commercial High-Bay LED Fixture Pack (10-Unit)',
    category: 'lighting',
    attributes: {
      lumens: '150W 21000lm 5000K Daylight',
      rating: 'IP65 Waterproof & Dustproof',
    },
    samplePriceCents: 65000,
    priceSource: 'sample',
  };

  state.products.set(monitor.id, monitor);
  state.products.set(solarKit.id, solarKit);
  state.products.set(ledBundle.id, ledBundle);

  // Monitor coalition
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
    quorum: 22,
    safetyMarginPct: 10,
    deadlineMs: Date.now() + 48 * 3600 * 1000,
    timeScale,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  state.coalitions.set(coalitionId, coalition);

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
  state.sellerOffers.set(coalitionId, [alphaOffer, betaOffer]);

  // Seed 15 simulated members
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

    state.ledger.push({
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
  state.memberships.set(coalitionId, initialMembers);

  // Solar Microgrid Coalition
  const solarCoalitionId = 'coalition_solar_demo';
  const solarCoalition: Coalition = {
    id: solarCoalitionId,
    productId: solarKit.id,
    specEnvelope: {
      category: 'solar',
      requiredAttributes: { capacity: '5kW Hybrid Inverter + 10kWh LiFePO4' },
      acceptableRanges: { capacityKw: { min: 5, max: 10 } },
      priceCeilingCents: 250000,
      acceptableSubstitutes: ['Residential Microgrid', 'Home Battery Storage'],
      deadlineMs: Date.now() + 72 * 3600 * 1000,
    },
    state: CoalitionState.COLLECTING,
    quorum: 6,
    safetyMarginPct: 10,
    deadlineMs: Date.now() + 72 * 3600 * 1000,
    timeScale,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  state.coalitions.set(solarCoalitionId, solarCoalition);

  const solarOffer: SellerOffer = {
    id: 'offer_solar_1',
    sellerId: 'seller_ecovolt',
    coalitionId: solarCoalitionId,
    productId: solarKit.id,
    tierLadder: [
      { minBuyers: 3, priceCents: 210000 },
      { minBuyers: 5, priceCents: 195000 },
      { minBuyers: 10, priceCents: 179000 },
    ],
    honorPct: 98,
    deliveryDays: 10,
    hiddenFloorCents: 170000,
    notes: 'Certified Tier-1 solar panels with 25-year manufacturer warranty and free commercial pallet delivery.',
    status: OfferStatus.ACTIVE,
  };
  state.sellerOffers.set(solarCoalitionId, [solarOffer]);

  const solarMembers: Membership[] = [];
  for (let i = 1; i <= 4; i++) {
    solarMembers.push({
      coalitionId: solarCoalitionId,
      userId: `solar_buyer_${i}`,
      isSimulated: true,
      state: MemberState.APPROVED,
      approvedMaxCents: 230000,
      simAuthId: `SIM-SOLAR-${i}`,
      timestamps: {
        joinedAt: new Date().toISOString(),
        approvedAt: new Date().toISOString(),
      },
    });
  }
  state.memberships.set(solarCoalitionId, solarMembers);

  // Commercial LED Fixture Coalition
  const ledCoalitionId = 'coalition_led_demo';
  const ledCoalition: Coalition = {
    id: ledCoalitionId,
    productId: ledBundle.id,
    specEnvelope: {
      category: 'lighting',
      requiredAttributes: { lumens: '150W 21000lm 5000K Daylight' },
      acceptableRanges: { wattage: { min: 100, max: 200 } },
      priceCeilingCents: 65000,
      acceptableSubstitutes: ['Industrial High-Bay', 'Warehouse LED'],
      deadlineMs: Date.now() + 96 * 3600 * 1000,
    },
    state: CoalitionState.COLLECTING,
    quorum: 11,
    safetyMarginPct: 10,
    deadlineMs: Date.now() + 96 * 3600 * 1000,
    timeScale,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  state.coalitions.set(ledCoalitionId, ledCoalition);

  const ledOffer: SellerOffer = {
    id: 'offer_led_1',
    sellerId: 'seller_lumens_direct',
    coalitionId: ledCoalitionId,
    productId: ledBundle.id,
    tierLadder: [
      { minBuyers: 5, priceCents: 58000 },
      { minBuyers: 10, priceCents: 52000 },
      { minBuyers: 25, priceCents: 47500 },
    ],
    honorPct: 92,
    deliveryDays: 3,
    hiddenFloorCents: 45000,
    notes: 'Direct from lighting factory. IP65 rated commercial grade with 5-year replacement guarantee.',
    status: OfferStatus.ACTIVE,
  };
  state.sellerOffers.set(ledCoalitionId, [ledOffer]);

  const ledMembers: Membership[] = [];
  for (let i = 1; i <= 8; i++) {
    ledMembers.push({
      coalitionId: ledCoalitionId,
      userId: `contractor_buyer_${i}`,
      isSimulated: true,
      state: MemberState.APPROVED,
      approvedMaxCents: 62000,
      simAuthId: `SIM-LED-${i}`,
      timestamps: {
        joinedAt: new Date().toISOString(),
        approvedAt: new Date().toISOString(),
      },
    });
  }
  state.memberships.set(ledCoalitionId, ledMembers);

  state.auditLog.push({
    id: 'audit_init_1',
    timestamp: new Date().toISOString(),
    actor: 'SystemEngine',
    actorType: 'system',
    eventType: 'COALITION_SEEDED',
    referenceIds: { coalitionId },
    summary: 'Seeded initial simulation data rooms with simulated buyer agents and seller offers.',
    verdict: 'allowed',
  });
}
