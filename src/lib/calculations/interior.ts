/**
 * Interior Painting Calculation Functions
 *
 * Based on painting-algo.md specifications
 * All functions are pure and deterministic
 */

import { RATES } from '../calc/rates';
import {
  RoomType,
  TrimMode,
  RoomInput,
  InteriorJobInput,
  LineItem,
  LineItemCategory,
  RoomResult,
  EstimateResult,
  WallCalculationResult,
  CeilingCalculationResult,
  CalculationResult,
  AdditionalColorsResult,
  SetupFeeResult,
  WindowInput,
} from '../../types/estimate';

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Round to nearest cent (2 decimal places) then to whole dollar
 */
export function roundCurrency(amount: number): number {
  return Math.round(amount);
}

/**
 * Clamp value to non-negative
 */
export function clampNonNeg(value: number): number {
  return Math.max(0, value);
}

/**
 * Get wall multiplier for room type
 */
export function getWallMultiplier(roomType: RoomType): number {
  switch (roomType) {
    case RoomType.KITCHEN:
      return RATES.WALL_MULT.KITCHEN;
    case RoomType.BATHROOM:
      return RATES.WALL_MULT.BATHROOM;
    case RoomType.GENERAL:
    default:
      return RATES.WALL_MULT.GENERAL;
  }
}

// ============================================================
// WALL CALCULATIONS (painting-algo.md L21-27, L257-268)
// ============================================================

/**
 * Calculate room wall cost
 *
 * Formula: floor_sqft * multiplier
 * - General: 2.8x
 * - Kitchen: 3.1x
 * - Bathroom: 4.1x
 * - Vaulted: adds 0.5 to multiplier
 * - Minimum: $275
 */
export function calculateRoomWalls(
  floorSqft: number,
  roomType: RoomType,
  options: { vaulted?: boolean; paintWalls?: boolean } = {}
): WallCalculationResult {
  const { vaulted = false, paintWalls = true } = options;

  // No cost if not painting walls or zero sqft
  if (!paintWalls || floorSqft <= 0) {
    return {
      cost: 0,
      basis: paintWalls ? 'No square footage' : 'Walls not being painted',
      multiplier: 0,
      minimumApplied: false,
    };
  }

  const sqft = clampNonNeg(floorSqft);

  // Get base multiplier for room type
  let multiplier = getWallMultiplier(roomType);

  // Add vaulted adjustment
  if (vaulted) {
    multiplier += RATES.VAULTED_ADD;
  }

  // Calculate cost
  let cost = sqft * multiplier;

  // Apply minimum room charge
  const minimumApplied = cost < RATES.MIN_ROOM_CHARGE;
  cost = Math.max(cost, RATES.MIN_ROOM_CHARGE);

  const vaultedNote = vaulted ? ` + ${RATES.VAULTED_ADD} vaulted` : '';

  return {
    cost: roundCurrency(cost),
    basis: `${sqft} sqft x ${multiplier.toFixed(1)}${vaultedNote}${minimumApplied ? ' (minimum applied)' : ''}`,
    multiplier,
    minimumApplied,
  };
}

// ============================================================
// CEILING CALCULATIONS (painting-algo.md L52-54, L272-273)
// ============================================================

/**
 * Calculate ceiling cost
 *
 * Formula:
 * - With walls being painted: floor_sqft x 0.6
 * - Ceiling only: floor_sqft x 1.7
 */
export function calculateCeiling(
  floorSqft: number,
  options: { paintCeiling?: boolean; wallsBeingPainted?: boolean } = {}
): CeilingCalculationResult {
  const { paintCeiling = true, wallsBeingPainted = true } = options;

  if (!paintCeiling || floorSqft <= 0) {
    return {
      cost: 0,
      basis: paintCeiling ? 'No square footage' : 'Ceiling not being painted',
      multiplier: 0,
    };
  }

  const sqft = clampNonNeg(floorSqft);
  const multiplier = wallsBeingPainted
    ? RATES.CEILING_MULT_WITH_WALLS
    : RATES.CEILING_MULT_ONLY;

  const cost = sqft * multiplier;
  const note = wallsBeingPainted ? '(with walls)' : '(ceiling only)';

  return {
    cost: roundCurrency(cost),
    basis: `${sqft} sqft x ${multiplier} ${note}`,
    multiplier,
  };
}

// ============================================================
// TRIM CALCULATIONS (painting-algo.md L36-45, L369-378)
// ============================================================

/**
 * Calculate trim/baseboard cost
 *
 * Modes:
 * - TRIM_PACKAGE_SF: sqft x 0.5
 * - BASEBOARDS_LF with walls: LF x $1.88
 * - BASEBOARDS_LF only: LF x $5.60
 * - Stained conversion: 3x multiplier
 */
export function calculateTrim(
  floorSqft: number,
  options: {
    trimMode?: TrimMode;
    baseboardLF?: number;
    wallsBeingPainted?: boolean;
    stainedConversion?: boolean;
  } = {}
): CalculationResult {
  const {
    trimMode = TrimMode.NONE,
    baseboardLF = 0,
    wallsBeingPainted = true,
    stainedConversion = false,
  } = options;

  if (trimMode === TrimMode.NONE) {
    return { cost: 0, basis: 'No trim' };
  }

  let cost = 0;
  let basis = '';

  switch (trimMode) {
    case TrimMode.TRIM_PACKAGE_SF: {
      const sqft = clampNonNeg(floorSqft);
      cost = sqft * RATES.TRIM_SF_MULT;
      basis = `${sqft} sqft x $${RATES.TRIM_SF_MULT}`;
      break;
    }

    case TrimMode.BASEBOARDS_LF: {
      const lf = clampNonNeg(baseboardLF);
      const rate = wallsBeingPainted
        ? RATES.BASEBOARD_LF_WITH_WALLS
        : RATES.BASEBOARD_LF_ONLY;
      cost = lf * rate;
      basis = `${lf} LF x $${rate}${wallsBeingPainted ? ' (with walls)' : ' (baseboards only)'}`;
      break;
    }
  }

  // Apply stained conversion multiplier
  if (stainedConversion && cost > 0) {
    cost *= RATES.STAINED_CONVERSION_MULT;
    basis += ` x ${RATES.STAINED_CONVERSION_MULT} (stained conversion)`;
  }

  return {
    cost: roundCurrency(cost),
    basis,
  };
}

// ============================================================
// CROWN MOLDING CALCULATIONS
// ============================================================

/**
 * Calculate crown molding cost
 *
 * Formula: LF x $1.50
 */
export function calculateCrownMolding(linearFeet: number): CalculationResult {
  const lf = clampNonNeg(linearFeet);

  if (lf <= 0) {
    return { cost: 0, basis: 'No crown molding' };
  }

  const cost = lf * RATES.CROWN_MOLDING_PER_LF;

  return {
    cost: roundCurrency(cost),
    basis: `${lf} LF x $${RATES.CROWN_MOLDING_PER_LF}`,
  };
}

// ============================================================
// DOOR CALCULATIONS (painting-algo.md L61, L276)
// ============================================================

/**
 * Calculate door cost
 *
 * Formula: sides x $63
 */
export function calculateDoors(sides: number): CalculationResult {
  const count = clampNonNeg(Math.floor(sides));

  if (count <= 0) {
    return { cost: 0, basis: 'No doors' };
  }

  const cost = count * RATES.DOOR_PER_SIDE;

  return {
    cost: roundCurrency(cost),
    basis: `${count} side(s) x $${RATES.DOOR_PER_SIDE}`,
  };
}

// ============================================================
// WINDOW CALCULATIONS (painting-algo.md L67, L278)
// ============================================================

/**
 * Calculate window cost
 *
 * Formula: base_price x size_factor
 * - Standard (factor 1): $70
 * - Large (factor 2): $140
 */
export function calculateWindows(windows: WindowInput[]): CalculationResult {
  if (!windows || windows.length === 0) {
    return { cost: 0, basis: 'No windows' };
  }

  let totalCost = 0;
  let standardCount = 0;
  let largeCount = 0;

  for (const window of windows) {
    const factor = clampNonNeg(window.sizeFactor) || 1;
    const windowCost = RATES.WINDOW_BASE * factor;
    totalCost += windowCost;

    if (factor >= 2) {
      largeCount++;
    } else {
      standardCount++;
    }
  }

  const parts: string[] = [];
  if (standardCount > 0) {
    parts.push(`${standardCount} standard x $${RATES.WINDOW_BASE}`);
  }
  if (largeCount > 0) {
    parts.push(`${largeCount} large x $${RATES.WINDOW_BASE * 2}`);
  }

  return {
    cost: roundCurrency(totalCost),
    basis: parts.join(' + ') || 'No windows',
  };
}

// ============================================================
// CLOSET CALCULATIONS (painting-algo.md L64-65, L277)
// ============================================================

/**
 * Calculate closet cost
 *
 * Formula:
 * - Standard: $120 each
 * - Walk-in: $185 each
 */
export function calculateClosets(
  standard: number,
  walkIn: number
): CalculationResult {
  const stdCount = clampNonNeg(Math.floor(standard));
  const walkInCount = clampNonNeg(Math.floor(walkIn));

  if (stdCount <= 0 && walkInCount <= 0) {
    return { cost: 0, basis: 'No closets' };
  }

  const standardCost = stdCount * RATES.CLOSET_STANDARD;
  const walkInCost = walkInCount * RATES.CLOSET_WALKIN;
  const totalCost = standardCost + walkInCost;

  const parts: string[] = [];
  if (stdCount > 0) {
    parts.push(`${stdCount} standard x $${RATES.CLOSET_STANDARD}`);
  }
  if (walkInCount > 0) {
    parts.push(`${walkInCount} walk-in x $${RATES.CLOSET_WALKIN}`);
  }

  return {
    cost: roundCurrency(totalCost),
    basis: parts.join(' + '),
  };
}

// ============================================================
// ACCENT WALL CALCULATIONS (painting-algo.md L74-75, L282-283)
// ============================================================

/**
 * Calculate accent wall cost
 *
 * Formula:
 * - In painted room: $150 each
 * - Standalone: $185 each
 */
export function calculateAccentWalls(
  inRoom: number,
  standalone: number
): CalculationResult {
  const inRoomCount = clampNonNeg(Math.floor(inRoom));
  const standaloneCount = clampNonNeg(Math.floor(standalone));

  if (inRoomCount <= 0 && standaloneCount <= 0) {
    return { cost: 0, basis: 'No accent walls' };
  }

  const inRoomCost = inRoomCount * RATES.ACCENT_WALL_IN_ROOM;
  const standaloneCost = standaloneCount * RATES.ACCENT_WALL_STANDALONE;
  const totalCost = inRoomCost + standaloneCost;

  const parts: string[] = [];
  if (inRoomCount > 0) {
    parts.push(`${inRoomCount} in-room x $${RATES.ACCENT_WALL_IN_ROOM}`);
  }
  if (standaloneCount > 0) {
    parts.push(`${standaloneCount} standalone x $${RATES.ACCENT_WALL_STANDALONE}`);
  }

  return {
    cost: roundCurrency(totalCost),
    basis: parts.join(' + '),
  };
}

// ============================================================
// SCAFFOLDING (painting-algo.md L86, L287)
// ============================================================

/**
 * Calculate scaffolding fee
 *
 * Flat fee: $650
 */
export function calculateScaffolding(needsScaffolding: boolean): CalculationResult {
  if (!needsScaffolding) {
    return { cost: 0, basis: 'No scaffolding needed' };
  }

  return {
    cost: RATES.SCAFFOLDING_FEE,
    basis: `Great room scaffolding: $${RATES.SCAFFOLDING_FEE}`,
  };
}

// ============================================================
// ADDITIONAL COLORS (painting-algo.md L117, L291)
// ============================================================

/**
 * Calculate additional wall colors fee
 *
 * Formula: (colors - 1) x $134
 * First color is included
 */
export function calculateAdditionalColors(
  numColors: number
): AdditionalColorsResult {
  const colors = clampNonNeg(Math.floor(numColors));
  const extra = Math.max(0, colors - 1);

  if (extra <= 0) {
    return { cost: 0, extraColors: 0, basis: 'Standard (1 color)' };
  }

  const cost = extra * RATES.ADDITIONAL_COLOR_FEE;

  return {
    cost: roundCurrency(cost),
    extraColors: extra,
    basis: `${extra} additional color(s) x $${RATES.ADDITIONAL_COLOR_FEE}`,
  };
}

// ============================================================
// WALLPAPER REMOVAL (painting-algo.md L298)
// ============================================================

/**
 * Calculate wallpaper removal cost
 *
 * Formula: wall_sqft x $7
 */
export function calculateWallpaperRemoval(wallSqft: number): CalculationResult {
  const sqft = clampNonNeg(wallSqft);

  if (sqft <= 0) {
    return { cost: 0, basis: 'No wallpaper removal' };
  }

  const cost = sqft * RATES.WALLPAPER_PER_WALL_SF;

  return {
    cost: roundCurrency(cost),
    basis: `${sqft} wall sqft x $${RATES.WALLPAPER_PER_WALL_SF}`,
  };
}

// ============================================================
// SETUP FEE (painting-algo.md L93, L293)
// ============================================================

/**
 * Calculate setup/cleanup fee
 *
 * Logic:
 * - If subtotal >= $1,566: no fee
 * - Otherwise: min($300, $1,566 - subtotal)
 */
export function calculateSetupFee(subtotal: number): SetupFeeResult {
  const sub = clampNonNeg(subtotal);

  if (sub >= RATES.SETUP_THRESHOLD) {
    return {
      fee: 0,
      basis: `Subtotal $${sub} >= minimum $${RATES.SETUP_THRESHOLD}`,
    };
  }

  const difference = RATES.SETUP_THRESHOLD - sub;
  const fee = Math.min(RATES.SETUP_MAX_FEE, difference);

  return {
    fee: roundCurrency(fee),
    basis: `Job under $${RATES.SETUP_THRESHOLD}: min($${RATES.SETUP_MAX_FEE}, $${roundCurrency(difference)}) = $${roundCurrency(fee)}`,
  };
}

// ============================================================
// ROOM TOTAL CALCULATION
// ============================================================

/**
 * Calculate all costs for a single room
 */
export function calculateRoom(room: RoomInput): RoomResult {
  const lineItems: LineItem[] = [];

  // Walls
  const walls = calculateRoomWalls(room.floorSqft, room.roomType, {
    vaulted: room.vaulted,
    paintWalls: room.paintWalls,
  });
  if (walls.cost > 0) {
    lineItems.push({
      category: LineItemCategory.WALLS,
      name: `Walls (${room.roomType})`,
      basis: walls.basis,
      cost: walls.cost,
      roomId: room.id,
      roomName: room.name,
    });
  }

  // Ceiling
  const ceiling = calculateCeiling(room.floorSqft, {
    paintCeiling: room.paintCeiling,
    wallsBeingPainted: room.paintWalls,
  });
  if (ceiling.cost > 0) {
    lineItems.push({
      category: LineItemCategory.CEILING,
      name: room.paintWalls ? 'Ceiling (with walls)' : 'Ceiling only',
      basis: ceiling.basis,
      cost: ceiling.cost,
      roomId: room.id,
      roomName: room.name,
    });
  }

  // Trim
  const trim = calculateTrim(room.floorSqft, {
    trimMode: room.trimMode,
    baseboardLF: room.baseboardLF,
    wallsBeingPainted: room.paintWalls,
    stainedConversion: room.stainedTrimConversion,
  });
  if (trim.cost > 0) {
    lineItems.push({
      category: LineItemCategory.TRIM,
      name: room.trimMode === TrimMode.TRIM_PACKAGE_SF ? 'Trim package' : 'Baseboards',
      basis: trim.basis,
      cost: trim.cost,
      roomId: room.id,
      roomName: room.name,
    });
  }

  // Crown molding
  const crown = calculateCrownMolding(room.crownMoldingLF);
  if (crown.cost > 0) {
    lineItems.push({
      category: LineItemCategory.CROWN_MOLDING,
      name: 'Crown molding',
      basis: crown.basis,
      cost: crown.cost,
      roomId: room.id,
      roomName: room.name,
    });
  }

  // Doors
  const doors = calculateDoors(room.doorSides);
  if (doors.cost > 0) {
    lineItems.push({
      category: LineItemCategory.DOORS,
      name: 'Doors',
      basis: doors.basis,
      cost: doors.cost,
      roomId: room.id,
      roomName: room.name,
    });
  }

  // Closets
  const closets = calculateClosets(room.closetsStandard, room.closetsWalkIn);
  if (closets.cost > 0) {
    lineItems.push({
      category: LineItemCategory.CLOSETS,
      name: 'Closets',
      basis: closets.basis,
      cost: closets.cost,
      roomId: room.id,
      roomName: room.name,
    });
  }

  // Windows
  const windows = calculateWindows(room.windows);
  if (windows.cost > 0) {
    lineItems.push({
      category: LineItemCategory.WINDOWS,
      name: 'Windows',
      basis: windows.basis,
      cost: windows.cost,
      roomId: room.id,
      roomName: room.name,
    });
  }

  // Accent walls
  const accentWalls = calculateAccentWalls(
    room.accentWallsInRoom,
    room.accentWallsStandalone
  );
  if (accentWalls.cost > 0) {
    lineItems.push({
      category: LineItemCategory.ACCENT_WALLS,
      name: 'Accent walls',
      basis: accentWalls.basis,
      cost: accentWalls.cost,
      roomId: room.id,
      roomName: room.name,
    });
  }

  // Scaffolding
  const scaffolding = calculateScaffolding(room.needsScaffolding);
  if (scaffolding.cost > 0) {
    lineItems.push({
      category: LineItemCategory.SCAFFOLDING,
      name: 'Scaffolding',
      basis: scaffolding.basis,
      cost: scaffolding.cost,
      roomId: room.id,
      roomName: room.name,
    });
  }

  // Wallpaper removal
  const wallpaper = calculateWallpaperRemoval(room.wallpaperRemovalSqft);
  if (wallpaper.cost > 0) {
    lineItems.push({
      category: LineItemCategory.WALLPAPER_REMOVAL,
      name: 'Wallpaper removal',
      basis: wallpaper.basis,
      cost: wallpaper.cost,
      roomId: room.id,
      roomName: room.name,
    });
  }

  // Calculate room total
  const roomTotal = lineItems.reduce((sum, item) => sum + item.cost, 0);

  return {
    roomId: room.id,
    roomName: room.name,
    lineItems,
    roomTotal,
  };
}

// ============================================================
// FULL ESTIMATE CALCULATION
// ============================================================

/**
 * Calculate complete interior estimate
 */
export function calculateInteriorEstimate(
  input: InteriorJobInput
): EstimateResult {
  const warnings: string[] = [];
  const allLineItems: LineItem[] = [];
  const roomResults: RoomResult[] = [];

  // Calculate each room
  for (const room of input.rooms) {
    const roomResult = calculateRoom(room);
    roomResults.push(roomResult);
    allLineItems.push(...roomResult.lineItems);
  }

  // Calculate subtotal (before job-level adjustments)
  let subtotal = allLineItems.reduce((sum, item) => sum + item.cost, 0);

  // Additional colors (job-level)
  const additionalColors = calculateAdditionalColors(input.numWallColors);
  if (additionalColors.cost > 0) {
    allLineItems.push({
      category: LineItemCategory.ADDITIONAL_COLORS,
      name: 'Additional wall colors',
      basis: additionalColors.basis,
      cost: additionalColors.cost,
      roomId: null,
    });
    subtotal += additionalColors.cost;
  }

  // Customer supplies paint (deduction)
  if (input.customerSuppliesPaint) {
    const deduction = roundCurrency(subtotal * RATES.CUSTOMER_SUPPLIES_PAINT_DEDUCT);
    allLineItems.push({
      category: LineItemCategory.PAINT_OPTIONS,
      name: 'Customer supplied paint',
      basis: `${RATES.CUSTOMER_SUPPLIES_PAINT_DEDUCT * 100}% material deduction`,
      cost: -deduction,
      roomId: null,
    });
    subtotal -= deduction;
  }

  // Premium paint (upcharge)
  if (input.premiumPaint) {
    allLineItems.push({
      category: LineItemCategory.PAINT_OPTIONS,
      name: 'Premium paint upgrade',
      basis: 'Higher-grade materials',
      cost: RATES.PREMIUM_PAINT_UPCHARGE,
      roomId: null,
    });
    subtotal += RATES.PREMIUM_PAINT_UPCHARGE;
  }

  // Setup fee
  const setupFeeResult = calculateSetupFee(subtotal);
  if (setupFeeResult.fee > 0) {
    allLineItems.push({
      category: LineItemCategory.SETUP_FEE,
      name: 'Setup/cleanup fee',
      basis: setupFeeResult.basis,
      cost: setupFeeResult.fee,
      roomId: null,
    });
  }

  // Final total
  const total = subtotal + setupFeeResult.fee;

  // Validation warnings
  if (input.rooms.length === 0) {
    warnings.push('No rooms added to estimate');
  }

  for (const room of input.rooms) {
    if (room.floorSqft > 5000) {
      warnings.push(`${room.name}: Unusually large room (${room.floorSqft} sqft). Please verify.`);
    }
    if (room.doorSides > 20) {
      warnings.push(`${room.name}: High door count (${room.doorSides} sides). Please verify.`);
    }
  }

  return {
    rooms: roomResults,
    lineItems: allLineItems,
    subtotal,
    setupFee: setupFeeResult.fee,
    total,
    roomCount: input.rooms.length,
    warnings,
  };
}

/**
 * Calculate job total (simplified for single value)
 */
export function calculateJobTotal(subtotal: number): number {
  const setupFee = calculateSetupFee(subtotal);
  return subtotal + setupFee.fee;
}
