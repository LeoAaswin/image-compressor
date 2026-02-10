import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Favicon Generator - Create Favicons for All Platforms | OptiPix',
  description: 'Generate complete favicon sets from a single image. Create favicons for iOS, Android, Windows, and all browsers with HTML code included. Download as ZIP.',
  keywords: ['favicon generator', 'favicon creator', 'apple touch icon', 'android icon', 'website icon', 'favicon maker', 'online tool'],
  openGraph: {
    title: 'Favicon Generator - OptiPix',
    description: 'Generate complete favicon sets from a single image. Create favicons for iOS, Android, Windows, and all browsers.',
    type: 'website',
    url: '/favicon-generator',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Favicon Generator - OptiPix',
    description: 'Generate complete favicon sets from a single image. Create favicons for all platforms.',
  },
  alternates: {
    canonical: '/favicon-generator',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
