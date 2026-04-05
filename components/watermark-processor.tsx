"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Dropzone } from "@/components/dropzone";
import { Download, Trash2, X, Type, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import JSZip from "jszip";

type WatermarkPosition = "tl" | "tc" | "tr" | "ml" | "mc" | "mr" | "bl" | "bc" | "br";

interface WatermarkImage {
  id: string;
  file: File;
  previewUrl: string;
  resultUrl: string | null;
  status: "pending" | "processing" | "done" | "error";
}

const POSITION_GRID: { pos: WatermarkPosition; label: string }[][] = [
  [{ pos: "tl", label: "↖" }, { pos: "tc", label: "↑" }, { pos: "tr", label: "↗" }],
  [{ pos: "ml", label: "←" }, { pos: "mc", label: "·" }, { pos: "mr", label: "→" }],
  [{ pos: "bl", label: "↙" }, { pos: "bc", label: "↓" }, { pos: "br", label: "↘" }],
];

function getWatermarkCoords(
  cw: number,
  ch: number,
  tw: number,
  th: number,
  pos: WatermarkPosition
): [number, number] {
  const pad = 24;
  const col = pos[1] as "l" | "c" | "r";
  const row = pos[0] as "t" | "m" | "b";
  const x = col === "l" ? pad : col === "c" ? (cw - tw) / 2 : cw - tw - pad;
  const y = row === "t" ? th + pad : row === "m" ? (ch + th) / 2 : ch - pad;
  return [x, y];
}

export function WatermarkProcessor() {
  const [images, setImages] = useState<WatermarkImage[]>([]);
  const [watermarkType, setWatermarkType] = useState<"text" | "image">("text");
  const [text, setText] = useState(() =>
    typeof window !== "undefined" ? (localStorage.getItem("opti-wm-text") ?? "© OptiPix") : "© OptiPix"
  );
  const [opacity, setOpacity] = useState(() =>
    typeof window !== "undefined" ? Number(localStorage.getItem("opti-wm-opacity") ?? 70) : 70
  );
  const [fontSize, setFontSize] = useState(() =>
    typeof window !== "undefined" ? Number(localStorage.getItem("opti-wm-fontsize") ?? 48) : 48
  );
  const [fontColor, setFontColor] = useState(() =>
    typeof window !== "undefined" ? (localStorage.getItem("opti-wm-color") ?? "#ffffff") : "#ffffff"
  );
  const [position, setPosition] = useState<WatermarkPosition>(() => {
    if (typeof window === "undefined") return "br";
    const saved = localStorage.getItem("opti-wm-position");
    return (["tl","tc","tr","ml","mc","mr","bl","bc","br"] as WatermarkPosition[]).includes(saved as WatermarkPosition)
      ? (saved as WatermarkPosition)
      : "br";
  });
  const [wmImageFile, setWmImageFile] = useState<File | null>(null);
  const [wmImagePreview, setWmImagePreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const imagesRef = useRef<WatermarkImage[]>([]);
  imagesRef.current = images;

  useEffect(() => { localStorage.setItem("opti-wm-text", text); }, [text]);
  useEffect(() => { localStorage.setItem("opti-wm-opacity", String(opacity)); }, [opacity]);
  useEffect(() => { localStorage.setItem("opti-wm-fontsize", String(fontSize)); }, [fontSize]);
  useEffect(() => { localStorage.setItem("opti-wm-color", fontColor); }, [fontColor]);
  useEffect(() => { localStorage.setItem("opti-wm-position", position); }, [position]);

  useEffect(() => {
    return () => {
      imagesRef.current.forEach(img => {
        URL.revokeObjectURL(img.previewUrl);
        if (img.resultUrl) URL.revokeObjectURL(img.resultUrl);
      });
      if (wmImagePreview) URL.revokeObjectURL(wmImagePreview);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onDrop = useCallback((files: File[]) => {
    const newImages = files.map(file => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      resultUrl: null,
      status: "pending" as const,
    }));
    setImages(prev => [...prev, ...newImages]);
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img) {
        URL.revokeObjectURL(img.previewUrl);
        if (img.resultUrl) URL.revokeObjectURL(img.resultUrl);
      }
      return prev.filter(i => i.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    imagesRef.current.forEach(img => {
      URL.revokeObjectURL(img.previewUrl);
      if (img.resultUrl) URL.revokeObjectURL(img.resultUrl);
    });
    setImages([]);
  }, []);

  const handleWmImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (wmImagePreview) URL.revokeObjectURL(wmImagePreview);
    setWmImageFile(file);
    setWmImagePreview(URL.createObjectURL(file));
  };

  const applyWatermark = useCallback(
    (img: WatermarkImage, wmEl: HTMLImageElement | null): Promise<Blob | null> => {
      return new Promise(resolve => {
        const el = new Image();
        const url = URL.createObjectURL(img.file);
        el.onload = () => {
          URL.revokeObjectURL(url);
          const canvas = document.createElement("canvas");
          canvas.width = el.naturalWidth;
          canvas.height = el.naturalHeight;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(el, 0, 0);
          ctx.globalAlpha = opacity / 100;

          if (watermarkType === "text" && text.trim()) {
            const clampedFont = Math.min(fontSize, Math.max(12, Math.floor(canvas.height / 8)));
            ctx.font = `bold ${clampedFont}px sans-serif`;
            ctx.fillStyle = fontColor;
            const metrics = ctx.measureText(text);
            const [x, y] = getWatermarkCoords(canvas.width, canvas.height, metrics.width, clampedFont, position);
            ctx.fillText(text, x, y);
          } else if (watermarkType === "image" && wmEl) {
            const maxW = Math.floor(canvas.width * 0.3);
            const scale = Math.min(1, maxW / wmEl.naturalWidth);
            const ww = Math.round(wmEl.naturalWidth * scale);
            const wh = Math.round(wmEl.naturalHeight * scale);
            const [x, y] = getWatermarkCoords(canvas.width, canvas.height, ww, wh, position);
            ctx.drawImage(wmEl, x, y - wh, ww, wh);
          }

          ctx.globalAlpha = 1;
          const mime = img.file.type === "image/png" ? "image/png"
            : img.file.type === "image/webp" ? "image/webp"
            : "image/jpeg";
          canvas.toBlob(resolve, mime, 0.92);
        };
        el.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
        el.src = url;
      });
    },
    [watermarkType, text, opacity, fontSize, fontColor, position]
  );

  const processAll = useCallback(async () => {
    if (!images.length) return;
    if (watermarkType === "text" && !text.trim()) {
      toast.error("Please enter watermark text.");
      return;
    }
    if (watermarkType === "image" && !wmImageFile) {
      toast.error("Please select a watermark image.");
      return;
    }

    setProcessing(true);

    // Pre-load watermark image once
    let wmEl: HTMLImageElement | null = null;
    if (watermarkType === "image" && wmImageFile) {
      wmEl = await new Promise<HTMLImageElement>(res => {
        const el = new Image();
        const u = URL.createObjectURL(wmImageFile);
        el.onload = () => { URL.revokeObjectURL(u); res(el); };
        el.onerror = () => { URL.revokeObjectURL(u); res(el); };
        el.src = u;
      });
    }

    const zip = new JSZip();
    let ok = 0, fail = 0;

    for (const img of images) {
      setImages(prev => prev.map(i => i.id === img.id ? { ...i, status: "processing" } : i));
      const blob = await applyWatermark(img, wmEl);
      if (blob) {
        const ext = img.file.name.split(".").pop() ?? "jpg";
        const base = img.file.name.replace(/\.[^.]+$/, "");
        zip.file(`${base}-watermarked.${ext}`, blob);
        const resultUrl = URL.createObjectURL(blob);
        setImages(prev => prev.map(i => i.id === img.id ? { ...i, status: "done", resultUrl } : i));
        ok++;
      } else {
        setImages(prev => prev.map(i => i.id === img.id ? { ...i, status: "error" } : i));
        fail++;
      }
    }

    if (ok === 1) {
      const filename = Object.keys(zip.files)[0];
      const blob = await zip.file(filename)?.async("blob");
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = filename;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      }
    } else if (ok > 1) {
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "watermarked-images.zip";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    }

    if (fail > 0) toast.warning(`Watermarked ${ok} images. ${fail} failed.`);
    else toast.success(`Successfully watermarked ${ok} image${ok > 1 ? "s" : ""}!`);
    setProcessing(false);
  }, [images, watermarkType, text, wmImageFile, applyWatermark]);

  return (
    <div className="space-y-6">
      {/* Settings Panel */}
      <div className="bg-card rounded-xl border p-5 space-y-5">
        {/* Type toggle */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Watermark Type</Label>
          <div className="grid grid-cols-2 gap-2">
            {(["text", "image"] as const).map(t => (
              <button
                key={t}
                onClick={() => setWatermarkType(t)}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                  watermarkType === t
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/50 hover:bg-muted border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "text" ? <Type className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                {t === "text" ? "Text" : "Image"}
              </button>
            ))}
          </div>
        </div>

        {/* Text settings */}
        {watermarkType === "text" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Watermark Text</Label>
              <Input
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="© Your Name"
                maxLength={100}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Font Size ({fontSize}px)</Label>
                <Slider
                  value={[fontSize]}
                  onValueChange={v => setFontSize(v[0])}
                  min={12} max={200} step={2}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fontColor}
                    onChange={e => setFontColor(e.target.value)}
                    className="w-10 h-9 rounded border cursor-pointer p-0.5 bg-transparent"
                  />
                  <span className="text-xs font-mono text-muted-foreground">{fontColor}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Image watermark */}
        {watermarkType === "image" && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Watermark Image</Label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer">
                <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm bg-muted/50 hover:bg-muted transition-colors">
                  <ImageIcon className="w-4 h-4" /> Choose image
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={handleWmImageSelect} />
              </label>
              {wmImagePreview && (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={wmImagePreview} alt="watermark" className="h-10 w-10 object-contain rounded border" />
                  <button
                    onClick={() => { setWmImageFile(null); if (wmImagePreview) URL.revokeObjectURL(wmImagePreview); setWmImagePreview(null); }}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-destructive text-white flex items-center justify-center"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Scaled to 30% of the image width, aspect ratio preserved.</p>
          </div>
        )}

        {/* Opacity */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-xs text-muted-foreground">Opacity</Label>
            <span className="text-sm font-semibold text-primary">{opacity}%</span>
          </div>
          <Slider
            value={[opacity]}
            onValueChange={v => setOpacity(v[0])}
            min={5} max={100} step={5}
          />
        </div>

        {/* Position grid */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Position</Label>
          <div className="inline-grid grid-cols-3 gap-1">
            {POSITION_GRID.map((row, ri) =>
              row.map(({ pos, label }) => (
                <button
                  key={pos}
                  onClick={() => setPosition(pos)}
                  className={`w-10 h-10 rounded-lg border text-base transition-colors ${
                    position === pos
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 hover:bg-muted border-border text-muted-foreground"
                  }`}
                  title={pos}
                >
                  {label}
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      <Dropzone onDrop={onDrop} />

      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <span className="font-semibold">{images.length} image{images.length > 1 ? "s" : ""} ready</span>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={clearAll} disabled={processing}>
                <Trash2 className="w-4 h-4 mr-1.5" /> Clear All
              </Button>
              <Button size="sm" onClick={processAll} disabled={processing}>
                <Download className="w-4 h-4 mr-1.5 shrink-0" />
                <span className="hidden sm:inline">{processing ? "Applying..." : "Apply & Download"}</span>
                <span className="sm:hidden">{processing ? "Applying..." : "Apply"}</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {images.map(img => (
              <div key={img.id} className="bg-card border rounded-xl overflow-hidden">
                <div className="relative h-36 bg-muted/50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.resultUrl ?? img.previewUrl}
                    alt={img.file.name}
                    className="w-full h-full object-contain"
                  />
                  <button
                    onClick={() => removeImage(img.id)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {img.status === "processing" && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {img.status === "done" && (
                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                      <span className="text-3xl text-green-400">✓</span>
                    </div>
                  )}
                  {img.status === "error" && (
                    <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                      <span className="text-3xl text-red-400">✗</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs font-medium truncate">{img.file.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
