/**
 * @module constants
 * System-wide constants for the Quorum platform.
 * All time values are in milliseconds unless noted otherwise.
 */

/** Maximum time a coalition can stay open for member collection (3 days). */
export const MAX_COALITION_WINDOW_MS = 3 * 24 * 60 * 60 * 1000; // 259_200_000 ms

/** Default safety margin added to quorum threshold (percent). */
export const DEFAULT_SAFETY_MARGIN_PCT = 10;

/** Default seller honor percentage — share of buyers the seller commits to fulfilling. */
export const DEFAULT_HONOR_PCT = 90;

/** Minimum allowable honor percentage. */
export const MIN_HONOR_PCT = 80;

/** Maximum allowable honor percentage. */
export const MAX_HONOR_PCT = 100;

/** Maximum number of AI-mediated negotiation rounds per coalition. */
export const MAX_NEGOTIATION_ROUNDS = 3;

/** How long a member has to approve an offer before it expires (30 minutes real time). */
export const APPROVAL_TIMEOUT_MS = 30 * 60 * 1000; // 1_800_000 ms

/**
 * Default time-scale factor.
 * 1 = real time, 1440 = 1 minute of wall-clock = 1 day of simulation time.
 */
export const DEFAULT_TIME_SCALE = 1;

/** Maximum number of AI retry attempts for transient failures. */
export const MAX_AI_RETRIES = 2;

/** PayPal Sandbox REST API base URL. */
export const PAYPAL_SANDBOX_API_BASE = 'https://api-m.sandbox.paypal.com';

/**
 * PayPal Live REST API base URL.
 * ⚠️  NEVER used at runtime — exists only so the Guard can detect & block live usage.
 */
export const PAYPAL_LIVE_API_BASE = 'https://api-m.paypal.com';
