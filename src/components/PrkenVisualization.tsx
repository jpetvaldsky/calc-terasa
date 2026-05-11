import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TerraceInput, PlankResult, RostResult } from '@/lib/types';

interface PrkenVisualizationProps {
  input: TerraceInput;
  planks: PlankResult;
  rost: RostResult;
}

export function PrkenVisualization({ input, planks, rost }: PrkenVisualizationProps) {
  const lengthMm = input.length * 10;
  const heightAMm = input.heightA * 10;
  const heightBMm = input.heightB * 10;
  const maxHeight = Math.max(heightAMm, heightBMm);

  const viewWidth = 700;
  const viewHeight = 450;
  const padding = 40;

  const scale = Math.min(
    (viewWidth - padding * 2) / lengthMm,
    (viewHeight - padding * 2) / maxHeight
  );

  const scaledLength = lengthMm * scale;
  const scaledHeightA = heightAMm * scale;
  const scaledHeightB = heightBMm * scale;

  const offsetX = padding;
  const offsetY = padding;

  // Colors for segments - alternate between full and cut planks
  const fullPlankColor = '#a3e635';
  const cutPlankColor = '#84cc16';

  const scaledPlankWidth = Math.max(input.plankWidth * scale, 2);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vizualizace prken</CardTitle>
      </CardHeader>
      <CardContent>
        <svg
          viewBox={`0 0 ${viewWidth} ${viewHeight}`}
          className="w-full border rounded-lg bg-slate-50"
          style={{ maxHeight: '550px' }}
        >
          {/* Clip path for trapezoid */}
          <defs>
            <clipPath id="terraceClip">
              <path
                d={`
                  M ${offsetX} ${offsetY}
                  L ${offsetX + scaledLength} ${offsetY}
                  L ${offsetX + scaledLength} ${offsetY + scaledHeightB}
                  L ${offsetX} ${offsetY + scaledHeightA}
                  Z
                `}
              />
            </clipPath>
          </defs>

          {/* Beam positions (horizontal lines) - draw first as background */}
          {rost.beamRows.map((beam, index) => {
            const y = offsetY + beam.position * scale;

            let beamStartX = offsetX;
            let beamEndX = offsetX + scaledLength;

            if (beam.position > heightAMm && heightAMm < heightBMm) {
              const ratio = (beam.position - heightAMm) / (heightBMm - heightAMm);
              beamStartX = offsetX + ratio * scaledLength;
            }
            if (beam.position > heightBMm && heightBMm < heightAMm) {
              const ratio = (beam.position - heightBMm) / (heightAMm - heightBMm);
              beamEndX = offsetX + scaledLength - ratio * scaledLength;
            }

            return (
              <line
                key={`beam-bg-${index}`}
                x1={beamStartX}
                y1={y}
                x2={beamEndX}
                y2={y}
                stroke="#78350f"
                strokeWidth="3"
                opacity="0.3"
              />
            );
          })}

          {/* Planks (vertical rectangles) */}
          <g clipPath="url(#terraceClip)">
            {planks.plankRows.map((plank, plankIndex) => {
              const x = offsetX + plank.position * scale;
              let segmentY = offsetY;

              return (
                <g key={`plank-${plankIndex}`}>
                  {plank.segments.map((segment, segIndex) => {
                    const segmentHeight = segment.length * scale;
                    const y = segmentY;
                    segmentY += segmentHeight;

                    const color = segment.isFullPlank ? fullPlankColor : cutPlankColor;

                    return (
                      <g key={`segment-${plankIndex}-${segIndex}`}>
                        {/* Plank segment */}
                        <rect
                          x={x}
                          y={y}
                          width={scaledPlankWidth}
                          height={segmentHeight}
                          fill={color}
                          stroke="#65a30d"
                          strokeWidth="0.5"
                        />
                        {/* Joint line (between segments) */}
                        {segIndex > 0 && (
                          <line
                            x1={x}
                            y1={y}
                            x2={x + scaledPlankWidth}
                            y2={y}
                            stroke="#dc2626"
                            strokeWidth="2"
                          />
                        )}
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </g>

          {/* Terrace outline */}
          <path
            d={`
              M ${offsetX} ${offsetY}
              L ${offsetX + scaledLength} ${offsetY}
              L ${offsetX + scaledLength} ${offsetY + scaledHeightB}
              L ${offsetX} ${offsetY + scaledHeightA}
              Z
            `}
            fill="none"
            stroke="#334155"
            strokeWidth="2"
          />

          {/* Legend */}
          <g transform={`translate(10, ${viewHeight - 55})`}>
            <rect x="0" y="0" width="10" height="20" fill={fullPlankColor} stroke="#65a30d" />
            <text x="15" y="14" fontSize="10" fill="#334155">
              Cele prkno (4m)
            </text>

            <rect x="110" y="0" width="10" height="20" fill={cutPlankColor} stroke="#65a30d" />
            <text x="125" y="14" fontSize="10" fill="#334155">
              Rezane prkno
            </text>

            <line x1="220" y1="10" x2="240" y2="10" stroke="#dc2626" strokeWidth="2" />
            <text x="245" y="14" fontSize="10" fill="#334155">
              Spoj (na hranolu)
            </text>

            <line x1="350" y1="10" x2="380" y2="10" stroke="#78350f" strokeWidth="3" opacity="0.3" />
            <text x="385" y="14" fontSize="10" fill="#334155">
              Hranol
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

        <div className="mt-4 text-sm text-muted-foreground space-y-1">
          <p>Prkna jsou osazena vertikalne (sirka {input.plankWidth} mm, mezera 10 mm)</p>
          <p>Spoje prken jsou vzdy na hranolu (roztec {rost.beamSpacing} mm)</p>
          <p>Deleni prken: rovnomerne rozlozeni s minimalnim prorezem</p>
        </div>
      </CardContent>
    </Card>
  );
}
