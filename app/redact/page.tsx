import { RedactProcessor } from "@/components/redact-processor";
import type { Metadata } from 'next';



export const metadata: Metadata = {
  title: 'Image Redaction Tool — Blur & Pixelate Sensitive Areas',
  description: 'Blur, pixelate, or black out sensitive regions in images. Protect faces, license plates, and private data before sharing. Free, browser-based, no uploads.',
  keywords: ['image redaction', 'blur face', 'blur image region', 'pixelate image', 'censor image', 'hide sensitive info', 'blur photo', 'image privacy tool', 'redact photo'],
  alternates: { canonical: '/redact' },
  openGraph: {
    title: 'Image Redaction Tool — OptiPix',
    description: 'Blur, pixelate, or black out regions in images. Protect faces and sensitive data before sharing.',
    url: '/redact',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Image Redaction Tool — OptiPix',
    description: 'Blur or pixelate sensitive areas in photos. Free and private.',
  },
};

export default function RedactPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            Blur & Redact
            <span className="block text-transparent bg-gradient-to-r from-primary to-primary/60 bg-clip-text">
              Protect Sensitive Info
            </span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Select and blur or pixelate regions in your images. Perfect for hiding faces, license plates, or sensitive data. 100% private — nothing leaves your browser.
          </p>
        </div>
        <div className="bg-card/50 backdrop-blur-sm rounded-xl border p-4 sm:p-6">
          <RedactProcessor />
        </div>
      </div>
    </div>
  );
}
