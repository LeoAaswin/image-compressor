import { AnnotateProcessor } from "@/components/annotate-processor";
import type { Metadata } from 'next';



export const metadata: Metadata = {
  title: 'Image Annotator — Add Arrows Text and Shapes Free',
  description: 'Annotate images with arrows, text labels, rectangles, circles, and freehand drawing. Perfect for screenshots, tutorials, and design feedback. Free, browser-based.',
  keywords: ['image annotator', 'annotate image', 'draw on image', 'add arrows to image', 'image markup', 'screenshot annotation', 'add text to image', 'free image annotator'],
  alternates: { canonical: '/annotate' },
  openGraph: {
    title: 'Image Annotator — OptiPix',
    description: 'Draw arrows, add text, shapes and freehand on images. Perfect for screenshots and tutorials.',
    url: '/annotate',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Image Annotator — OptiPix',
    description: 'Annotate images with arrows, text and shapes. Free and browser-based.',
  },
};

export default function AnnotatePage() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            Image Annotator
            <span className="block text-transparent bg-gradient-to-r from-primary to-primary/60 bg-clip-text">
              Draw, Label & Mark
            </span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Add arrows, text labels, shapes, and freehand drawings to your images. Perfect for screenshots, tutorials, and feedback. 100% private — nothing leaves your browser.
          </p>
        </div>
        <div className="bg-card/50 backdrop-blur-sm rounded-xl border p-4 sm:p-6">
          <AnnotateProcessor />
        </div>
      </div>
    </div>
  );
}
