/**
 * Exterior estimation types
 * Source: painting-algo.md L184-231
 */

// ============================================================
// ENUMS (as const objects for erasableSyntaxOnly compatibility)
// ============================================================

/**
 * Number of stories for height multiplier
 * Source: painting-algo.md L186-189
 */
export const StoryType = {
  ONE_STORY: 'one_story',
  ONE_HALF_STORY: 'one_half_story',
  TWO_STORY: 'two_story',
  THREE_STORY: 'three_story',
} as const;
export type StoryType = (typeof StoryType)[keyof typeof StoryType];

/**
 * Flaking/peeling severity levels
 * Source: painting-algo.md L199-207
 */
export const FlakingSeverity = {
  LIGHT: 'light',
  MEDIUM: 'medium',
  HEAVY: 'heavy',
} as const;
export type FlakingSeverity = (typeof FlakingSeverity)[keyof typeof FlakingSeverity];

/**
 * Exterior job scope
 * Source: painting-algo.md L223-229
 */
export const ExteriorScope = {
  FULL: 'full', // Siding + trim
  TRIM_ONLY: 'trim_only',
  SIDING_ONLY: 'siding_only',
} as const;
export type ExteriorScope = (typeof ExteriorScope)[keyof typeof ExteriorScope];

/**
 * Exterior line item category
 */
export const ExteriorLineItemCategory = {
  BASE: 'base',
  HEIGHT: 'height',
  DIFFICULTY: 'difficulty',
  FLAKING: 'flaking',
  COATS: 'coats',
  SHUTTERS: 'shutters',
  FRONT_DOOR: 'front_door',
  GARAGE: 'garage',
  SCOPE_ADJUSTMENT: 'scope',
} as const;
export type ExteriorLineItemCategory = (typeof ExteriorLineItemCategory)[keyof typeof ExteriorLineItemCategory];

// ============================================================
// INTERFACES
// ============================================================

/**
 * Side identifier
 */
export type SideId = 'front' | 'back' | 'left' | 'right';

/**
 * Per-side difficulty configuration
 */
export interface SideDifficulty {
  /** Side identifier (front, back, left, right) */
  side: SideId;

  /** Ground is not flat (landscaping, slope) */
  nonFlatGround: boolean;

  /** Requires roof access to paint */
  roofAccess: boolean;
}

/**
 * Garage door configuration
 */
export interface GarageDoorInput {
  /** Number of 1-car garage doors */
  oneCarDoors: number;

  /** Number of 2-car garage doors */
  twoCarDoors: number;
}

/**
 * Complete exterior job input
 * Source: painting-algo.md L449-459
 */
export interface ExteriorJobInput {
  /** Unique identifier */
  id: string;

  /** House square footage */
  houseSqft: number;

  /** Number of stories */
  storyType: StoryType;

  /** Difficulty per side */
  sideDifficulties: SideDifficulty[];

  /** Flaking/peeling severity */
  flakingSeverity: FlakingSeverity;

  /**
   * Heavy flaking adjustment (0.5 to 1.0)
   * Only used when flakingSeverity is HEAVY
   */
  heavyFlakingAdjustment?: number;

  /** Job scope (full, trim only, siding only) */
  scope: ExteriorScope;

  /** Number of shutters to paint */
  shutterCount: number;

  /** Paint front door (3 coats, high gloss) */
  paintFrontDoor: boolean;

  /** Garage door configuration */
  garageDoors: GarageDoorInput;

  /** Custom notes */
  notes?: string;
}

/**
 * Exterior calculation breakdown
 */
export interface ExteriorBreakdown {
  /** Height multiplier used */
  heightMultiplier: number;

  /** Total difficulty adjustment */
  difficultyAdjustment: number;

  /** Flaking adjustment used */
  flakingAdjustment: number;

  /** Combined multiplier before applying to SF */
  totalMultiplier: number;

  /** Base calculation: (multiplier x SF) + $1,750 */
  baseCalculation: number;

  /** After 1.6x two-coat multiplier */
  afterCoatMultiplier: number;

  /** Shutters add-on cost */
  shuttersCost: number;

  /** Front door add-on cost */
  frontDoorCost: number;

  /** Garage doors add-on cost */
  garageDoorsCost: number;

  /** Total add-ons */
  totalAddOns: number;

  /** Full exterior total (before scope adjustment) */
  fullExteriorTotal: number;

  /** Scope multiplier applied (1.0 for full, 0.6 for partial) */
  scopeMultiplier: number;

  /** Final total after scope adjustment */
  finalTotal: number;
}

/**
 * Exterior line item for breakdown display
 */
export interface ExteriorLineItem {
  category: ExteriorLineItemCategory;
  name: string;
  basis: string;
  cost: number;
}

/**
 * Exterior estimate result
 */
export interface ExteriorEstimateResult {
  /** Input data */
  input: ExteriorJobInput;

  /** Calculation breakdown */
  breakdown: ExteriorBreakdown;

  /** Line items for display */
  lineItems: ExteriorLineItem[];

  /** Final total */
  total: number;

  /** Calculation timestamp */
  calculatedAt: Date;
}

/**
 * Default side difficulties (all false)
 */
export function createDefaultSideDifficulties(): SideDifficulty[] {
  return [
    { side: 'front', nonFlatGround: false, roofAccess: false },
    { side: 'back', nonFlatGround: false, roofAccess: false },
    { side: 'left', nonFlatGround: false, roofAccess: false },
    { side: 'right', nonFlatGround: false, roofAccess: false },
  ];
}

/**
 * Default exterior job input
 */
export function createDefaultExteriorJob(): ExteriorJobInput {
  return {
    id: crypto.randomUUID(),
    houseSqft: 0,
    storyType: StoryType.ONE_STORY,
    sideDifficulties: createDefaultSideDifficulties(),
    flakingSeverity: FlakingSeverity.LIGHT,
    scope: ExteriorScope.FULL,
    shutterCount: 0,
    paintFrontDoor: false,
    garageDoors: {
      oneCarDoors: 0,
      twoCarDoors: 0,
    },
    notes: '',
  };
}
