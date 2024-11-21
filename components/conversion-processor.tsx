"use client";

import React, { useState, useCallback } from 'react';
import { Download } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dropzone } from '@/components/dropzone';
import { ImageCard } from '@/components/image-card';
import { FormatSelector } from '@/components/format-selector';
import { ProcessedImage } from '@/lib/types';
import { IMAGE_FORMATS } from '@/lib/constants';

export function ConversionProcessor() {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [outputFormat, setOutputFormat] = useState('webp');
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
            fileType: IMAGE_FORMATS[outputFormat.toUpperCase() as keyof typeof IMAGE_FORMATS].mimeType,
          };
          const convertedFile = await imageCompression(
            image.originalFile,
            options
          );

          const processedUrl = URL.createObjectURL(convertedFile);

          setImages((prev) =>
            prev.map((img) =>
              img.id === image.id
                ? {
                    ...img,
                    processedUrl,
                    processedSize: convertedFile.size,
                    progress: 100,
                  }
                : img
            )
          );

          return { file: convertedFile, originalName: image.originalFile.name };
        })
      ).then((processedFiles) => {
        if (processedFiles.length === 1) {
          const file = processedFiles[0].file;
          const originalName = processedFiles[0].originalName;
          const baseName = originalName.split('.')[0];
          const fileName = `${baseName}.${outputFormat}`;
          
          const downloadUrl = URL.createObjectURL(file);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          processedFiles.forEach(({ file, originalName }) => {
            const baseName = originalName.split('.')[0];
            zip.file(`${baseName}.${outputFormat}`, file);
          });

          zip.generateAsync({ type: 'blob' }).then((content) => {
            const downloadUrl = URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `converted-to-${outputFormat}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          });
        }
      });

      toast.success('Images converted successfully!');
    } catch (error) {
      toast.error('Error converting images');
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="prose dark:prose-invert">
        <h2>Format Conversion</h2>
        <p className="text-muted-foreground">
          Convert your images to different formats. Supports batch processing.
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
          <FormatSelector
            value={outputFormat}
            onChange={setOutputFormat}
            disabled={processing}
          />

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
                'Converting...'
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