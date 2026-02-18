"use client";

import { Label } from '@/components/ui/label';
import { FAVICON_SIZES } from './lib/constants';

interface SizeSelectorProps {
  selectedSizes: string[];
  onChange: (sizes: string[]) => void;
  idPrefix?: string;
}

export function SizeSelector({ selectedSizes, onChange, idPrefix = 'size' }: SizeSelectorProps) {
  const toggle = (sizeStr: string, checked: boolean) => {
    onChange(
      checked
        ? [...selectedSizes, sizeStr]
        : selectedSizes.filter((s) => s !== sizeStr)
    );
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Select Sizes</Label>
      <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
        {FAVICON_SIZES.map((size) => (
          <div key={size.size} className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={`${idPrefix}-${size.size}`}
              checked={selectedSizes.includes(size.size.toString())}
              onChange={(e) => toggle(size.size.toString(), e.target.checked)}
              className="rounded"
            />
            <Label htmlFor={`${idPrefix}-${size.size}`} className="text-sm cursor-pointer">
              {size.size}×{size.size}px — {size.name} ({size.filename})
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
