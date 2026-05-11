import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CalculationResult } from '@/lib/types';

interface ResultsPanelProps {
  result: CalculationResult;
}

export function ResultsPanel({ result }: ResultsPanelProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Plocha terasy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{result.area.toFixed(2)} m²</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Rost - hranoly</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Roztec hranolu:</span>
            <span className="font-medium">{result.rost.beamSpacing} mm</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pocet rad:</span>
            <span className="font-medium">{result.rost.beamRows.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pocet hranolu (4m):</span>
            <span className="font-medium">{result.rost.beamCount4m} ks</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">S rezervou (+5%):</span>
            <span className="font-bold">{result.rost.beamCount4mWithReserve} ks</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Celkem metru:</span>
            <span className="font-medium">{(result.rost.beamCount4mWithReserve * 4).toFixed(1)} m</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Dlazdice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pocet dlazdic:</span>
            <span className="font-bold">{result.rost.tileCount} ks</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Roztec stredů:</span>
            <span className="font-medium">100 cm</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Terasova prkna</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pocet prken (4m):</span>
            <span className="font-medium">{result.planks.plankCount4m} ks</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">S rezervou (+5%):</span>
            <span className="font-bold">{result.planks.plankCount4mWithReserve} ks</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Celkem metru:</span>
            <span className="font-medium">{(result.planks.plankCount4mWithReserve * 4).toFixed(1)} m</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Celkova plocha:</span>
            <span className="font-medium">{result.planks.totalArea.toFixed(2)} m²</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Vruty</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pocet vrutu:</span>
            <span className="font-medium">{result.planks.screwCount} ks</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">S rezervou (+5%):</span>
            <span className="font-bold">{result.planks.screwCountWithReserve} ks</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            2 vruty na kazdy spoj prkna s hranolem
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
