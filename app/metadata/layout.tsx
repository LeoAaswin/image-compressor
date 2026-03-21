import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image Metadata Viewer & Stripper - Remove EXIF Data | OptiPix',
  description: 'View image metadata including dimensions, file size, and format. Strip EXIF data (GPS location, camera info) for privacy. 100% client-side — your images never leave your browser.',
  keywords: ['image metadata', 'EXIF remover', 'strip EXIF', 'remove GPS data', 'image privacy', 'metadata viewer'],
  openGraph: {
    title: 'Image Metadata Stripper - OptiPix',
    description: 'View and strip EXIF metadata from images for privacy. GPS, camera data removed instantly.',
    type: 'website',
    url: '/metadata',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Image Metadata Stripper - OptiPix',
    description: 'View and strip EXIF metadata from images for privacy.',
  },
  alternates: { canonical: '/metadata' },
};

export default function MetadataLayout({ children }: { children: React.ReactNode }) {
  return children;
}
