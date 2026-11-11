import type { SpecEnvelope, TierStep, SellerOffer, Product } from '@quorum/shared/src/types.js';

export type AIMode = 'live' | 'cached' | 'scripted';

export interface AIProviderConfig {
  apiKey?: string;
  model?: string;
  mode?: AIMode;
  maxCallsPerDay?: number;
}

export interface InterpretedWishResult {
  specEnvelope: SpecEnvelope;
  suggestedProductTitle: string;
  summaryText: string;
  substitutesAccepted: string[];
}

export interface MatcherResult {
  action: 'JOIN_EXISTING' | 'CREATE_NEW';
  targetCoalitionId?: string;
  confidenceScore: number;
  reason: string;
}

export interface NegotiationBid {
  sellerId: string;
  sellerName: string;
  ladder: TierStep[];
  honorPct: number;
  deliveryDays: number;
  notes: string;
}

export interface ExplainerEvent {
  eventType: string;
  deltaCount?: number;
  newPriceCents?: number;
  sellerName?: string;
  round?: number;
}
