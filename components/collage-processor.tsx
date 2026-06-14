"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { trackUpload } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Download, Trash2, GripHorizontal, LayoutGrid } from "lucide-react";

interface ImageItem { id: string; url: string; img: HTMLImageElement }

type Layout = { cols: number; rows: number; label: string };

const LAYOUTS: Layout[] = [
  { cols: 1, rows: 2, label: "1×2" },
  { cols: 2, rows: 1, label: "2×1" },
  { cols: 2, rows: 2, label: "2×2" },
  { cols: 3, rows: 1, label: "3×1" },
  { cols: 3, rows: 2, label: "3×2" },
  { cols: 2, rows: 3, label: "2×3" },
  { cols: 4, rows: 1, label: "4×1" },
  { cols: 4, rows: 2, label: "4×2" },
];

export function CollageProcessor() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [layout, setLayout] = useState<Layout>(LAYOUTS[2]);
  const [gap, setGap] = useState(8);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [cellSize, setCellSize] = useState(400);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => {
      trackUpload(files);
      files.forEach((file) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
          setImages((prev) => [...prev, { id: Math.random().toString(36).slice(2), url, img }]);
        };
        img.src = url;
      });
    },
    accept: { "image/*": [] },
    multiple: true,
  });

  const renderCollage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || images.length === 0) return;
    const { cols, rows } = layout;
    const totalCols = cols;
    const totalRows = rows;
    const W = totalCols * cellSize + (totalCols + 1) * gap;
    const H = totalRows * cellSize + (totalRows + 1) * gap;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, W, H);

    let idx = 0;
    for (let r = 0; r < totalRows; r++) {
      for (let c = 0; c < totalCols; c++) {
        const item = images[idx % images.length];
        if (!item) continue;
        const x = gap + c * (cellSize + gap);
        const y = gap + r * (cellSize + gap);
        // Cover fit
        const scale = Math.max(cellSize / item.img.naturalWidth, cellSize / item.img.naturalHeight);
        const sw = item.img.naturalWidth * scale;
        const sh = item.img.naturalHeight * scale;
        const sx = (sw - cellSize) / 2;
        const sy = (sh - cellSize) / 2;
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, cellSize, cellSize);
        ctx.clip();
        ctx.drawImage(item.img, x - sx, y - sy, sw, sh);
        ctx.restore();
        idx++;
      }
    }
  }, [images, layout, gap, bgColor, cellSize]);

  useEffect(() => { renderCollage(); }, [renderCollage]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas || images.length === 0) { toast.error("Add images first"); return; }
    canvas.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `collage_${layout.label}.png`;
      a.click();
      toast.success("Collage downloaded!");
    }, "image/png");
  };

  return (
    <div className="space-y-6">
      <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"}`}>
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <LayoutGrid className="w-7 h-7 text-primary" />
          </div>
          <p className="font-semibold text-lg">{isDragActive ? "Drop images here" : "Upload images for collage"}</p>
          <p className="text-sm text-muted-foreground">{images.length > 0 ? `${images.length} image${images.length !== 1 ? "s" : ""} loaded — add more or adjust settings` : "Drag & drop multiple images"}</p>
        </div>
      </div>

      {images.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm mb-2 block">Layout</Label>
              <div className="grid grid-cols-4 gap-1">
                {LAYOUTS.map((l) => (
                  <Button key={l.label} size="sm" variant={layout.label === l.label ? "default" : "outline"} onClick={() => setLayout(l)} className="text-xs px-1">{l.label}</Button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm mb-2 block">Gap: {gap}px</Label>
              <Slider value={[gap]} onValueChange={([v]) => setGap(v)} min={0} max={40} step={2} />
            </div>
            <div>
              <Label className="text-sm mb-2 block">Cell size: {cellSize}px</Label>
              <Slider value={[cellSize]} onValueChange={([v]) => setCellSize(v)} min={100} max={800} step={50} />
            </div>
            <div>
              <Label className="text-sm mb-2 block">Background</Label>
              <div className="flex items-center gap-2">
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-9 h-9 rounded cursor-pointer border border-border" />
                <span className="text-sm text-muted-foreground">{bgColor}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-1 flex-wrap flex-1">
              {images.map((item, i) => (
                <div key={item.id} className="relative w-12 h-12 rounded overflow-hidden border border-border group">
                  <img src={item.url} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => setImages((p) => p.filter((x) => x.id !== item.id))} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">✕</button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" size="sm" onClick={() => setImages([])}><Trash2 className="w-4 h-4 mr-1" />Clear</Button>
              <Button size="sm" onClick={download}><Download className="w-4 h-4 mr-1" />Download</Button>
            </div>
          </div>

          <div className="border rounded-xl overflow-hidden bg-checkerboard">
            <canvas ref={canvasRef} className="w-full" />
          </div>
        </>
      )}
    </div>
  );
}
