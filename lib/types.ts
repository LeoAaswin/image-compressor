export interface ProcessedImage {
  id: string;
  originalFile: File;
  previewUrl: string;
  processedUrl: string | null;
  processedSize: number;
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'edited' | 'error';
  error?: string;
  memoryCleaned?: boolean;
  editedFile?: File; // Store the actual edited file
}