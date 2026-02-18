"use client";

import { Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dropzone } from '@/components/dropzone';
import { SizeSelector } from './SizeSelector';

interface ImageModePanelProps {
  imagePreview: string | null;
  selectedSizes: string[];
  processing: boolean;
  onDrop: (files: File[]) => void;
  onSizesChange: (sizes: string[]) => void;
  onGenerate: () => void;
}

export function ImageModePanel({
  imagePreview,
  selectedSizes,
  processing,
  onDrop,
  onSizesChange,
  onGenerate,
}: ImageModePanelProps) {
  return (
    <div className="space-y-4">
      <div>
        <Dropzone onDrop={onDrop} />
      </div>

      {imagePreview ? (
        <div className="space-y-4">
          <SizeSelector selectedSizes={selectedSizes} onChange={onSizesChange} idPrefix="img" />
          <Button
            onClick={onGenerate}
            disabled={processing || selectedSizes.length === 0}
            className="w-full"
          >
            {processing ? 'Generating…' : `Generate ${selectedSizes.length} Favicons`}
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
          <div className="text-center space-y-2">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Upload an image to generate favicons</p>
          </div>
        </div>
      )}
    </div>
  );
}
