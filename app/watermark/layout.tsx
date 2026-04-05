import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image Watermark - Add Watermarks Online | OptiPix',
  description: 'Add text or image watermarks to your photos online. Control opacity, position, font size, and color. Batch watermark with ZIP download. Free, fast, and private — all processing in your browser.',
  keywords: ['image watermark', 'add watermark', 'watermark photo', 'text watermark', 'logo watermark', 'batch watermark', 'watermark online'],
  openGraph: {
    title: 'Image Watermark - OptiPix',
    description: 'Add text or image watermarks to your photos. Control opacity, position, and style. Batch support with ZIP download.',
    type: 'website',
    url: '/watermark',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Image Watermark - OptiPix',
    description: 'Add text or image watermarks to photos. Opacity, position, and batch support.',
  },
  alternates: { canonical: '/watermark' },
};

export default function WatermarkLayout({ children }: { children: React.ReactNode }) {
  return children;
}
