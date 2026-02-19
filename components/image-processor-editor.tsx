"use client";

import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dropzone } from "@/components/dropzone";
import { ImageCardEnhanced } from "@/components/image-card-enhanced";
import { ImageEditor } from "@/components/image-editor";
import { ProcessedImage } from "@/lib/types";

import { Edit, Download, Trash2, Image as ImageIcon } from "lucide-react";
import JSZip from "jszip";

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
      status: "pending" as const,
    }));

    setImages((prev) => [...prev, ...newImages]);
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.previewUrl);
        if (image.processedUrl) URL.revokeObjectURL(image.processedUrl);
      }
      return prev.filter((img) => img.id !== id);
    });
    toast.success("Image removed successfully!");
  }, []);

  const openEditor = useCallback((image: ProcessedImage) => {
    setEditingImage(image);
  }, []);

  const handleEditSave = useCallback(
    (editedImage: File) => {
      if (!editingImage) return;

      URL.revokeObjectURL(editingImage.previewUrl);
      if (editingImage.processedUrl)
        URL.revokeObjectURL(editingImage.processedUrl);

      const editedPreviewUrl = URL.createObjectURL(editedImage);

      setImages((prev) =>
        prev.map((img) =>
          img.id === editingImage.id
            ? {
                ...img,
                originalFile: editedImage,
                previewUrl: editedPreviewUrl,
                processedUrl: null,
                processedSize: editedImage.size,
                status: "edited" as const,
                progress: 100,
                editedFile: editedImage,
              }
            : img,
        ),
      );

      setEditingImage(null);
      toast.success("Image edited and saved successfully!");
    },
    [editingImage],
  );

  const processAllImages = async () => {
    if (images.length === 0) return;

    setProcessing(true);
    zipRef.current = new JSZip();

    try {
      const processPromises = images.map(async (image) => {
        setImages((prev) =>
          prev.map((img) =>
            img.id === image.id
              ? { ...img, status: "processing" as const, progress: 0 }
              : img,
          ),
        );

        try {
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const fileToProcess =
            image.status === "edited" && image.editedFile
              ? image.editedFile
              : image.originalFile;

          const processedUrl = URL.createObjectURL(fileToProcess);
          const zipFileName = image.originalFile.name;
          zipRef.current.file(zipFileName, fileToProcess);

          setImages((prev) =>
            prev.map((img) =>
              img.id === image.id
                ? {
                    ...img,
                    status: "completed" as const,
                    processedUrl,
                    processedSize: fileToProcess.size,
                    progress: 100,
                  }
                : img,
            ),
          );
        } catch {
          setImages((prev) =>
            prev.map((img) =>
              img.id === image.id
                ? {
                    ...img,
                    status: "error" as const,
                    error: "Processing failed",
                  }
                : img,
            ),
          );
        }
      });

      await Promise.all(processPromises);

      if (images.length === 1) {
        const zipFiles = Object.keys(zipRef.current.files);
        if (zipFiles.length === 1) {
          const filename = zipFiles[0];
          const content = await zipRef.current.file(filename)?.async("blob");
          if (content) {
            const downloadUrl = URL.createObjectURL(content);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(downloadUrl);
          }
        }
      } else {
        const content = await zipRef.current.generateAsync({ type: "blob" });
        const downloadUrl = URL.createObjectURL(content);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = "edited-images.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);
      }

      toast.success("All images processed and downloaded!");
    } catch (error) {
      toast.error("Error processing images");
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  const downloadSingleImage = useCallback((image: ProcessedImage) => {
    let fileToDownload: string;

    if (image.status === "edited" && image.editedFile) {
      fileToDownload = URL.createObjectURL(image.editedFile);
    } else {
      fileToDownload = image.processedUrl || image.previewUrl;
    }

    const link = document.createElement("a");
    link.href = fileToDownload;
    link.download = image.originalFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (image.status === "edited" && image.editedFile) {
      URL.revokeObjectURL(fileToDownload);
    }

    toast.success("Image downloaded successfully!");
  }, []);

  const clearAll = () => {
    images.forEach((image) => {
      URL.revokeObjectURL(image.previewUrl);
      if (image.processedUrl) URL.revokeObjectURL(image.processedUrl);
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
          {/* Toolbar — responsive */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold">Images ({images.length})</h3>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2">
              <Button
                onClick={processAllImages}
                disabled={processing || images.length === 0}
                className="flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                <span>{processing ? "Processing..." : "Download All"}</span>
              </Button>
              <Button
                onClick={clearAll}
                variant="outline"
                className="flex items-center justify-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear All</span>
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
                {/*
                 * Action buttons:
                 * - Desktop: fade in on hover (opacity-0 group-hover:opacity-100)
                 * - Mobile: always visible (opacity-100 sm:opacity-0 sm:group-hover:opacity-100)
                 */}
                <div className="absolute top-2 left-2 flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-20">
                  <Button
                    onClick={() => openEditor(image)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 shadow-md"
                    aria-label="Edit image"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => downloadSingleImage(image)}
                    size="sm"
                    variant="outline"
                    className="bg-red-600 hover:bg-red-700 shadow-md"
                    aria-label="Download image"
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
