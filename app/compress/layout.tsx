import { Metadata } from 'next';
import { CompressionProcessorOptimized } from "@/components/compression-processor-optimized";
import { SimpleCounterDisplay } from "@/components/simple-counter-display";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: 'Image Compression Tool - Optimize Images Online | OptiPix',
  description: 'Compress images online with advanced memory management. Reduce file size while maintaining quality. Batch processing, multiple formats support, and memory-safe optimization.',
  keywords: ['image compression', 'optimize images', 'reduce file size', 'batch compression', 'image optimizer', 'online tool'],
  openGraph: {
    title: 'Image Compression Tool - OptiPix',
    description: 'Compress images online with advanced algorithms. Reduce file size while maintaining quality.',
    type: 'website',
    url: '/compress',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Image Compression Tool - OptiPix',
    description: 'Compress images online with advanced algorithms. Reduce file size while maintaining quality.',
  },
  alternates: {
    canonical: '/compress',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
