import type {
  TerraceInput,
  CalculationResult,
  RostResult,
  PlankResult,
  BeamRow,
  PlankRow,
  PlankSegment,
  TilePosition,
  PriceInput,
  PriceResult,
} from './types';

const BEAM_LENGTH_MM = 4000; // 4 meters standard plank/beam length
const TILE_SPACING_MM = 1000; // 100 cm between tile centers
const PLANK_GAP_MM = 10; // 1 cm gap between planks
const SCREWS_PER_JOINT = 2;
const RESERVE_PERCENT = 0.05; // 5%

/**
 * Calculate beam spacing based on plank thickness
 */
export function getBeamSpacing(plankThickness: number): number {
  return plankThickness <= 18 ? 450 : 500;
}

/**
 * Get all beam positions (Y coordinates) for given parameters
 */
export function getBeamPositions(maxHeight: number, beamSpacing: number): number[] {
  const positions: number[] = [];
  let pos = 0;
  while (pos <= maxHeight) {
    positions.push(pos);
    pos += beamSpacing;
  }
  // Add final beam at maxHeight if not already there
  if (positions[positions.length - 1] < maxHeight) {
    positions.push(maxHeight);
  }
  return positions;
}

/**
 * Calculate terrace area (trapezoid formula)
 */
export function calculateArea(input: TerraceInput): number {
  const areaInCm2 = ((input.heightA + input.heightB) / 2) * input.length;
  return areaInCm2 / 10000; // convert to m2
}

/**
 * Calculate rost (substructure) - beams and tiles
 * Beams are HORIZONTAL (X direction), spaced along Y (height)
 */
export function calculateRost(input: TerraceInput): RostResult {
  const lengthMm = input.length * 10;
  const heightAMm = input.heightA * 10;
  const heightBMm = input.heightB * 10;
  const maxHeight = Math.max(heightAMm, heightBMm);

  const beamSpacing = getBeamSpacing(input.plankThickness);
  const beamPositions = getBeamPositions(maxHeight, beamSpacing);

  const beamRows: BeamRow[] = [];
  let totalBeamLength = 0;
  let totalTileCount = 0;

  for (const yPosition of beamPositions) {
    // Calculate beam extent based on trapezoid shape
    let beamStartX = 0;
    let beamEndX = lengthMm;

    // Diagonal bottom edge: from (0, heightA) to (length, heightB)
    if (heightAMm !== heightBMm) {
      if (yPosition > heightAMm && heightAMm < heightBMm) {
        // Left side is shorter, beam starts further right
        const ratio = (yPosition - heightAMm) / (heightBMm - heightAMm);
        beamStartX = ratio * lengthMm;
      }
      if (yPosition > heightBMm && heightBMm < heightAMm) {
        // Right side is shorter, beam ends earlier
        const ratio = (yPosition - heightBMm) / (heightAMm - heightBMm);
        beamEndX = lengthMm - ratio * lengthMm;
      }
    }

    // Skip if beam is outside trapezoid
    if (yPosition > heightAMm && yPosition > heightBMm) continue;

    const beamLength = Math.max(0, beamEndX - beamStartX);
    if (beamLength <= 0) continue;

    // Calculate tiles for this beam
    const tileCount = Math.ceil(beamLength / TILE_SPACING_MM) + 1;
    const tiles: TilePosition[] = [];

    for (let j = 0; j < tileCount; j++) {
      const tileX = beamStartX + Math.min(j * TILE_SPACING_MM, beamLength);
      tiles.push({
        x: tileX,
        y: yPosition,
      });
    }

    beamRows.push({
      position: yPosition,
      length: beamLength,
      tiles,
    });

    totalBeamLength += beamLength;
    totalTileCount += tiles.length;
  }

  const totalMeters = totalBeamLength / 1000;
  const beamCount4m = Math.ceil(totalBeamLength / BEAM_LENGTH_MM);
  const beamCount4mWithReserve = Math.ceil(beamCount4m * (1 + RESERVE_PERCENT));

  return {
    beamRows,
    totalBeamLength,
    beamCount4m,
    beamCount4mWithReserve,
    totalMeters,
    tileCount: totalTileCount,
    beamSpacing,
  };
}

/**
 * Calculate optimal plank segments for a given column height
 * Joints must be on beam positions, minimize waste, distribute evenly
 */
function calculateOptimalPlankSegments(
  columnHeight: number,
  beamSpacing: number,
  plankLength: number = BEAM_LENGTH_MM
): PlankSegment[] {
  // If column fits in one plank, no joints needed
  if (columnHeight <= plankLength) {
    return [{
      length: columnHeight,
      isFullPlank: columnHeight === plankLength,
    }];
  }

  // Get beam positions within this column
  const beamPositions = getBeamPositions(columnHeight, beamSpacing);

  // Find valid joint positions (beam positions where both segments would be <= plankLength)
  const validJoints: number[] = [];
  for (const pos of beamPositions) {
    if (pos > 0 && pos < columnHeight) {
      // Check if this creates valid segments
      const segment1 = pos;
      const segment2 = columnHeight - pos;
      if (segment1 <= plankLength && segment2 <= plankLength) {
        validJoints.push(pos);
      }
    }
  }

  // If we need more than one joint (column > 2 * plankLength)
  if (validJoints.length === 0) {
    // Need multiple joints - find recursive solution
    return calculateMultiJointSegments(columnHeight, beamSpacing, plankLength);
  }

  // Find the joint closest to the center for even distribution
  const centerPoint = columnHeight / 2;
  let bestJoint = validJoints[0];
  let minDistance = Math.abs(validJoints[0] - centerPoint);

  for (const joint of validJoints) {
    const distance = Math.abs(joint - centerPoint);
    if (distance < minDistance) {
      minDistance = distance;
      bestJoint = joint;
    }
  }

  // Create two segments
  const segment1Length = bestJoint;
  const segment2Length = columnHeight - bestJoint;

  return [
    {
      length: segment1Length,
      isFullPlank: segment1Length === plankLength,
    },
    {
      length: segment2Length,
      isFullPlank: segment2Length === plankLength,
    },
  ];
}

/**
 * Handle columns that need more than one joint (height > 8m)
 */
function calculateMultiJointSegments(
  columnHeight: number,
  beamSpacing: number,
  plankLength: number
): PlankSegment[] {
  const segments: PlankSegment[] = [];
  let remaining = columnHeight;

  // Get all beam positions
  const beamPositions = getBeamPositions(columnHeight, beamSpacing);

  while (remaining > 0) {
    if (remaining <= plankLength) {
      // Last segment
      segments.push({
        length: remaining,
        isFullPlank: remaining === plankLength,
      });
      remaining = 0;
    } else {
      // Find best joint position for this segment
      // We want to use as much of the plank as possible while landing on a beam
      const currentStart = columnHeight - remaining;

      // Find beam positions that are within plankLength from current start
      let bestSegmentLength = 0;
      for (const beamPos of beamPositions) {
        const segmentLength = beamPos - currentStart;
        if (segmentLength > 0 && segmentLength <= plankLength) {
          if (segmentLength > bestSegmentLength) {
            bestSegmentLength = segmentLength;
          }
        }
      }

      if (bestSegmentLength === 0) {
        // Fallback: use full plank length (shouldn't happen with proper beam spacing)
        bestSegmentLength = Math.min(plankLength, remaining);
      }

      segments.push({
        length: bestSegmentLength,
        isFullPlank: bestSegmentLength === plankLength,
      });
      remaining -= bestSegmentLength;
    }
  }

  return segments;
}

/**
 * Calculate planks layout
 * Planks are VERTICAL (Y direction), spaced along X (length)
 */
export function calculatePlanks(input: TerraceInput): PlankResult {
  const lengthMm = input.length * 10;
  const heightAMm = input.heightA * 10;
  const heightBMm = input.heightB * 10;
  const plankWidthMm = input.plankWidth;
  const effectivePlankWidth = plankWidthMm + PLANK_GAP_MM;
  const beamSpacing = getBeamSpacing(input.plankThickness);

  const plankColumnCount = Math.ceil(lengthMm / effectivePlankWidth);

  const plankRows: PlankRow[] = [];
  let totalPlankLength = 0;
  let screwCount = 0;

  for (let i = 0; i < plankColumnCount; i++) {
    const xPosition = i * effectivePlankWidth;

    if (xPosition >= lengthMm) continue;

    // Calculate plank height at this X position (linear interpolation)
    const ratio = xPosition / lengthMm;
    const plankHeight = heightAMm + (heightBMm - heightAMm) * ratio;

    if (plankHeight <= 0) continue;

    // Calculate optimal segments with joints on beams
    const segments = calculateOptimalPlankSegments(plankHeight, beamSpacing);

    plankRows.push({
      position: xPosition,
      segments,
      totalLength: plankHeight,
    });

    totalPlankLength += plankHeight;

    // Screws: 2 per joint with each beam this plank crosses
    // Count beams that this plank actually crosses
    const beamsCrossed = Math.ceil(plankHeight / beamSpacing) + 1;
    screwCount += beamsCrossed * SCREWS_PER_JOINT;
  }

  const totalMeters = totalPlankLength / 1000;
  const plankCount4m = Math.ceil(totalPlankLength / BEAM_LENGTH_MM);
  const plankCount4mWithReserve = Math.ceil(plankCount4m * (1 + RESERVE_PERCENT));

  const totalArea = (totalMeters * input.plankWidth) / 1000;

  const screwCountWithReserve = Math.ceil(screwCount * (1 + RESERVE_PERCENT));

  return {
    plankRows,
    totalPlankLength,
    plankCount4m,
    plankCount4mWithReserve,
    totalMeters,
    totalArea,
    screwCount,
    screwCountWithReserve,
  };
}

/**
 * Main calculation function
 */
export function calculateTerrace(input: TerraceInput): CalculationResult {
  const area = calculateArea(input);
  const rost = calculateRost(input);
  const planks = calculatePlanks(input);

  return {
    area,
    rost,
    planks,
  };
}

/**
 * Calculate prices
 */
export function calculatePrice(
  result: CalculationResult,
  priceInput: PriceInput
): PriceResult {
  const beamTotal = result.rost.beamCount4mWithReserve * 4 * priceInput.beamPricePerMeter;

  let plankTotal: number;
  if (priceInput.plankPriceMode === 'meter') {
    plankTotal = result.planks.plankCount4mWithReserve * 4 * priceInput.plankPricePerMeter;
  } else {
    plankTotal = result.planks.totalArea * priceInput.plankPricePerSqm;
  }

  const screwTotal = result.planks.screwCountWithReserve * priceInput.screwPrice;

  return {
    beamTotal,
    plankTotal,
    screwTotal,
    grandTotal: beamTotal + plankTotal + screwTotal,
  };
}
