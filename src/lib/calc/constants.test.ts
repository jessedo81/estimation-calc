import { describe, it, expect } from 'vitest';
import { RATES } from './rates';
import {
  ROOM_TYPE_MULTIPLIERS,
  MINIMUM_JOB_FEE,
  SETUP_CLEANUP_FEE,
} from './constants';

describe('RATES constants', () => {
  describe('Wall multipliers (painting-algo.md L21-23)', () => {
    it('should have General room multiplier of 2.8', () => {
      expect(RATES.WALL_MULT.GENERAL).toBe(2.8);
    });

    it('should have Kitchen multiplier of 3.1', () => {
      expect(RATES.WALL_MULT.KITCHEN).toBe(3.1);
    });

    it('should have Bathroom multiplier of 4.1', () => {
      expect(RATES.WALL_MULT.BATHROOM).toBe(4.1);
    });

    it('should have vaulted adjustment of 0.5', () => {
      expect(RATES.VAULTED_ADD).toBe(0.5);
    });
  });

  describe('Ceiling multipliers (painting-algo.md L52-54)', () => {
    it('should have ceiling with walls multiplier of 0.6', () => {
      expect(RATES.CEILING_MULT_WITH_WALLS).toBe(0.6);
    });

    it('should have ceiling only multiplier of 1.7', () => {
      expect(RATES.CEILING_MULT_ONLY).toBe(1.7);
    });
  });

  describe('Trim pricing (painting-algo.md L36-45)', () => {
    it('should have trim SF multiplier of 0.5', () => {
      expect(RATES.TRIM_SF_MULT).toBe(0.5);
    });

    it('should have baseboard LF with walls rate of $1.88', () => {
      expect(RATES.BASEBOARD_LF_WITH_WALLS).toBe(1.88);
    });

    it('should have baseboard LF only rate of $5.60', () => {
      expect(RATES.BASEBOARD_LF_ONLY).toBe(5.6);
    });

    it('should have stained conversion multiplier of 3.0', () => {
      expect(RATES.STAINED_CONVERSION_MULT).toBe(3.0);
    });
  });

  describe('Line item prices (painting-algo.md L60-75)', () => {
    it('should have door price of $63 per side', () => {
      expect(RATES.DOOR_PER_SIDE).toBe(63);
    });

    it('should have standard closet price of $120', () => {
      expect(RATES.CLOSET_STANDARD).toBe(120);
    });

    it('should have walk-in closet price of $185', () => {
      expect(RATES.CLOSET_WALKIN).toBe(185);
    });

    it('should have window base price of $70', () => {
      expect(RATES.WINDOW_BASE).toBe(70);
    });

    it('should have accent wall in-room price of $150', () => {
      expect(RATES.ACCENT_WALL_IN_ROOM).toBe(150);
    });

    it('should have accent wall standalone price of $185', () => {
      expect(RATES.ACCENT_WALL_STANDALONE).toBe(185);
    });
  });

  describe('Crown molding and scaffolding', () => {
    it('should have crown molding at $1.50/LF', () => {
      expect(RATES.CROWN_MOLDING_PER_LF).toBe(1.5);
    });

    it('should have scaffolding fee of $650', () => {
      expect(RATES.SCAFFOLDING_FEE).toBe(650);
    });
  });

  describe('Job-level adjustments (painting-algo.md L93, L117)', () => {
    it('should have setup threshold of $1,566', () => {
      expect(RATES.SETUP_THRESHOLD).toBe(1566);
    });

    it('should have max setup fee of $300', () => {
      expect(RATES.SETUP_MAX_FEE).toBe(300);
    });

    it('should have additional color fee of $134', () => {
      expect(RATES.ADDITIONAL_COLOR_FEE).toBe(134);
    });
  });

  describe('Minimums (painting-algo.md L27)', () => {
    it('should have room minimum of $275', () => {
      expect(RATES.MIN_ROOM_CHARGE).toBe(275);
    });
  });

  describe('Wallpaper removal', () => {
    it('should have wallpaper removal at $7/wall sqft', () => {
      expect(RATES.WALLPAPER_PER_WALL_SF).toBe(7);
    });
  });

  describe('Paint options', () => {
    it('should have customer paint deduction of 15%', () => {
      expect(RATES.CUSTOMER_SUPPLIES_PAINT_DEDUCT).toBe(0.15);
    });

    it('should have premium paint upcharge of $200', () => {
      expect(RATES.PREMIUM_PAINT_UPCHARGE).toBe(200);
    });
  });
});

describe('Legacy exports (backwards compatibility)', () => {
  it('should export ROOM_TYPE_MULTIPLIERS matching RATES', () => {
    expect(ROOM_TYPE_MULTIPLIERS.standard).toBe(RATES.WALL_MULT.GENERAL);
    expect(ROOM_TYPE_MULTIPLIERS.kitchen).toBe(RATES.WALL_MULT.KITCHEN);
    expect(ROOM_TYPE_MULTIPLIERS.bathroom).toBe(RATES.WALL_MULT.BATHROOM);
  });

  it('should export MINIMUM_JOB_FEE matching RATES.SETUP_THRESHOLD', () => {
    expect(MINIMUM_JOB_FEE).toBe(RATES.SETUP_THRESHOLD);
  });

  it('should export SETUP_CLEANUP_FEE matching RATES.SETUP_MAX_FEE', () => {
    expect(SETUP_CLEANUP_FEE).toBe(RATES.SETUP_MAX_FEE);
  });
});
