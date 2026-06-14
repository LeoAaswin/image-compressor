import { ImageProcessorEditor } from "@/components/image-processor-editor";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image Editor — Crop Rotate Adjust Brightness Free',
  description: 'Edit images online: crop with presets, rotate, flip, adjust brightness, contrast, and saturation. Batch editing with ZIP download. 100% browser-based.',
  keywords: ['image editor online', 'crop image', 'rotate image', 'adjust brightness', 'image contrast', 'image saturation', 'flip image', 'free image editor', 'batch image editor'],
  alternates: { canonical: '/edit' },
  openGraph: {
    title: 'Free Online Image Editor — OptiPix',
    description: 'Crop, rotate, flip and adjust images online. Social media presets, batch editing, no uploads.',
    url: '/edit',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Online Image Editor — OptiPix',
    description: 'Crop, rotate, flip, and adjust brightness/contrast. Free, private, no uploads.',
  },
};

export default function EditPage() {
  return (
    <main className="min-h-[100dvh] bg-gradient-to-br from-background via-background to-muted/20">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center space-y-3 sm:space-y-4 mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              Image Editor
              <span className="block text-transparent bg-gradient-to-r from-primary to-primary/60 bg-clip-text">
                Edit & Enhance Images
              </span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Professional image editing tools with crop, rotate, filters, and
              adjustments. Transform your images with powerful editing features.
            </p>
          </div>

          <div className="bg-transparent sm:bg-card/50 sm:backdrop-blur-sm sm:rounded-xl sm:border sm:p-6">
            <ImageProcessorEditor />
          </div>
        </div>
      </div>
    </main>
  );
}
