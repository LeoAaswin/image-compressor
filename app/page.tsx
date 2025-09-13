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
              Compress, convert and edit images with advanced memory management.
              Handle large batches safely with our optimized processing engine.
            </p>
          </div>

          <Tabs defaultValue="compress-optimized" className="space-y-6">
            <div className="flex justify-center">
              <TabsList className="grid w-full max-w-4xl grid-cols-1 sm:grid-cols-3 bg-muted/50 p-1 h-auto gap-1 sm:gap-0">
                <TabsTrigger
                  value="compress-optimized"
                  className="data-[state=active]:bg-background data-[state=active]:shadow-sm relative py-3 px-4 text-sm sm:text-base min-h-[48px] touch-manipulation"
                >
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <div className="w-5 h-5 sm:w-4 sm:h-4">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                        <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
                        <line x1="12" y1="22.08" x2="12" y2="12"/>
                      </svg>
                    </div>
                    <span className="font-medium">Compress</span>
                  </div>
                </TabsTrigger>

                <TabsTrigger
                  value="convert-optimized"
                  className="data-[state=active]:bg-background data-[state=active]:shadow-sm relative py-3 px-4 text-sm sm:text-base min-h-[48px] touch-manipulation"
                >
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <div className="w-5 h-5 sm:w-4 sm:h-4">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
                        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                        <circle cx="12" cy="13" r="3"/>
                      </svg>
                    </div>
                    <span className="font-medium">Convert</span>
                  </div>
                </TabsTrigger>

                <TabsTrigger
                  value="image-editor"
                  className="data-[state=active]:bg-background data-[state=active]:shadow-sm relative py-3 px-4 text-sm sm:text-base min-h-[48px] touch-manipulation"
                >
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <div className="w-5 h-5 sm:w-4 sm:h-4">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
                        <path d="M12 20h9"/>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                      </svg>
                    </div>
                    <span className="font-medium">Edit</span>
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="compress-optimized" className="mt-0">
              <div className="bg-card/50 backdrop-blur-sm rounded-xl border p-4 sm:p-6">
                <CompressionProcessorOptimized />
              </div>
            </TabsContent>

            <TabsContent value="convert-optimized" className="mt-0">
              <div className="bg-card/50 backdrop-blur-sm rounded-xl border p-4 sm:p-6">
                <ConversionProcessorOptimized />
              </div>
            </TabsContent>

            <TabsContent value="image-editor" className="mt-0">
              <div className="bg-card/50 backdrop-blur-sm rounded-xl border p-4 sm:p-6">
                <ImageProcessorEditor />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <SimpleCounterDisplay />
      </div>

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
                Professional image compression, conversion and editor tool with advanced
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
                <li>• Editor for image editing</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Optimized Processing</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Handles 500MB+ batches safely</li>
                <li>• Queue-based processing</li>
                <li>• Automatic memory cleanup</li>
                <li>• Editor for image editing</li>
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
