import type { AIClient } from '../gemini-client.js';
import type { MatcherResult } from '../types.js';
import type { SpecEnvelope, Coalition } from '@quorum/shared/src/types.js';

export async function matchSpecToCoalitions(
  client: AIClient,
  spec: SpecEnvelope,
  openCoalitions: Coalition[],
): Promise<MatcherResult> {
  // Deterministic attribute scoring first
  for (const c of openCoalitions) {
    if (c.specEnvelope.category === spec.category) {
      if (c.specEnvelope.priceCeilingCents <= spec.priceCeilingCents) {
        return {
          action: 'JOIN_EXISTING',
          targetCoalitionId: c.id,
          confidenceScore: 0.95,
          reason: `Found active coalition ${c.id} matching ${spec.category} with compatible price target.`,
        };
      }
    }
  }

  // Fallback if no direct match
  return {
    action: 'CREATE_NEW',
    confidenceScore: 1.0,
    reason: 'No open coalition matches this specific spec envelope and price threshold. Forming a new coalition room.',
  };
}
