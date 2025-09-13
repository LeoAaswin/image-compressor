"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Download, AlertTriangle, MemoryStick } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dropzone } from '@/components/dropzone';
import { ImageCardEnhanced } from '@/components/image-card-enhanced';
import { MemoryMonitor } from '@/components/memory-monitor';
import { ProcessedImage } from '@/lib/types';
import { MemoryManager, ProcessingQueue, formatFileSize, estimateMemoryUsage } from '@/lib/memory-utils';
import { MAX_TOTAL_SIZE, MAX_CONCURRENT_PROCESSING, MEMORY_WARNING_THRESHOLD } from '@/lib/constants';
import { SimpleCounter } from '@/lib/simple-counter';

export function CompressionProcessorOptimized() {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [quality, setQuality] = useState(75);
  const [processing, setProcessing] = useState(false);
  const [memoryUsage, setMemoryUsage] = useState({ used: 0, max: 0, percentage: 0 });
  const [showMemoryWarning, setShowMemoryWarning] = useState(false);
  const processingQueue = useRef(new ProcessingQueue());
  const zipRef = useRef<JSZip | null>(null);

  // Memory monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      const usage = MemoryManager.getMemoryUsage();
      setMemoryUsage(usage);
      setShowMemoryWarning(usage.percentage > MEMORY_WARNING_THRESHOLD * 100);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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
      id: Math.random().toString(36).substr(2, 9),
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
  }, []);

  const processImages = async () => {
    setProcessing(true);
    zipRef.current = new JSZip();
    let processedCount = 0;

    try {
      // Process images in queue to limit memory usage
      const processPromises = images.map((image) => 
        processingQueue.current.add(async () => {
          // Update status to processing
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

            const compressedFile = await imageCompression(
              image.originalFile,
              options
            );

            const processedUrl = MemoryManager.createObjectURL(compressedFile);

            setImages((prev) =>
              prev.map((img) =>
                img.id === image.id
                  ? {
                      ...img,
                      processedUrl,
                      processedSize: compressedFile.size,
                      progress: 100,
                      status: 'completed',
                    }
                  : img
              )
            );

            // Add to ZIP
            if (zipRef.current) {
              const extension = image.originalFile.name.split('.').pop();
              const baseName = image.originalFile.name.slice(0, -(extension?.length || 0) - 1);
              zipRef.current.file(`${baseName}-compressed.${extension}`, compressedFile);
            }

            processedCount++;
            
            // Cleanup old preview URLs if memory usage is high
            if (MemoryManager.isMemoryLimitReached()) {
              MemoryManager.cleanupOldestUrls(3);
            }

          } catch (error) {
            setImages((prev) =>
              prev.map((img) =>
                img.id === image.id
                  ? {
                      ...img,
                      status: 'error',
                      error: error instanceof Error ? error.message : 'Processing failed',
                    }
                  : img
              )
            );
            throw error;
          }
        })
      );

      await Promise.all(processPromises);

      // Update simple counter
      const totalOriginalSize = images.reduce((sum, img) => sum + img.originalFile.size, 0);
      SimpleCounter.updateCounts(processedCount, totalOriginalSize);

      // Generate and download ZIP
      if (zipRef.current) {
        const content = await zipRef.current.generateAsync({ type: 'blob' });
        const downloadUrl = MemoryManager.createObjectURL(content);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = 'compressed-images.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Cleanup download URL
        setTimeout(() => MemoryManager.revokeObjectURL(downloadUrl), 1000);
      }

      toast.success(`Successfully processed ${processedCount} images!`);
    } catch (error) {
      toast.error('Error processing images');
      console.error(error);
    } finally {
      setProcessing(false);
      zipRef.current = null;
    }
  };

  const clearAllImages = useCallback(() => {
    images.forEach(img => {
      MemoryManager.revokeObjectURL(img.previewUrl);
      if (img.processedUrl) {
        MemoryManager.revokeObjectURL(img.processedUrl);
      }
    });
    setImages([]);
  }, [images]);

  const totalOriginalSize = images.reduce((sum, img) => sum + img.originalFile.size, 0);
  const totalProcessedSize = images.reduce((sum, img) => sum + img.processedSize, 0);
  const compressionRatio = totalOriginalSize > 0 ? ((totalOriginalSize - totalProcessedSize) / totalOriginalSize) * 100 : 0;

  return (
    <div className="space-y-8">
      <div className="prose dark:prose-invert">
        <h2>Image Compression (Optimized)</h2>
        <p className="text-muted-foreground">
          Compress your images while maintaining quality. Supports batch processing with memory management.
        </p>
      </div>

      {/* Enhanced Memory Monitor */}
      <MemoryMonitor 
        memoryUsage={memoryUsage}
        showWarning={showMemoryWarning}
        processingCount={images.filter(img => img.status === 'processing').length}
        totalImages={images.length}
      />

      <Dropzone onDrop={onDrop} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => (
          <ImageCardEnhanced
            key={image.id}
            image={image}
            onRemove={removeImage}
          />
        ))}
      </div>

      {images.length > 0 && (
        <div className="space-y-4 bg-card p-6 rounded-lg border">
          {/* Compression Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Original Size:</span>
              <span className="ml-2 font-medium">{formatFileSize(totalOriginalSize)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Compressed Size:</span>
              <span className="ml-2 font-medium">{formatFileSize(totalProcessedSize)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Space Saved:</span>
              <span className="ml-2 font-medium text-green-600">{compressionRatio.toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-muted-foreground">Images:</span>
              <span className="ml-2 font-medium">{images.length}</span>
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

          <div className="flex justify-end space-x-4">
            <Button
              variant="destructive"
              onClick={clearAllImages}
              disabled={processing}
            >
              Clear All
            </Button>
            <Button
              onClick={processImages}
              disabled={processing || images.length === 0}
              className="min-w-[150px]"
            >
              {processing ? (
                'Compressing...'
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Compress & Download
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
