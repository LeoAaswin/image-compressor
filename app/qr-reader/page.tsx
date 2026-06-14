import { QrReader } from "@/components/qr-reader";
import type { Metadata } from 'next';



export const metadata: Metadata = {
  title: 'QR Code Reader — Decode QR Codes From Images Free',
  description: 'Upload any image to instantly decode QR codes. Supports multiple QR codes per image. Copy decoded text or open URLs directly. Free, browser-based, no uploads.',
  keywords: ['qr code reader', 'qr code decoder', 'scan qr code from image', 'qr code scanner', 'decode qr code', 'read qr code online', 'free qr reader'],
  alternates: { canonical: '/qr-reader' },
  openGraph: {
    title: 'QR Code Reader — OptiPix',
    description: 'Decode QR codes from any image instantly. No camera needed — upload an image to scan.',
    url: '/qr-reader',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QR Code Reader — OptiPix',
    description: 'Decode QR codes from uploaded images. Free, instant, browser-based.',
  },
};

export default function QrReaderPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            QR Code Reader
            <span className="block text-transparent bg-gradient-to-r from-primary to-primary/60 bg-clip-text">
              Decode Instantly
            </span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Upload any image containing a QR code and instantly decode its content. Supports multiple QR codes per image. 100% private — nothing leaves your browser.
          </p>
        </div>
        <div className="bg-card/50 backdrop-blur-sm rounded-xl border p-4 sm:p-6">
          <QrReader />
        </div>
      </div>
    </div>
  );
}
