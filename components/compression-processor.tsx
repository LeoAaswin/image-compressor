"use client";

import React, { useState, useCallback } from 'react';
import { Download } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Dropzone } from '@/components/dropzone';
import { ImageCard } from '@/components/image-card';
import { ProcessedImage } from '@/lib/types';

export function CompressionProcessor() {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [quality, setQuality] = useState(75);
  const [processing, setProcessing] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      originalFile: file,
      previewUrl: URL.createObjectURL(file),
      processedUrl: null,
      processedSize: 0,
      progress: 0,
    }));

    setImages((prev) => [...prev, ...newImages]);
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  }, []);

  const processImages = async () => {
    setProcessing(true);
    const zip = new JSZip();

    try {
      await Promise.all(
        images.map(async (image) => {
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

          const processedUrl = URL.createObjectURL(compressedFile);

          setImages((prev) =>
            prev.map((img) =>
              img.id === image.id
                ? {
                    ...img,
                    processedUrl,
                    processedSize: compressedFile.size,
                    progress: 100,
                  }
                : img
            )
          );

          return { file: compressedFile, originalName: image.originalFile.name };
        })
      ).then((processedFiles) => {
        if (processedFiles.length === 1) {
          const file = processedFiles[0].file;
          const originalName = processedFiles[0].originalName;
          const extension = originalName.split('.').pop();
          const baseName = originalName.slice(0, -(extension?.length || 0) - 1);
          const fileName = `${baseName}-compressed.${extension}`;
          
          const downloadUrl = URL.createObjectURL(file);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          processedFiles.forEach(({ file, originalName }) => {
            const extension = originalName.split('.').pop();
            const baseName = originalName.slice(0, -(extension?.length || 0) - 1);
            zip.file(`${baseName}-compressed.${extension}`, file);
          });

          zip.generateAsync({ type: 'blob' }).then((content) => {
            const downloadUrl = URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = 'compressed-images.zip';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          });
        }
      });

      toast.success('Images compressed successfully!');
    } catch (error) {
      toast.error('Error compressing images');
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="prose dark:prose-invert">
        <h2>Image Compression</h2>
        <p className="text-muted-foreground">
          Compress your images while maintaining quality. Supports batch processing.
        </p>
      </div>

      <Dropzone onDrop={onDrop} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => (
          <ImageCard
            key={image.id}
            image={image}
            onRemove={removeImage}
          />
        ))}
      </div>

      {images.length > 0 && (
        <div className="space-y-4 bg-card p-6 rounded-lg border">
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
              onClick={() => setImages([])}
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