/**
 * Exterior estimation calculations
 *
 * Master Formula (painting-algo.md L184):
 * Exterior Price = ((Height_Mult + Difficulty_Adj + Flaking_Adj) x SF + $1,750) x 1.6
 */

import { RATES } from './rates';
import {
  StoryType,
  FlakingSeverity,
  ExteriorScope,
  ExteriorLineItemCategory,
} from '../../types/exterior';
import type {
  ExteriorJobInput,
  ExteriorEstimateResult,
  ExteriorBreakdown,
  ExteriorLineItem,
  SideDifficulty,
} from '../../types/exterior';
import { roundCurrency } from '../calculations/interior';

/**
 * Gets the height multiplier for a story type
 * Source: painting-algo.md L186-189
 *
 * @param storyType - Number of stories
 * @returns Height multiplier
 */
export function getHeightMultiplier(storyType: StoryType): number {
  const multipliers: Record<StoryType, number> = {
    [StoryType.ONE_STORY]: RATES.EXTERIOR.HEIGHT_MULT.ONE_STORY,
    [StoryType.ONE_HALF_STORY]: RATES.EXTERIOR.HEIGHT_MULT.ONE_HALF_STORY,
    [StoryType.TWO_STORY]: RATES.EXTERIOR.HEIGHT_MULT.TWO_STORY,
    [StoryType.THREE_STORY]: RATES.EXTERIOR.HEIGHT_MULT.THREE_STORY,
  };
  return multipliers[storyType] ?? RATES.EXTERIOR.HEIGHT_MULT.ONE_STORY;
}

/**
 * Calculates total difficulty adjustment based on side conditions
 * Source: painting-algo.md L191-193
 *
 * Formula: (nonFlatSides x 0.25) + (roofAccessSides x 0.25)
 *
 * @param sideDifficulties - Array of side difficulty configurations
 * @returns Total difficulty adjustment and counts
 */
export function calculateDifficultyAdjustment(
  sideDifficulties: SideDifficulty[]
): { adjustment: number; nonFlatCount: number; roofAccessCount: number } {
  let nonFlatCount = 0;
  let roofAccessCount = 0;

  for (const side of sideDifficulties) {
    if (side.nonFlatGround) nonFlatCount++;
    if (side.roofAccess) roofAccessCount++;
  }

  const adjustment =
    nonFlatCount * RATES.EXTERIOR.DIFFICULTY.NON_FLAT_GROUND +
    roofAccessCount * RATES.EXTERIOR.DIFFICULTY.ROOF_ACCESS;

  return {
    adjustment, // Keep as decimal - this is a multiplier, not currency
    nonFlatCount,
    roofAccessCount,
  };
}

/**
 * Gets the flaking adjustment based on severity
 * Source: painting-algo.md L199-207
 *
 * @param severity - Flaking severity level
 * @param heavyAdjustment - Custom adjustment for heavy flaking (0.5-1.0)
 * @returns Flaking adjustment
 */
export function getFlakingAdjustment(
  severity: FlakingSeverity,
  heavyAdjustment?: number
): number {
  switch (severity) {
    case FlakingSeverity.LIGHT:
      return RATES.EXTERIOR.FLAKING.LIGHT;
    case FlakingSeverity.MEDIUM:
      return RATES.EXTERIOR.FLAKING.MEDIUM;
    case FlakingSeverity.HEAVY: {
      // Use provided adjustment, clamped to valid range
      const adj = heavyAdjustment ?? RATES.EXTERIOR.FLAKING.HEAVY_MIN;
      return Math.min(
        RATES.EXTERIOR.FLAKING.HEAVY_MAX,
        Math.max(RATES.EXTERIOR.FLAKING.HEAVY_MIN, adj)
      );
    }
    default:
      return RATES.EXTERIOR.FLAKING.LIGHT;
  }
}

/**
 * Calculates exterior add-ons total
 * Source: painting-algo.md L211-217
 *
 * @param input - Exterior job input
 * @returns Add-on costs breakdown
 */
export function calculateAddOns(input: ExteriorJobInput): {
  shuttersCost: number;
  frontDoorCost: number;
  garageDoorsCost: number;
  total: number;
} {
  const shuttersCost = input.shutterCount * RATES.EXTERIOR.ADD_ONS.SHUTTER;
  const frontDoorCost = input.paintFrontDoor
    ? RATES.EXTERIOR.ADD_ONS.FRONT_DOOR
    : 0;
  const garageDoorsCost =
    input.garageDoors.oneCarDoors * RATES.EXTERIOR.ADD_ONS.GARAGE_1_CAR +
    input.garageDoors.twoCarDoors * RATES.EXTERIOR.ADD_ONS.GARAGE_2_CAR;

  return {
    shuttersCost,
    frontDoorCost,
    garageDoorsCost,
    total: shuttersCost + frontDoorCost + garageDoorsCost,
  };
}

/**
 * Gets scope multiplier for partial exterior jobs
 * Source: painting-algo.md L223-229
 *
 * @param scope - Job scope
 * @returns Scope multiplier
 */
export function getScopeMultiplier(scope: ExteriorScope): number {
  switch (scope) {
    case ExteriorScope.FULL:
      return 1.0;
    case ExteriorScope.TRIM_ONLY:
    case ExteriorScope.SIDING_ONLY:
      return RATES.EXTERIOR.PARTIAL_JOB_MULTIPLIER;
    default:
      return 1.0;
  }
}

/**
 * Calculates the full exterior estimate
 *
 * Master Formula (painting-algo.md L184):
 * Exterior Price = ((Height_Mult + Difficulty_Adj + Flaking_Adj) x SF + $1,750) x 1.6
 *
 * @param input - Exterior job input
 * @returns Complete estimate result with breakdown
 */
export function calculateExteriorEstimate(
  input: ExteriorJobInput
): ExteriorEstimateResult {
  // Get multipliers
  const heightMultiplier = getHeightMultiplier(input.storyType);
  const { adjustment: difficultyAdjustment, nonFlatCount, roofAccessCount } =
    calculateDifficultyAdjustment(input.sideDifficulties);
  const flakingAdjustment = getFlakingAdjustment(
    input.flakingSeverity,
    input.heavyFlakingAdjustment
  );

  // Calculate total multiplier (keep as decimal for accurate calculation)
  const totalMultiplier =
    heightMultiplier + difficultyAdjustment + flakingAdjustment;

  // Base calculation: (multiplier x SF) + base fee
  const baseCalculation = roundCurrency(
    totalMultiplier * input.houseSqft + RATES.EXTERIOR.BASE_FEE
  );

  // Apply two-coat multiplier
  const afterCoatMultiplier = roundCurrency(
    baseCalculation * RATES.EXTERIOR.COAT_MULTIPLIER
  );

  // Calculate add-ons
  const addOns = calculateAddOns(input);

  // Full exterior total (before scope adjustment)
  const fullExteriorTotal = roundCurrency(afterCoatMultiplier + addOns.total);

  // Apply scope multiplier
  const scopeMultiplier = getScopeMultiplier(input.scope);
  const finalTotal = roundCurrency(fullExteriorTotal * scopeMultiplier);

  // Build breakdown
  const breakdown: ExteriorBreakdown = {
    heightMultiplier,
    difficultyAdjustment,
    flakingAdjustment,
    totalMultiplier,
    baseCalculation,
    afterCoatMultiplier,
    shuttersCost: addOns.shuttersCost,
    frontDoorCost: addOns.frontDoorCost,
    garageDoorsCost: addOns.garageDoorsCost,
    totalAddOns: addOns.total,
    fullExteriorTotal,
    scopeMultiplier,
    finalTotal,
  };

  // Build line items for display
  const lineItems = buildLineItems(input, breakdown, nonFlatCount, roofAccessCount);

  return {
    input,
    breakdown,
    lineItems,
    total: finalTotal,
    calculatedAt: new Date(),
  };
}

/**
 * Builds line items for estimate breakdown display
 */
function buildLineItems(
  input: ExteriorJobInput,
  breakdown: ExteriorBreakdown,
  nonFlatCount: number,
  roofAccessCount: number
): ExteriorLineItem[] {
  const items: ExteriorLineItem[] = [];

  // Base calculation
  items.push({
    category: ExteriorLineItemCategory.BASE,
    name: 'Base Fee',
    basis: 'Power wash, setup, materials',
    cost: RATES.EXTERIOR.BASE_FEE,
  });

  // Height adjustment contribution to sqft cost
  const heightCost = roundCurrency(breakdown.heightMultiplier * input.houseSqft);
  items.push({
    category: ExteriorLineItemCategory.HEIGHT,
    name: `${formatStoryType(input.storyType)} (${breakdown.heightMultiplier}x)`,
    basis: `${input.houseSqft.toLocaleString()} sq.ft`,
    cost: heightCost,
  });

  // Difficulty adjustments
  if (breakdown.difficultyAdjustment > 0) {
    const details: string[] = [];
    if (nonFlatCount > 0) {
      details.push(`${nonFlatCount} side${nonFlatCount > 1 ? 's' : ''} non-flat`);
    }
    if (roofAccessCount > 0) {
      details.push(`${roofAccessCount} side${roofAccessCount > 1 ? 's' : ''} roof access`);
    }
    items.push({
      category: ExteriorLineItemCategory.DIFFICULTY,
      name: `Difficulty Adjustment (+${breakdown.difficultyAdjustment})`,
      basis: details.join(', '),
      cost: roundCurrency(breakdown.difficultyAdjustment * input.houseSqft),
    });
  }

  // Flaking adjustment
  if (breakdown.flakingAdjustment > 0) {
    items.push({
      category: ExteriorLineItemCategory.FLAKING,
      name: `${formatFlakingSeverity(input.flakingSeverity)} Flaking (+${breakdown.flakingAdjustment})`,
      basis: 'Prep work required',
      cost: roundCurrency(breakdown.flakingAdjustment * input.houseSqft),
    });
  }

  // Two-coat multiplier
  items.push({
    category: ExteriorLineItemCategory.COATS,
    name: 'Two-Coat Application (×1.6)',
    basis: 'Standard exterior coverage',
    cost: roundCurrency(breakdown.afterCoatMultiplier - breakdown.baseCalculation),
  });

  // Add-ons
  if (breakdown.shuttersCost > 0) {
    items.push({
      category: ExteriorLineItemCategory.SHUTTERS,
      name: 'Shutters',
      basis: `${input.shutterCount} × $${RATES.EXTERIOR.ADD_ONS.SHUTTER}`,
      cost: breakdown.shuttersCost,
    });
  }

  if (breakdown.frontDoorCost > 0) {
    items.push({
      category: ExteriorLineItemCategory.FRONT_DOOR,
      name: 'Front Door',
      basis: '3 coats, high gloss',
      cost: breakdown.frontDoorCost,
    });
  }

  if (breakdown.garageDoorsCost > 0) {
    const garageParts: string[] = [];
    if (input.garageDoors.oneCarDoors > 0) {
      garageParts.push(`${input.garageDoors.oneCarDoors} × 1-car`);
    }
    if (input.garageDoors.twoCarDoors > 0) {
      garageParts.push(`${input.garageDoors.twoCarDoors} × 2-car`);
    }
    items.push({
      category: ExteriorLineItemCategory.GARAGE,
      name: 'Garage Doors',
      basis: garageParts.join(', '),
      cost: breakdown.garageDoorsCost,
    });
  }

  // Scope adjustment (if partial)
  if (breakdown.scopeMultiplier < 1.0) {
    items.push({
      category: ExteriorLineItemCategory.SCOPE_ADJUSTMENT,
      name: `${formatScope(input.scope)} (×${breakdown.scopeMultiplier})`,
      basis: 'Partial exterior pricing',
      cost: roundCurrency(breakdown.finalTotal - breakdown.fullExteriorTotal),
    });
  }

  return items;
}

/**
 * Format story type for display
 */
function formatStoryType(storyType: StoryType): string {
  const labels: Record<StoryType, string> = {
    [StoryType.ONE_STORY]: '1 Story',
    [StoryType.ONE_HALF_STORY]: '1.5 Story',
    [StoryType.TWO_STORY]: '2 Story',
    [StoryType.THREE_STORY]: '3 Story',
  };
  return labels[storyType] ?? '1 Story';
}

/**
 * Format flaking severity for display
 */
function formatFlakingSeverity(severity: FlakingSeverity): string {
  const labels: Record<FlakingSeverity, string> = {
    [FlakingSeverity.LIGHT]: 'Light',
    [FlakingSeverity.MEDIUM]: 'Medium',
    [FlakingSeverity.HEAVY]: 'Heavy',
  };
  return labels[severity] ?? 'Light';
}

/**
 * Format scope for display
 */
function formatScope(scope: ExteriorScope): string {
  const labels: Record<ExteriorScope, string> = {
    [ExteriorScope.FULL]: 'Full Exterior',
    [ExteriorScope.TRIM_ONLY]: 'Trim Only',
    [ExteriorScope.SIDING_ONLY]: 'Siding Only',
  };
  return labels[scope] ?? 'Full Exterior';
}
