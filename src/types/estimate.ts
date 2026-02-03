/**
 * TypeScript types for EstimationCalc
 *
 * Based on painting-algo.md specifications
 */

// ============================================================
// ENUMS
// ============================================================

/**
 * Room type determines the wall multiplier
 * painting-algo.md L21-23
 */
export enum RoomType {
  GENERAL = 'general', // 2.8x - bedrooms, living rooms, offices
  KITCHEN = 'kitchen', // 3.1x - more cut-in, cabinets, prep
  BATHROOM = 'bathroom', // 4.1x - tight spaces, fixtures, moisture prep
}

/**
 * Trim mode determines how trim pricing is calculated
 * painting-algo.md L36-45
 */
export enum TrimMode {
  NONE = 'none', // No trim
  TRIM_PACKAGE_SF = 'trim_package_sf', // SF x 0.5
  BASEBOARDS_LF = 'baseboards_lf', // LF x rate (depends on walls)
}

/**
 * Window size factor for pricing
 * painting-algo.md L67
 */
export enum WindowSize {
  STANDARD = 1, // Base price ($70)
  LARGE = 2, // Double base ($140)
}

/**
 * Line item categories for breakdown display
 */
export enum LineItemCategory {
  WALLS = 'walls',
  CEILING = 'ceiling',
  TRIM = 'trim',
  DOORS = 'doors',
  CLOSETS = 'closets',
  WINDOWS = 'windows',
  ACCENT_WALLS = 'accent_walls',
  CROWN_MOLDING = 'crown_molding',
  SCAFFOLDING = 'scaffolding',
  ADDITIONAL_COLORS = 'additional_colors',
  WALLPAPER_REMOVAL = 'wallpaper_removal',
  PAINT_OPTIONS = 'paint_options',
  SETUP_FEE = 'setup_fee',
}

// ============================================================
// INPUT TYPES
// ============================================================

/**
 * Window input for pricing calculation
 */
export interface WindowInput {
  sizeFactor: WindowSize | number; // 1 = standard ($70), 2 = large ($140)
}

/**
 * Room input for interior estimate
 * All the data needed to calculate a single room
 */
export interface RoomInput {
  id: string;
  name: string;
  floorSqft: number; // Floor square footage (used for wall calculation)
  roomType: RoomType;

  // Paint scope
  paintWalls: boolean;
  paintCeiling: boolean;
  vaulted: boolean; // Adds 0.5 to wall multiplier

  // Trim options
  trimMode: TrimMode;
  baseboardLF: number; // Linear feet of baseboards (used when trimMode = BASEBOARDS_LF)
  stainedTrimConversion: boolean; // 3x multiplier for stained to painted

  // Crown molding
  crownMoldingLF: number; // Linear feet of crown molding

  // Line items
  doorSides: number; // Number of door sides to paint
  closetsStandard: number; // Number of standard closets
  closetsWalkIn: number; // Number of walk-in closets
  windows: WindowInput[]; // Array of windows with size factors

  // Accent walls
  accentWallsInRoom: number; // Accent walls in rooms being painted
  accentWallsStandalone: number; // Accent walls in rooms NOT being painted

  // Special conditions
  needsScaffolding: boolean; // Great room requiring scaffolding
  wallpaperRemovalSqft: number; // Square feet of wallpaper to remove
}

/**
 * Job-level options for interior estimate
 */
export interface InteriorJobInput {
  rooms: RoomInput[];
  numWallColors: number; // 1 = no charge, 2+ = $134 each additional
  customerSuppliesPaint: boolean; // 15% deduction
  premiumPaint: boolean; // $200 upcharge
}

// ============================================================
// OUTPUT TYPES
// ============================================================

/**
 * A single line item in the breakdown
 */
export interface LineItem {
  category: LineItemCategory;
  name: string;
  basis: string; // e.g., "200 sqft x 2.8"
  cost: number;
  roomId: string | null; // null for job-level items
  roomName?: string;
}

/**
 * Calculation result for a single component
 */
export interface CalculationResult {
  cost: number;
  basis: string;
}

/**
 * Extended result for wall calculations
 */
export interface WallCalculationResult extends CalculationResult {
  multiplier: number;
  minimumApplied: boolean;
}

/**
 * Extended result for ceiling calculations
 */
export interface CeilingCalculationResult extends CalculationResult {
  multiplier: number;
}

/**
 * Extended result for additional colors
 */
export interface AdditionalColorsResult extends CalculationResult {
  extraColors: number;
}

/**
 * Extended result for setup fee
 */
export interface SetupFeeResult {
  fee: number;
  basis: string;
}

/**
 * Result for a single room calculation
 */
export interface RoomResult {
  roomId: string;
  roomName: string;
  lineItems: LineItem[];
  roomTotal: number;
}

/**
 * Complete estimate result
 */
export interface EstimateResult {
  rooms: RoomResult[];
  lineItems: LineItem[]; // All line items (room + job level)
  subtotal: number; // Before setup fee
  setupFee: number;
  total: number;
  roomCount: number;
  warnings: string[]; // Any validation warnings
}

// ============================================================
// STATE TYPES (for React hooks)
// ============================================================

/**
 * Default values for a new room
 */
export const DEFAULT_ROOM: Omit<RoomInput, 'id' | 'name'> = {
  floorSqft: 0,
  roomType: RoomType.GENERAL,
  paintWalls: true,
  paintCeiling: false,
  vaulted: false,
  trimMode: TrimMode.NONE,
  baseboardLF: 0,
  stainedTrimConversion: false,
  crownMoldingLF: 0,
  doorSides: 0,
  closetsStandard: 0,
  closetsWalkIn: 0,
  windows: [],
  accentWallsInRoom: 0,
  accentWallsStandalone: 0,
  needsScaffolding: false,
  wallpaperRemovalSqft: 0,
};

/**
 * Create a new room with defaults
 */
export function createRoom(
  name: string = 'New Room',
  overrides: Partial<RoomInput> = {}
): RoomInput {
  return {
    id: crypto.randomUUID(),
    name,
    ...DEFAULT_ROOM,
    ...overrides,
  };
}

/**
 * Estimate state for React hooks
 */
export interface EstimateState {
  rooms: RoomInput[];
  numWallColors: number;
  customerSuppliesPaint: boolean;
  premiumPaint: boolean;
  jobName: string;
  estimatorName: string;
}

/**
 * Default estimate state
 */
export const DEFAULT_ESTIMATE_STATE: EstimateState = {
  rooms: [],
  numWallColors: 1,
  customerSuppliesPaint: false,
  premiumPaint: false,
  jobName: '',
  estimatorName: '',
};
