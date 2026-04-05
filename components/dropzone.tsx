"use client";

import { useDropzone } from "react-dropzone";
import { Upload, Image as ImageIcon, FileImage, Zap } from "lucide-react";
import { MAX_FILE_SIZE } from "@/lib/constants";
import { formatFileSize as formatSize } from "@/lib/memory-utils";
import { useState, useCallback, useEffect } from "react";
import { normalizeImageFiles } from "@/lib/heic-utils";
import { toast } from "sonner";

interface DropzoneProps {
  onDrop: (acceptedFiles: File[]) => void;
}

export function Dropzone({ onDrop }: DropzoneProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [dragCounter, setDragCounter] = useState(false);
  const [isTouchActive, setIsTouchActive] = useState(false);

  const handleDrop = useCallback(async (acceptedFiles: File[]) => {
    const heicFiles = acceptedFiles.filter(
      (f) => f.type === 'image/heic' || f.type === 'image/heif' ||
             f.name.toLowerCase().endsWith('.heic') || f.name.toLowerCase().endsWith('.heif')
    );
    if (heicFiles.length > 0) {
      toast.info(`Converting ${heicFiles.length} HEIC file${heicFiles.length > 1 ? 's' : ''} to JPEG...`);
    }
    try {
      const normalized = await normalizeImageFiles(acceptedFiles);
      
      // Track stats in the background (fire-and-forget, non-blocking)
      const totalSize = acceptedFiles.reduce((acc, file) => acc + file.size, 0);
      fetch('/api/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filesCount: acceptedFiles.length, bytesCount: totalSize })
      }).catch(console.error);
      
      onDrop(normalized);
    } catch (err) {
      console.error('HEIC conversion error:', err);
      toast.error('Failed to convert HEIC file. Please check the browser console for details.');
    }
  }, [onDrop]);

  useEffect(() => {
    const handlePaste = async (event: ClipboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
      const items = Array.from(event.clipboardData?.items ?? []);
      const imageFiles = items
        .filter(item => item.kind === 'file' && item.type.startsWith('image/'))
        .map(item => item.getAsFile())
        .filter((f): f is File => f !== null);
      if (imageFiles.length > 0) {
        await handleDrop(imageFiles);
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handleDrop]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop: handleDrop,
      accept: {
        "image/jpeg": [".jpg", ".jpeg"],
        "image/png": [".png"],
        "image/webp": [".webp"],
        "image/gif": [".gif"],
        "image/bmp": [".bmp"],
        "image/tiff": [".tiff", ".tif"],
        "image/avif": [".avif"],
        "image/x-icon": [".ico"],
        "image/svg+xml": [".svg"],
        "image/heic": [".heic"],
        "image/heif": [".heif"],
      },
      maxSize: MAX_FILE_SIZE,
      multiple: true,
    });

  // File rejection errors are displayed in the UI below the dropzone

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={() => setIsTouchActive(true)}
        onTouchEnd={() => setIsTouchActive(false)}
        className={`
          relative border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer 
          transition-all duration-300 ease-in-out transform
          ${isDragActive
            ? "border-primary bg-primary/10 scale-[1.02] shadow-lg shadow-primary/20"
            : isHovered || isTouchActive
              ? "border-primary/50 bg-primary/5 scale-[1.01]"
              : "border-muted-foreground/25 hover:border-muted-foreground/40"
          }
          group overflow-hidden
          active:scale-95
        `}
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Animated border */}
        <div
          className={`
          absolute inset-0 rounded-xl transition-all duration-300
          ${isDragActive
              ? "ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
              : ""
            }
        `}
        />

        <input {...getInputProps()} />

        {/* Icon with animation */}
        <div className="relative z-10">
          <div
            className={`
            w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 rounded-full flex items-center justify-center
            transition-all duration-300
            ${isDragActive
                ? "bg-primary/20 scale-110"
                : isHovered || isTouchActive
                  ? "bg-primary/10 scale-105"
                  : "bg-muted/50"
              }
          `}
          >
            {isDragActive ? (
              <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-primary animate-pulse" />
            ) : (
              <div className="relative">
                <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
              </div>
            )}
          </div>

          {/* Main text */}
          <h3
            className={`
            text-lg sm:text-xl font-semibold mb-2 transition-colors duration-300
            ${isDragActive ? "text-primary" : "text-foreground"}
          `}
          >
            {isDragActive
              ? "Drop your images here!"
              : "Drag & drop images here"}
          </h3>

          <p className="text-sm sm:text-base text-muted-foreground mb-4">
            or{" "}
            <span className="text-primary font-medium underline">
              tap to browse
            </span>
            {" "}or <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted border rounded">Ctrl+V</kbd> to paste
          </p>

          {/* File info */}
          <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
              <span className="flex items-center gap-1">
                <FileImage className="w-3 h-3 sm:w-4 sm:h-4" />
                JPEG, PNG, WEBP, HEIC & more
              </span>
              <span className="text-muted-foreground/60">•</span>
              <span>Max {formatSize(MAX_FILE_SIZE)}</span>
            </div>
            <p className="text-xs text-muted-foreground/70 hidden sm:block">
              Supports batch processing with memory optimization
            </p>
            <p className="text-xs text-muted-foreground/70 sm:hidden">
              Tap anywhere to upload images
            </p>
          </div>
        </div>

        {/* Animated particles effect */}
        {isDragActive && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-primary/30 rounded-full animate-ping"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${30 + (i % 3) * 20}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: "1.5s",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Error messages */}
      {fileRejections.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
          <p className="text-sm text-destructive font-medium">
            Some files were rejected:
          </p>
          <ul className="text-xs text-destructive/80 mt-1 space-y-1">
            {fileRejections.map((rejection, index) => (
              <li key={index}>
                {rejection.file.name}:{" "}
                {rejection.errors.map((e) => e.message).join(", ")}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
