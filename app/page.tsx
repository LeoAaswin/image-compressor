import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompressionProcessor } from '@/components/compression-processor';
import { ConversionProcessor } from '@/components/conversion-processor';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold">Image Processor</h1>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      <div className="py-8">
        <div className="w-full max-w-6xl mx-auto px-6">
          <Tabs defaultValue="compress" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="compress">Compression</TabsTrigger>
              <TabsTrigger value="convert">Conversion</TabsTrigger>
            </TabsList>
            <TabsContent value="compress">
              <CompressionProcessor />
            </TabsContent>
            <TabsContent value="convert">
              <ConversionProcessor />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <footer className="border-t mt-12">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <p className="text-center text-sm text-muted-foreground">
            Image Processor - A powerful tool for compressing and converting images
          </p>
        </div>
      </footer>
    </main>
  );
}