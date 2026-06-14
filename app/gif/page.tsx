import { GifProcessor } from "@/components/gif-processor";

export const metadata = { title: "GIF Maker" };

export default function GifPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            GIF Maker
            <span className="block text-transparent bg-gradient-to-r from-primary to-primary/60 bg-clip-text">
              Create & Extract Animations
            </span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Create animated GIFs from multiple images, or extract individual frames from an existing GIF. Control speed and loop settings. 100% private — nothing leaves your browser.
          </p>
        </div>
        <div className="bg-card/50 backdrop-blur-sm rounded-xl border p-4 sm:p-6">
          <GifProcessor />
        </div>
      </div>
    </div>
  );
}
