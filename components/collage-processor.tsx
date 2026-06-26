"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { trackUpload } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Download, Trash2, LayoutGrid, Plus, AlertCircle } from "lucide-react";

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

function LayoutIcon({ cols, rows, active }: { cols: number; rows: number; active: boolean }) {
  return (
    <div
      style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)`, gap: 2 }}
      className="w-full aspect-square p-1"
    >
      {Array.from({ length: cols * rows }).map((_, i) => (
        <div key={i} className={`rounded-[2px] ${active ? "bg-primary-foreground" : "bg-muted-foreground/50"}`} />
      ))}
    </div>
  );
}

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

  const totalSlots = layout.cols * layout.rows;
  const hasRepeat = images.length > 0 && images.length < totalSlots;

  const renderCollage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || images.length === 0) return;
    const { cols, rows } = layout;
    const W = cols * cellSize + (cols + 1) * gap;
    const H = rows * cellSize + (rows + 1) * gap;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, W, H);

    let idx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const item = images[idx % images.length];
        if (!item) continue;
        const x = gap + c * (cellSize + gap);
        const y = gap + r * (cellSize + gap);
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

  if (images.length === 0) {
    return (
      <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"}`}>
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <LayoutGrid className="w-7 h-7 text-primary" />
          </div>
          <p className="font-semibold text-lg">{isDragActive ? "Drop images here" : "Upload images for collage"}</p>
          <p className="text-sm text-muted-foreground">Drag & drop multiple images — JPG, PNG, WebP</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:h-[70vh]">
      {/* ── Left control panel ── */}
      <div className="w-full lg:w-60 shrink-0 flex flex-col gap-4 lg:overflow-y-auto pr-0 lg:pr-1">
        {/* Compact add-more dropzone */}
        <div {...getRootProps()} className={`border border-dashed rounded-lg px-3 py-2.5 flex items-center gap-2.5 cursor-pointer transition-all shrink-0 ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/20"}`}>
          <input {...getInputProps()} />
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Plus className="w-3.5 h-3.5 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground">{isDragActive ? "Drop to add images" : "Add more images"}</p>
        </div>

        {/* Image strip */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Frames</span>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">{images.length} / {totalSlots} slots</Badge>
            {hasRepeat && (
              <span className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400">
                <AlertCircle className="w-3 h-3" />repeats
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto rounded-lg border border-border/50 p-1.5 bg-muted/20">
            {images.map((item, i) => (
              <div key={item.id} className="relative w-12 h-12 rounded overflow-hidden border border-border group shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt="" className="w-full h-full object-cover" />
                <div className="absolute top-0 left-0 bg-primary text-primary-foreground text-[9px] font-bold rounded-br px-1 leading-3.5">{i + 1}</div>
                <button onClick={() => setImages((p) => p.filter((x) => x.id !== item.id))} className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-sm font-bold">✕</button>
              </div>
            ))}
          </div>
        </div>

        {/* Layout picker */}
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Layout</Label>
          <div className="grid grid-cols-4 gap-1.5">
            {LAYOUTS.map((l) => (
              <button
                key={l.label}
                onClick={() => setLayout(l)}
                title={l.label}
                className={`rounded-lg border-2 transition-all ${layout.label === l.label ? "border-primary bg-primary" : "border-border hover:border-primary/50 bg-muted/30"}`}
              >
                <LayoutIcon cols={l.cols} rows={l.rows} active={layout.label === l.label} />
                <span className={`block text-center text-[10px] pb-1 font-medium ${layout.label === l.label ? "text-primary-foreground" : "text-muted-foreground"}`}>{l.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sliders */}
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Gap: {gap}px</Label>
          <Slider value={[gap]} onValueChange={([v]) => setGap(v)} min={0} max={40} step={2} />
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Cell size: {cellSize}px</Label>
          <Slider value={[cellSize]} onValueChange={([v]) => setCellSize(v)} min={100} max={800} step={50} />
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Background</Label>
          <div className="flex items-center gap-2">
            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-9 h-9 rounded cursor-pointer border border-border" />
            <span className="text-sm text-muted-foreground font-mono">{bgColor}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1.5 pt-3 border-t border-border/50 mt-auto">
          <Button size="sm" onClick={download}><Download className="w-4 h-4 mr-1.5" />Download collage</Button>
          <Button size="sm" variant="ghost" onClick={() => setImages([])}><Trash2 className="w-4 h-4 mr-1.5" />Clear all</Button>
        </div>
      </div>

      {/* ── Right canvas area ── */}
      <div className="flex-1 min-w-0 flex flex-col border rounded-xl overflow-hidden">
        <div className="shrink-0 px-3 py-1.5 bg-muted/50 border-b border-border/40">
          <span className="text-xs text-muted-foreground">
            {layout.cols}×{layout.rows} grid · {layout.cols * cellSize + (layout.cols + 1) * gap}×{layout.rows * cellSize + (layout.rows + 1) * gap}px output
          </span>
        </div>
        <div className="flex-1 min-h-0 overflow-auto bg-checkerboard">
          <canvas ref={canvasRef} className="w-full block" />
        </div>
      </div>
    </div>
  );
}
