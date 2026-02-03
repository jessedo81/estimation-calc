/**
 * RATES - All configurable pricing constants
 *
 * Source: painting-algo.md (authoritative)
 *
 * Validated by:
 * #tech-enabled-painting-estimator-sales-ops-lead
 */

export const RATES = {
  // ============================================================
  // INTERIOR WALL MULTIPLIERS (painting-algo.md L21-23, L257-259)
  // Formula: floor_sqft * multiplier
  // ============================================================
  WALL_MULT: {
    GENERAL: 2.8, // L21: Standard rooms (bedrooms, living rooms, offices)
    KITCHEN: 3.1, // L22: Kitchens (more cut-in, cabinets, prep)
    BATHROOM: 4.1, // L23: Bathrooms (tight spaces, fixtures, moisture prep)
  },

  // Vaulted ceiling adjustment (painting-algo.md L157, L263)
  // Add to room multiplier when ceiling is vaulted
  VAULTED_ADD: 0.5,

  // ============================================================
  // TRIM PRICING (painting-algo.md L36-45, L369-378)
  // ============================================================
  TRIM_SF_MULT: 0.5, // L36-37: Trim package: sqft x 0.5
  BASEBOARD_LF_WITH_WALLS: 1.88, // L44: Baseboards when walls painted: $1.88/LF
  BASEBOARD_LF_ONLY: 5.6, // L45: Baseboards only (no walls): $5.60/LF
  STAINED_CONVERSION_MULT: 3.0, // L81: Stained wood -> paint: 3x multiplier

  // ============================================================
  // CEILINGS (painting-algo.md L52-54, L272-273)
  // ============================================================
  CEILING_MULT_WITH_WALLS: 0.6, // L53: Ceiling when walls painted: SF x 0.6
  CEILING_MULT_ONLY: 1.7, // L54: Ceiling only: SF x 1.7

  // ============================================================
  // DOORS, CLOSETS, WINDOWS (painting-algo.md L60-70, L276-279)
  // ============================================================
  DOOR_PER_SIDE: 63, // L61: $63 per door side
  CLOSET_STANDARD: 120, // L64: Standard closet: $120
  CLOSET_WALKIN: 185, // L65: Walk-in closet: $185
  WINDOW_BASE: 70, // L67: Window base price: $70

  // ============================================================
  // ACCENT WALLS (painting-algo.md L74-75, L282-283)
  // ============================================================
  ACCENT_WALL_IN_ROOM: 150, // L74: Accent wall in painted room: $150
  ACCENT_WALL_STANDALONE: 185, // L75: Accent wall only (not painting room): $185

  // ============================================================
  // CROWN MOLDING (painting-algo.md L285)
  // ============================================================
  CROWN_MOLDING_PER_LF: 1.5, // Crown molding: $1.50/LF

  // ============================================================
  // SCAFFOLDING (painting-algo.md L86, L287)
  // ============================================================
  SCAFFOLDING_FEE: 650, // L86: Great room scaffolding: $650 flat

  // ============================================================
  // JOB-LEVEL ADJUSTMENTS (painting-algo.md L93, L117, L290-293)
  // ============================================================
  SETUP_THRESHOLD: 1566, // L93: Minimum job total before setup fee kicks in
  SETUP_MAX_FEE: 300, // L93: Maximum setup/cleanup fee
  ADDITIONAL_COLOR_FEE: 134, // L117: Each additional wall color: $134

  // ============================================================
  // MINIMUMS (painting-algo.md L27, L268)
  // ============================================================
  MIN_ROOM_CHARGE: 275, // L27: Minimum per-room charge: $275

  // ============================================================
  // WALLPAPER REMOVAL (painting-algo.md L298)
  // ============================================================
  WALLPAPER_PER_WALL_SF: 7, // Wallpaper removal: $7 per wall sqft

  // ============================================================
  // PAINT OPTIONS (painting-algo.md L301-302)
  // ============================================================
  CUSTOMER_SUPPLIES_PAINT_DEDUCT: 0.15, // 15% deduction if customer supplies paint
  PREMIUM_PAINT_UPCHARGE: 200, // Premium paint upgrade: $200 flat

  // ============================================================
  // EXTERIOR (painting-algo.md L184-231)
  // Formula: ((Height_Mult + Difficulty_Adj + Flaking_Adj) x SF + $1,750) x 1.6
  // ============================================================
  EXTERIOR: {
    // Height multipliers (painting-algo.md L186-189, L461)
    HEIGHT_MULT: {
      ONE_STORY: 1.25, // Single level, ground work
      ONE_HALF_STORY: 1.5, // Split level with peaks
      TWO_STORY: 1.75, // Standard two-story
      THREE_STORY: 2.25, // Three-story, ladder/lift work
    },

    // Difficulty adjustments per side (painting-algo.md L191-193, L467-468)
    DIFFICULTY: {
      NON_FLAT_GROUND: 0.25, // Per side with non-flat ground
      ROOF_ACCESS: 0.25, // Per side requiring roof access
    },

    // Flaking adjustments (painting-algo.md L199-207, L469-472)
    FLAKING: {
      LIGHT: 0.0, // ~5-8 SF prep included
      MEDIUM: 0.3, // Moderate scraping/sanding
      HEAVY_MIN: 0.5, // Extensive prep minimum
      HEAVY_MAX: 1.0, // Extensive prep maximum
    },

    // Base fee (painting-algo.md L197)
    BASE_FEE: 1750,

    // Two-coat multiplier (painting-algo.md L198)
    COAT_MULTIPLIER: 1.6,

    // Add-ons (painting-algo.md L211-217, L483-488)
    ADD_ONS: {
      SHUTTER: 75, // Per shutter
      FRONT_DOOR: 250, // 3 coats, high gloss
      GARAGE_1_CAR: 200, // Standard single
      GARAGE_2_CAR: 400, // Standard double
    },

    // Partial job multiplier (painting-algo.md L227)
    PARTIAL_JOB_MULTIPLIER: 0.6, // Trim only or siding only
  },
} as const;

// Type for rate keys (useful for admin config)
export type RateKey = keyof typeof RATES;

// Freeze the object to prevent accidental mutation
Object.freeze(RATES);
Object.freeze(RATES.WALL_MULT);
Object.freeze(RATES.EXTERIOR);
Object.freeze(RATES.EXTERIOR.HEIGHT_MULT);
Object.freeze(RATES.EXTERIOR.DIFFICULTY);
Object.freeze(RATES.EXTERIOR.FLAKING);
Object.freeze(RATES.EXTERIOR.ADD_ONS);
