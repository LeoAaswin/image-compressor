"use client";

import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dropzone } from '@/components/dropzone';
import { ImageCardEnhanced } from '@/components/image-card-enhanced';
import { ImageEditor } from '@/components/image-editor';
import { ProcessedImage } from '@/lib/types';
import { SimpleCounter } from '@/lib/simple-counter';
import { Edit, Download, Trash2, Image as ImageIcon } from 'lucide-react';
import JSZip from 'jszip';

export function ImageProcessorEditor() {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [editingImage, setEditingImage] = useState<ProcessedImage | null>(null);
  const [processing, setProcessing] = useState(false);
  const zipRef = useRef<JSZip>(new JSZip());

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      originalFile: file,
      previewUrl: URL.createObjectURL(file),
      processedUrl: null,
      processedSize: 0,
      progress: 0,
      status: 'pending' as const,
    }));

    setImages((prev) => [...prev, ...newImages]);
  }, []);

  const removeImage = useCallback((id: string) => {
    console.log('Removing image with id:', id);
    setImages((prev) => {
      const image = prev.find(img => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.previewUrl);
        if (image.processedUrl) {
          URL.revokeObjectURL(image.processedUrl);
        }
        if (image.editedFile) {
          // Clean up edited file URL if it exists
          URL.revokeObjectURL(URL.createObjectURL(image.editedFile));
        }
      }
      return prev.filter(img => img.id !== id);
    });
    toast.success('Image removed successfully!');
  }, []);

  const openEditor = useCallback((image: ProcessedImage) => {
    setEditingImage(image);
  }, []);

  const handleEditSave = useCallback((editedImage: File) => {
    if (!editingImage) return;

    console.log('Saving edited image:', {
      originalSize: editingImage.originalFile.size,
      editedSize: editedImage.size,
      originalName: editingImage.originalFile.name,
      editedName: editedImage.name
    });

    // Clean up old URLs
    URL.revokeObjectURL(editingImage.previewUrl);
    if (editingImage.processedUrl) {
      URL.revokeObjectURL(editingImage.processedUrl);
    }

    const editedPreviewUrl = URL.createObjectURL(editedImage);
    
    setImages((prev) => prev.map(img => 
      img.id === editingImage.id 
        ? {
            ...img,
            originalFile: editedImage,
            previewUrl: editedPreviewUrl,
            processedUrl: null, // Clear processedUrl so preview shows
            processedSize: editedImage.size,
            status: 'edited' as const,
            progress: 100,
            editedFile: editedImage // Store the edited file
          }
        : img
    ));

    setEditingImage(null);
    toast.success('Image edited and saved successfully!');
  }, [editingImage]);

  const processAllImages = async () => {
    if (images.length === 0) return;

    setProcessing(true);
    zipRef.current = new JSZip();

    try {
      const processPromises = images.map(async (image, index) => {
        // Update status to processing
        setImages(prev => prev.map(img => 
          img.id === image.id 
            ? { ...img, status: 'processing' as const, progress: 0 }
            : img
        ));

        try {
          // Simulate processing (you can add actual image processing here)
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Use the appropriate file based on status
          let fileToProcess: File;
          if (image.status === 'edited' && image.editedFile) {
            // For edited images, use the stored edited file
            fileToProcess = image.editedFile;
          } else {
            fileToProcess = image.originalFile;
          }
          
          const processedUrl = URL.createObjectURL(fileToProcess);
          
          // Add to ZIP with appropriate filename
          let zipFileName = fileToProcess.name;
          if (image.status === 'edited' && image.editedFile) {
            const originalName = image.originalFile.name;
            const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
            const extension = originalName.substring(originalName.lastIndexOf('.'));
            zipFileName = `${nameWithoutExt}_edited${extension}`;
          }
          zipRef.current.file(zipFileName, fileToProcess);

          // Update status to completed
          setImages(prev => prev.map(img => 
            img.id === image.id 
              ? { 
                  ...img, 
                  status: 'completed' as const, 
                  processedUrl,
                  processedSize: fileToProcess.size,
                  progress: 100
                }
              : img
          ));

        } catch (error) {
          setImages(prev => prev.map(img => 
            img.id === image.id 
              ? { 
                  ...img, 
                  status: 'error' as const, 
                  error: 'Processing failed'
                }
              : img
          ));
        }
      });

      await Promise.all(processPromises);

      // Update simple counter
      const totalOriginalSize = images.reduce((sum, img) => sum + img.originalFile.size, 0);
      SimpleCounter.updateCounts(images.length, totalOriginalSize);

      // Generate and download ZIP
      const content = await zipRef.current.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'edited-images.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      toast.success('All images processed and downloaded!');
    } catch (error) {
      toast.error('Error processing images');
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  const downloadSingleImage = useCallback((image: ProcessedImage) => {
    console.log('Downloading image:', {
      id: image.id,
      status: image.status,
      hasEditedFile: !!image.editedFile,
      editedFileSize: image.editedFile?.size,
      originalFileSize: image.originalFile.size
    });
    
    // For edited images, use the editedFile if available, otherwise previewUrl
    // For other images, use processedUrl if available, otherwise previewUrl
    let fileToDownload: string;
    
    if (image.status === 'edited' && image.editedFile) {
      // Create a new URL for the edited file
      fileToDownload = URL.createObjectURL(image.editedFile);
      console.log('Using edited file for download');
    } else {
      fileToDownload = image.processedUrl || image.previewUrl;
      console.log('Using original file for download');
    }
    
    const link = document.createElement('a');
    link.href = fileToDownload;
    
    // Create a filename that indicates it's edited
    const originalName = image.originalFile.name;
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
    const extension = originalName.substring(originalName.lastIndexOf('.'));
    const editedFileName = image.status === 'edited' 
      ? `${nameWithoutExt}_edited${extension}`
      : originalName;
    
    link.download = editedFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL if we created it
    if (image.status === 'edited' && image.editedFile) {
      URL.revokeObjectURL(fileToDownload);
    }
    
    toast.success('Image downloaded successfully!');
  }, []);

  const clearAll = () => {
    images.forEach(image => {
      URL.revokeObjectURL(image.previewUrl);
      if (image.processedUrl) {
        URL.revokeObjectURL(image.processedUrl);
      }
    });
    setImages([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <ImageIcon className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Image Editor</h2>
        </div>
        <p className="text-muted-foreground">
          Crop, scale, and edit your images with precision
        </p>
      </div>

      {/* Dropzone */}
      <Dropzone onDrop={onDrop} />

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Images ({images.length})
            </h3>
            <div className="flex gap-2">
              <Button
                onClick={processAllImages}
                disabled={processing || images.length === 0}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {processing ? 'Processing...' : 'Download All'}
              </Button>
              <Button
                onClick={clearAll}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear All
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <ImageCardEnhanced
                  image={image}
                  onRemove={() => removeImage(image.id)}
                />
                <div className="absolute top-2 left-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <Button
                    onClick={() => openEditor(image)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => downloadSingleImage(image)}
                    size="sm"
                    variant="outline"
                    className="bg-white/90 hover:bg-white"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Editor Modal */}
      {editingImage && (
        <ImageEditor
          image={editingImage.originalFile}
          onSave={handleEditSave}
          onClose={() => setEditingImage(null)}
        />
      )}
    </div>
  );
}
