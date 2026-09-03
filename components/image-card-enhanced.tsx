"use client";

import { useState, useRef, useEffect } from "react";
import { ProcessedImage } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { X, CheckCircle, AlertCircle, Loader2, FileImage, Edit3, RefreshCw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { formatFileSize } from "@/lib/memory-utils";

interface ImageCardEnhancedProps {
  image: ProcessedImage;
  onRemove: (id: string) => void;
  onRetry?: () => void;
  onDownload?: (id: string) => void;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export function ImageCardEnhanced({
  image,
  onRemove,
  onRetry,
  onDownload,
  isSelected,
  onToggleSelect,
}: ImageCardEnhancedProps) {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const showSlider =
    image.status === "completed" &&
    image.processedUrl &&
    !image.memoryCleaned;

  // Reset slider when a new processed result arrives
  useEffect(() => {
    if (image.processedUrl) setSliderPos(50);
  }, [image.processedUrl]);

  // Global mouse/touch tracking for slider drag
  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      setSliderPos((x / rect.width) * 100);
    };
    const onMouseUp = () => setIsDragging(false);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging]);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  };

  const getStatusIcon = () => {
    switch (image.status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "edited":
        return <Edit3 className="h-4 w-4 text-purple-500" />;
      case "processing":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileImage className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = () => {
    switch (image.status) {
      case "completed":
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Completed</Badge>;
      case "edited":
        return <Badge variant="default" className="bg-purple-500 hover:bg-purple-600">Edited</Badge>;
      case "processing":
        return <Badge variant="secondary" className="bg-blue-500 hover:bg-blue-600 text-white">Processing</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const compressionRatio =
    image.originalFile.size > 0 && image.processedSize > 0
      ? ((image.originalFile.size - image.processedSize) / image.originalFile.size) * 100
      : 0;

  return (
    <div
      className={`relative rounded-xl overflow-hidden border bg-card group hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 ${
        isSelected ? "ring-2 ring-primary border-primary/50" : ""
      }`}
    >
      {/* Selection checkbox */}
      {onToggleSelect && (
        <div className="absolute top-3 left-3 z-30 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200">
          <Checkbox
            checked={isSelected ?? false}
            onCheckedChange={() => onToggleSelect(image.id)}
            className="h-5 w-5 bg-background/80 backdrop-blur-sm border-white/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
        </div>
      )}

      {/* Remove button */}
      <Button
        variant="destructive"
        size="icon"
        className="absolute top-3 right-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 z-30 h-8 w-8 shadow-lg"
        onClick={() => onRemove(image.id)}
      >
        <X className="h-4 w-4" />
      </Button>

      {/* Image / Before-After slider */}
      <div ref={containerRef} className="aspect-square relative overflow-hidden select-none">
        {showSlider ? (
          <>
            {/* AFTER — processed (bottom layer) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.processedUrl!}
              alt={`${image.originalFile.name} processed`}
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false}
            />

            {/* BEFORE — original clipped to left side */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.thumbnailUrl || image.previewUrl}
              alt={`${image.originalFile.name} original`}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
              draggable={false}
            />

            {/* Divider line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_6px_rgba(0,0,0,0.5)] cursor-ew-resize z-10"
              style={{ left: `${sliderPos}%` }}
              onMouseDown={() => setIsDragging(true)}
              onTouchStart={() => {}}
              onTouchMove={handleTouchMove}
            >
              {/* Drag handle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
                <svg viewBox="0 0 16 16" className="w-4 h-4 text-gray-600" fill="currentColor">
                  <path d="M5 3l-3 5 3 5V3zm6 0v10l3-5-3-5z" />
                </svg>
              </div>
            </div>

            {/* Labels */}
            <span className="absolute top-2 left-2 text-[10px] font-semibold bg-black/60 text-white px-1.5 py-0.5 rounded-full pointer-events-none z-10">
              BEFORE
            </span>
            <span className="absolute top-2 right-2 text-[10px] font-semibold bg-black/60 text-white px-1.5 py-0.5 rounded-full pointer-events-none z-10">
              AFTER
            </span>

            {/* Per-card download */}
            {onDownload && (
              <button
                onClick={() => onDownload(image.id)}
                className="absolute bottom-2 right-2 z-10 h-8 w-8 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center shadow-lg transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                title="Download"
              >
                <Download className="h-4 w-4" />
              </button>
            )}
          </>
        ) : (
          <>
            <Image
              src={image.processedUrl || image.thumbnailUrl || image.previewUrl}
              alt={image.originalFile.name}
              width={400}
              height={400}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

            {/* Status overlay */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-background/90 backdrop-blur-sm rounded-full px-2 py-1">
                {getStatusIcon()}
                {getStatusBadge()}
              </div>
            </div>

            {/* Progress overlay for processing */}
            {image.status === "processing" && (
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
          </>
        )}
      </div>

      {/* Content area */}
      <div className="p-4 space-y-3">
        {/* File info */}
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
        {image.status !== "processing" && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span className="font-medium">{image.progress}%</span>
            </div>
            <Progress value={image.progress} className="h-2 bg-muted/50" />
          </div>
        )}

        {/* Processing results */}
        {image.status === "completed" && image.processedSize > 0 && (
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
                <span className="font-medium text-green-600">{compressionRatio.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {image.status === "error" && image.error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 text-xs mb-1">
              <AlertCircle className="h-3 w-3 text-red-600" />
              <span className="font-medium text-red-800 dark:text-red-200">Processing Failed</span>
            </div>
            <p className="text-xs text-red-700 dark:text-red-300">{image.error}</p>
            {onRetry && (
              <Button
                size="sm"
                variant="outline"
                onClick={onRetry}
                className="mt-2 w-full text-xs h-7 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50"
              >
                <RefreshCw className="w-3 h-3 mr-1" /> Retry
              </Button>
            )}
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
