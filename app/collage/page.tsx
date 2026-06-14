import { CollageProcessor } from "@/components/collage-processor";
import type { Metadata } from 'next';



export const metadata: Metadata = {
  title: 'Collage Maker — Combine Images Into Grid Layout Free',
  description: 'Create photo collages by combining multiple images into grid layouts (1×2 to 4×2). Customize gap, cell size, and background color. Free, browser-based, no uploads.',
  keywords: ['collage maker', 'photo collage', 'image grid', 'combine images', 'photo grid maker', 'collage creator', 'free collage maker', 'image collage online'],
  alternates: { canonical: '/collage' },
  openGraph: {
    title: 'Collage Maker — OptiPix',
    description: 'Combine images into beautiful grid collages. Choose layout, spacing, and background. No uploads.',
    url: '/collage',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Collage Maker — OptiPix',
    description: 'Create photo collages with grid layouts. Free and browser-based.',
  },
};

export default function CollagePage() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            Collage Maker
            <span className="block text-transparent bg-gradient-to-r from-primary to-primary/60 bg-clip-text">
              Combine into Grids
            </span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Combine multiple images into a beautiful grid collage. Choose layout, spacing, and background color. 100% private — nothing leaves your browser.
          </p>
        </div>
        <div className="bg-card/50 backdrop-blur-sm rounded-xl border p-4 sm:p-6">
          <CollageProcessor />
        </div>
      </div>
    </div>
  );
}
