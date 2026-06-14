import { BackgroundRemovalProcessor } from "@/components/background-removal-processor";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Background Remover — Remove Image Background Free',
  description: 'Remove image backgrounds automatically using AI. Get transparent PNG output instantly. Free to use with rate limiting for fair access.',
  keywords: ['remove background', 'background remover', 'transparent background', 'remove image background', 'ai background removal', 'png transparent', 'free background remover'],
  alternates: { canonical: '/remove-background' },
  openGraph: {
    title: 'AI Background Remover — OptiPix',
    description: 'Remove image backgrounds automatically with AI. Transparent PNG output, instant results.',
    url: '/remove-background',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Background Remover — OptiPix',
    description: 'Remove image backgrounds with AI. Free, transparent PNG output.',
  },
};

export default function RemoveBackgroundPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center space-y-3 sm:space-y-4 mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              Background Remover
              <span className="block text-transparent bg-gradient-to-r from-primary to-primary/60 bg-clip-text">
                Remove Image Backgrounds
              </span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Remove backgrounds from images instantly with AI-powered
              technology. Perfect for product photos, portraits, and graphics.
            </p>
          </div>

          <div className="bg-card/50 backdrop-blur-sm rounded-xl border p-4 sm:p-6">
            <BackgroundRemovalProcessor />
          </div>
        </div>
      </div>
    </main>
  );
}
