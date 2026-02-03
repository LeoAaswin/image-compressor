import Image from "next/image";
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const tools = [
    { name: "Image Compressor", href: "/compress" },
    { name: "Format Converter", href: "/convert" },
    { name: "Image Editor", href: "/edit" },
    { name: "Background Remover", href: "/remove-background" },
    { name: "Favicon Generator", href: "/favicon-generator" },
  ];

  const features = [
    "Memory-safe batch processing",
    "Multiple format support", 
    "Real-time progress tracking",
    "Advanced compression algorithms",
    "Favicon generator for all platforms",
    "AI-powered background removal",
  ];

  return (
    <footer className="border-t bg-muted/30 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2 h-24 w-24">
              <Image
                src="/camera.png"
                alt="OptiPix"
                width={32}
                height={32}
                className="object-contain h-full w-full"
              />
              <h1 className="text-2xl font-bold tracking-tight leading-tight">
                Opti<br/><span className="text-primary">Pix</span>
              </h1>
            </Link>
            <p className="text-sm text-muted-foreground">
              Professional image compression, conversion, favicon generator and editor tool with advanced
              memory management.
            </p>
          </div>

          {/* Tools Section */}
          <div className="space-y-4">
            <h3 className="font-semibold">Tools</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {tools.map((tool) => (
                <li key={tool.href}>
                  <Link 
                    href={tool.href}
                    className="hover:text-foreground transition-colors"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Features Section */}
          <div className="space-y-4">
            <h3 className="font-semibold">Features</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {features.map((feature, index) => (
                <li key={index}>• {feature}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t mt-8 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-sm text-muted-foreground">
              © {currentYear} OptiPix. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link href="/sitemap.xml" className="hover:text-foreground transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
