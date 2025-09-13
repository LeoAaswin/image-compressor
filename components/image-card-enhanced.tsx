"use client";

import { ProcessedImage } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { X, CheckCircle, AlertCircle, Loader2, FileImage, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { formatFileSize } from "@/lib/memory-utils";

interface ImageCardEnhancedProps {
  image: ProcessedImage;
  onRemove: (id: string) => void;
}

export function ImageCardEnhanced({ image, onRemove }: ImageCardEnhancedProps) {
  const getStatusIcon = () => {
    switch (image.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'edited':
        return <Edit3 className="h-4 w-4 text-purple-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileImage className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = () => {
    switch (image.status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Completed</Badge>;
      case 'edited':
        return <Badge variant="default" className="bg-purple-500 hover:bg-purple-600">Edited</Badge>;
      case 'processing':
        return <Badge variant="secondary" className="bg-blue-500 hover:bg-blue-600 text-white">Processing</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const compressionRatio = image.originalFile.size > 0 && image.processedSize > 0 
    ? ((image.originalFile.size - image.processedSize) / image.originalFile.size) * 100 
    : 0;

  return (
    <div className="relative rounded-xl overflow-hidden border bg-card group hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
      {/* Remove button */}
      <Button
        variant="destructive"
        size="icon"
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 z-30 h-8 w-8 shadow-lg"
        onClick={() => onRemove(image.id)}
      >
        <X className="h-4 w-4" />
      </Button>
      
      {/* Image container with enhanced styling */}
      <div className="aspect-square relative overflow-hidden">
        <Image
          src={image.processedUrl || image.previewUrl}
          alt="Preview"
          width={400}
          height={400}
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        
        {/* Status overlay with enhanced styling */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-background/90 backdrop-blur-sm rounded-full px-2 py-1">
            {getStatusIcon()}
            {getStatusBadge()}
          </div>
        </div>

        {/* Progress overlay for processing images */}
        {image.status === 'processing' && (
          <div className="absolute bottom-3 left-3 right-3">
            <div className="bg-background/90 backdrop-blur-sm rounded-lg p-2">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Processing...</span>
                <span>{image.progress}%</span>
              </div>
              <Progress value={image.progress} className="h-1.5" />
            </div>
          </div>
        )}
      </div>
      
      {/* Content area with enhanced spacing */}
      <div className="p-4 space-y-3">
        {/* File info with better typography */}
        <div className="space-y-1">
          <p className="text-sm font-semibold truncate" title={image.originalFile.name}>
            {image.originalFile.name}
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Original: {formatFileSize(image.originalFile.size)}</span>
            {image.processedSize > 0 && (
              <span className="text-green-600 font-medium">
                -{compressionRatio.toFixed(1)}%
              </span>
            )}
          </div>
        </div>

        {/* Progress bar for non-processing states */}
        {image.status !== 'processing' && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span className="font-medium">{image.progress}%</span>
            </div>
            <Progress 
              value={image.progress} 
              className="h-2 bg-muted/50"
            />
          </div>
        )}

        {/* Processing results with enhanced styling */}
        {image.status === 'completed' && image.processedSize > 0 && (
          <div className="space-y-2 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span className="font-medium text-green-800 dark:text-green-200">Compression Complete</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Compressed:</span>
                <span className="font-medium">{formatFileSize(image.processedSize)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Space Saved:</span>
                <span className="font-medium text-green-600">
                  {compressionRatio.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error message with enhanced styling */}
        {image.status === 'error' && image.error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 text-xs mb-1">
              <AlertCircle className="h-3 w-3 text-red-600" />
              <span className="font-medium text-red-800 dark:text-red-200">Processing Failed</span>
            </div>
            <p className="text-xs text-red-700 dark:text-red-300">{image.error}</p>
          </div>
        )}

        {/* Memory optimization indicator */}
        {image.memoryCleaned && (
          <div className="flex items-center gap-1.5 text-xs text-orange-600 bg-orange-50 dark:bg-orange-950/30 px-2 py-1 rounded-full">
            <AlertCircle className="h-3 w-3" />
            <span>Memory optimized</span>
          </div>
        )}
      </div>
    </div>
  );
}
