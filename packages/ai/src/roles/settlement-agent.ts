import type { CapturePlan } from '@quorum/engine/src/settlement.js';
import { createCapturePlan } from '@quorum/engine/src/settlement.js';
import type { Membership } from '@quorum/shared/src/types.js';

export async function proposeSettlementPlan(
  members: Membership[],
  finalPriceCents: number,
): Promise<CapturePlan> {
  // Propose standard capture plan computed from engine rules
  return createCapturePlan(members, finalPriceCents);
}
