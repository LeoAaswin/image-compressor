import { PdfProcessor } from "@/components/pdf-processor";

export const metadata = { title: "PDF ↔ Image" };

export default function PdfPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            PDF ↔ Image
            <span className="block text-transparent bg-gradient-to-r from-primary to-primary/60 bg-clip-text">
              Convert Both Ways
            </span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Convert PDF pages to images, or combine multiple images into a PDF. High quality output with full page control. 100% private — nothing leaves your browser.
          </p>
        </div>
        <div className="bg-card/50 backdrop-blur-sm rounded-xl border p-4 sm:p-6">
          <PdfProcessor />
        </div>
      </div>
    </div>
  );
}
