import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InputForm } from '@/components/InputForm';
import { ResultsPanel } from '@/components/ResultsPanel';
import { RostVisualization } from '@/components/RostVisualization';
import { PrkenVisualization } from '@/components/PrkenVisualization';
import { PriceCalculator } from '@/components/PriceCalculator';
import { calculateTerrace } from '@/lib/calculations';
import type { TerraceInput, CalculationResult } from '@/lib/types';
import './index.css';

const defaultInput: TerraceInput = {
  length: 1200, // 12m horizontal (X)
  heightA: 500, // 5m left side (Y)
  heightB: 350, // 3.5m right side (Y)
  plankWidth: 140,
  plankThickness: 18,
  tileSize: 30,
};

function App() {
  const [input, setInput] = useState<TerraceInput>(defaultInput);
  const [result, setResult] = useState<CalculationResult | null>(null);

  useEffect(() => {
    if (input.length > 0 && input.heightA > 0 && input.heightB > 0 && input.plankWidth > 0) {
      const newResult = calculateTerrace(input);
      setResult(newResult);
    }
  }, [input]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Kalkulacka terasoveho materialu</h1>
          <p className="text-muted-foreground mt-2">
            Vypocet materialu a ceny drevene terasy ve tvaru lichobeznika
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
          <aside>
            <InputForm input={input} onChange={setInput} />
          </aside>

          <main className="space-y-8">
            {result && (
              <>
                <ResultsPanel result={result} />

                <Tabs defaultValue="rost" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="rost">Vizualizace rostu</TabsTrigger>
                    <TabsTrigger value="prkna">Vizualizace prken</TabsTrigger>
                    <TabsTrigger value="cena">Cenova kalkulace</TabsTrigger>
                  </TabsList>
                  <TabsContent value="rost">
                    <RostVisualization input={input} rost={result.rost} />
                  </TabsContent>
                  <TabsContent value="prkna">
                    <PrkenVisualization
                      input={input}
                      planks={result.planks}
                      rost={result.rost}
                    />
                  </TabsContent>
                  <TabsContent value="cena">
                    <PriceCalculator result={result} />
                  </TabsContent>
                </Tabs>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
