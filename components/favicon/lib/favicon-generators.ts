import { FAVICON_SIZES } from './constants';
import { createTextCanvas, createImageCanvas, canvasToBlob } from './canvas-utils';
import { GeneratedFavicon, IcoFavicon, TextFaviconSettings } from '../types';

export async function generateTextFavicon(
  size: number,
  settings: TextFaviconSettings
): Promise<GeneratedFavicon | null> {
  const canvas = createTextCanvas(size, settings);
  if (!canvas) return null;

  const blob = await canvasToBlob(canvas);
  if (!blob) return null;

  const faviconSize = FAVICON_SIZES.find((s) => s.size === size);
  if (!faviconSize) return null;

  return { size: faviconSize, blob, url: URL.createObjectURL(blob) };
}

export async function generateImageFavicon(
  size: number,
  imageSrc: string
): Promise<GeneratedFavicon | null> {
  const canvas = await createImageCanvas(size, imageSrc);
  if (!canvas) return null;

  const blob = await canvasToBlob(canvas);
  if (!blob) return null;

  const faviconSize = FAVICON_SIZES.find((s) => s.size === size);
  if (!faviconSize) return null;

  return { size: faviconSize, blob, url: URL.createObjectURL(blob) };
}

export async function generateTextIco(
  size: number,
  settings: TextFaviconSettings
): Promise<IcoFavicon | null> {
  const canvas = createTextCanvas(size, settings);
  if (!canvas) return null;

  const pngBlob = await canvasToBlob(canvas);
  if (!pngBlob) return null;

  const icoBlob = new Blob([pngBlob], { type: 'image/x-icon' });
  return {
    size,
    name: `${size}x${size}`,
    filename: size === 256 ? 'favicon.ico' : `favicon-${size}x${size}.ico`,
    blob: icoBlob,
    url: URL.createObjectURL(icoBlob),
  };
}

export async function generateImageIco(
  size: number,
  imageSrc: string
): Promise<IcoFavicon | null> {
  const canvas = await createImageCanvas(size, imageSrc);
  if (!canvas) return null;

  const pngBlob = await canvasToBlob(canvas);
  if (!pngBlob) return null;

  const icoBlob = new Blob([pngBlob], { type: 'image/x-icon' });
  return {
    size,
    name: `${size}x${size}`,
    filename: size === 256 ? 'favicon.ico' : `favicon-${size}x${size}.ico`,
    blob: icoBlob,
    url: URL.createObjectURL(icoBlob),
  };
}
