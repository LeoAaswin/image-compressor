"use client";

import React, { useState, useCallback } from 'react';
import { Download } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dropzone } from '@/components/dropzone';
import { ImageCard } from '@/components/image-card';
import { FormatSelector } from '@/components/format-selector';
import { ProcessedImage } from '@/lib/types';
import { IMAGE_FORMATS } from '@/lib/constants';

export function ImageProcessor() {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [outputFormat, setOutputFormat] = useState('webp');
  const [quality, setQuality] = useState(75);
  const [processing, setProcessing] = useState(false);
  const [keepMetadata, setKeepMetadata] = useState(false);

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
            fileType: IMAGE_FORMATS[outputFormat.toUpperCase()].mimeType,
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
          // Single file download
          const file = processedFiles[0].file;
          const fileName = `processed-${processedFiles[0].originalName}.${outputFormat}`;
          const downloadUrl = URL.createObjectURL(file);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          // Multiple files - create zip
          processedFiles.forEach(({ file, originalName }) => {
            zip.file(
              `processed-${originalName}.${outputFormat}`,
              file
            );
          });

          zip.generateAsync({ type: 'blob' }).then((content) => {
            const downloadUrl = URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = 'processed-images.zip';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          });
        }
      });

      toast.success('Images processed successfully!');
    } catch (error) {
      toast.error('Error processing images');
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormatSelector
              value={outputFormat}
              onChange={setOutputFormat}
              disabled={processing}
            />

            <div className="space-y-2">
              <Label>Quality ({quality}%)</Label>
              <Slider
                value={[quality]}
                onValueChange={(value) => setQuality(value[0])}
                min={1}
                max={100}
                step={1}
                disabled={processing}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="metadata"
              checked={keepMetadata}
              onCheckedChange={setKeepMetadata}
              disabled={processing}
            />
            <Label htmlFor="metadata">Keep image metadata</Label>
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
                'Processing...'
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Process & Download
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}