/**
 * Pricing constants for EstimationCalc
 * Re-exports from rates.ts for backwards compatibility
 */

export { RATES, type RateKey } from './rates';

// Legacy exports for backwards compatibility
// These map to the new RATES structure
import { RATES } from './rates';

/** @deprecated Use RATES.WALL_MULT instead */
export const ROOM_TYPE_MULTIPLIERS: Record<string, number> = {
  standard: RATES.WALL_MULT.GENERAL,
  general: RATES.WALL_MULT.GENERAL,
  kitchen: RATES.WALL_MULT.KITCHEN,
  bathroom: RATES.WALL_MULT.BATHROOM,
  laundry: RATES.WALL_MULT.GENERAL,
  garage: 2.5,
  hallway: RATES.WALL_MULT.GENERAL,
  stairwell: 3.5,
};

/** @deprecated Use RATES.MIN_ROOM_CHARGE instead */
export const MINIMUM_ROOM_CHARGE = RATES.MIN_ROOM_CHARGE;

/** @deprecated Use RATES.SETUP_THRESHOLD instead */
export const MINIMUM_JOB_FEE = RATES.SETUP_THRESHOLD;

/** @deprecated Use RATES.SETUP_MAX_FEE instead */
export const SETUP_CLEANUP_FEE = RATES.SETUP_MAX_FEE;
