import { ColorPaletteExtractor } from '@/components/color-palette-extractor';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Color Palette Extractor — Extract Colors From Image',
  description: 'Extract dominant colors from any image. Get hex codes, RGB values, and color frequencies. Export as JSON or image. Free, browser-based, no uploads.',
  keywords: ['color palette extractor', 'extract colors from image', 'image color picker', 'dominant colors', 'hex color extractor', 'color finder', 'palette generator', 'free color extractor'],
  alternates: { canonical: '/color-palette' },
  openGraph: {
    title: 'Color Palette Extractor — OptiPix',
    description: 'Extract dominant colors from images instantly. Get hex, RGB values and export palettes.',
    url: '/color-palette',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Color Palette Extractor — OptiPix',
    description: 'Extract hex and RGB colors from any image. Free and browser-based.',
  },
};

export default function ColorPalettePage() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            Color Palette Extractor
            <span className="block text-transparent bg-gradient-to-r from-primary to-primary/60 bg-clip-text">
              Extract Colors from Any Image
            </span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Drop an image to instantly extract its dominant colors. Copy hex values, RGB, or CSS variables for your design workflow.
          </p>
        </div>
        <div className="bg-card/50 backdrop-blur-sm rounded-xl border p-4 sm:p-6">
          <ColorPaletteExtractor />
        </div>
      </div>
    </div>
  );
}
