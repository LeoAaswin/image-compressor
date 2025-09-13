import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompressionProcessorOptimized } from "@/components/compression-processor-optimized";
import { ConversionProcessorOptimized } from "@/components/conversion-processor-optimized";
import { ImageProcessorEditor } from "@/components/image-processor-editor";
import { SimpleCounterDisplay } from "@/components/simple-counter-display";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Enhanced Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="space-x-3">
              <div className="w-20 h-20 rounded-lg flex items-center justify-center">
                <Image
                  src="/optipixl.png"
                  alt="OptiPix"
                  width={32}
                  height={32}
                  className="object-contain h-full w-full"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-4 mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Optimize Your Images with
              <span className="block text-transparent bg-gradient-to-r from-primary to-primary/60 bg-clip-text">
                Professional Tools
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Compress and convert images with advanced memory management.
              Handle large batches safely with our optimized processing engine.
            </p>
          </div>

          {/* Enhanced Tabs */}
          <Tabs defaultValue="compress-optimized" className="space-y-8">
            <div className="flex justify-center">
              <TabsList className="grid w-full max-w-3xl grid-cols-3 lg:grid-cols-3 bg-muted/50 p-1">
                <TabsTrigger
                  value="compress-optimized"
                  className="data-[state=active]:bg-background data-[state=active]:shadow-sm relative"
                >
                  <span className="hidden sm:inline">Image Compressor</span>
                </TabsTrigger>

                <TabsTrigger
                  value="convert-optimized"
                  className="data-[state=active]:bg-background data-[state=active]:shadow-sm relative"
                >
                  <span className="hidden sm:inline">Image Converter</span>
                </TabsTrigger>

                <TabsTrigger
                  value="image-editor"
                  className="data-[state=active]:bg-background data-[state=active]:shadow-sm relative"
                >
                  <span className="hidden sm:inline">Image Editor</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="compress-optimized" className="mt-0">
              <div className="bg-card/50 backdrop-blur-sm rounded-xl border p-6">
                <CompressionProcessorOptimized />
              </div>
            </TabsContent>

            <TabsContent value="convert-optimized" className="mt-0">
              <div className="bg-card/50 backdrop-blur-sm rounded-xl border p-6">
                <ConversionProcessorOptimized />
              </div>
            </TabsContent>

            <TabsContent value="image-editor" className="mt-0">
              <div className="bg-card/50 backdrop-blur-sm rounded-xl border p-6">
                <ImageProcessorEditor />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Processing Counter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SimpleCounterDisplay />
      </div>

      {/* Enhanced Footer */}
      <footer className="border-t bg-muted/30 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 h-24 w-24">
                <Image
                  src="/optipixl.png"
                  alt="OptiPix"
                  width={32}
                  height={32}
                  className="object-contain h-full w-full"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Professional image compression and conversion tool with advanced
                memory management.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Features</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Memory-safe batch processing</li>
                <li>• Multiple format support</li>
                <li>• Real-time progress tracking</li>
                <li>• Advanced compression algorithms</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Optimized Processing</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Handles 500MB+ batches safely</li>
                <li>• Queue-based processing</li>
                <li>• Automatic memory cleanup</li>
                <li>• Error recovery & reporting</li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © 2024 OptiPix. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
