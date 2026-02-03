import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Background Remover - Remove Image Backgrounds Online | OptiPix',
  description: 'Remove backgrounds from images instantly with AI-powered technology. Perfect for product photos, portraits, and graphics. High quality results.',
  keywords: ['background remover', 'remove background', 'AI background removal', 'transparent background', 'photo editor', 'image background'],
  openGraph: {
    title: 'Background Remover - OptiPix',
    description: 'Remove backgrounds from images instantly with AI-powered technology. Perfect for product photos and portraits.',
    type: 'website',
    url: '/remove-background',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Background Remover - OptiPix',
    description: 'Remove backgrounds from images instantly with AI-powered technology.',
  },
  alternates: {
    canonical: '/remove-background',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
