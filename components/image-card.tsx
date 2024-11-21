"use client";

import { ProcessedImage } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageCardProps {
  image: ProcessedImage;
  onRemove: (id: string) => void;
}

export function ImageCard({ image, onRemove }: ImageCardProps) {
  return (
    <div className="relative rounded-lg overflow-hidden border bg-card group">
      <Button
        variant="destructive"
        size="icon"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onRemove(image.id)}
      >
        <X className="h-4 w-4" />
      </Button>
      <div className="aspect-square relative">
        <img
          src={image.processedUrl || image.previewUrl}
          alt="Preview"
          className="object-cover w-full h-full"
        />
      </div>
      <div className="p-4">
        <p className="text-sm font-medium truncate">{image.originalFile.name}</p>
        <Progress value={image.progress} className="mt-2" />
        {image.progress === 100 && (
          <p className="text-xs text-muted-foreground mt-2">
            Size: {(image.processedSize / 1024).toFixed(2)} KB
          </p>
        )}
      </div>
    </div>
  );
}