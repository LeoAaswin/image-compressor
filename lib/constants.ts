export const IMAGE_FORMATS = {
  JPEG: { id: 'jpeg', label: 'JPEG', mimeType: 'image/jpeg' },
  PNG: { id: 'png', label: 'PNG', mimeType: 'image/png' },
  WEBP: { id: 'webp', label: 'WEBP', mimeType: 'image/webp' },
  GIF: { id: 'gif', label: 'GIF', mimeType: 'image/gif' },
  BMP: { id: 'bmp', label: 'BMP', mimeType: 'image/bmp' },
  TIFF: { id: 'tiff', label: 'TIFF', mimeType: 'image/tiff' },
} as const;

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const SUPPORTED_FORMATS = Object.values(IMAGE_FORMATS).map(
  (format) => format.mimeType
);