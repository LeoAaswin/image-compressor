import { WatermarkProcessor } from "@/components/watermark-processor";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image Watermark Tool — Add Text or Image Watermark',
  description: 'Add text or image watermarks to photos. Control position, opacity, font size, and color. Batch watermark multiple images and download as ZIP. Free, no uploads.',
  keywords: ['image watermark', 'add watermark to image', 'watermark photos', 'text watermark', 'image watermark tool', 'batch watermark', 'watermark online free', 'photo watermark'],
  alternates: { canonical: '/watermark' },
  openGraph: {
    title: 'Free Image Watermark Tool — OptiPix',
    description: 'Add text or image watermarks to photos. 9-point positioning, opacity control, batch processing.',
    url: '/watermark',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Image Watermark Tool — OptiPix',
    description: 'Add text or image watermarks. Batch process and download as ZIP. Free.',
  },
};

export default function WatermarkPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            Image Watermark
            <span className="block text-transparent bg-gradient-to-r from-primary to-primary/60 bg-clip-text">
              Protect Your Work
            </span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Add text or image watermarks to your photos. Control opacity, position, and style.
            Batch process multiple images and download as ZIP. 100% private — nothing leaves your browser.
          </p>
        </div>
        <div className="bg-card/50 backdrop-blur-sm rounded-xl border p-4 sm:p-6">
          <WatermarkProcessor />
        </div>
      </div>
    </div>
  );
}
