import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TerraceInput } from '@/lib/types';

interface InputFormProps {
  input: TerraceInput;
  onChange: (input: TerraceInput) => void;
}

export function InputForm({ input, onChange }: InputFormProps) {
  const handleChange = (field: keyof TerraceInput, value: number) => {
    onChange({ ...input, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Parametry terasy</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="length">Delka terasy (cm)</Label>
            <Input
              id="length"
              type="number"
              min={1}
              value={input.length}
              onChange={(e) => handleChange('length', Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">Horizontalni rozmer (X)</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tileSize">Velikost dlazdice (cm)</Label>
            <Select
              value={String(input.tileSize)}
              onValueChange={(value) => handleChange('tileSize', Number(value) as 30 | 40)}
            >
              <SelectTrigger id="tileSize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30x30 cm</SelectItem>
                <SelectItem value="40">40x40 cm</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="heightA">Vyska terasy A (cm)</Label>
            <Input
              id="heightA"
              type="number"
              min={1}
              value={input.heightA}
              onChange={(e) => handleChange('heightA', Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">Leva strana (Y)</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="heightB">Vyska terasy B (cm)</Label>
            <Input
              id="heightB"
              type="number"
              min={1}
              value={input.heightB}
              onChange={(e) => handleChange('heightB', Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">Prava strana (Y)</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="plankWidth">Sirka prkna (mm)</Label>
            <Input
              id="plankWidth"
              type="number"
              min={1}
              value={input.plankWidth}
              onChange={(e) => handleChange('plankWidth', Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="plankThickness">Tloustka prkna (mm)</Label>
            <Input
              id="plankThickness"
              type="number"
              min={1}
              value={input.plankThickness}
              onChange={(e) => handleChange('plankThickness', Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              {input.plankThickness <= 18
                ? 'Roztec hranolu: 450mm'
                : 'Roztec hranolu: 500mm'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
