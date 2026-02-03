/**
 * Calculator types for EstimationCalc
 * Phase 1.1: Interior painting calculations
 */

export interface RoomDimensions {
  length: number; // feet
  width: number; // feet
  height: number; // feet (wall height)
}

export interface RoomFeatures {
  doorsStandard: number;
  doorsDouble: number;
  doorsSliding: number;
  windowsSmall: number;
  windowsMedium: number;
  windowsLarge: number;
  closets: number;
}

export type RoomType =
  | 'standard'
  | 'kitchen'
  | 'bathroom'
  | 'laundry'
  | 'garage'
  | 'hallway'
  | 'stairwell';

export type PaintableArea = 'walls' | 'ceiling' | 'trim' | 'doors' | 'windows';

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  dimensions: RoomDimensions;
  features: RoomFeatures;
  selectedAreas: PaintableArea[];
  coatCount: number;
}

export interface PricingResult {
  subtotal: number;
  laborCost: number;
  materialCost: number;
  setupCleanup: number;
  total: number;
  breakdown: LineItem[];
}

export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Estimate {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  customerName?: string;
  projectAddress?: string;
  rooms: Room[];
  pricing: PricingResult;
  notes?: string;
}
