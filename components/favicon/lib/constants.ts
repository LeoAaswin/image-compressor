import { FaviconSize } from '../types';

export const FAVICON_SIZES: FaviconSize[] = [
  { size: 16, name: 'Favicon', filename: 'favicon-16x16.png' },
  { size: 32, name: 'Favicon', filename: 'favicon-32x32.png' },
  { size: 180, name: 'iOS', filename: 'apple-touch-icon-180x180.png' },
  { size: 192, name: 'Android', filename: 'android-chrome-192x192.png' },
  { size: 512, name: 'Android', filename: 'android-chrome-512x512.png' },
];

export const ICO_SIZES = [16, 32, 48];

export const DEFAULT_TEXT_SETTINGS = {
  faviconText: 'OP',
  textColor: '#ffffff',
  backgroundColor: '#3b82f6',
  borderColor: '#1e40af',
  borderWidth: 2,
  borderRadius: 25, // Changed from 8 to 25 (25% for more rounded appearance)
  fontSize: 24,
  fontFamily: 'Arial, sans-serif',
};

export const FONT_OPTIONS = [
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: "'Courier New', monospace", label: 'Courier New' },
  { value: "'Times New Roman', serif", label: 'Times New Roman' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: "'Trebuchet MS', sans-serif", label: 'Trebuchet MS' },
  { value: "'Comic Sans MS', cursive", label: 'Comic Sans' },
  { value: 'Impact, fantasy', label: 'Impact' },
  { value: "'Lucida Console', monospace", label: 'Lucida Console' },
  { value: 'Tahoma, sans-serif', label: 'Tahoma' },
  { value: "'Palatino Linotype', 'Book Antiqua', Palatino, serif", label: 'Palatino' },
  { value: "'Gill Sans', 'Gill Sans MT', Calibri, sans-serif", label: 'Gill Sans' },
  { value: "'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif", label: 'Franklin Gothic' },
  { value: 'system-ui, -apple-system, sans-serif', label: 'System UI' },
  { value: 'monospace', label: 'Monospace' },
  { value: 'cursive', label: 'Cursive' },
  { value: 'fantasy', label: 'Fantasy' },
];
