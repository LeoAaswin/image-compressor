import { GenerationMode } from '../types';

export function generateHTMLCode(): string {
  return `<!-- Favicon HTML Code - Essential Standard Sizes -->
<!-- Core browser support -->
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">

<!-- Apple iOS support -->
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png">

<!-- Android and PWA support -->
<link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png">
<link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#000000">

<!-- Place all files in website root directory -->`;
}

export function generateWebManifest(mode: GenerationMode, backgroundColor: string): string {
  const themeColor = mode === 'text' ? backgroundColor : '#000000';

  const manifest = {
    name: 'Your Website',
    short_name: 'Website',
    description: 'A professional website with optimized favicons',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: themeColor,
    orientation: 'portrait-primary',
    scope: '/',
    icons: [
      { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
      { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
      { src: '/apple-touch-icon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
  };

  return JSON.stringify(manifest, null, 2);
}
