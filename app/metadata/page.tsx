import { MetadataTool } from '@/components/metadata-tool';

export default function MetadataPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            Metadata Viewer & Stripper
            <span className="block text-transparent bg-gradient-to-r from-primary to-primary/60 bg-clip-text">
              Protect Your Privacy
            </span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            View image details and remove hidden EXIF data — GPS location, camera model, date taken — before sharing photos online. Everything runs in your browser.
          </p>
        </div>
        <div className="bg-card/50 backdrop-blur-sm rounded-xl border p-4 sm:p-6">
          <MetadataTool />
        </div>
      </div>
    </div>
  );
}
