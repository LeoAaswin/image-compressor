import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { JsonLd } from '@/components/json-ld';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { SimpleCounterDisplay } from '@/components/simple-counter-display';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'OptiPix - Free Image Compressor, Converter & Background Remover',
    template: '%s | OptiPix',
  },
  description: 'Professional tool to compress images, convert formats (JPG, PNG, WEBP, AVIF, ICO, SVG), and automatically remove backgrounds. Free, fast, and privacy-focused.',
  keywords: [
    'image compressor', 'compress jpeg', 'compress png', 'image converter',
    'convert to webp', 'convert to avif', 'remove background', 'background remover',
    'free image tool', 'no upload image compressor', 'privacy focused'
  ],
  authors: [{ name: 'OptiPix Team' }],
  creator: 'OptiPix',
  publisher: 'OptiPix',
  metadataBase: new URL('https://optipix.dhakalasmin.com.np'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'OptiPix - Ultimate Image Optimization Tool',
    description: 'Compress, convert, and edit images locally in your browser. No file upload limits, privacy-first processing.',
    url: 'https://optipix.dhakalasmin.com.np',
    siteName: 'OptiPix',
    images: [
      {
        url: '/og-image.png', // We should make sure this exists or user knows to add it
        width: 1200,
        height: 630,
        alt: 'OptiPix Dashboard',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OptiPix - Professional Image Tools',
    description: 'Compress, convert, and remove backgrounds instantly.',
    images: ['/og-image.png'], // Reusing OG image
    creator: '@optipix',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.ico', type: 'image/x-icon' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              <SimpleCounterDisplay />
            </div>
            <Footer />
          </div>
          <Toaster />
          <JsonLd />
        </ThemeProvider>
      </body>
    </html>
  );
}