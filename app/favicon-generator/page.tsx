import { FaviconGenerator } from "@/components/favicon/FaviconGenerator";

export default function FaviconGeneratorPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center space-y-3 sm:space-y-4 mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              Favicon Generator
              <span className="block text-transparent bg-gradient-to-r from-primary to-primary/60 bg-clip-text">
                Create Favicons for All Platforms
              </span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Generate complete favicon sets from a single image. Create
              favicons for iOS, Android, Windows, and all browsers with HTML
              code included.
            </p>
          </div>

          <div className="bg-card/50 backdrop-blur-sm rounded-xl border p-4 sm:p-6">
            <FaviconGenerator />
          </div>
        </div>
      </div>
    </main>
  );
}
