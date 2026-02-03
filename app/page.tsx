import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompressionProcessorOptimized } from "@/components/compression-processor-optimized";
import { ConversionProcessorOptimized } from "@/components/conversion-processor-optimized";
import { ImageProcessorEditor } from "@/components/image-processor-editor";
import { BackgroundRemovalProcessor } from "@/components/background-removal-processor";
import { FaviconGenerator } from "@/components/favicon-generator";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            Optimize Your Images with
            <span className="block text-transparent bg-gradient-to-r from-primary to-primary/60 bg-clip-text">
              Professional Tools
            </span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Compress, convert, edit images and generate favicons with advanced
            memory management. Handle large batches safely with our optimized
            processing engine.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link href="/compress" className="group">
            <div className="bg-card/50 backdrop-blur-sm rounded-xl border p-6 hover:shadow-lg transition-all duration-200 hover:border-primary/50">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-6 h-6"
                  >
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27,6.96 12,12.01 20.73,6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Image Compressor</h3>
                  <p className="text-sm text-muted-foreground">
                    Reduce file size while maintaining quality
                  </p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                • Batch processing • Memory safe • Multiple formats
              </div>
            </div>
          </Link>

          <Link href="/convert" className="group">
            <div className="bg-card/50 backdrop-blur-sm rounded-xl border p-6 hover:shadow-lg transition-all duration-200 hover:border-primary/50">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-6 h-6"
                  >
                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                    <circle cx="12" cy="13" r="3" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Format Converter</h3>
                  <p className="text-sm text-muted-foreground">
                    Convert between image formats
                  </p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                • JPEG, PNG, WebP • GIF, BMP • Batch conversion
              </div>
            </div>
          </Link>

          <Link href="/edit" className="group">
            <div className="bg-card/50 backdrop-blur-sm rounded-xl border p-6 hover:shadow-lg transition-all duration-200 hover:border-primary/50">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-6 h-6"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Image Editor</h3>
                  <p className="text-sm text-muted-foreground">
                    Edit and enhance images
                  </p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                • Crop & rotate • Filters • Adjustments
              </div>
            </div>
          </Link>

          <Link href="/remove-background" className="group">
            <div className="bg-card/50 backdrop-blur-sm rounded-xl border p-6 hover:shadow-lg transition-all duration-200 hover:border-primary/50">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-6 h-6"
                  >
                    <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
                    <path d="M22 21H7" />
                    <path d="m5 11 9 9" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Background Remover</h3>
                  <p className="text-sm text-muted-foreground">
                    Remove backgrounds instantly
                  </p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                • AI-powered • Instant results • High quality
              </div>
            </div>
          </Link>

          <Link href="/favicon-generator" className="group">
            <div className="bg-card/50 backdrop-blur-sm rounded-xl border p-6 hover:shadow-lg transition-all duration-200 hover:border-primary/50">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-6 h-6"
                  >
                    <path d="M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
                    <rect x="6" y="6" width="4" height="4" />
                    <rect x="14" y="6" width="4" height="4" />
                    <rect x="6" y="14" width="4" height="4" />
                    <rect x="14" y="14" width="4" height="4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Favicon Generator</h3>
                  <p className="text-sm text-muted-foreground">
                    Create favicons for all platforms
                  </p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                • All sizes • HTML code • ZIP download
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
