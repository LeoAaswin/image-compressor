"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Download, AlertTriangle, MemoryStick, FileImage } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dropzone } from '@/components/dropzone';
import { ImageCardEnhanced } from '@/components/image-card-enhanced';
import { MemoryMonitor } from '@/components/memory-monitor';
import { FormatSelector } from '@/components/format-selector';
import { ProcessedImage } from '@/lib/types';
import { MemoryManager, ProcessingQueue, formatFileSize, estimateMemoryUsage } from '@/lib/memory-utils';
import { MAX_TOTAL_SIZE, MAX_CONCURRENT_PROCESSING, MEMORY_WARNING_THRESHOLD } from '@/lib/constants';
import { IMAGE_FORMATS } from '@/lib/constants';
import { SupabaseCounter } from '@/lib/supabase';

export function ConversionProcessorOptimized() {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [outputFormat, setOutputFormat] = useState('webp');
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
    let errorCount = 0;

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
              fileType: IMAGE_FORMATS[outputFormat.toUpperCase() as keyof typeof IMAGE_FORMATS].mimeType,
              maxSizeMB: 10,
              maxWidthOrHeight: 1920,
              useWebWorker: true,
            };

            const convertedFile = await imageCompression(
              image.originalFile,
              options
            );

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
              const baseName = image.originalFile.name.split('.')[0];
              zipRef.current.file(`${baseName}.${outputFormat}`, convertedFile);
            }

            processedCount++;
            
            // Cleanup old preview URLs if memory usage is high
            if (MemoryManager.isMemoryLimitReached()) {
              MemoryManager.cleanupOldestUrls(3);
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

      // Update simple counter
      const totalOriginalSize = images.reduce((sum, img) => sum + img.originalFile.size, 0);
      await SupabaseCounter.updateCounts(processedCount, totalOriginalSize);

      // Generate and download ZIP
      if (zipRef.current) {
        const content = await zipRef.current.generateAsync({ type: 'blob' });
        const downloadUrl = MemoryManager.createObjectURL(content);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `converted-to-${outputFormat}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Cleanup download URL
        setTimeout(() => MemoryManager.revokeObjectURL(downloadUrl), 1000);
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
  const completedImages = images.filter(img => img.status === 'completed').length;
  const errorImages = images.filter(img => img.status === 'error').length;
  const processingImages = images.filter(img => img.status === 'processing').length;

  return (
    <div className="space-y-8">
      <div className="prose dark:prose-invert">
        <h2>Format Conversion (Optimized)</h2>
        <p className="text-muted-foreground">
          Convert your images to different formats with memory-safe batch processing.
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
          {/* Processing Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <FileImage className="w-4 h-4" />
              <span className="text-muted-foreground">Total:</span>
              <span className="font-medium">{images.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-muted-foreground">Completed:</span>
              <span className="font-medium">{completedImages}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-muted-foreground">Processing:</span>
              <span className="font-medium">{processingImages}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-muted-foreground">Errors:</span>
              <span className="font-medium">{errorImages}</span>
            </div>
          </div>

          {/* File Size Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Original Size:</span>
              <span className="ml-2 font-medium">{formatFileSize(totalOriginalSize)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Converted Size:</span>
              <span className="ml-2 font-medium">{formatFileSize(totalProcessedSize)}</span>
            </div>
          </div>

          <FormatSelector
            value={outputFormat}
            onChange={setOutputFormat}
            disabled={processing}
          />

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
                `Converting... (${completedImages}/${images.length})`
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Convert & Download
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
