"use client";

import { Image as ImageIcon, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { GenerationMode } from './types';

interface ModeSelectorProps {
  mode: GenerationMode;
  onChange: (mode: GenerationMode) => void;
}

export function ModeSelector({ mode, onChange }: ModeSelectorProps) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Generation Mode</Label>
      <div className="flex space-x-4">
        <Button
          variant={mode === 'image' ? 'default' : 'outline'}
          onClick={() => onChange('image')}
          className="flex-1"
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          From Image
        </Button>
        <Button
          variant={mode === 'text' ? 'default' : 'outline'}
          onClick={() => onChange('text')}
          className="flex-1"
        >
          <Type className="h-4 w-4 mr-2" />
          From Text
        </Button>
      </div>
    </div>
  );
}
