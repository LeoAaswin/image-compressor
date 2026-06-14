import { ConversionProcessorOptimized } from "@/components/conversion-processor-optimized";
import { SimpleCounterDisplay } from "@/components/simple-counter-display";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image Converter — Convert JPG PNG WebP AVIF Free',
  description: 'Convert images between JPG, PNG, WebP, AVIF, GIF, BMP, TIFF, ICO and SVG. Batch convert with a single click. Free, fast, and private — no uploads.',
  keywords: ['image converter', 'convert jpg to png', 'convert to webp', 'convert to avif', 'png to jpg', 'jpg to webp', 'batch image converter', 'free image converter'],
  alternates: { canonical: '/convert' },
  openGraph: {
    title: 'Free Image Format Converter — OptiPix',
    description: 'Convert images between any format — JPG, PNG, WebP, AVIF, SVG and more. Batch processing, no uploads.',
    url: '/convert',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Image Format Converter — OptiPix',
    description: 'Convert between JPG, PNG, WebP, AVIF, GIF, BMP, ICO and SVG. Free and private.',
  },
};

export default function ConvertPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center space-y-3 sm:space-y-4 mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              Image Format Converter
              <span className="block text-transparent bg-gradient-to-r from-primary to-primary/60 bg-clip-text">
                Convert Between Formats
              </span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Convert images between different formats with support for JPEG,
              PNG, WebP, and more. Maintain quality while changing formats.
            </p>
          </div>

          <div className="bg-card/50 backdrop-blur-sm rounded-xl border p-4 sm:p-6">
            <ConversionProcessorOptimized />
          </div>
        </div>
      </div>
    </main>
  );
}
