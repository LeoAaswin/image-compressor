"use client";

import { useState, useRef, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { trackUpload } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Download, Trash2, ZoomIn, Loader2, X } from "lucide-react";
import JSZip from "jszip";

interface UpscaleItem {
  id: string;
  fileName: string;
  originalUrl: string;
  resultUrl: string | null;
  originalSize: { w: number; h: number };
  newSize: { w: number; h: number } | null;
  status: "pending" | "processing" | "done" | "error";
}

const upscaleCanvas = (img: HTMLImageElement, factor: number, sharpen: boolean): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const newW = img.naturalWidth * factor;
    const newH = img.naturalHeight * factor;
    const canvas = document.createElement("canvas");
    canvas.width = newW;
    canvas.height = newH;
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, newW, newH);

    if (sharpen) {
      const imageData = ctx.getImageData(0, 0, newW, newH);
      const d = imageData.data;
      const copy = new Uint8ClampedArray(d);
      const w = newW;
      // Unsharp mask kernel approximation
      const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];
      for (let y = 1; y < newH - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          for (let c = 0; c < 3; c++) {
            let val = 0;
            for (let ky = -1; ky <= 1; ky++) {
              for (let kx = -1; kx <= 1; kx++) {
                val += copy[((y + ky) * w + (x + kx)) * 4 + c] * kernel[(ky + 1) * 3 + (kx + 1)];
              }
            }
            d[(y * w + x) * 4 + c] = Math.min(255, Math.max(0, val));
          }
        }
      }
      ctx.putImageData(imageData, 0, 0);
    }

    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to create blob"));
    }, "image/png");
  });
};

export function UpscaleProcessor() {
  const [items, setItems] = useState<UpscaleItem[]>([]);
  const [factor, setFactor] = useState(2);
  const [sharpen, setSharpen] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => {
      trackUpload(files);
      files.forEach((file) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
          setItems((prev) => [...prev, {
            id: Math.random().toString(36).slice(2),
            fileName: file.name,
            originalUrl: url,
            resultUrl: null,
            originalSize: { w: img.naturalWidth, h: img.naturalHeight },
            newSize: null,
            status: "pending",
          }]);
        };
        img.src = url;
      });
    },
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [], "image/bmp": [] },
    multiple: true,
  });

  const processAll = async () => {
    const pending = items.filter((i) => i.status === "pending");
    if (pending.length === 0) { toast.error("No pending images"); return; }
    setProcessing(true);
    setProgress(0);

    for (let i = 0; i < pending.length; i++) {
      const item = pending[i];
      setItems((prev) => prev.map((p) => p.id === item.id ? { ...p, status: "processing" } : p));
      try {
        const img = new Image();
        await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = rej; img.src = item.originalUrl; });
        const blob = await upscaleCanvas(img, factor, sharpen);
        const url = URL.createObjectURL(blob);
        setItems((prev) => prev.map((p) => p.id === item.id ? {
          ...p,
          status: "done",
          resultUrl: url,
          newSize: { w: p.originalSize.w * factor, h: p.originalSize.h * factor },
        } : p));
      } catch {
        setItems((prev) => prev.map((p) => p.id === item.id ? { ...p, status: "error" } : p));
      }
      setProgress(Math.round(((i + 1) / pending.length) * 100));
    }
    setProcessing(false);
    toast.success("Upscaling complete!");
  };

  const downloadOne = (item: UpscaleItem) => {
    if (!item.resultUrl) return;
    const a = document.createElement("a");
    a.href = item.resultUrl;
    a.download = `upscaled_${factor}x_${item.fileName.replace(/\.[^.]+$/, "")}.png`;
    a.click();
  };

  const downloadAll = async () => {
    const done = items.filter((i) => i.status === "done" && i.resultUrl);
    if (done.length === 0) { toast.error("No upscaled images yet"); return; }
    const zip = new JSZip();
    await Promise.all(done.map(async (item) => {
      const res = await fetch(item.resultUrl!);
      const blob = await res.blob();
      zip.file(`upscaled_${factor}x_${item.fileName}`, blob);
    }));
    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `upscaled_${factor}x.zip`;
    a.click();
    toast.success("Downloaded all as ZIP");
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  return (
    <div className="space-y-6">
      <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"}`}>
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <ZoomIn className="w-7 h-7 text-primary" />
          </div>
          <p className="font-semibold text-lg">{isDragActive ? "Drop images here" : "Upload images to upscale"}</p>
          <p className="text-sm text-muted-foreground">JPG, PNG, WebP, BMP — batch supported</p>
        </div>
      </div>

      {items.length > 0 && (
        <>
          <div className="flex flex-wrap gap-6 items-end">
            <div>
              <Label className="text-sm mb-2 block">Scale factor</Label>
              <div className="flex gap-2">
                {[2, 3, 4].map((f) => (
                  <Button key={f} size="sm" variant={factor === f ? "default" : "outline"} onClick={() => setFactor(f)}>{f}×</Button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="sharpen" checked={sharpen} onChange={(e) => setSharpen(e.target.checked)} className="w-4 h-4 rounded" />
              <Label htmlFor="sharpen" className="text-sm cursor-pointer">Apply sharpening</Label>
            </div>
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" size="sm" onClick={() => setItems([])}><Trash2 className="w-4 h-4 mr-1" />Clear</Button>
              {items.some((i) => i.status === "done") && (
                <Button variant="outline" size="sm" onClick={downloadAll}><Download className="w-4 h-4 mr-1" />Download All</Button>
              )}
              <Button size="sm" onClick={processAll} disabled={processing}>
                {processing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Upscaling…</> : <><ZoomIn className="w-4 h-4 mr-1" />Upscale {factor}×</>}
              </Button>
            </div>
          </div>

          {processing && <Progress value={progress} />}

          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="border rounded-xl p-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.resultUrl || item.originalUrl} alt={item.fileName} className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.fileName}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.originalSize.w}×{item.originalSize.h}
                    {item.newSize && <> → <span className="text-primary font-medium">{item.newSize.w}×{item.newSize.h}</span></>}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {item.status === "pending" && <Badge variant="secondary">Pending</Badge>}
                  {item.status === "processing" && <Badge variant="secondary"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Processing</Badge>}
                  {item.status === "done" && <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Done</Badge>}
                  {item.status === "error" && <Badge variant="destructive">Error</Badge>}
                  {item.status === "done" && (
                    <Button size="sm" variant="outline" onClick={() => downloadOne(item)}><Download className="w-4 h-4" /></Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => removeItem(item.id)}><X className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
