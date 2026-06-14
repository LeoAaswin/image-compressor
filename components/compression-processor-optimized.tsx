"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Download } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dropzone } from '@/components/dropzone';
import { ImageCardEnhanced } from '@/components/image-card-enhanced';
import { ClearAllButton } from '@/components/clear-all-button';
import { ProcessedImage } from '@/lib/types';
import { MemoryManager, ProcessingQueue, formatFileSize, estimateMemoryUsage } from '@/lib/memory-utils';
import { MAX_TOTAL_SIZE } from '@/lib/constants';
import { useShortcut } from '@/hooks/use-shortcut';


export function CompressionProcessorOptimized() {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [quality, setQuality] = useState(() => {
    if (typeof window === 'undefined') return 75;
    return Number(localStorage.getItem('opti-quality') ?? 75);
  });
  const [processing, setProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [renamePattern, setRenamePattern] = useState('');
  const processingQueue = useRef(new ProcessingQueue());
  const zipRef = useRef<JSZip | null>(null);

  // Persist quality preference
  useEffect(() => {
    localStorage.setItem('opti-quality', String(quality));
  }, [quality]);

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
    const ext = image.originalFile.name.split('.').pop();
    const base = image.originalFile.name.replace(/\.[^.]+$/, '');
    const a = document.createElement('a');
    a.href = image.processedUrl;
    a.download = `${base}-compressed.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [images]);

  const processImages = useCallback(async () => {
    // Only process images that haven't been completed yet
    const pendingImages = images.filter(img =>
      (img.status === 'pending' || img.status === 'error') &&
      (selectedIds.size === 0 || selectedIds.has(img.id))
    );
    if (pendingImages.length === 0) return;

    setProcessing(true);
    setProcessedCount(0);
    zipRef.current = new JSZip();
    let successCount = 0;
    let errorCount = 0;

    try {
      const processPromises = pendingImages.map((image) =>
        processingQueue.current.add(async () => {
          setImages((prev) =>
            prev.map((img) =>
              img.id === image.id ? { ...img, status: 'processing' } : img
            )
          );

          try {
            const options = {
              maxSizeMB: 10,
              maxWidthOrHeight: 1920,
              useWebWorker: true,
              initialQuality: quality / 100,
            };

            const compressedFile = await imageCompression(image.originalFile, options);
            const processedUrl = MemoryManager.createObjectURL(compressedFile);

            setImages((prev) =>
              prev.map((img) =>
                img.id === image.id
                  ? { ...img, processedUrl, processedSize: compressedFile.size, progress: 100, status: 'completed' }
                  : img
              )
            );

            if (zipRef.current) {
              const extension = image.originalFile.name.split('.').pop();
              const rawBase = image.originalFile.name.slice(0, -(extension?.length || 0) - 1);
              const safeBase = rawBase.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_');
              const idx = pendingImages.indexOf(image) + 1;
              const date = new Date().toISOString().slice(0, 10);
              const baseName = renamePattern.trim()
                ? renamePattern
                    .replace(/\{name\}/g, safeBase)
                    .replace(/\{n\}/g, String(idx).padStart(2, '0'))
                    .replace(/\{date\}/g, date)
                    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
                : `${safeBase}-compressed`;
              zipRef.current.file(`${baseName}.${extension}`, compressedFile);
            }

            successCount++;
            setProcessedCount(successCount);

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
                  ? { ...img, status: 'error', error: error instanceof Error ? error.message : 'Processing failed' }
                  : img
              )
            );
          }
        })
      );

      await Promise.all(processPromises);

      if (successCount === 0) {
        toast.error('No images were compressed successfully.');
        return;
      }

      // Single file — download directly without zipping
      if (pendingImages.length === 1 && successCount === 1 && zipRef.current) {
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
      } else if (zipRef.current && successCount > 0) {
        const zipToastId = toast.loading('Packaging ZIP... 0%');
        const content = await zipRef.current.generateAsync(
          { type: 'blob' },
          (meta) => toast.loading(`Packaging ZIP... ${Math.round(meta.percent)}%`, { id: zipToastId })
        );
        toast.dismiss(zipToastId);
        const downloadUrl = MemoryManager.createObjectURL(content);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = 'compressed-images.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => MemoryManager.revokeObjectURL(downloadUrl), 5000);
      }

      if (errorCount > 0) {
        toast.warning(`Compressed ${successCount} images. ${errorCount} failed.`);
      } else {
        toast.success(`Successfully compressed ${successCount} image${successCount > 1 ? 's' : ''}!`);
      }
    } catch (error) {
      toast.error('Unexpected error during compression');
      console.error(error);
    } finally {
      setProcessing(false);
      setProcessedCount(0);
      zipRef.current = null;
    }
  }, [images, quality]);

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

  const pendingCount = images.filter(img => img.status === 'pending' || img.status === 'error').length;

  useShortcut(processImages, processing || pendingCount === 0);
  const totalOriginalSize = images.reduce((sum, img) => sum + img.originalFile.size, 0);
  const totalProcessedSize = images.reduce((sum, img) => sum + img.processedSize, 0);
  const compressionRatio = totalOriginalSize > 0 ? ((totalOriginalSize - totalProcessedSize) / totalOriginalSize) * 100 : 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="space-y-1">
        <h2 className="text-lg sm:text-xl font-semibold">Image Compression</h2>
        <p className="text-sm text-muted-foreground">
          Compress your images while maintaining quality. Supports batch processing with memory management.
        </p>
      </div>

      <Dropzone onDrop={onDrop} />

      {images.length > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <Checkbox
            id="select-all-compress"
            checked={selectedIds.size === images.length && images.length > 0 ? true : selectedIds.size > 0 ? 'indeterminate' : false}
            onCheckedChange={(checked) => setSelectedIds(checked === true ? new Set(images.map(i => i.id)) : new Set())}
          />
          <label htmlFor="select-all-compress" className="text-muted-foreground cursor-pointer">
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
          {/* Compression Stats */}
          <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="flex flex-col gap-0.5">
              <span className="text-muted-foreground">Original Size</span>
              <span className="font-medium">{formatFileSize(totalOriginalSize)}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-muted-foreground">Compressed Size</span>
              <span className="font-medium">{formatFileSize(totalProcessedSize)}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-muted-foreground">Space Saved</span>
              <span className="font-medium text-green-600">{compressionRatio.toFixed(1)}%</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-muted-foreground">Images</span>
              <span className="font-medium">{images.length}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Compression Quality ({quality}%)</Label>
            <Slider
              value={[quality]}
              onValueChange={(value) => setQuality(value[0])}
              min={1}
              max={100}
              step={1}
              disabled={processing}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Rename pattern <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <input
              type="text"
              value={renamePattern}
              onChange={(e) => setRenamePattern(e.target.value)}
              placeholder="e.g. photo_{n}_{date}  •  {name}_compressed"
              className="w-full text-sm px-3 py-1.5 rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <p className="text-xs text-muted-foreground">Use <code className="bg-muted px-1 rounded">{'{name}'}</code> = original name, <code className="bg-muted px-1 rounded">{'{n}'}</code> = number, <code className="bg-muted px-1 rounded">{'{date}'}</code> = today</p>
          </div>

          <div className="flex flex-wrap justify-end gap-2 sm:gap-3">
            <ClearAllButton onConfirm={clearAllImages} disabled={processing} count={images.length} />
            <Button
              onClick={processImages}
              disabled={processing || pendingCount === 0}
              size="sm"
              className="shrink-0"
              title="Compress & Download (Ctrl+Enter / ⌘+Enter)"
            >
              {processing ? (
                <span className="truncate max-w-[160px] sm:max-w-none">
                  Compressing... ({processedCount}/{pendingCount + processedCount})
                </span>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2 shrink-0" />
                  <span className="hidden sm:inline">
                    {selectedIds.size > 0 ? `Compress Selected (${selectedIds.size})` : pendingCount < images.length ? 'Compress Remaining' : 'Compress & Download'}
                  </span>
                  <span className="sm:hidden">
                    {selectedIds.size > 0 ? `Compress (${selectedIds.size})` : 'Compress'}
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
