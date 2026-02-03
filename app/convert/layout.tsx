import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image Format Converter - Convert JPEG PNG WebP | OptiPix',
  description: 'Convert images between formats online. Support for JPEG, PNG, WebP, GIF, BMP and more. Batch conversion with quality preservation.',
  keywords: ['image converter', 'format converter', 'JPEG to PNG', 'PNG to WebP', 'image format', 'online converter'],
  openGraph: {
    title: 'Image Format Converter - OptiPix',
    description: 'Convert images between formats online. Support for JPEG, PNG, WebP, GIF, BMP and more.',
    type: 'website',
    url: '/convert',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Image Format Converter - OptiPix',
    description: 'Convert images between formats online. Support for JPEG, PNG, WebP, GIF, BMP and more.',
  },
  alternates: {
    canonical: '/convert',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
