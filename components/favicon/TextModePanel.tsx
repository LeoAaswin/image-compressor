"use client";

import Image from 'next/image';
import { Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ColorPicker } from './ColorPicker';
import { SliderControl } from './SliderControl';
import { SizeSelector } from './SizeSelector';
import { FONT_OPTIONS } from './lib/constants';
import { TextFaviconSettings } from './types';

interface TextModePanelProps {
  settings: TextFaviconSettings;
  textPreview: string | null;
  selectedSizes: string[];
  processing: boolean;
  onSettingChange: <K extends keyof TextFaviconSettings>(key: K, value: TextFaviconSettings[K]) => void;
  onSizesChange: (sizes: string[]) => void;
  onGenerate: () => void;
}

export function TextModePanel({
  settings, textPreview, selectedSizes, processing,
  onSettingChange, onSizesChange, onGenerate,
}: TextModePanelProps) {
  return (
    <div className="space-y-5">
      {/* Text + Font Size */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">Favicon Text</Label>
          <div className="flex items-center space-x-2 mt-2">
            <Input
              value={settings.faviconText}
              onChange={(e) => onSettingChange('faviconText', e.target.value)}
              placeholder="2-3 letters"
              maxLength={3}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onSettingChange('faviconText', settings.faviconText.slice(0, -1))}
              disabled={!settings.faviconText}
            >
              ←
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onSettingChange('faviconText', '')}
              disabled={!settings.faviconText}
            >
              Clear
            </Button>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {['A', 'B', 'C', 'OP', 'M', 'X', 'Y', 'Z', 'AB', 'CD'].map((preset) => (
              <Button
                key={preset}
                type="button"
                variant={settings.faviconText === preset ? 'default' : 'outline'}
                size="sm"
                onClick={() => onSettingChange('faviconText', preset)}
                className="h-6 px-2 text-xs"
              >
                {preset}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium">Font Size</Label>
          <div className="flex items-center space-x-2 mt-2">
            <Input
              type="range"
              value={settings.fontSize}
              onChange={(e) => onSettingChange('fontSize', parseInt(e.target.value))}
              min={16}
              max={300}
              className="flex-1"
            />
            <Input
              type="number"
              value={settings.fontSize}
              onChange={(e) => onSettingChange('fontSize', Math.max(16, Math.min(300, parseInt(e.target.value) || 32)))}
              min={16}
              max={300}
              className="w-20"
            />
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {[
              { label: 'Small', value: 16 },
              { label: 'Medium', value: 32 },
              { label: 'Large', value: 64 },
              { label: 'XL', value: 96 },
              { label: 'XXL', value: 128 },
              { label: 'MAX', value: 160 },
              { label: 'MEGA', value: 200 },
              { label: 'FULL', value: 250 },
              { label: 'GIANT', value: 300 },
            ].map((preset) => (
              <Button
                key={preset.label}
                type="button"
                variant={settings.fontSize === preset.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => onSettingChange('fontSize', preset.value)}
                className="h-6 px-2 text-xs"
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Font Family */}
      <div>
        <Label className="text-sm font-medium">Font Family</Label>
        <select
          value={settings.fontFamily}
          onChange={(e) => onSettingChange('fontFamily', e.target.value)}
          className="mt-2 w-full p-2 border rounded-md bg-background"
        >
          {FONT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Colors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ColorPicker label="Text Color" value={settings.textColor} onChange={(v) => onSettingChange('textColor', v)} />
        <ColorPicker label="Background Color" value={settings.backgroundColor} onChange={(v) => onSettingChange('backgroundColor', v)} />
        <ColorPicker label="Border Color" value={settings.borderColor} onChange={(v) => onSettingChange('borderColor', v)} />
      </div>

      {/* Border Width */}
      <SliderControl
        label="Border Width"
        value={settings.borderWidth}
        min={0}
        max={10}
        onChange={(v) => onSettingChange('borderWidth', v)}
        presets={[
          { label: 'None', value: 0 },
          { label: 'Thin', value: 2 },
          { label: 'Medium', value: 4 },
          { label: 'Thick', value: 8 },
        ]}
      />

      {/* Border Radius */}
      <SliderControl
        label="Border Radius"
        value={settings.borderRadius}
        min={0}
        max={50}
        onChange={(v) => onSettingChange('borderRadius', v)}
        presets={[
          { label: 'Square', value: 0 },
          { label: 'Slightly Rounded', value: 10 },
          { label: 'Rounded', value: 25 },
          { label: 'Very Rounded', value: 40 },
          { label: 'Circle', value: 50 },
        ]}
        unit="%"
        minLabel="Square"
        maxLabel="Circle"
      />

      {/* Preview */}
      {textPreview ? (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Preview</Label>
          <div className="flex justify-center">
            <div className="border rounded-lg p-4">
              <Image src={textPreview} alt="Text favicon preview" width={128} height={128} className="w-32 h-32 object-contain" />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-40 border-2 border-dashed rounded-lg">
          <div className="text-center space-y-2">
            <Type className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Enter text to see a preview</p>
          </div>
        </div>
      )}

      <SizeSelector selectedSizes={selectedSizes} onChange={onSizesChange} idPrefix="txt" />

      <Button
        onClick={onGenerate}
        disabled={processing || selectedSizes.length === 0 || !settings.faviconText.trim()}
        className="w-full"
      >
        {processing ? 'Generating…' : `Generate ${selectedSizes.length} Text Favicons`}
      </Button>
    </div>
  );
}
