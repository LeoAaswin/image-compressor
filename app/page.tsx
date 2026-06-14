import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, Users, Zap, Shield, Clock, Cpu } from "lucide-react";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Image Tools — Compress, Convert, Edit & More',
  description: 'OptiPix offers free browser-based image tools: compress, convert, resize, edit, remove background, add watermarks, and more. No uploads, 100% private.',
  keywords: ['image tools', 'free image editor', 'image compressor', 'image converter', 'remove background', 'resize image', 'online image tool', 'privacy first'],
  alternates: { canonical: '/' },
  openGraph: {
    title: 'OptiPix — Free Image Tools Suite',
    description: 'Compress, convert, resize, edit, and more — all free, all in your browser. No uploads, no limits.',
    url: '/',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OptiPix — Free Image Tools Suite',
    description: 'Compress, convert, resize, edit images — all in your browser, 100% private.',
  },
};

export default function Home() {
  const stats = [
    { label: "Processing Power", value: "Client-Side", icon: <Zap className="w-5 h-5" /> },
    { label: "Privacy", value: "Mostly Local", icon: <Shield className="w-5 h-5" /> },
    { label: "Formats Supported", value: "15+", icon: <Users className="w-5 h-5" /> },
    { label: "Memory Safe", value: "Optimized", icon: <Clock className="w-5 h-5" /> },
  ];

  const featuredTools = [
    {
      name: 'Image Compressor',
      href: '/compress',
      description: 'Reduce file size while maintaining quality',
      features: ['Batch processing', 'Memory safe', 'Multiple formats'],
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27,6.96 12,12.01 20.73,6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
      popular: true,
      category: 'essential',
    },
    {
      name: 'Format Converter',
      href: '/convert',
      description: 'Convert between image formats',
      features: ['JPEG, PNG, WebP', 'GIF, BMP', 'Batch conversion'],
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
          <circle cx="12" cy="13" r="3" />
        </svg>
      ),
      popular: true,
      category: 'essential',
    },
    {
      name: 'Background Remover',
      href: '/remove-background',
      description: 'Remove backgrounds instantly',
      features: ['AI-powered', 'Instant results', 'High quality'],
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
          <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
          <path d="M22 21H7" />
          <path d="m5 11 9 9" />
        </svg>
      ),
      popular: true,
      category: 'advanced',
    },
  ];

  const otherTools = [
    {
      name: 'Image Editor',
      href: '/edit',
      description: 'Edit and enhance images',
      features: ['Crop & rotate', 'Filters', 'Adjustments'],
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      ),
      category: 'advanced',
    },
    {
      name: 'Favicon Generator',
      href: '/favicon-generator',
      description: 'Create favicons for all platforms',
      features: ['All sizes', 'HTML code', 'ZIP download'],
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
          <path d="M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
          <rect x="6" y="6" width="4" height="4" />
          <rect x="14" y="6" width="4" height="4" />
          <rect x="6" y="14" width="4" height="4" />
          <rect x="14" y="14" width="4" height="4" />
        </svg>
      ),
      category: 'utilities',
    },
    {
      name: 'Image Resizer',
      href: '/resize',
      description: 'Resize to any dimension instantly',
      features: ['Exact size', 'Percentage', 'Max dimension'],
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      ),
      category: 'essential',
    },
    {
      name: 'Color Palette',
      href: '/color-palette',
      description: 'Extract colors from any image',
      features: ['Hex & RGB', 'CSS variables', 'JSON export'],
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
          <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
          <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
          <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
          <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
        </svg>
      ),
      category: 'advanced',
    },
    {
      name: 'Metadata Stripper',
      href: '/metadata',
      description: 'Remove EXIF & GPS data for privacy',
      features: ['View metadata', 'Strip EXIF', 'Protect privacy'],
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      category: 'utilities',
    },
    {
      name: 'Watermark',
      href: '/watermark',
      description: 'Add text or image watermarks',
      features: ['Text & image overlay', '9-point positioning', 'Opacity control'],
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M8 11h8M8 15h5" />
        </svg>
      ),
      category: 'utilities',
    },
    {
      name: 'PDF ↔ Image',
      href: '/pdf',
      description: 'Convert PDF pages to images and vice versa',
      features: ['PDF → PNG/JPG', 'Images → PDF', 'A4 or fit-to-image'],
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
      category: 'utilities',
      badge: 'New',
    },
    {
      name: 'GIF Maker',
      href: '/gif',
      description: 'Create animated GIFs from images',
      features: ['Create from images', 'Extract frames', 'Control speed & loop'],
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
          <rect x="2" y="2" width="20" height="20" rx="2" />
          <path d="M8 12h2.5M9.5 10v4M13 10v4M13 12h3M17 10v4" />
        </svg>
      ),
      category: 'utilities',
      badge: 'New',
    },
    {
      name: 'Collage Maker',
      href: '/collage',
      description: 'Combine images into grid layouts',
      features: ['8 layout presets', 'Custom gap & size', 'PNG download'],
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
      category: 'utilities',
      badge: 'New',
    },
    {
      name: 'Image Upscaler',
      href: '/upscale',
      description: 'Enlarge images without quality loss',
      features: ['2×, 3×, 4× scale', 'Optional sharpening', 'Batch + ZIP'],
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
          <polyline points="15 3 21 3 21 9" />
          <polyline points="9 21 3 21 3 15" />
          <line x1="21" y1="3" x2="14" y2="10" />
          <line x1="3" y1="21" x2="10" y2="14" />
        </svg>
      ),
      category: 'utilities',
      badge: 'New',
    },
    {
      name: 'Image Annotator',
      href: '/annotate',
      description: 'Draw arrows, text and shapes on images',
      features: ['Pen, arrow, shapes', 'Text labels', 'Undo & download'],
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      ),
      category: 'utilities',
      badge: 'New',
    },
    {
      name: 'Blur & Redact',
      href: '/redact',
      description: 'Blur or hide sensitive regions in images',
      features: ['Blur, pixelate, black', 'Region selection', 'Preview before save'],
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      ),
      category: 'utilities',
      badge: 'New',
    },
    {
      name: 'QR Code Reader',
      href: '/qr-reader',
      description: 'Decode QR codes from any image',
      features: ['Upload & scan', 'Copy decoded text', 'Open URLs directly'],
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
          <rect x="3" y="3" width="5" height="5" />
          <rect x="4" y="4" width="3" height="3" fill="currentColor" stroke="none" />
          <rect x="16" y="3" width="5" height="5" />
          <rect x="17" y="4" width="3" height="3" fill="currentColor" stroke="none" />
          <rect x="3" y="16" width="5" height="5" />
          <rect x="4" y="17" width="3" height="3" fill="currentColor" stroke="none" />
          <path d="M16 16h2v2h-2zM20 16v2M16 20h2M20 20v-2M20 18h-2" />
        </svg>
      ),
      category: 'utilities',
      badge: 'New',
    },
  ];
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center space-y-3 sm:space-y-4 mb-8 sm:mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <Badge variant="secondary" className="text-xs">
              Privacy-First Processing
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Optimize Your Images with
            <span className="block text-transparent bg-gradient-to-r from-primary to-primary/60 bg-clip-text">
              Professional Tools
            </span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Compress, convert, edit images and generate favicons with advanced
            memory management. Handle large batches safely with our optimized
            processing engine.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" asChild>
              <Link href="/compress">
                Start Optimizing
                <TrendingUp className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="#tools">View All Tools</Link>
            </Button>
          </div>
        </div>

        {/* Featured Tools */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Most Popular Tools</h2>
            <p className="text-muted-foreground">Essential tools that professionals use daily</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredTools.map((tool, index) => (
              <Link key={index} href={tool.href} className="group">
                <div className="bg-card/50 backdrop-blur-sm rounded-xl border p-6 hover:shadow-lg transition-all duration-200 hover:border-primary/50 hover:-translate-y-1 relative overflow-hidden">
                  {tool.popular && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-primary text-primary-foreground text-xs">
                        Popular
                      </Badge>
                    </div>
                  )}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      {tool.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{tool.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {tool.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* All Tools */}
        <div id="tools" className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">All Tools</h2>
            <p className="text-muted-foreground">Complete toolkit for image optimization</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherTools.map((tool, index) => (
              <Link key={index} href={tool.href} className="group">
                <div className="bg-card/50 backdrop-blur-sm rounded-xl border p-6 hover:shadow-lg transition-all duration-200 hover:border-primary/50 hover:-translate-y-1 relative overflow-hidden">
                  {'badge' in tool && tool.badge && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">{tool.badge}</Badge>
                    </div>
                  )}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      {tool.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{tool.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {tool.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-2">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text">
                Performance Metrics
              </h2>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built for speed, privacy, and reliability. See how our tools perform.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="group relative">
                <div className="bg-gradient-to-br from-card via-card/50 to-card/30 backdrop-blur-sm rounded-2xl border border-border/50 p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-105 hover:border-primary/20 overflow-hidden">
                  {/* Animated background effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Enhanced icon container */}
                  <div className="relative flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary border border-primary/20 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300">
                    {stat.icon}
                  </div>
                  
                  {/* Value with enhanced animation */}
                  <div className="relative">
                    <div className="text-3xl sm:text-4xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors duration-300">
                      {stat.value}
                    </div>
                    
                    {/* Animated underline */}
                    <div className="h-0.5 bg-gradient-to-r from-primary to-primary/50 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  </div>
                  
                  {/* Enhanced label */}
                  <div className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Enhanced trust indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mt-12 p-6 bg-gradient-to-r from-muted/20 via-muted/10 to-muted/20 rounded-2xl border border-border/50 backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Real-Time Processing</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Privacy First*</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Zero Uploads</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
