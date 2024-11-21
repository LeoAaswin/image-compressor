"use client";

import { IMAGE_FORMATS } from "@/lib/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface FormatSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function FormatSelector({
  value,
  onChange,
  disabled
}: FormatSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Output Format</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.values(IMAGE_FORMATS).map((format) => (
            <SelectItem key={format.id} value={format.id}>
              {format.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}