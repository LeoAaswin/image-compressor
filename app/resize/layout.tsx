import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image Resizer - Resize Images Online | OptiPix',
  description: 'Resize images online by exact dimensions, percentage, or max dimension. Batch resize with aspect ratio lock. Free, fast, and private — all processing in your browser.',
  keywords: ['image resizer', 'resize image', 'bulk resize', 'scale image', 'image dimensions', 'aspect ratio'],
  openGraph: {
    title: 'Image Resizer - OptiPix',
    description: 'Resize images by exact dimensions, percentage, or max dimension. Batch support with ZIP download.',
    type: 'website',
    url: '/resize',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Image Resizer - OptiPix',
    description: 'Resize images by exact dimensions, percentage, or max dimension.',
  },
  alternates: { canonical: '/resize' },
};

export default function ResizeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
