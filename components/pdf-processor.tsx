"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { trackUpload } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Download, Trash2, FileText, ImageIcon, Loader2 } from "lucide-react";
import JSZip from "jszip";

interface PageImage { url: string; pageNum: number }

export function PdfProcessor() {
  // PDF → Images
  const [pdfPages, setPdfPages] = useState<PageImage[]>([]);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scale, setScale] = useState(2);

  // Images → PDF
  const [pdfImages, setPdfImages] = useState<{ url: string; img: HTMLImageElement; name: string }[]>([]);
  const [building, setBuilding] = useState(false);
  const [pdfFormat, setPdfFormat] = useState<"fit" | "a4">("fit");

  const { getRootProps: getPdfProps, getInputProps: getPdfInput, isDragActive: isPdfDrag } = useDropzone({
    onDrop: async (files) => {
      trackUpload(files);
      if (!files[0]) return;
      setPdfPages([]);
      setConverting(true);
      setProgress(0);
      try {
        await convertPdfToImages(files[0]);
      } finally {
        setConverting(false);
      }
    },
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  const { getRootProps: getImgProps, getInputProps: getImgInput, isDragActive: isImgDrag } = useDropzone({
    onDrop: (files) => {
      trackUpload(files);
      files.forEach((file) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => setPdfImages((prev) => [...prev, { url, img, name: file.name }]);
        img.src = url;
      });
    },
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [] },
    multiple: true,
  });

  const convertPdfToImages = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const pages: PageImage[] = [];

      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx as any, viewport, canvas: canvas as any }).promise;
        pages.push({ url: canvas.toDataURL("image/png"), pageNum: i });
        setProgress(Math.round((i / doc.numPages) * 100));
      }
      setPdfPages(pages);
      toast.success(`Converted ${doc.numPages} page${doc.numPages !== 1 ? "s" : ""}`);
    } catch (err: any) {
      if (err?.name === "PasswordException" || err?.message?.toLowerCase().includes("password")) {
        toast.error("This PDF is password-protected. Please remove the password and try again.");
      } else {
        toast.error("Failed to convert PDF. The file may be corrupted or unsupported.");
      }
      console.error(err);
    }
  };

  const downloadAllPages = async () => {
    if (pdfPages.length === 0) return;
    const zip = new JSZip();
    pdfPages.forEach((p) => {
      const base64 = p.url.split(",")[1];
      zip.file(`page_${p.pageNum}.png`, base64, { base64: true });
    });
    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "pdf_pages.zip";
    a.click();
    toast.success("Downloaded all pages as ZIP");
  };

  const downloadPage = (url: string, pageNum: number) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `page_${pageNum}.png`;
    a.click();
  };

  const buildPdf = async () => {
    if (pdfImages.length === 0) { toast.error("Add at least one image"); return; }
    setBuilding(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.create();

      for (const item of pdfImages) {
        let pdfImage;
        const response = await fetch(item.url);
        const bytes = await response.arrayBuffer();
        try {
          pdfImage = await pdfDoc.embedJpg(bytes);
        } catch {
          try {
            pdfImage = await pdfDoc.embedPng(bytes);
          } catch {
            // Convert to PNG via canvas
            const canvas = document.createElement("canvas");
            canvas.width = item.img.naturalWidth;
            canvas.height = item.img.naturalHeight;
            canvas.getContext("2d")!.drawImage(item.img, 0, 0);
            const pngBytes = await new Promise<ArrayBuffer>((res) => {
              canvas.toBlob((b) => b!.arrayBuffer().then(res), "image/png");
            });
            pdfImage = await pdfDoc.embedPng(pngBytes);
          }
        }

        const { width: imgW, height: imgH } = pdfImage;
        let pageW = imgW, pageH = imgH;
        if (pdfFormat === "a4") {
          const a4W = 595, a4H = 842;
          const ratio = Math.min(a4W / imgW, a4H / imgH);
          pageW = a4W; pageH = a4H;
          const drawW = imgW * ratio, drawH = imgH * ratio;
          const page = pdfDoc.addPage([pageW, pageH]);
          page.drawImage(pdfImage, { x: (a4W - drawW) / 2, y: (a4H - drawH) / 2, width: drawW, height: drawH });
        } else {
          const page = pdfDoc.addPage([imgW, imgH]);
          page.drawImage(pdfImage, { x: 0, y: 0, width: imgW, height: imgH });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "images.pdf";
      a.click();
      toast.success("PDF created and downloaded!");
    } catch (err) {
      toast.error("Failed to create PDF");
      console.error(err);
    } finally {
      setBuilding(false);
    }
  };

  return (
    <Tabs defaultValue="pdf-to-img">
      <TabsList className="mb-6">
        <TabsTrigger value="pdf-to-img"><FileText className="w-4 h-4 mr-2" />PDF → Images</TabsTrigger>
        <TabsTrigger value="img-to-pdf"><ImageIcon className="w-4 h-4 mr-2" />Images → PDF</TabsTrigger>
      </TabsList>

      <TabsContent value="pdf-to-img" className="space-y-6">
        <div {...getPdfProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isPdfDrag ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"}`}>
          <input {...getPdfInput()} />
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="w-7 h-7 text-primary" />
            </div>
            <p className="font-semibold">{isPdfDrag ? "Drop PDF here" : "Upload a PDF file"}</p>
            <p className="text-sm text-muted-foreground">Each page will be exported as a high-quality PNG</p>
          </div>
        </div>

        <div className="flex items-center gap-4 max-w-sm">
          <Label className="text-sm shrink-0">Quality: {scale}x</Label>
          <Slider value={[scale]} onValueChange={([v]) => setScale(v)} min={1} max={4} step={0.5} className="flex-1" />
        </div>

        {converting && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Converting pages… {progress}%
            </div>
            <Progress value={progress} />
          </div>
        )}

        {pdfPages.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{pdfPages.length} page{pdfPages.length !== 1 ? "s" : ""} converted</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPdfPages([])}><Trash2 className="w-4 h-4 mr-1" />Clear</Button>
                <Button size="sm" onClick={downloadAllPages}><Download className="w-4 h-4 mr-1" />Download All (ZIP)</Button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {pdfPages.map((p) => (
                <div key={p.pageNum} className="group relative border rounded-xl overflow-hidden bg-white">
                  <img src={p.url} alt={`Page ${p.pageNum}`} className="w-full object-contain" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button size="sm" onClick={() => downloadPage(p.url, p.pageNum)}><Download className="w-4 h-4 mr-1" />Page {p.pageNum}</Button>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-xs text-center py-1">Page {p.pageNum}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </TabsContent>

      <TabsContent value="img-to-pdf" className="space-y-6">
        <div {...getImgProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isImgDrag ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"}`}>
          <input {...getImgInput()} />
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <ImageIcon className="w-7 h-7 text-primary" />
            </div>
            <p className="font-semibold">{isImgDrag ? "Drop images here" : "Upload images for PDF"}</p>
            <p className="text-sm text-muted-foreground">{pdfImages.length > 0 ? `${pdfImages.length} image${pdfImages.length !== 1 ? "s" : ""} added` : "JPG, PNG, WebP — order = page order"}</p>
          </div>
        </div>

        {pdfImages.length > 0 && (
          <>
            <div className="flex gap-2 items-center flex-wrap">
              <Label className="text-sm mr-2">Page size:</Label>
              <Button size="sm" variant={pdfFormat === "fit" ? "default" : "outline"} onClick={() => setPdfFormat("fit")}>Fit to image</Button>
              <Button size="sm" variant={pdfFormat === "a4" ? "default" : "outline"} onClick={() => setPdfFormat("a4")}>A4 page</Button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {pdfImages.map((item, i) => (
                <div key={i} className="relative group">
                  <div className="aspect-[3/4] rounded-lg overflow-hidden border border-border bg-checkerboard">
                    <img src={item.url} alt="" className="w-full h-full object-contain" />
                  </div>
                  <div className="absolute -top-1 -left-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">{i + 1}</div>
                  <button onClick={() => setPdfImages((p) => p.filter((_, j) => j !== i))} className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPdfImages([])}><Trash2 className="w-4 h-4 mr-1" />Clear</Button>
              <Button onClick={buildPdf} disabled={building}>
                {building ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Building PDF…</> : <><FileText className="w-4 h-4 mr-1" />Create PDF</>}
              </Button>
            </div>
          </>
        )}
      </TabsContent>
    </Tabs>
  );
}
