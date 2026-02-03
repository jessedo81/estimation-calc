import { describe, it, expect } from 'vitest';
import {
  roundCurrency,
  clampNonNeg,
  getWallMultiplier,
  calculateRoomWalls,
  calculateCeiling,
  calculateTrim,
  calculateCrownMolding,
  calculateDoors,
  calculateWindows,
  calculateClosets,
  calculateAccentWalls,
  calculateScaffolding,
  calculateAdditionalColors,
  calculateWallpaperRemoval,
  calculateSetupFee,
  calculateRoom,
  calculateInteriorEstimate,
  calculateJobTotal,
} from '../interior';
import { RATES } from '../../calc/rates';
import {
  RoomType,
  TrimMode,
  WindowSize,
  RoomInput,
  createRoom,
} from '../../../types/estimate';

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

describe('Utility Functions', () => {
  describe('roundCurrency', () => {
    it('rounds to nearest dollar', () => {
      expect(roundCurrency(99.4)).toBe(99);
      expect(roundCurrency(99.5)).toBe(100);
      expect(roundCurrency(99.6)).toBe(100);
    });

    it('handles negative numbers', () => {
      expect(roundCurrency(-99.4)).toBe(-99);
    });
  });

  describe('clampNonNeg', () => {
    it('returns value when positive', () => {
      expect(clampNonNeg(100)).toBe(100);
    });

    it('returns 0 when negative', () => {
      expect(clampNonNeg(-50)).toBe(0);
    });

    it('returns 0 when zero', () => {
      expect(clampNonNeg(0)).toBe(0);
    });
  });

  describe('getWallMultiplier', () => {
    it('returns 2.8 for general room', () => {
      expect(getWallMultiplier(RoomType.GENERAL)).toBe(2.8);
    });

    it('returns 3.1 for kitchen', () => {
      expect(getWallMultiplier(RoomType.KITCHEN)).toBe(3.1);
    });

    it('returns 4.1 for bathroom', () => {
      expect(getWallMultiplier(RoomType.BATHROOM)).toBe(4.1);
    });
  });
});

// ============================================================
// WALL CALCULATIONS
// ============================================================

describe('Wall Calculations (painting-algo.md L21-27)', () => {
  describe('General Room (2.8x multiplier)', () => {
    it('calculates 200 SF general room walls', () => {
      const result = calculateRoomWalls(200, RoomType.GENERAL);
      expect(result.cost).toBe(560); // 200 * 2.8
      expect(result.multiplier).toBe(2.8);
      expect(result.minimumApplied).toBe(false);
    });

    it('calculates 300 SF general room walls', () => {
      const result = calculateRoomWalls(300, RoomType.GENERAL);
      expect(result.cost).toBe(840); // 300 * 2.8
    });

    it('calculates 500 SF general room walls', () => {
      const result = calculateRoomWalls(500, RoomType.GENERAL);
      expect(result.cost).toBe(1400); // 500 * 2.8
    });
  });

  describe('Kitchen (3.1x multiplier)', () => {
    it('calculates 150 SF kitchen walls', () => {
      const result = calculateRoomWalls(150, RoomType.KITCHEN);
      expect(result.cost).toBe(465); // 150 * 3.1
      expect(result.multiplier).toBe(3.1);
    });

    it('calculates 200 SF kitchen walls', () => {
      const result = calculateRoomWalls(200, RoomType.KITCHEN);
      expect(result.cost).toBe(620); // 200 * 3.1
    });

    it('calculates 250 SF kitchen walls', () => {
      const result = calculateRoomWalls(250, RoomType.KITCHEN);
      expect(result.cost).toBe(775); // 250 * 3.1
    });
  });

  describe('Bathroom (4.1x multiplier)', () => {
    it('calculates 50 SF bathroom walls with minimum', () => {
      const result = calculateRoomWalls(50, RoomType.BATHROOM);
      // 50 * 4.1 = 205, but minimum is $275
      expect(result.cost).toBe(275);
      expect(result.minimumApplied).toBe(true);
    });

    it('calculates 80 SF bathroom walls', () => {
      const result = calculateRoomWalls(80, RoomType.BATHROOM);
      expect(result.cost).toBe(328); // 80 * 4.1
      expect(result.minimumApplied).toBe(false);
    });

    it('calculates 100 SF bathroom walls', () => {
      const result = calculateRoomWalls(100, RoomType.BATHROOM);
      expect(result.cost).toBe(410); // 100 * 4.1
    });
  });

  describe('Minimum Room Charge ($275)', () => {
    it('applies minimum for small general room (50 SF)', () => {
      const result = calculateRoomWalls(50, RoomType.GENERAL);
      // 50 * 2.8 = 140 < 275
      expect(result.cost).toBe(275);
      expect(result.minimumApplied).toBe(true);
    });

    it('applies minimum for tiny general room (30 SF)', () => {
      const result = calculateRoomWalls(30, RoomType.GENERAL);
      // 30 * 2.8 = 84 < 275
      expect(result.cost).toBe(275);
    });

    it('does not apply minimum when calculation exceeds $275', () => {
      const result = calculateRoomWalls(100, RoomType.GENERAL);
      // 100 * 2.8 = 280 > 275
      expect(result.cost).toBe(280);
      expect(result.minimumApplied).toBe(false);
    });

    it('applies minimum for small kitchen (70 SF)', () => {
      const result = calculateRoomWalls(70, RoomType.KITCHEN);
      // 70 * 3.1 = 217 < 275
      expect(result.cost).toBe(275);
    });
  });

  describe('Vaulted Ceiling Adjustment (+0.5)', () => {
    it('adds vaulted adjustment to general room', () => {
      const result = calculateRoomWalls(200, RoomType.GENERAL, { vaulted: true });
      // 200 * (2.8 + 0.5) = 200 * 3.3 = 660
      expect(result.cost).toBe(660);
      expect(result.multiplier).toBe(3.3);
    });

    it('adds vaulted adjustment to kitchen', () => {
      const result = calculateRoomWalls(200, RoomType.KITCHEN, { vaulted: true });
      // 200 * (3.1 + 0.5) = 200 * 3.6 = 720
      expect(result.cost).toBe(720);
    });

    it('adds vaulted adjustment to bathroom', () => {
      const result = calculateRoomWalls(100, RoomType.BATHROOM, { vaulted: true });
      // 100 * (4.1 + 0.5) = 100 * 4.6 = 460
      expect(result.cost).toBe(460);
    });

    it('still applies minimum with vaulted adjustment', () => {
      const result = calculateRoomWalls(50, RoomType.GENERAL, { vaulted: true });
      // 50 * 3.3 = 165 < 275
      expect(result.cost).toBe(275);
    });
  });

  describe('Edge Cases', () => {
    it('returns 0 for zero square footage', () => {
      const result = calculateRoomWalls(0, RoomType.GENERAL);
      expect(result.cost).toBe(0);
    });

    it('handles decimal square footage', () => {
      const result = calculateRoomWalls(150.5, RoomType.GENERAL);
      // 150.5 * 2.8 = 421.4, rounded to 421
      expect(result.cost).toBe(421);
    });

    it('returns 0 when paintWalls is false', () => {
      const result = calculateRoomWalls(200, RoomType.GENERAL, { paintWalls: false });
      expect(result.cost).toBe(0);
    });

    it('handles negative square footage', () => {
      const result = calculateRoomWalls(-100, RoomType.GENERAL);
      expect(result.cost).toBe(0);
    });
  });
});

// ============================================================
// CEILING CALCULATIONS
// ============================================================

describe('Ceiling Calculations (painting-algo.md L52-54)', () => {
  describe('Ceiling with Walls Being Painted (0.6x)', () => {
    it('calculates 200 SF ceiling with walls', () => {
      const result = calculateCeiling(200, { wallsBeingPainted: true });
      expect(result.cost).toBe(120); // 200 * 0.6
      expect(result.multiplier).toBe(0.6);
    });

    it('calculates 300 SF ceiling with walls', () => {
      const result = calculateCeiling(300, { wallsBeingPainted: true });
      expect(result.cost).toBe(180); // 300 * 0.6
    });

    it('calculates 500 SF ceiling with walls', () => {
      const result = calculateCeiling(500, { wallsBeingPainted: true });
      expect(result.cost).toBe(300); // 500 * 0.6
    });
  });

  describe('Ceiling Only - Walls NOT Being Painted (1.7x)', () => {
    it('calculates 200 SF ceiling only', () => {
      const result = calculateCeiling(200, { wallsBeingPainted: false });
      expect(result.cost).toBe(340); // 200 * 1.7
      expect(result.multiplier).toBe(1.7);
    });

    it('calculates 300 SF ceiling only', () => {
      const result = calculateCeiling(300, { wallsBeingPainted: false });
      expect(result.cost).toBe(510); // 300 * 1.7
    });

    it('calculates 150 SF ceiling only', () => {
      const result = calculateCeiling(150, { wallsBeingPainted: false });
      expect(result.cost).toBe(255); // 150 * 1.7
    });
  });

  describe('Edge Cases', () => {
    it('returns 0 when paintCeiling is false', () => {
      const result = calculateCeiling(200, { paintCeiling: false });
      expect(result.cost).toBe(0);
    });

    it('returns 0 for zero square footage', () => {
      const result = calculateCeiling(0, { wallsBeingPainted: true });
      expect(result.cost).toBe(0);
    });

    it('defaults to walls being painted', () => {
      const result = calculateCeiling(200);
      expect(result.cost).toBe(120); // Uses 0.6x multiplier
    });
  });
});

// ============================================================
// TRIM CALCULATIONS
// ============================================================

describe('Trim Calculations (painting-algo.md L36-45)', () => {
  describe('Trim Package (SF x 0.5)', () => {
    it('calculates 200 SF trim package', () => {
      const result = calculateTrim(200, { trimMode: TrimMode.TRIM_PACKAGE_SF });
      expect(result.cost).toBe(100); // 200 * 0.5
    });

    it('calculates 350 SF trim package', () => {
      const result = calculateTrim(350, { trimMode: TrimMode.TRIM_PACKAGE_SF });
      expect(result.cost).toBe(175); // 350 * 0.5
    });

    it('calculates 500 SF trim package', () => {
      const result = calculateTrim(500, { trimMode: TrimMode.TRIM_PACKAGE_SF });
      expect(result.cost).toBe(250); // 500 * 0.5
    });
  });

  describe('Baseboards Linear Foot - With Walls ($1.88/LF)', () => {
    it('calculates 50 LF baseboards with walls', () => {
      const result = calculateTrim(0, {
        trimMode: TrimMode.BASEBOARDS_LF,
        baseboardLF: 50,
        wallsBeingPainted: true,
      });
      expect(result.cost).toBe(94); // 50 * 1.88
    });

    it('calculates 80 LF baseboards with walls', () => {
      const result = calculateTrim(0, {
        trimMode: TrimMode.BASEBOARDS_LF,
        baseboardLF: 80,
        wallsBeingPainted: true,
      });
      expect(result.cost).toBe(150); // 80 * 1.88 = 150.4, rounded
    });

    it('calculates 100 LF baseboards with walls', () => {
      const result = calculateTrim(0, {
        trimMode: TrimMode.BASEBOARDS_LF,
        baseboardLF: 100,
        wallsBeingPainted: true,
      });
      expect(result.cost).toBe(188); // 100 * 1.88
    });
  });

  describe('Baseboards Linear Foot - Without Walls ($5.60/LF)', () => {
    it('calculates 50 LF baseboards only', () => {
      const result = calculateTrim(0, {
        trimMode: TrimMode.BASEBOARDS_LF,
        baseboardLF: 50,
        wallsBeingPainted: false,
      });
      expect(result.cost).toBe(280); // 50 * 5.60
    });

    it('calculates 80 LF baseboards only', () => {
      const result = calculateTrim(0, {
        trimMode: TrimMode.BASEBOARDS_LF,
        baseboardLF: 80,
        wallsBeingPainted: false,
      });
      expect(result.cost).toBe(448); // 80 * 5.60
    });

    it('calculates 100 LF baseboards only', () => {
      const result = calculateTrim(0, {
        trimMode: TrimMode.BASEBOARDS_LF,
        baseboardLF: 100,
        wallsBeingPainted: false,
      });
      expect(result.cost).toBe(560); // 100 * 5.60
    });
  });

  describe('Stained Wood Conversion (3x multiplier)', () => {
    it('applies 3x to trim package', () => {
      const result = calculateTrim(200, {
        trimMode: TrimMode.TRIM_PACKAGE_SF,
        stainedConversion: true,
      });
      expect(result.cost).toBe(300); // (200 * 0.5) * 3
    });

    it('applies 3x to baseboards with walls', () => {
      const result = calculateTrim(0, {
        trimMode: TrimMode.BASEBOARDS_LF,
        baseboardLF: 50,
        wallsBeingPainted: true,
        stainedConversion: true,
      });
      expect(result.cost).toBe(282); // (50 * 1.88) * 3
    });

    it('applies 3x to baseboards only', () => {
      const result = calculateTrim(0, {
        trimMode: TrimMode.BASEBOARDS_LF,
        baseboardLF: 50,
        wallsBeingPainted: false,
        stainedConversion: true,
      });
      expect(result.cost).toBe(840); // (50 * 5.60) * 3
    });
  });

  describe('No Trim', () => {
    it('returns 0 when trimMode is none', () => {
      const result = calculateTrim(200, { trimMode: TrimMode.NONE });
      expect(result.cost).toBe(0);
    });

    it('returns 0 with default options', () => {
      const result = calculateTrim(200);
      expect(result.cost).toBe(0);
    });
  });
});

// ============================================================
// CROWN MOLDING CALCULATIONS
// ============================================================

describe('Crown Molding Calculations', () => {
  it('calculates 50 LF crown molding', () => {
    const result = calculateCrownMolding(50);
    expect(result.cost).toBe(75); // 50 * 1.5
  });

  it('calculates 100 LF crown molding', () => {
    const result = calculateCrownMolding(100);
    expect(result.cost).toBe(150); // 100 * 1.5
  });

  it('returns 0 for no crown molding', () => {
    const result = calculateCrownMolding(0);
    expect(result.cost).toBe(0);
  });

  it('handles negative LF', () => {
    const result = calculateCrownMolding(-50);
    expect(result.cost).toBe(0);
  });
});

// ============================================================
// DOOR CALCULATIONS
// ============================================================

describe('Door Calculations (painting-algo.md L61)', () => {
  it('calculates 1 door side', () => {
    const result = calculateDoors(1);
    expect(result.cost).toBe(63);
  });

  it('calculates 2 door sides (1 door both sides)', () => {
    const result = calculateDoors(2);
    expect(result.cost).toBe(126);
  });

  it('calculates 4 door sides', () => {
    const result = calculateDoors(4);
    expect(result.cost).toBe(252);
  });

  it('returns 0 for no doors', () => {
    const result = calculateDoors(0);
    expect(result.cost).toBe(0);
  });

  it('handles decimal sides (floors to integer)', () => {
    const result = calculateDoors(2.7);
    expect(result.cost).toBe(126); // 2 * 63
  });
});

// ============================================================
// WINDOW CALCULATIONS
// ============================================================

describe('Window Calculations (painting-algo.md L67)', () => {
  it('calculates standard window ($70)', () => {
    const result = calculateWindows([{ sizeFactor: WindowSize.STANDARD }]);
    expect(result.cost).toBe(70);
  });

  it('calculates large window ($140)', () => {
    const result = calculateWindows([{ sizeFactor: WindowSize.LARGE }]);
    expect(result.cost).toBe(140);
  });

  it('calculates multiple windows', () => {
    const result = calculateWindows([
      { sizeFactor: WindowSize.STANDARD },
      { sizeFactor: WindowSize.STANDARD },
      { sizeFactor: WindowSize.LARGE },
    ]);
    expect(result.cost).toBe(280); // 70 + 70 + 140
  });

  it('returns 0 for no windows', () => {
    const result = calculateWindows([]);
    expect(result.cost).toBe(0);
  });

  it('handles numeric size factors', () => {
    const result = calculateWindows([{ sizeFactor: 1 }, { sizeFactor: 2 }]);
    expect(result.cost).toBe(210); // 70 + 140
  });
});

// ============================================================
// CLOSET CALCULATIONS
// ============================================================

describe('Closet Calculations (painting-algo.md L64-65)', () => {
  it('calculates standard closet ($120)', () => {
    const result = calculateClosets(1, 0);
    expect(result.cost).toBe(120);
  });

  it('calculates walk-in closet ($185)', () => {
    const result = calculateClosets(0, 1);
    expect(result.cost).toBe(185);
  });

  it('calculates mixed closets', () => {
    const result = calculateClosets(2, 1);
    expect(result.cost).toBe(425); // (2 * 120) + (1 * 185)
  });

  it('returns 0 for no closets', () => {
    const result = calculateClosets(0, 0);
    expect(result.cost).toBe(0);
  });

  it('handles decimal counts (floors to integer)', () => {
    const result = calculateClosets(1.7, 0.5);
    expect(result.cost).toBe(120); // 1 standard only
  });
});

// ============================================================
// ACCENT WALL CALCULATIONS
// ============================================================

describe('Accent Wall Calculations (painting-algo.md L74-75)', () => {
  it('calculates accent wall inside painted room ($150)', () => {
    const result = calculateAccentWalls(1, 0);
    expect(result.cost).toBe(150);
  });

  it('calculates accent wall only ($185)', () => {
    const result = calculateAccentWalls(0, 1);
    expect(result.cost).toBe(185);
  });

  it('calculates multiple accent walls', () => {
    const result = calculateAccentWalls(2, 1);
    expect(result.cost).toBe(485); // (2 * 150) + (1 * 185)
  });

  it('returns 0 for no accent walls', () => {
    const result = calculateAccentWalls(0, 0);
    expect(result.cost).toBe(0);
  });
});

// ============================================================
// SCAFFOLDING CALCULATIONS
// ============================================================

describe('Scaffolding Calculations (painting-algo.md L86)', () => {
  it('adds scaffolding fee for great rooms', () => {
    const result = calculateScaffolding(true);
    expect(result.cost).toBe(650);
  });

  it('returns 0 when not needed', () => {
    const result = calculateScaffolding(false);
    expect(result.cost).toBe(0);
  });
});

// ============================================================
// ADDITIONAL COLORS CALCULATIONS
// ============================================================

describe('Additional Colors Calculations (painting-algo.md L117)', () => {
  it('returns 0 for single color (default)', () => {
    const result = calculateAdditionalColors(1);
    expect(result.cost).toBe(0);
    expect(result.extraColors).toBe(0);
  });

  it('calculates 1 additional color', () => {
    const result = calculateAdditionalColors(2);
    expect(result.cost).toBe(134);
    expect(result.extraColors).toBe(1);
  });

  it('calculates 3 additional colors', () => {
    const result = calculateAdditionalColors(4);
    expect(result.cost).toBe(402); // (4 - 1) * 134
    expect(result.extraColors).toBe(3);
  });

  it('handles zero colors', () => {
    const result = calculateAdditionalColors(0);
    expect(result.cost).toBe(0);
  });
});

// ============================================================
// WALLPAPER REMOVAL CALCULATIONS
// ============================================================

describe('Wallpaper Removal Calculations', () => {
  it('calculates 100 wall sqft removal', () => {
    const result = calculateWallpaperRemoval(100);
    expect(result.cost).toBe(700); // 100 * 7
  });

  it('returns 0 for no removal', () => {
    const result = calculateWallpaperRemoval(0);
    expect(result.cost).toBe(0);
  });

  it('handles negative sqft', () => {
    const result = calculateWallpaperRemoval(-50);
    expect(result.cost).toBe(0);
  });
});

// ============================================================
// SETUP FEE CALCULATIONS
// ============================================================

describe('Setup Fee Calculations (painting-algo.md L93)', () => {
  it('adds full $300 when subtotal is very low', () => {
    const result = calculateSetupFee(1000);
    expect(result.fee).toBe(300);
  });

  it('adds partial fee to reach $1,566 threshold', () => {
    const result = calculateSetupFee(1400);
    expect(result.fee).toBe(166); // 1566 - 1400
  });

  it('adds exact amount to reach threshold', () => {
    const result = calculateSetupFee(1300);
    expect(result.fee).toBe(266); // 1566 - 1300
  });

  it('adds nothing when subtotal equals threshold', () => {
    const result = calculateSetupFee(1566);
    expect(result.fee).toBe(0);
  });

  it('adds nothing when subtotal exceeds threshold', () => {
    const result = calculateSetupFee(2000);
    expect(result.fee).toBe(0);
  });

  it('adds nothing for large jobs', () => {
    const result = calculateSetupFee(5000);
    expect(result.fee).toBe(0);
  });
});

// ============================================================
// CALCULATE JOB TOTAL
// ============================================================

describe('Calculate Job Total', () => {
  it('adds setup fee for small job', () => {
    const result = calculateJobTotal(1200);
    expect(result).toBe(1500); // 1200 + 300
  });

  it('adds partial setup fee', () => {
    const result = calculateJobTotal(1450);
    expect(result).toBe(1566); // 1450 + 116
  });

  it('no setup fee for large job', () => {
    const result = calculateJobTotal(3000);
    expect(result).toBe(3000);
  });
});

// ============================================================
// ROOM CALCULATION
// ============================================================

describe('Room Calculation', () => {
  it('calculates typical bedroom', () => {
    const room = createRoom('Bedroom', {
      floorSqft: 150,
      roomType: RoomType.GENERAL,
      paintWalls: true,
      paintCeiling: true,
    });

    const result = calculateRoom(room);

    // Walls: 150 * 2.8 = 420
    // Ceiling: 150 * 0.6 = 90
    // Total: 510
    expect(result.roomTotal).toBe(510);
    expect(result.lineItems.length).toBe(2);
  });

  it('calculates master bedroom with trim and closet', () => {
    const room = createRoom('Master Bedroom', {
      floorSqft: 300,
      roomType: RoomType.GENERAL,
      paintWalls: true,
      paintCeiling: true,
      trimMode: TrimMode.TRIM_PACKAGE_SF,
      doorSides: 2,
      closetsWalkIn: 1,
    });

    const result = calculateRoom(room);

    // Walls: 300 * 2.8 = 840
    // Ceiling: 300 * 0.6 = 180
    // Trim: 300 * 0.5 = 150
    // Doors: 2 * 63 = 126
    // Walk-in: 185
    // Total: 1481
    expect(result.roomTotal).toBe(1481);
  });

  it('calculates small bathroom with minimum', () => {
    const room = createRoom('Bathroom', {
      floorSqft: 50,
      roomType: RoomType.BATHROOM,
      paintWalls: true,
      paintCeiling: true,
    });

    const result = calculateRoom(room);

    // Walls: 50 * 4.1 = 205 -> minimum 275
    // Ceiling: 50 * 0.6 = 30
    // Total: 305
    expect(result.roomTotal).toBe(305);
  });

  it('calculates vaulted great room with scaffolding', () => {
    const room = createRoom('Great Room', {
      floorSqft: 400,
      roomType: RoomType.GENERAL,
      paintWalls: true,
      paintCeiling: true,
      vaulted: true,
      trimMode: TrimMode.TRIM_PACKAGE_SF,
      needsScaffolding: true,
    });

    const result = calculateRoom(room);

    // Walls: 400 * 3.3 = 1320
    // Ceiling: 400 * 0.6 = 240
    // Trim: 400 * 0.5 = 200
    // Scaffolding: 650
    // Total: 2410
    expect(result.roomTotal).toBe(2410);
  });
});

// ============================================================
// FULL ESTIMATE CALCULATION
// ============================================================

describe('Full Estimate Calculation', () => {
  it('calculates single room estimate with setup fee', () => {
    const rooms = [
      createRoom('Small Room', {
        floorSqft: 100,
        roomType: RoomType.GENERAL,
        paintWalls: true,
        paintCeiling: false,
      }),
    ];

    const result = calculateInteriorEstimate({
      rooms,
      numWallColors: 1,
      customerSuppliesPaint: false,
      premiumPaint: false,
    });

    // Walls: 100 * 2.8 = 280
    // Subtotal: 280
    // Setup fee: min(300, 1566 - 280) = 300
    // Total: 580
    expect(result.subtotal).toBe(280);
    expect(result.setupFee).toBe(300);
    expect(result.total).toBe(580);
  });

  it('calculates multi-room estimate', () => {
    const rooms = [
      createRoom('Bedroom 1', {
        floorSqft: 150,
        roomType: RoomType.GENERAL,
        paintWalls: true,
        paintCeiling: true,
      }),
      createRoom('Kitchen', {
        floorSqft: 200,
        roomType: RoomType.KITCHEN,
        paintWalls: true,
        paintCeiling: true,
      }),
    ];

    const result = calculateInteriorEstimate({
      rooms,
      numWallColors: 1,
      customerSuppliesPaint: false,
      premiumPaint: false,
    });

    // Bedroom: 150*2.8 + 150*0.6 = 420 + 90 = 510
    // Kitchen: 200*3.1 + 200*0.6 = 620 + 120 = 740
    // Subtotal: 1250
    // Setup fee: min(300, 1566 - 1250) = 300
    // Total: 1550
    expect(result.subtotal).toBe(1250);
    expect(result.setupFee).toBe(300);
    expect(result.total).toBe(1550);
    expect(result.roomCount).toBe(2);
  });

  it('calculates estimate with additional colors', () => {
    const rooms = [
      createRoom('Room', {
        floorSqft: 200,
        roomType: RoomType.GENERAL,
        paintWalls: true,
        paintCeiling: true,
      }),
    ];

    const result = calculateInteriorEstimate({
      rooms,
      numWallColors: 3,
      customerSuppliesPaint: false,
      premiumPaint: false,
    });

    // Room: 200*2.8 + 200*0.6 = 560 + 120 = 680
    // Additional colors: (3-1) * 134 = 268
    // Subtotal: 948
    // Setup fee: min(300, 1566 - 948) = 300
    // Total: 1248
    expect(result.subtotal).toBe(948);
    expect(result.total).toBe(1248);
  });

  it('calculates estimate with premium paint', () => {
    const rooms = [
      createRoom('Room', {
        floorSqft: 500,
        roomType: RoomType.GENERAL,
        paintWalls: true,
      }),
    ];

    const result = calculateInteriorEstimate({
      rooms,
      numWallColors: 1,
      customerSuppliesPaint: false,
      premiumPaint: true,
    });

    // Room: 500*2.8 = 1400
    // Premium: 200
    // Subtotal: 1600
    // Setup fee: 0 (over threshold)
    expect(result.subtotal).toBe(1600);
    expect(result.setupFee).toBe(0);
    expect(result.total).toBe(1600);
  });

  it('calculates estimate with customer paint deduction', () => {
    const rooms = [
      createRoom('Room', {
        floorSqft: 500,
        roomType: RoomType.GENERAL,
        paintWalls: true,
      }),
    ];

    const result = calculateInteriorEstimate({
      rooms,
      numWallColors: 1,
      customerSuppliesPaint: true,
      premiumPaint: false,
    });

    // Room: 500*2.8 = 1400
    // Deduction: 1400 * 0.15 = 210
    // Subtotal: 1190
    // Setup fee: min(300, 1566 - 1190) = 300
    expect(result.subtotal).toBe(1190);
    expect(result.total).toBe(1490);
  });

  it('includes warnings for unusual values', () => {
    const rooms = [
      createRoom('Huge Room', {
        floorSqft: 6000,
        roomType: RoomType.GENERAL,
        paintWalls: true,
        doorSides: 25,
      }),
    ];

    const result = calculateInteriorEstimate({
      rooms,
      numWallColors: 1,
      customerSuppliesPaint: false,
      premiumPaint: false,
    });

    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.some((w) => w.includes('6000 sqft'))).toBe(true);
    expect(result.warnings.some((w) => w.includes('25 sides'))).toBe(true);
  });

  it('warns when no rooms added', () => {
    const result = calculateInteriorEstimate({
      rooms: [],
      numWallColors: 1,
      customerSuppliesPaint: false,
      premiumPaint: false,
    });

    expect(result.warnings).toContain('No rooms added to estimate');
    // Subtotal is 0, but setup fee still applies (0 < 1566)
    expect(result.subtotal).toBe(0);
    expect(result.setupFee).toBe(300);
    expect(result.total).toBe(300);
  });
});
