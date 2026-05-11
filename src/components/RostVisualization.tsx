import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TerraceInput, RostResult } from '@/lib/types';

interface RostVisualizationProps {
  input: TerraceInput;
  rost: RostResult;
}

export function RostVisualization({ input, rost }: RostVisualizationProps) {
  const lengthMm = input.length * 10; // X axis (horizontal)
  const heightAMm = input.heightA * 10; // Y axis left side
  const heightBMm = input.heightB * 10; // Y axis right side
  const maxHeight = Math.max(heightAMm, heightBMm);

  // Calculate scale to fit in view
  const viewWidth = 700;
  const viewHeight = 400;
  const padding = 40;

  const scale = Math.min(
    (viewWidth - padding * 2) / lengthMm,
    (viewHeight - padding * 2) / maxHeight
  );

  const scaledLength = lengthMm * scale;
  const scaledHeightA = heightAMm * scale;
  const scaledHeightB = heightBMm * scale;

  // Position trapezoid
  const offsetX = padding;
  const offsetY = padding;

  // Create trapezoid path
  // Top: (0,0) to (length, 0)
  // Right: (length, 0) to (length, heightB)
  // Bottom: (length, heightB) to (0, heightA) - diagonal if heights differ
  // Left: (0, heightA) to (0, 0)
  const trapezoidPath = `
    M ${offsetX} ${offsetY}
    L ${offsetX + scaledLength} ${offsetY}
    L ${offsetX + scaledLength} ${offsetY + scaledHeightB}
    L ${offsetX} ${offsetY + scaledHeightA}
    Z
  `;

  const tileSizeMm = input.tileSize * 10;
  const scaledTileSize = tileSizeMm * scale;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vizualizace rostu (hranoly + dlazdice)</CardTitle>
      </CardHeader>
      <CardContent>
        <svg
          viewBox={`0 0 ${viewWidth} ${viewHeight}`}
          className="w-full border rounded-lg bg-slate-50"
          style={{ maxHeight: '500px' }}
        >
          {/* Terrace outline */}
          <path
            d={trapezoidPath}
            fill="rgba(241, 245, 249, 0.5)"
            stroke="#94a3b8"
            strokeWidth="2"
            strokeDasharray="5,5"
          />

          {/* Beams (horizontal lines) and tiles */}
          {rost.beamRows.map((beam, index) => {
            const y = offsetY + beam.position * scale;

            // Calculate beam start and end X based on trapezoid shape
            let beamStartX = offsetX;
            let beamEndX = offsetX + scaledLength;

            // Adjust for trapezoid diagonal bottom edge
            if (beam.position > heightAMm && heightAMm < heightBMm) {
              // Beam starts further right due to diagonal
              const ratio = (beam.position - heightAMm) / (heightBMm - heightAMm);
              beamStartX = offsetX + ratio * scaledLength;
            }
            if (beam.position > heightBMm && heightBMm < heightAMm) {
              // Beam ends earlier due to diagonal
              const ratio = (beam.position - heightBMm) / (heightAMm - heightBMm);
              beamEndX = offsetX + scaledLength - ratio * scaledLength;
            }

            return (
              <g key={`beam-${index}`}>
                {/* Tiles under beam */}
                {beam.tiles.map((tile, tileIndex) => {
                  const tileX = offsetX + tile.x * scale - scaledTileSize / 2;
                  const tileY = y - scaledTileSize / 2;

                  return (
                    <rect
                      key={`tile-${index}-${tileIndex}`}
                      x={tileX}
                      y={tileY}
                      width={scaledTileSize}
                      height={scaledTileSize}
                      fill="#e2e8f0"
                      stroke="#64748b"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Beam line (horizontal) */}
                <line
                  x1={beamStartX}
                  y1={y}
                  x2={beamEndX}
                  y2={y}
                  stroke="#78350f"
                  strokeWidth="4"
                />
              </g>
            );
          })}

          {/* Legend */}
          <g transform={`translate(10, ${viewHeight - 50})`}>
            <rect x="0" y="0" width="20" height="4" fill="#78350f" />
            <text x="25" y="4" fontSize="10" fill="#334155">
              Hranol 50x70mm (horizontalne)
            </text>

            <rect x="200" y="-5" width="15" height="15" fill="#e2e8f0" stroke="#64748b" />
            <text x="220" y="4" fontSize="10" fill="#334155">
              Dlazdice {input.tileSize}x{input.tileSize}cm
            </text>
          </g>

          {/* Dimensions */}
          <text x={offsetX + scaledLength / 2} y={offsetY - 10} fontSize="11" fill="#64748b" textAnchor="middle">
            Delka: {input.length} cm
          </text>
          <text x={offsetX - 5} y={offsetY + scaledHeightA / 2} fontSize="11" fill="#64748b" textAnchor="end" dominantBaseline="middle">
            A: {input.heightA} cm
          </text>
          <text x={offsetX + scaledLength + 5} y={offsetY + scaledHeightB / 2} fontSize="11" fill="#64748b" textAnchor="start" dominantBaseline="middle">
            B: {input.heightB} cm
          </text>
        </svg>

        <div className="mt-4 text-sm text-muted-foreground">
          <p>Hranoly jsou osazeny horizontalne s rozteci {rost.beamSpacing} mm</p>
          <p>Dlazdice pod hranoly s rozteci 100 cm (od stredu ke stredu)</p>
        </div>
      </CardContent>
    </Card>
  );
}
