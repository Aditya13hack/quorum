import { describe, it, expect } from 'vitest';
import { CoalitionState, MemberState } from '@quorum/shared/src/enums.js';
import {
  COALITION_TRANSITIONS,
  MEMBER_TRANSITIONS,
  canTransition,
  assertTransition,
} from '../state-machine.js';

describe('Coalition State Machine', () => {
  it('allows COLLECTING → NEGOTIATING', () => {
    expect(canTransition(COALITION_TRANSITIONS, CoalitionState.COLLECTING, CoalitionState.NEGOTIATING)).toBe(true);
  });

  it('allows COLLECTING → EXPIRED', () => {
    expect(canTransition(COALITION_TRANSITIONS, CoalitionState.COLLECTING, CoalitionState.EXPIRED)).toBe(true);
  });

  it('allows COLLECTING → CANCELLED', () => {
    expect(canTransition(COALITION_TRANSITIONS, CoalitionState.COLLECTING, CoalitionState.CANCELLED)).toBe(true);
  });

  it('blocks COLLECTING → SETTLED (skip states)', () => {
    expect(canTransition(COALITION_TRANSITIONS, CoalitionState.COLLECTING, CoalitionState.SETTLED)).toBe(false);
  });

  it('blocks COLLECTING → LOCKED', () => {
    expect(canTransition(COALITION_TRANSITIONS, CoalitionState.COLLECTING, CoalitionState.LOCKED)).toBe(false);
  });

  it('allows NEGOTIATING → OFFER_READY', () => {
    expect(canTransition(COALITION_TRANSITIONS, CoalitionState.NEGOTIATING, CoalitionState.OFFER_READY)).toBe(true);
  });

  it('allows NEGOTIATING → COLLECTING (return transition)', () => {
    expect(canTransition(COALITION_TRANSITIONS, CoalitionState.NEGOTIATING, CoalitionState.COLLECTING)).toBe(true);
  });

  it('allows OFFER_READY → APPROVING', () => {
    expect(canTransition(COALITION_TRANSITIONS, CoalitionState.OFFER_READY, CoalitionState.APPROVING)).toBe(true);
  });

  it('allows OFFER_READY → NEGOTIATING (return transition)', () => {
    expect(canTransition(COALITION_TRANSITIONS, CoalitionState.OFFER_READY, CoalitionState.NEGOTIATING)).toBe(true);
  });

  it('allows APPROVING → LOCKED', () => {
    expect(canTransition(COALITION_TRANSITIONS, CoalitionState.APPROVING, CoalitionState.LOCKED)).toBe(true);
  });

  it('allows APPROVING → COLLECTING (return transition)', () => {
    expect(canTransition(COALITION_TRANSITIONS, CoalitionState.APPROVING, CoalitionState.COLLECTING)).toBe(true);
  });

  it('allows LOCKED → CAPTURING', () => {
    expect(canTransition(COALITION_TRANSITIONS, CoalitionState.LOCKED, CoalitionState.CAPTURING)).toBe(true);
  });

  it('allows CAPTURING → FULFILLING', () => {
    expect(canTransition(COALITION_TRANSITIONS, CoalitionState.CAPTURING, CoalitionState.FULFILLING)).toBe(true);
  });

  it('allows CAPTURING → FAILED_AT_CAPTURE', () => {
    expect(canTransition(COALITION_TRANSITIONS, CoalitionState.CAPTURING, CoalitionState.FAILED_AT_CAPTURE)).toBe(true);
  });

  it('allows FULFILLING → SETTLED', () => {
    expect(canTransition(COALITION_TRANSITIONS, CoalitionState.FULFILLING, CoalitionState.SETTLED)).toBe(true);
  });

  it('blocks terminal state SETTLED → anything', () => {
    for (const state of Object.values(CoalitionState)) {
      expect(canTransition(COALITION_TRANSITIONS, CoalitionState.SETTLED, state)).toBe(false);
    }
  });

  it('blocks terminal state EXPIRED → anything', () => {
    for (const state of Object.values(CoalitionState)) {
      expect(canTransition(COALITION_TRANSITIONS, CoalitionState.EXPIRED, state)).toBe(false);
    }
  });

  it('blocks terminal state FAILED_AT_CAPTURE → anything', () => {
    for (const state of Object.values(CoalitionState)) {
      expect(canTransition(COALITION_TRANSITIONS, CoalitionState.FAILED_AT_CAPTURE, state)).toBe(false);
    }
  });
});

describe('Member State Machine', () => {
  it('allows INTERESTED → LIMITS_SET', () => {
    expect(canTransition(MEMBER_TRANSITIONS, MemberState.INTERESTED, MemberState.LIMITS_SET)).toBe(true);
  });

  it('allows LIMITS_SET → MATCHED', () => {
    expect(canTransition(MEMBER_TRANSITIONS, MemberState.LIMITS_SET, MemberState.MATCHED)).toBe(true);
  });

  it('allows MATCHED → OFFER_SHOWN', () => {
    expect(canTransition(MEMBER_TRANSITIONS, MemberState.MATCHED, MemberState.OFFER_SHOWN)).toBe(true);
  });

  it('allows OFFER_SHOWN → APPROVED', () => {
    expect(canTransition(MEMBER_TRANSITIONS, MemberState.OFFER_SHOWN, MemberState.APPROVED)).toBe(true);
  });

  it('allows OFFER_SHOWN → DECLINED', () => {
    expect(canTransition(MEMBER_TRANSITIONS, MemberState.OFFER_SHOWN, MemberState.DECLINED)).toBe(true);
  });

  it('allows OFFER_SHOWN → EXPIRED_NO_ANSWER', () => {
    expect(canTransition(MEMBER_TRANSITIONS, MemberState.OFFER_SHOWN, MemberState.EXPIRED_NO_ANSWER)).toBe(true);
  });

  it('allows APPROVED → CAPTURED', () => {
    expect(canTransition(MEMBER_TRANSITIONS, MemberState.APPROVED, MemberState.CAPTURED)).toBe(true);
  });

  it('allows APPROVED → RELEASED (void)', () => {
    expect(canTransition(MEMBER_TRANSITIONS, MemberState.APPROVED, MemberState.RELEASED)).toBe(true);
  });

  it('allows APPROVED → WAITLISTED', () => {
    expect(canTransition(MEMBER_TRANSITIONS, MemberState.APPROVED, MemberState.WAITLISTED)).toBe(true);
  });

  it('allows APPROVED → REAPPROVAL_REQUIRED', () => {
    expect(canTransition(MEMBER_TRANSITIONS, MemberState.APPROVED, MemberState.REAPPROVAL_REQUIRED)).toBe(true);
  });

  it('allows WAITLISTED → APPROVED (promotion)', () => {
    expect(canTransition(MEMBER_TRANSITIONS, MemberState.WAITLISTED, MemberState.APPROVED)).toBe(true);
  });

  it('allows CAPTURED → DELIVERED', () => {
    expect(canTransition(MEMBER_TRANSITIONS, MemberState.CAPTURED, MemberState.DELIVERED)).toBe(true);
  });

  it('allows CAPTURED → REFUNDED', () => {
    expect(canTransition(MEMBER_TRANSITIONS, MemberState.CAPTURED, MemberState.REFUNDED)).toBe(true);
  });

  it('allows DELIVERED → REFUNDED', () => {
    expect(canTransition(MEMBER_TRANSITIONS, MemberState.DELIVERED, MemberState.REFUNDED)).toBe(true);
  });

  it('blocks DECLINED → anything (terminal)', () => {
    for (const state of Object.values(MemberState)) {
      expect(canTransition(MEMBER_TRANSITIONS, MemberState.DECLINED, state)).toBe(false);
    }
  });

  it('blocks INTERESTED → APPROVED (skipping steps)', () => {
    expect(canTransition(MEMBER_TRANSITIONS, MemberState.INTERESTED, MemberState.APPROVED)).toBe(false);
  });
});

describe('assertTransition', () => {
  it('does not throw for valid transitions', () => {
    expect(() => assertTransition(COALITION_TRANSITIONS, CoalitionState.COLLECTING, CoalitionState.NEGOTIATING)).not.toThrow();
  });

  it('throws StateTransitionError for invalid transitions', () => {
    expect(() => assertTransition(COALITION_TRANSITIONS, CoalitionState.SETTLED, CoalitionState.COLLECTING)).toThrow('Invalid transition');
  });
});
