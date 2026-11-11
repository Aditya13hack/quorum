/**
 * @module demo-clock
 * Configurable time acceleration for the demo mode.
 * Pure utility — no side effects.
 */

export interface DemoClock {
  /** Convert real milliseconds to simulated milliseconds. */
  realToSimulated(realMs: number): number;
  /** Convert simulated milliseconds to real milliseconds. */
  simulatedToReal(simMs: number): number;
  /** Adjust a deadline (expressed in real ms duration) to demo speed. */
  adjustDeadline(realDurationMs: number): number;
  /** Get the current time scale. */
  getTimeScale(): number;
  /** Whether time is accelerated (timeScale > 1). */
  isAccelerated(): boolean;
}

/**
 * Create a demo clock with the given time scale.
 *
 * @param timeScale  Acceleration factor.
 *   - 1 = real time (no acceleration)
 *   - 1440 = 1 real minute ≈ 1 simulated day
 */
export function createDemoClock(timeScale: number): DemoClock {
  if (timeScale <= 0) {
    throw new Error(`timeScale must be positive, got ${timeScale}`);
  }

  return {
    realToSimulated(realMs: number): number {
      return realMs * timeScale;
    },

    simulatedToReal(simMs: number): number {
      return simMs / timeScale;
    },

    adjustDeadline(realDurationMs: number): number {
      return realDurationMs / timeScale;
    },

    getTimeScale(): number {
      return timeScale;
    },

    isAccelerated(): boolean {
      return timeScale > 1;
    },
  };
}
