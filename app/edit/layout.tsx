import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image Editor Online - Edit Photos & Images | OptiPix',
  description: 'Professional image editor online. Crop, rotate, apply filters and adjustments. Transform your images with powerful editing tools.',
  keywords: ['image editor', 'photo editor', 'online editor', 'crop images', 'rotate images', 'image filters', 'photo editing'],
  openGraph: {
    title: 'Image Editor Online - OptiPix',
    description: 'Professional image editor online. Crop, rotate, apply filters and adjustments.',
    type: 'website',
    url: '/edit',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Image Editor Online - OptiPix',
    description: 'Professional image editor online. Crop, rotate, apply filters and adjustments.',
  },
  alternates: {
    canonical: '/edit',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
