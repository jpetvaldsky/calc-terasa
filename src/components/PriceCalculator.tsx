import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CalculationResult, PriceInput, PriceResult } from '@/lib/types';
import { calculatePrice } from '@/lib/calculations';

interface PriceCalculatorProps {
  result: CalculationResult;
}

export function PriceCalculator({ result }: PriceCalculatorProps) {
  const [priceInput, setPriceInput] = useState<PriceInput>({
    beamPricePerMeter: 0,
    plankPriceMode: 'meter',
    plankPricePerMeter: 0,
    plankPricePerSqm: 0,
    screwPrice: 0,
  });

  const [priceResult, setPriceResult] = useState<PriceResult>({
    beamTotal: 0,
    plankTotal: 0,
    screwTotal: 0,
    grandTotal: 0,
  });

  useEffect(() => {
    const newPriceResult = calculatePrice(result, priceInput);
    setPriceResult(newPriceResult);
  }, [result, priceInput]);

  const handleChange = (field: keyof PriceInput, value: number | string) => {
    setPriceInput((prev) => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cenova kalkulace</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Beam price */}
        <div className="space-y-2">
          <Label htmlFor="beamPrice">Cena hranolu (Kc/bm)</Label>
          <div className="flex items-center gap-4">
            <Input
              id="beamPrice"
              type="number"
              min={0}
              step={0.1}
              value={priceInput.beamPricePerMeter || ''}
              onChange={(e) => handleChange('beamPricePerMeter', Number(e.target.value))}
              className="w-32"
            />
            <span className="text-sm text-muted-foreground">
              {result.rost.beamCount4mWithReserve * 4} bm
            </span>
            <span className="font-medium">{formatCurrency(priceResult.beamTotal)}</span>
          </div>
        </div>

        {/* Plank price */}
        <div className="space-y-2">
          <Label>Cena prken</Label>
          <div className="flex flex-wrap items-center gap-4">
            <Select
              value={priceInput.plankPriceMode}
              onValueChange={(value) =>
                handleChange('plankPriceMode', value as 'meter' | 'sqm')
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="meter">Za bezny metr</SelectItem>
                <SelectItem value="sqm">Za m²</SelectItem>
              </SelectContent>
            </Select>

            {priceInput.plankPriceMode === 'meter' ? (
              <>
                <Input
                  type="number"
                  min={0}
                  step={0.1}
                  value={priceInput.plankPricePerMeter || ''}
                  onChange={(e) => handleChange('plankPricePerMeter', Number(e.target.value))}
                  className="w-32"
                  placeholder="Kc/bm"
                />
                <span className="text-sm text-muted-foreground">
                  {result.planks.plankCount4mWithReserve * 4} bm
                </span>
              </>
            ) : (
              <>
                <Input
                  type="number"
                  min={0}
                  step={0.1}
                  value={priceInput.plankPricePerSqm || ''}
                  onChange={(e) => handleChange('plankPricePerSqm', Number(e.target.value))}
                  className="w-32"
                  placeholder="Kc/m²"
                />
                <span className="text-sm text-muted-foreground">
                  {result.planks.totalArea.toFixed(2)} m²
                </span>
              </>
            )}
            <span className="font-medium">{formatCurrency(priceResult.plankTotal)}</span>
          </div>
        </div>

        {/* Screw price */}
        <div className="space-y-2">
          <Label htmlFor="screwPrice">Cena vrutu (Kc/ks)</Label>
          <div className="flex items-center gap-4">
            <Input
              id="screwPrice"
              type="number"
              min={0}
              step={0.01}
              value={priceInput.screwPrice || ''}
              onChange={(e) => handleChange('screwPrice', Number(e.target.value))}
              className="w-32"
            />
            <span className="text-sm text-muted-foreground">
              {result.planks.screwCountWithReserve} ks
            </span>
            <span className="font-medium">{formatCurrency(priceResult.screwTotal)}</span>
          </div>
        </div>

        {/* Total */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Celkem:</span>
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(priceResult.grandTotal)}
            </span>
          </div>
          <div className="mt-2 text-sm text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Hranoly:</span>
              <span>{formatCurrency(priceResult.beamTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Prkna:</span>
              <span>{formatCurrency(priceResult.plankTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Vruty:</span>
              <span>{formatCurrency(priceResult.screwTotal)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
