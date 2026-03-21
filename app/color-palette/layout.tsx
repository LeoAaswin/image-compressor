import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Color Palette Extractor - Extract Colors from Images | OptiPix',
  description: 'Extract dominant colors from any image. Get hex and RGB values, copy as CSS variables, and download your palette as JSON. Perfect for designers and developers.',
  keywords: ['color palette', 'extract colors', 'dominant colors', 'color picker', 'image colors', 'hex colors'],
  openGraph: {
    title: 'Color Palette Extractor - OptiPix',
    description: 'Extract dominant colors from images. Copy hex, RGB, or CSS variables instantly.',
    type: 'website',
    url: '/color-palette',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Color Palette Extractor - OptiPix',
    description: 'Extract dominant colors from images. Copy hex, RGB, or CSS variables instantly.',
  },
  alternates: { canonical: '/color-palette' },
};

export default function ColorPaletteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
