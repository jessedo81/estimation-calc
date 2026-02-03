/**
 * Pricing constants for EstimationCalc
 * Based on On-Demand Painters pricing standards
 */

// Square footage multipliers by room type
export const ROOM_TYPE_MULTIPLIERS: Record<string, number> = {
  standard: 2.8,
  kitchen: 3.1,
  bathroom: 4.1,
  laundry: 2.8,
  garage: 2.5,
  hallway: 2.8,
  stairwell: 3.5,
};

// Ceiling pricing per square foot
export const CEILING_PRICE_PER_SQFT = 1.15;

// Baseboard/trim pricing per linear foot
export const BASEBOARD_PRICE_PER_LF = 1.25;

// Door pricing
export const DOOR_PRICES = {
  standard: 65,
  double: 110,
  sliding: 95,
  closet: 45,
};

// Window pricing
export const WINDOW_PRICES = {
  small: 25, // <12 sqft
  medium: 40, // 12-24 sqft
  large: 60, // >24 sqft
};

// Minimum job fee
export const MINIMUM_JOB_FEE = 1566;

// Setup and cleanup fee
export const SETUP_CLEANUP_FEE = 300;

// Default wall height in feet
export const DEFAULT_WALL_HEIGHT = 9;

// Default coat count
export const DEFAULT_COAT_COUNT = 2;
