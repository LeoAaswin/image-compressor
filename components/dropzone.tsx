"use client";

import { useDropzone } from "react-dropzone";
import { Upload, Image as ImageIcon, FileImage, Zap } from "lucide-react";
import { MAX_FILE_SIZE } from "@/lib/constants";
import { formatFileSize as formatSize } from "@/lib/memory-utils";
import { useState, useEffect } from "react";

interface DropzoneProps {
  onDrop: (acceptedFiles: File[]) => void;
}

export function Dropzone({ onDrop }: DropzoneProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: {
        "image/jpeg": [".jpg", ".jpeg"],
        "image/png": [".png"],
        "image/webp": [".webp"],
        "image/gif": [".gif"],
        "image/bmp": [".bmp"],
        "image/tiff": [".tiff", ".tif"],
      },
      maxSize: MAX_FILE_SIZE,
      multiple: true,
    });

  useEffect(() => {
    if (fileRejections.length > 0) {
      const errors = fileRejections
        .map((rejection) =>
          rejection.errors.map((error) => error.message).join(", ")
        )
        .join("; ");
      console.warn("File rejection errors:", errors);
    }
  }, [fileRejections]);

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer 
          transition-all duration-300 ease-in-out transform
          ${
            isDragActive
              ? "border-primary bg-primary/10 scale-[1.02] shadow-lg shadow-primary/20"
              : isHovered
              ? "border-primary/50 bg-primary/5 scale-[1.01]"
              : "border-muted-foreground/25 hover:border-muted-foreground/40"
          }
          group overflow-hidden
        `}
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Animated border */}
        <div
          className={`
          absolute inset-0 rounded-xl transition-all duration-300
          ${
            isDragActive
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
            w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center
            transition-all duration-300
            ${
              isDragActive
                ? "bg-primary/20 scale-110"
                : isHovered
                ? "bg-primary/10 scale-105"
                : "bg-muted/50"
            }
          `}
          >
            {isDragActive ? (
              <Zap className="w-8 h-8 text-primary animate-pulse" />
            ) : (
              <div className="relative">
                <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
              </div>
            )}
          </div>

          {/* Main text */}
          <h3
            className={`
            text-xl font-semibold mb-2 transition-colors duration-300
            ${isDragActive ? "text-primary" : "text-foreground"}
          `}
          >
            {isDragActive
              ? "Drop your images here!"
              : "Drag & drop images here"}
          </h3>

          <p className="text-muted-foreground mb-4">
            or{" "}
            <span className="text-primary font-medium underline">
              click to browse
            </span>
          </p>

          {/* File info */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <span className="flex items-center gap-1">
                <FileImage className="w-4 h-4" />
                JPEG, PNG, WEBP, GIF, BMP, TIFF
              </span>
              <span className="text-muted-foreground/60">•</span>
              <span>Max {formatSize(MAX_FILE_SIZE)} per file</span>
            </div>
            <p className="text-xs text-muted-foreground/70">
              Supports batch processing with memory optimization
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
