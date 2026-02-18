"use client";

import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface Preset {
  label: string;
  value: number;
}

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  presets?: Preset[];
  unit?: string;
  minLabel?: string;
  maxLabel?: string;
}

export function SliderControl({
  label, value, min, max, onChange,
  presets, unit = 'px', minLabel, maxLabel,
}: SliderControlProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>

      {presets && (
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <Button
              key={p.value}
              variant={value === p.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onChange(p.value)}
            >
              {p.label}
            </Button>
          ))}
        </div>
      )}

      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Custom</span>
          <span className="text-xs font-medium">{value}{unit}</span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
        />
        {(minLabel || maxLabel) && (
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{minLabel ?? min}</span>
            <span>{maxLabel ?? max}</span>
          </div>
        )}
      </div>
    </div>
  );
}
