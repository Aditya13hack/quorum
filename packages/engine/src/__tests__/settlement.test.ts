import { describe, it, expect } from 'vitest';
import { MemberState } from '@quorum/shared/src/enums.js';
import type { Membership } from '@quorum/shared/src/types.js';
import {
  createCapturePlan,
  handleFailedCapture,
  shouldAbort,
  createAbortPlan,
} from '../settlement.js';

function makeMember(id: string, state: MemberState, authId: string, maxCents: number, waitPos?: number): Membership {
  return {
    coalitionId: 'c1',
    userId: id,
    isSimulated: true,
    state,
    approvedMaxCents: maxCents,
    simAuthId: authId,
    waitlistPosition: waitPos,
    timestamps: { joinedAt: new Date().toISOString() },
  };
}

describe('createCapturePlan', () => {
  it('creates capture for all approved members', () => {
    const members = [
      makeMember('u1', MemberState.APPROVED, 'auth1', 40000),
      makeMember('u2', MemberState.APPROVED, 'auth2', 40000),
    ];
    const plan = createCapturePlan(members, 35000);
    expect(plan.captures).toHaveLength(2);
    expect(plan.totalCaptureCents).toBe(70000);
  });

  it('marks partial capture when final price < approved max', () => {
    const members = [makeMember('u1', MemberState.APPROVED, 'auth1', 40000)];
    const plan = createCapturePlan(members, 35000);
    expect(plan.captures[0]?.isPartialCapture).toBe(true);
  });

  it('marks non-partial when price = approved max', () => {
    const members = [makeMember('u1', MemberState.APPROVED, 'auth1', 35000)];
    const plan = createCapturePlan(members, 35000);
    expect(plan.captures[0]?.isPartialCapture).toBe(false);
  });

  it('skips non-approved members', () => {
    const members = [
      makeMember('u1', MemberState.APPROVED, 'auth1', 40000),
      makeMember('u2', MemberState.WAITLISTED, 'auth2', 40000),
    ];
    const plan = createCapturePlan(members, 35000);
    expect(plan.captures).toHaveLength(1);
  });
});

describe('handleFailedCapture', () => {
  it('removes failed member and promotes from waitlist', () => {
    const plan = createCapturePlan(
      [makeMember('u1', MemberState.APPROVED, 'auth1', 40000)],
      35000,
    );
    const waitlist = [makeMember('w1', MemberState.WAITLISTED, 'authw1', 40000, 0)];
    const newPlan = handleFailedCapture(plan, 'u1', waitlist, 35000);

    expect(newPlan.captures).toHaveLength(1);
    expect(newPlan.captures[0]?.memberId).toBe('w1');
    expect(newPlan.waitlistPromotions).toContain('w1');
  });

  it('handles empty waitlist', () => {
    const plan = createCapturePlan(
      [
        makeMember('u1', MemberState.APPROVED, 'auth1', 40000),
        makeMember('u2', MemberState.APPROVED, 'auth2', 40000),
      ],
      35000,
    );
    const newPlan = handleFailedCapture(plan, 'u1', [], 35000);
    expect(newPlan.captures).toHaveLength(1);
    expect(newPlan.captures[0]?.memberId).toBe('u2');
  });
});

describe('shouldAbort', () => {
  it('does not abort when captures >= honor threshold', () => {
    expect(shouldAbort(18, 20, 90)).toBe(false); // ceil(20*0.9) = 18
  });

  it('aborts when captures < honor threshold', () => {
    expect(shouldAbort(17, 20, 90)).toBe(true); // need 18, have 17
  });

  it('does not abort at 100% honor if exactly met', () => {
    expect(shouldAbort(20, 20, 100)).toBe(false);
  });
});

describe('createAbortPlan', () => {
  it('creates refund and void lists', () => {
    const plan = createAbortPlan(['cap1', 'cap2'], ['auth3', 'auth4']);
    expect(plan.refundCaptureIds).toEqual(['cap1', 'cap2']);
    expect(plan.voidAuthorizationIds).toEqual(['auth3', 'auth4']);
  });
});
