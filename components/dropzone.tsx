"use client";

import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { SUPPORTED_FORMATS, MAX_FILE_SIZE } from "@/lib/constants";

interface DropzoneProps {
  onDrop: (acceptedFiles: File[]) => void;
}

export function Dropzone({ onDrop }: DropzoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': SUPPORTED_FORMATS,
    },
    maxSize: MAX_FILE_SIZE,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragActive
          ? 'border-primary bg-primary/5'
          : 'border-muted-foreground/25'
      }`}
    >
      <input {...getInputProps()} />
      <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
      <p className="text-lg font-medium">
        {isDragActive
          ? 'Drop your images here'
          : 'Drag & drop images here, or click to select'}
      </p>
      <p className="text-sm text-muted-foreground mt-2">
        Supported formats: JPEG, PNG, WEBP, GIF, BMP, TIFF (Max 50MB per file)
      </p>
    </div>
  );
}