export interface ProcessedImage {
  id: string;
  originalFile: File;
  previewUrl: string;
  processedUrl: string | null;
  processedSize: number;
  progress: number;
}