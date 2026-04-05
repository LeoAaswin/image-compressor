import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const essentialTools = [
    { name: "Image Compressor", href: "/compress" },
    { name: "Format Converter", href: "/convert" },
    { name: "Image Resizer", href: "/resize" },
    { name: "Background Remover", href: "/remove-background" },
  ];

  const advancedTools = [
    { name: "Color Palette", href: "/color-palette" },
    { name: "Metadata Stripper", href: "/metadata" },
    { name: "Image Editor", href: "/edit" },
    { name: "Favicon Generator", href: "/favicon-generator" },
    { name: "Watermark", href: "/watermark" },
  ];

  const resources = [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Sitemap", href: "/sitemap.xml" },
  ];

  return (
    <footer className="relative border-t border-border/50 bg-gradient-to-b from-transparent to-muted/50 mt-16 pt-16 shadow-[0_-15px_40px_-15px_rgba(0,0,0,0.1)] overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-24 bg-primary/10 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-12">
          {/* Brand Section  (Spans 4 cols on large) */}
          <div className="md:col-span-12 lg:col-span-3 space-y-6">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center p-1.5 border border-primary/20 group-hover:border-primary/40 transition-colors">
                <Image
                  src="/camera.png"
                  alt="OptiPix"
                  width={32}
                  height={32}
                  className="object-contain h-full w-full"
                />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">
                Opti<span className="text-primary">Pix</span>
              </h1>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Professional image compression, conversion, favicon generator and editor tool with advanced
              memory management. All processed securely in your browser.
            </p>
          </div>

          {/* Tools Section 1 (Spans 3 cols) */}
          <div className="md:col-span-4 lg:col-span-3 lg:ml-8 space-y-4">
            <h3 className="font-semibold text-foreground tracking-tight">Essential</h3>
            <ul className="space-y-3">
              {essentialTools.map((tool) => (
                <li key={tool.href}>
                  <Link 
                    href={tool.href}
                    className="text-sm text-muted-foreground hover:text-primary hover:translate-x-1 transition-all inline-flex items-center group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/0 group-hover:bg-primary/50 mr-2 transition-colors"></span>
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools Section 2 (Spans 3 cols) */}
          <div className="md:col-span-4 lg:col-span-3 space-y-4">
            <h3 className="font-semibold text-foreground tracking-tight">Advanced</h3>
            <ul className="space-y-3">
              {advancedTools.map((tool) => (
                <li key={tool.href}>
                  <Link 
                    href={tool.href}
                    className="text-sm text-muted-foreground hover:text-primary hover:translate-x-1 transition-all inline-flex items-center group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/0 group-hover:bg-primary/50 mr-2 transition-colors"></span>
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Section (Spans 3 cols) */}
          <div className="md:col-span-4 lg:col-span-3 space-y-4">
            <h3 className="font-semibold text-foreground tracking-tight">Legal & Links</h3>
            <ul className="space-y-3">
              {resources.map((item) => (
                <li key={item.href}>
                  <Link 
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-primary hover:translate-x-1 transition-all inline-flex items-center group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/0 group-hover:bg-primary/50 mr-2 transition-colors"></span>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border/50 py-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-muted-foreground flex items-center">
            © {currentYear} OptiPix. Crafted with <Heart className="w-3.5 h-3.5 text-red-500 mx-1.5 animate-pulse" /> for creators.
          </p>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <p>Made for space and privacy</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
