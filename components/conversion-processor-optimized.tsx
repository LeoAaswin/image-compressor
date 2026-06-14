"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Download, FileImage } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dropzone } from '@/components/dropzone';
import { ImageCardEnhanced } from '@/components/image-card-enhanced';
import { ClearAllButton } from '@/components/clear-all-button';
import { FormatSelector } from '@/components/format-selector';
import { ProcessedImage } from '@/lib/types';
import { MemoryManager, ProcessingQueue, formatFileSize, estimateMemoryUsage } from '@/lib/memory-utils';
import { MAX_TOTAL_SIZE, IMAGE_FORMATS } from '@/lib/constants';
import { useShortcut } from '@/hooks/use-shortcut';


export function ConversionProcessorOptimized() {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [outputFormat, setOutputFormat] = useState(() => {
    if (typeof window === 'undefined') return 'webp';
    return localStorage.getItem('opti-format') ?? 'webp';
  });
  const [processing, setProcessing] = useState(false);
  const processingQueue = useRef(new ProcessingQueue());
  const zipRef = useRef<JSZip | null>(null);

  // Persist format preference
  useEffect(() => {
    localStorage.setItem('opti-format', outputFormat);
  }, [outputFormat]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      MemoryManager.revokeAllObjectURLs();
    };
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const totalSize = acceptedFiles.reduce((sum, file) => sum + file.size, 0);
    const currentTotalSize = images.reduce((sum, img) => sum + img.originalFile.size, 0);

    if (totalSize + currentTotalSize > MAX_TOTAL_SIZE) {
      toast.error(`Total batch size exceeds ${formatFileSize(MAX_TOTAL_SIZE)} limit`);
      return;
    }

    const estimatedMemory = estimateMemoryUsage(totalSize, acceptedFiles.length);
    if (estimatedMemory > MAX_TOTAL_SIZE) {
      toast.warning('Large batch detected. Processing will be slower to prevent crashes.');
    }

    const newImages = acceptedFiles.map((file) => ({
      id: crypto.randomUUID(),
      originalFile: file,
      previewUrl: MemoryManager.createObjectURL(file),
      processedUrl: null,
      processedSize: 0,
      progress: 0,
      status: 'pending' as const,
      memoryCleaned: false,
    }));

    setImages((prev) => [...prev, ...newImages]);
  }, [images]);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove) {
        MemoryManager.revokeObjectURL(imageToRemove.previewUrl);
        if (imageToRemove.processedUrl) {
          MemoryManager.revokeObjectURL(imageToRemove.processedUrl);
        }
      }
      return prev.filter((img) => img.id !== id);
    });
    setSelectedIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleDownloadSingle = useCallback((id: string) => {
    const image = images.find(img => img.id === id);
    if (!image?.processedUrl) return;
    const base = image.originalFile.name.replace(/\.[^.]+$/, '');
    const a = document.createElement('a');
    a.href = image.processedUrl;
    a.download = `${base}.${outputFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [images, outputFormat]);

  const processImages = useCallback(async () => {
    const pendingImages = images.filter(img =>
      (img.status === 'pending' || img.status === 'error') &&
      (selectedIds.size === 0 || selectedIds.has(img.id))
    );
    if (pendingImages.length === 0) return;

    setProcessing(true);
    zipRef.current = new JSZip();
    let processedCount = 0;
    let errorCount = 0;

    try {
      const processPromises = pendingImages.map((image) =>
        processingQueue.current.add(async () => {
          // Update status to processing
          setImages((prev) =>
            prev.map((img) =>
              img.id === image.id ? { ...img, status: 'processing' } : img
            )
          );

          try {
            let convertedFile: File;
            const rawName = image.originalFile.name.split('.')[0];
            const baseName = rawName.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_');

            // Handle SVG conversion separately since it's vector-based
            if (outputFormat === 'svg') {
              // Convert TO SVG - create SVG from raster image
              if (image.originalFile.type.startsWith('image/')) {
                convertedFile = await convertToSvg(image.originalFile);
              } else {
                throw new Error('Cannot convert this file type to SVG');
              }
            } else if (image.originalFile.type === 'image/svg+xml') {
              // Convert FROM SVG to other formats
              convertedFile = await convertFromSvg(image.originalFile, outputFormat);
            } else {
              // Regular image conversion
              const options = {
                fileType: IMAGE_FORMATS[outputFormat.toUpperCase() as keyof typeof IMAGE_FORMATS].mimeType,
                maxSizeMB: 10,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
              };

              convertedFile = await imageCompression(
                image.originalFile,
                options
              );
            }

            const processedUrl = MemoryManager.createObjectURL(convertedFile);

            setImages((prev) =>
              prev.map((img) =>
                img.id === image.id
                  ? {
                      ...img,
                      processedUrl,
                      processedSize: convertedFile.size,
                      progress: 100,
                      status: 'completed',
                    }
                  : img
              )
            );

            // Add to ZIP
            if (zipRef.current) {
              zipRef.current.file(`${baseName}.${outputFormat}`, convertedFile);
            }

            processedCount++;

            // Cleanup old preview URLs if memory usage is high
            if (MemoryManager.isMemoryLimitReached()) {
              MemoryManager.cleanupOldestUrls(3);
            }

            if (MemoryManager.shouldShowMemoryWarning()) {
              toast.warning('Memory usage is over 80%. Consider clearing completed images to free space.');
            }

          } catch (error) {
            errorCount++;
            setImages((prev) =>
              prev.map((img) =>
                img.id === image.id
                  ? {
                      ...img,
                      status: 'error',
                      error: error instanceof Error ? error.message : 'Conversion failed',
                    }
                  : img
              )
            );
            console.error(`Error converting ${image.originalFile.name}:`, error);
          }
        })
      );

      await Promise.all(processPromises);

      // Generate and download
      if (images.length === 1 && processedCount === 1) {
        if (zipRef.current) {
          const zipFiles = Object.keys(zipRef.current.files);
          if (zipFiles.length === 1) {
            const filename = zipFiles[0];
            const content = await zipRef.current.file(filename)?.async('blob');
            if (content) {
              const downloadUrl = MemoryManager.createObjectURL(content);
              const link = document.createElement('a');
              link.href = downloadUrl;
              link.download = filename;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              setTimeout(() => MemoryManager.revokeObjectURL(downloadUrl), 5000);
            }
          }
        }
      } else if (zipRef.current) {
        const zipToastId = toast.loading('Packaging ZIP... 0%');
        const content = await zipRef.current.generateAsync(
          { type: 'blob' },
          (meta) => toast.loading(`Packaging ZIP... ${Math.round(meta.percent)}%`, { id: zipToastId })
        );
        toast.dismiss(zipToastId);
        const downloadUrl = MemoryManager.createObjectURL(content);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `converted-to-${outputFormat}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Cleanup download URL
        setTimeout(() => MemoryManager.revokeObjectURL(downloadUrl), 5000);
      }

      if (errorCount > 0) {
        toast.warning(`Converted ${processedCount} images successfully, ${errorCount} failed.`);
      } else {
        toast.success(`Successfully converted ${processedCount} images to ${outputFormat.toUpperCase()}!`);
      }
    } catch (error) {
      toast.error('Error during conversion process');
      console.error(error);
    } finally {
      setProcessing(false);
      zipRef.current = null;
    }
  }, [images, outputFormat]);

  // Helper function to convert raster images to SVG
  const convertToSvg = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <image href="${canvas.toDataURL('image/png', 1.0)}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet"/>
</svg>`;

        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const svgFile = new File([blob], `${file.name.split('.')[0]}.svg`, { type: 'image/svg+xml' });
        resolve(svgFile);
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to load image for SVG conversion'));
      };

      img.src = objectUrl;
    });
  };

  // Helper function to convert SVG to other formats
  const convertFromSvg = async (svgFile: File, targetFormat: string): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      // First, parse SVG to get actual dimensions
      const reader = new FileReader();
      reader.onload = (e) => {
        const svgText = e.target?.result as string;
        
        // Extract dimensions from SVG
        const widthMatch = svgText.match(/width="([^"]+)"/);
        const heightMatch = svgText.match(/height="([^"]+)"/);
        const viewBoxMatch = svgText.match(/viewBox="([^"]+)"/);
        
        let svgWidth = 800; // fallback
        let svgHeight = 600; // fallback
        let usedFallback = true;

        if (widthMatch && heightMatch) {
          svgWidth = parseInt(widthMatch[1]) || 800;
          svgHeight = parseInt(heightMatch[1]) || 600;
          usedFallback = false;
        } else if (viewBoxMatch) {
          const values = viewBoxMatch[1].split(' ');
          svgWidth = parseInt(values[2]) || 800;
          svgHeight = parseInt(values[3]) || 600;
          usedFallback = false;
        }

        if (usedFallback) {
          toast.warning(`Could not read dimensions from ${svgFile.name}, using 800×600 fallback`);
        }

        const svgObjectUrl = URL.createObjectURL(svgFile);

        img.onload = () => {
          URL.revokeObjectURL(svgObjectUrl);
          canvas.width = svgWidth;
          canvas.height = svgHeight;

          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
          }

          ctx?.drawImage(img, 0, 0, svgWidth, svgHeight);

          canvas.toBlob((blob) => {
            if (blob) {
              const convertedFile = new File([blob], `${svgFile.name.split('.')[0]}.${targetFormat}`, {
                type: IMAGE_FORMATS[targetFormat.toUpperCase() as keyof typeof IMAGE_FORMATS].mimeType,
              });
              resolve(convertedFile);
            } else {
              reject(new Error('Failed to convert SVG'));
            }
          }, IMAGE_FORMATS[targetFormat.toUpperCase() as keyof typeof IMAGE_FORMATS].mimeType, 0.95);
        };

        img.onerror = () => {
          URL.revokeObjectURL(svgObjectUrl);
          reject(new Error('Failed to load SVG for conversion'));
        };

        img.src = svgObjectUrl;
      };

      reader.onerror = () => reject(new Error('Failed to read SVG file'));
      reader.readAsText(svgFile);
    });
  };

  const resetImageStatus = useCallback((id: string) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, status: 'pending' as const, error: undefined, progress: 0 } : img
      )
    );
  }, []);

  const clearAllImages = useCallback(() => {
    images.forEach(img => {
      MemoryManager.revokeObjectURL(img.previewUrl);
      if (img.processedUrl) {
        MemoryManager.revokeObjectURL(img.processedUrl);
      }
    });
    setImages([]);
    setSelectedIds(new Set());
  }, [images]);

  const totalOriginalSize = images.reduce((sum, img) => sum + img.originalFile.size, 0);
  const totalProcessedSize = images.reduce((sum, img) => sum + img.processedSize, 0);
  const completedImages = images.filter(img => img.status === 'completed').length;
  const errorImages = images.filter(img => img.status === 'error').length;
  const processingImages = images.filter(img => img.status === 'processing').length;
  const pendingCount = images.filter(img => img.status === 'pending' || img.status === 'error').length;

  useShortcut(processImages, processing || pendingCount === 0);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="space-y-1">
        <h2 className="text-lg sm:text-xl font-semibold">Format Conversion</h2>
        <p className="text-sm text-muted-foreground">
          Convert your images to different formats with memory-safe batch processing.
        </p>
      </div>

      <Dropzone onDrop={onDrop} />

      {images.length > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <Checkbox
            id="select-all-convert"
            checked={selectedIds.size === images.length && images.length > 0 ? true : selectedIds.size > 0 ? 'indeterminate' : false}
            onCheckedChange={(checked) => setSelectedIds(checked === true ? new Set(images.map(i => i.id)) : new Set())}
          />
          <label htmlFor="select-all-convert" className="text-muted-foreground cursor-pointer">
            {selectedIds.size === 0 ? 'Select all' : `${selectedIds.size} selected`}
          </label>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => (
          <ImageCardEnhanced
            key={image.id}
            image={image}
            onRemove={removeImage}
            onRetry={image.status === 'error' ? () => resetImageStatus(image.id) : undefined}
            onDownload={handleDownloadSingle}
            isSelected={selectedIds.has(image.id)}
            onToggleSelect={toggleSelect}
          />
        ))}
      </div>

      {images.length > 0 && (
        <div className="space-y-4 bg-card p-4 sm:p-6 rounded-lg border">
          {/* Processing Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
            <div className="flex flex-col gap-0.5">
              <span className="text-muted-foreground flex items-center gap-1">
                <FileImage className="w-3 h-3 shrink-0" /> Total
              </span>
              <span className="font-medium">{images.length}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-muted-foreground flex items-center gap-1">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full shrink-0" /> Completed
              </span>
              <span className="font-medium">{completedImages}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-muted-foreground flex items-center gap-1">
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shrink-0" /> Processing
              </span>
              <span className="font-medium">{processingImages}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-muted-foreground flex items-center gap-1">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full shrink-0" /> Errors
              </span>
              <span className="font-medium">{errorImages}</span>
            </div>
          </div>

          {/* File Size Stats */}
          <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="flex flex-col gap-0.5">
              <span className="text-muted-foreground">Original Size</span>
              <span className="font-medium">{formatFileSize(totalOriginalSize)}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-muted-foreground">Converted Size</span>
              <span className="font-medium">{formatFileSize(totalProcessedSize)}</span>
            </div>
          </div>

          <FormatSelector
            value={outputFormat}
            onChange={setOutputFormat}
            disabled={processing}
          />

          <div className="flex flex-wrap justify-end gap-2 sm:gap-3">
            <ClearAllButton onConfirm={clearAllImages} disabled={processing} count={images.length} />
            <Button
              onClick={processImages}
              disabled={processing || pendingCount === 0}
              size="sm"
              className="shrink-0"
              title="Convert & Download (Ctrl+Enter / ⌘+Enter)"
            >
              {processing ? (
                <span className="truncate max-w-[160px] sm:max-w-none">
                  Converting... ({completedImages}/{pendingCount + completedImages})
                </span>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2 shrink-0" />
                  <span className="hidden sm:inline">
                    {selectedIds.size > 0 ? `Convert Selected (${selectedIds.size})` : pendingCount < images.length ? 'Convert Remaining' : 'Convert & Download'}
                  </span>
                  <span className="sm:hidden">
                    {selectedIds.size > 0 ? `Convert (${selectedIds.size})` : 'Convert'}
                  </span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
