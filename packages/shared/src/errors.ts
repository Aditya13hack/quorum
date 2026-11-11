/**
 * @module errors
 * Custom error classes for the Quorum system.
 * Every error extends QuorumError so callers can catch the whole family.
 */

/** Base error for all Quorum-specific failures. */
export class QuorumError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuorumError';
    // Restore prototype chain (required when extending built-ins in TS)
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when the Guard (deterministic rule layer) blocks an action.
 * Includes a machine-readable `ruleCode` for the UI / logs.
 */
export class GuardViolationError extends QuorumError {
  public readonly ruleCode: string;
  public readonly context: Record<string, unknown>;

  constructor(
    ruleCode: string,
    message: string,
    context: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = 'GuardViolationError';
    this.ruleCode = ruleCode;
    this.context = context;
  }
}

/** Thrown when a payment operation (auth, capture, refund, payout) fails. */
export class PaymentError extends QuorumError {
  constructor(message: string) {
    super(message);
    this.name = 'PaymentError';
  }
}

/** Thrown when a state-machine transition is invalid (e.g., COLLECTING → SETTLED). */
export class StateTransitionError extends QuorumError {
  public readonly from: string;
  public readonly to: string;
  public readonly reason: string;

  constructor(from: string, to: string, reason: string) {
    super(`Invalid transition ${from} → ${to}: ${reason}`);
    this.name = 'StateTransitionError';
    this.from = from;
    this.to = to;
    this.reason = reason;
  }
}

/** Thrown when input data fails Zod or manual validation. */
export class ValidationError extends QuorumError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
