import { TextFaviconSettings } from '../types';

/**
 * Draws a rounded rectangle with fill and optional border on a canvas context.
 */
export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  size: number,
  radiusPercent: number,
  backgroundColor: string,
  borderColor: string,
  borderWidth: number
) {
  // Convert percentage to actual radius
  const radius = (radiusPercent / 100) * size;
  const halfBorder = borderWidth / 2;
  
  // For perfect circle, ensure radius is exactly half the size
  const actualRadius = radiusPercent >= 50 ? size / 2 : Math.min(radius, size / 2);

  ctx.beginPath();
  
  if (radiusPercent >= 50) {
    // Draw perfect circle
    ctx.arc(size / 2, size / 2, (size / 2) - halfBorder, 0, Math.PI * 2);
  } else {
    // Draw rounded rectangle with adjusted path for border
    ctx.moveTo(actualRadius + halfBorder, halfBorder);
    ctx.lineTo(size - actualRadius - halfBorder, halfBorder);
    ctx.quadraticCurveTo(size - halfBorder, halfBorder, size - halfBorder, actualRadius + halfBorder);
    ctx.lineTo(size - halfBorder, size - actualRadius - halfBorder);
    ctx.quadraticCurveTo(size - halfBorder, size - halfBorder, size - actualRadius - halfBorder, size - halfBorder);
    ctx.lineTo(actualRadius + halfBorder, size - halfBorder);
    ctx.quadraticCurveTo(halfBorder, size - halfBorder, halfBorder, size - actualRadius - halfBorder);
    ctx.lineTo(halfBorder, actualRadius + halfBorder);
    ctx.quadraticCurveTo(halfBorder, halfBorder, actualRadius + halfBorder, halfBorder);
    ctx.closePath();
  }

  // Fill background
  ctx.fillStyle = backgroundColor;
  ctx.fill();

  // Draw border if specified
  if (borderWidth > 0) {
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth;
    ctx.stroke();
  }
}

/**
 * Draws text centered on the canvas context.
 */
export function drawCenteredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  size: number,
  fontSize: number,
  fontFamily: string,
  color: string
) {
  ctx.fillStyle = color;
  ctx.font = `bold ${fontSize}px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, size / 2, size / 2);
}

/**
 * Generates a canvas with text favicon content at a given size.
 * Returns the canvas or null on failure.
 */
export function createTextCanvas(
  size: number,
  settings: TextFaviconSettings
): HTMLCanvasElement | null {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  canvas.width = size;
  canvas.height = size;

  const scaledBorderWidth = settings.borderWidth * (size / 256);
  const scaledFontSize = settings.fontSize * (size / 256);

  drawRoundedRect(ctx, size, settings.borderRadius, settings.backgroundColor, settings.borderColor, scaledBorderWidth);
  drawCenteredText(ctx, settings.faviconText, size, scaledFontSize, settings.fontFamily, settings.textColor);

  return canvas;
}

/**
 * Generates a canvas from an image source cropped to a square.
 * Returns the canvas or null on failure.
 */
export function createImageCanvas(
  size: number,
  imageSrc: string
): Promise<HTMLCanvasElement | null> {
  return new Promise((resolve) => {
    const img = document.createElement('img');
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(null); return; }

      canvas.width = size;
      canvas.height = size;

      const sourceSize = Math.min(img.width, img.height);
      const sourceX = (img.width - sourceSize) / 2;
      const sourceY = (img.height - sourceSize) / 2;
      ctx.drawImage(img, sourceX, sourceY, sourceSize, sourceSize, 0, 0, size, size);

      resolve(canvas);
    };
    img.onerror = () => resolve(null);
    img.src = imageSrc;
  });
}

/**
 * Converts a canvas to a Blob.
 */
export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 1.0));
}
