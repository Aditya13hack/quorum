/**
 * @module state-machine
 *
 * Coalition and Member finite-state machines.
 *
 * Both machines are defined as simple transition maps. The `canTransition`
 * and `assertTransition` helpers work against either machine, keeping
 * state-change validation uniform across the entire codebase.
 */

import { CoalitionState, MemberState } from '@quorum/shared/src/enums.js';
import { StateTransitionError } from '@quorum/shared/src/errors.js';

// ─── Transition map type ────────────────────────────────────────────────────

/**
 * A transition map: for every source state, list the valid target states.
 * Terminal states map to an empty array.
 */
export type TransitionMap<S extends string> = Readonly<Record<S, readonly S[]>>;

// ─── Coalition state machine ────────────────────────────────────────────────

export const COALITION_TRANSITIONS: TransitionMap<CoalitionState> = {
  [CoalitionState.COLLECTING]: [
    CoalitionState.NEGOTIATING,
    CoalitionState.EXPIRED,
    CoalitionState.CANCELLED,
  ],
  [CoalitionState.NEGOTIATING]: [
    CoalitionState.COLLECTING,
    CoalitionState.OFFER_READY,
    CoalitionState.EXPIRED,
    CoalitionState.CANCELLED,
  ],
  [CoalitionState.OFFER_READY]: [
    CoalitionState.APPROVING,
    CoalitionState.NEGOTIATING,
    CoalitionState.EXPIRED,
    CoalitionState.CANCELLED,
  ],
  [CoalitionState.APPROVING]: [
    CoalitionState.LOCKED,
    CoalitionState.COLLECTING,
    CoalitionState.EXPIRED,
    CoalitionState.CANCELLED,
  ],
  [CoalitionState.LOCKED]: [
    CoalitionState.CAPTURING,
    CoalitionState.CANCELLED,
  ],
  [CoalitionState.CAPTURING]: [
    CoalitionState.FULFILLING,
    CoalitionState.FAILED_AT_CAPTURE,
  ],
  [CoalitionState.FULFILLING]: [
    CoalitionState.SETTLED,
  ],
  // Terminal states — no outgoing transitions
  [CoalitionState.SETTLED]: [],
  [CoalitionState.EXPIRED]: [],
  [CoalitionState.CANCELLED]: [],
  [CoalitionState.FAILED_AT_CAPTURE]: [],
} as const;

// ─── Member state machine ───────────────────────────────────────────────────

export const MEMBER_TRANSITIONS: TransitionMap<MemberState> = {
  [MemberState.INTERESTED]: [
    MemberState.LIMITS_SET,
    MemberState.DECLINED,
    MemberState.DROPPED,
  ],
  [MemberState.LIMITS_SET]: [
    MemberState.MATCHED,
    MemberState.DECLINED,
    MemberState.DROPPED,
  ],
  [MemberState.MATCHED]: [
    MemberState.OFFER_SHOWN,
    MemberState.DECLINED,
    MemberState.DROPPED,
  ],
  [MemberState.OFFER_SHOWN]: [
    MemberState.APPROVED,
    MemberState.DECLINED,
    MemberState.DROPPED,
    MemberState.EXPIRED_NO_ANSWER,
  ],
  [MemberState.APPROVED]: [
    MemberState.CAPTURED,
    MemberState.RELEASED,
    MemberState.DROPPED,
    MemberState.REAPPROVAL_REQUIRED,
    MemberState.WAITLISTED,
    MemberState.FAILED_AUTH,
  ],
  [MemberState.WAITLISTED]: [
    MemberState.APPROVED,
    MemberState.RELEASED,
    MemberState.DROPPED,
  ],
  [MemberState.CAPTURED]: [
    MemberState.DELIVERED,
    MemberState.REFUNDED,
    MemberState.FAILED_CAPTURE,
  ],
  [MemberState.REAPPROVAL_REQUIRED]: [
    MemberState.APPROVED,
    MemberState.DECLINED,
    MemberState.DROPPED,
    MemberState.EXPIRED_NO_ANSWER,
  ],
  [MemberState.DELIVERED]: [
    MemberState.REFUNDED,
  ],
  // Terminal states — no outgoing transitions
  [MemberState.RELEASED]: [],
  [MemberState.DECLINED]: [],
  [MemberState.DROPPED]: [],
  [MemberState.EXPIRED_NO_ANSWER]: [],
  [MemberState.REFUNDED]: [],
  [MemberState.FAILED_AUTH]: [],
  [MemberState.FAILED_CAPTURE]: [],
} as const;

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Check whether a transition from `from` to `to` is allowed in the given
 * machine (coalition or member).
 *
 * @param machine  The transition map to check against.
 * @param from     Current state.
 * @param to       Desired target state.
 * @returns `true` if the transition is explicitly allowed.
 */
export function canTransition<S extends string>(
  machine: TransitionMap<S>,
  from: S,
  to: S,
): boolean {
  const allowed = machine[from];
  if (!allowed) return false;
  return (allowed as readonly string[]).includes(to);
}

/**
 * Assert that a transition is valid. Throws `StateTransitionError` if not.
 *
 * @param machine  The transition map to check against.
 * @param from     Current state.
 * @param to       Desired target state.
 * @throws {StateTransitionError} when the transition is not in the map.
 */
export function assertTransition<S extends string>(
  machine: TransitionMap<S>,
  from: S,
  to: S,
): void {
  if (!canTransition(machine, from, to)) {
    const allowed = machine[from];
    const allowedStr = allowed && allowed.length > 0
      ? (allowed as readonly string[]).join(', ')
      : '(terminal state — no transitions)';
    throw new StateTransitionError(
      from,
      to,
      `Allowed transitions from ${from}: ${allowedStr}`,
    );
  }
}
