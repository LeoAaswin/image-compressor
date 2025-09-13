export const IMAGE_FORMATS = {
  JPEG: { id: 'jpeg', label: 'JPEG', mimeType: 'image/jpeg' },
  PNG: { id: 'png', label: 'PNG', mimeType: 'image/png' },
  WEBP: { id: 'webp', label: 'WEBP', mimeType: 'image/webp' },
  GIF: { id: 'gif', label: 'GIF', mimeType: 'image/gif' },
  BMP: { id: 'bmp', label: 'BMP', mimeType: 'image/bmp' },
  TIFF: { id: 'tiff', label: 'TIFF', mimeType: 'image/tiff' },
};

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_TOTAL_SIZE = 500 * 1024 * 1024; // 500MB total batch limit
export const MAX_CONCURRENT_PROCESSING = 3; // Limit concurrent processing
export const MEMORY_WARNING_THRESHOLD = 0.8; // 80% memory usage warning
export const SUPPORTED_FORMATS = Object.values(IMAGE_FORMATS).map(
  (format) => format.mimeType
);