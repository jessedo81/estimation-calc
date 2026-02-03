import { describe, it, expect } from 'vitest';
import {
  getHeightMultiplier,
  calculateDifficultyAdjustment,
  getFlakingAdjustment,
  calculateAddOns,
  getScopeMultiplier,
  calculateExteriorEstimate,
} from '../exterior';
import {
  StoryType,
  FlakingSeverity,
  ExteriorScope,
  createDefaultExteriorJob,
  createDefaultSideDifficulties,
} from '../../../types/exterior';

describe('Exterior Calculation Functions', () => {
  describe('getHeightMultiplier', () => {
    it('returns 1.25 for one story', () => {
      expect(getHeightMultiplier(StoryType.ONE_STORY)).toBe(1.25);
    });

    it('returns 1.5 for one-half story', () => {
      expect(getHeightMultiplier(StoryType.ONE_HALF_STORY)).toBe(1.5);
    });

    it('returns 1.75 for two story', () => {
      expect(getHeightMultiplier(StoryType.TWO_STORY)).toBe(1.75);
    });

    it('returns 2.25 for three story', () => {
      expect(getHeightMultiplier(StoryType.THREE_STORY)).toBe(2.25);
    });
  });

  describe('calculateDifficultyAdjustment', () => {
    it('returns 0 for all flat ground and no roof access', () => {
      const sides = createDefaultSideDifficulties();
      const result = calculateDifficultyAdjustment(sides);
      expect(result.adjustment).toBe(0);
      expect(result.nonFlatCount).toBe(0);
      expect(result.roofAccessCount).toBe(0);
    });

    it('adds 0.25 per side with non-flat ground', () => {
      const sides = createDefaultSideDifficulties();
      sides[0].nonFlatGround = true; // front
      sides[2].nonFlatGround = true; // left
      const result = calculateDifficultyAdjustment(sides);
      expect(result.adjustment).toBe(0.5);
      expect(result.nonFlatCount).toBe(2);
    });

    it('adds 0.25 per side with roof access', () => {
      const sides = createDefaultSideDifficulties();
      sides[1].roofAccess = true; // back
      sides[3].roofAccess = true; // right
      const result = calculateDifficultyAdjustment(sides);
      expect(result.adjustment).toBe(0.5);
      expect(result.roofAccessCount).toBe(2);
    });

    it('combines non-flat and roof access adjustments', () => {
      const sides = createDefaultSideDifficulties();
      sides[0].nonFlatGround = true;
      sides[0].roofAccess = true;
      const result = calculateDifficultyAdjustment(sides);
      expect(result.adjustment).toBe(0.5); // 0.25 + 0.25
    });

    it('calculates maximum adjustment (all sides, both conditions)', () => {
      const sides = createDefaultSideDifficulties();
      sides.forEach((side) => {
        side.nonFlatGround = true;
        side.roofAccess = true;
      });
      const result = calculateDifficultyAdjustment(sides);
      expect(result.adjustment).toBe(2.0); // 4 sides * 0.25 * 2
    });
  });

  describe('getFlakingAdjustment', () => {
    it('returns 0 for light flaking', () => {
      expect(getFlakingAdjustment(FlakingSeverity.LIGHT)).toBe(0);
    });

    it('returns 0.3 for medium flaking', () => {
      expect(getFlakingAdjustment(FlakingSeverity.MEDIUM)).toBe(0.3);
    });

    it('returns 0.5 (minimum) for heavy flaking without custom adjustment', () => {
      expect(getFlakingAdjustment(FlakingSeverity.HEAVY)).toBe(0.5);
    });

    it('uses custom adjustment for heavy flaking', () => {
      expect(getFlakingAdjustment(FlakingSeverity.HEAVY, 0.75)).toBe(0.75);
    });

    it('clamps heavy adjustment to minimum 0.5', () => {
      expect(getFlakingAdjustment(FlakingSeverity.HEAVY, 0.3)).toBe(0.5);
    });

    it('clamps heavy adjustment to maximum 1.0', () => {
      expect(getFlakingAdjustment(FlakingSeverity.HEAVY, 1.5)).toBe(1.0);
    });
  });

  describe('calculateAddOns', () => {
    it('calculates shutter cost correctly', () => {
      const input = createDefaultExteriorJob();
      input.shutterCount = 8;
      const result = calculateAddOns(input);
      expect(result.shuttersCost).toBe(8 * 75); // 600
    });

    it('calculates front door cost when selected', () => {
      const input = createDefaultExteriorJob();
      input.paintFrontDoor = true;
      const result = calculateAddOns(input);
      expect(result.frontDoorCost).toBe(250);
    });

    it('returns 0 for front door when not selected', () => {
      const input = createDefaultExteriorJob();
      input.paintFrontDoor = false;
      const result = calculateAddOns(input);
      expect(result.frontDoorCost).toBe(0);
    });

    it('calculates 1-car garage doors correctly', () => {
      const input = createDefaultExteriorJob();
      input.garageDoors.oneCarDoors = 2;
      const result = calculateAddOns(input);
      expect(result.garageDoorsCost).toBe(2 * 200); // 400
    });

    it('calculates 2-car garage doors correctly', () => {
      const input = createDefaultExteriorJob();
      input.garageDoors.twoCarDoors = 1;
      const result = calculateAddOns(input);
      expect(result.garageDoorsCost).toBe(400);
    });

    it('calculates combined add-ons total', () => {
      const input = createDefaultExteriorJob();
      input.shutterCount = 4;
      input.paintFrontDoor = true;
      input.garageDoors.twoCarDoors = 1;
      const result = calculateAddOns(input);
      expect(result.total).toBe(300 + 250 + 400); // 950
    });
  });

  describe('getScopeMultiplier', () => {
    it('returns 1.0 for full exterior', () => {
      expect(getScopeMultiplier(ExteriorScope.FULL)).toBe(1.0);
    });

    it('returns 0.6 for trim only', () => {
      expect(getScopeMultiplier(ExteriorScope.TRIM_ONLY)).toBe(0.6);
    });

    it('returns 0.6 for siding only', () => {
      expect(getScopeMultiplier(ExteriorScope.SIDING_ONLY)).toBe(0.6);
    });
  });

  describe('calculateExteriorEstimate', () => {
    it('calculates basic one-story exterior', () => {
      const input = createDefaultExteriorJob();
      input.houseSqft = 2000;
      input.storyType = StoryType.ONE_STORY;

      const result = calculateExteriorEstimate(input);

      // Formula: ((1.25 + 0 + 0) x 2000 + 1750) x 1.6
      // = (2500 + 1750) x 1.6
      // = 4250 x 1.6
      // = 6800
      expect(result.breakdown.heightMultiplier).toBe(1.25);
      expect(result.breakdown.difficultyAdjustment).toBe(0);
      expect(result.breakdown.flakingAdjustment).toBe(0);
      expect(result.breakdown.totalMultiplier).toBe(1.25);
      expect(result.breakdown.baseCalculation).toBe(4250); // 1.25 * 2000 + 1750
      expect(result.breakdown.afterCoatMultiplier).toBe(6800); // 4250 * 1.6
      expect(result.total).toBe(6800);
    });

    it('calculates two-story with difficulty adjustments', () => {
      const input = createDefaultExteriorJob();
      input.houseSqft = 2500;
      input.storyType = StoryType.TWO_STORY;
      input.sideDifficulties[0].nonFlatGround = true; // front
      input.sideDifficulties[1].roofAccess = true; // back

      const result = calculateExteriorEstimate(input);

      // Height: 1.75, Difficulty: 0.5 (0.25 + 0.25)
      // Total multiplier: 2.25
      expect(result.breakdown.heightMultiplier).toBe(1.75);
      expect(result.breakdown.difficultyAdjustment).toBe(0.5);
      expect(result.breakdown.totalMultiplier).toBe(2.25);
    });

    it('calculates with medium flaking', () => {
      const input = createDefaultExteriorJob();
      input.houseSqft = 1500;
      input.storyType = StoryType.ONE_STORY;
      input.flakingSeverity = FlakingSeverity.MEDIUM;

      const result = calculateExteriorEstimate(input);

      expect(result.breakdown.flakingAdjustment).toBe(0.3);
      // Total multiplier: 1.25 + 0 + 0.3 = 1.55
      expect(result.breakdown.totalMultiplier).toBe(1.55);
    });

    it('includes add-ons in total', () => {
      const input = createDefaultExteriorJob();
      input.houseSqft = 2000;
      input.storyType = StoryType.ONE_STORY;
      input.shutterCount = 8;
      input.paintFrontDoor = true;

      const result = calculateExteriorEstimate(input);

      expect(result.breakdown.shuttersCost).toBe(600); // 8 * 75
      expect(result.breakdown.frontDoorCost).toBe(250);
      expect(result.breakdown.totalAddOns).toBe(850);
      // Base: 6800 + add-ons: 850 = 7650
      expect(result.total).toBe(7650);
    });

    it('applies trim-only scope multiplier', () => {
      const input = createDefaultExteriorJob();
      input.houseSqft = 2000;
      input.storyType = StoryType.ONE_STORY;
      input.scope = ExteriorScope.TRIM_ONLY;

      const result = calculateExteriorEstimate(input);

      expect(result.breakdown.scopeMultiplier).toBe(0.6);
      // Full exterior: 6800, Trim only: 6800 * 0.6 = 4080
      expect(result.total).toBe(4080);
    });

    it('generates correct line items', () => {
      const input = createDefaultExteriorJob();
      input.houseSqft = 2000;
      input.storyType = StoryType.TWO_STORY;
      input.shutterCount = 4;

      const result = calculateExteriorEstimate(input);

      // Should have: base fee, height, coats, shutters (at minimum)
      expect(result.lineItems.length).toBeGreaterThanOrEqual(4);

      const baseItem = result.lineItems.find((item) => item.category === 'base');
      expect(baseItem).toBeDefined();
      expect(baseItem?.cost).toBe(1750);

      const shuttersItem = result.lineItems.find((item) => item.category === 'shutters');
      expect(shuttersItem).toBeDefined();
      expect(shuttersItem?.cost).toBe(300); // 4 * 75
    });

    it('handles complex scenario with all options', () => {
      const input = createDefaultExteriorJob();
      input.houseSqft = 3000;
      input.storyType = StoryType.THREE_STORY;
      input.sideDifficulties[0].nonFlatGround = true;
      input.sideDifficulties[1].nonFlatGround = true;
      input.sideDifficulties[2].roofAccess = true;
      input.flakingSeverity = FlakingSeverity.HEAVY;
      input.heavyFlakingAdjustment = 0.8;
      input.shutterCount = 12;
      input.paintFrontDoor = true;
      input.garageDoors.twoCarDoors = 1;

      const result = calculateExteriorEstimate(input);

      // Height: 2.25
      // Difficulty: 2*0.25 + 1*0.25 = 0.75
      // Flaking: 0.8
      // Total mult: 2.25 + 0.75 + 0.8 = 3.8
      expect(result.breakdown.heightMultiplier).toBe(2.25);
      expect(result.breakdown.difficultyAdjustment).toBe(0.75);
      expect(result.breakdown.flakingAdjustment).toBe(0.8);
      expect(result.breakdown.totalMultiplier).toBe(3.8);

      // Base: 3.8 * 3000 + 1750 = 11400 + 1750 = 13150
      expect(result.breakdown.baseCalculation).toBe(13150);

      // After coats: 13150 * 1.6 = 21040
      expect(result.breakdown.afterCoatMultiplier).toBe(21040);

      // Add-ons: 12*75 + 250 + 400 = 900 + 250 + 400 = 1550
      expect(result.breakdown.totalAddOns).toBe(1550);

      // Total: 21040 + 1550 = 22590
      expect(result.total).toBe(22590);
    });
  });
});
