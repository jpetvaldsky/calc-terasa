export interface TerraceInput {
  length: number; // cm - horizontal (X axis)
  heightA: number; // cm - vertical left side (Y axis)
  heightB: number; // cm - vertical right side (Y axis)
  plankWidth: number; // mm
  plankThickness: number; // mm
  tileSize: 30 | 40; // cm
}

export interface BeamRow {
  position: number; // mm from start
  length: number; // mm - varies for trapezoid
  tiles: TilePosition[];
}

export interface TilePosition {
  x: number; // mm
  y: number; // mm
}

export interface PlankRow {
  position: number; // mm from left edge
  segments: PlankSegment[];
  totalLength: number; // mm
}

export interface PlankSegment {
  length: number; // mm
  isFullPlank: boolean;
}

export interface RostResult {
  beamRows: BeamRow[];
  totalBeamLength: number; // mm
  beamCount4m: number; // count of 4m beams needed
  beamCount4mWithReserve: number;
  totalMeters: number; // total meters
  tileCount: number;
  beamSpacing: number; // mm
}

export interface PlankResult {
  plankRows: PlankRow[];
  totalPlankLength: number; // mm
  plankCount4m: number;
  plankCount4mWithReserve: number;
  totalMeters: number;
  totalArea: number; // m2
  screwCount: number;
  screwCountWithReserve: number;
}

export interface CalculationResult {
  area: number; // m2
  rost: RostResult;
  planks: PlankResult;
}

export interface PriceInput {
  beamPricePerMeter: number;
  plankPriceMode: 'meter' | 'sqm';
  plankPricePerMeter: number;
  plankPricePerSqm: number;
  screwPrice: number;
}

export interface PriceResult {
  beamTotal: number;
  plankTotal: number;
  screwTotal: number;
  grandTotal: number;
}
