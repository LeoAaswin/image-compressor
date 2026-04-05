"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dropzone } from "@/components/dropzone";
import { Download, Trash2, Lock, Unlock, X } from "lucide-react";
import { toast } from "sonner";
import JSZip from "jszip";

type ResizeMode = "exact" | "percent" | "maxdim";

interface ResizeImage {
  id: string;
  file: File;
  previewUrl: string;
  naturalW: number;
  naturalH: number;
  status: "pending" | "processing" | "done" | "error";
}

function getImageDims(file: File): Promise<{ w: number; h: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve({ w: img.naturalWidth, h: img.naturalHeight }); };
    img.onerror = () => { URL.revokeObjectURL(url); resolve({ w: 0, h: 0 }); };
    img.src = url;
  });
}

export function ImageResizer() {
  const [images, setImages] = useState<ResizeImage[]>([]);
  const [mode, setMode] = useState<ResizeMode>(() => {
    if (typeof window === 'undefined') return 'exact';
    const saved = localStorage.getItem('opti-resize-mode');
    return (['exact', 'percent', 'maxdim'] as ResizeMode[]).includes(saved as ResizeMode) ? (saved as ResizeMode) : 'exact';
  });
  const [lockAspect, setLockAspect] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('opti-resize-lock') !== 'false';
  });
  const [width, setWidth] = useState(() => {
    if (typeof window === 'undefined') return 1280;
    return Number(localStorage.getItem('opti-resize-width') ?? 1280);
  });
  const [height, setHeight] = useState(() => {
    if (typeof window === 'undefined') return 720;
    return Number(localStorage.getItem('opti-resize-height') ?? 720);
  });
  const [percent, setPercent] = useState(() => {
    if (typeof window === 'undefined') return 50;
    return Number(localStorage.getItem('opti-resize-percent') ?? 50);
  });
  const [maxDim, setMaxDim] = useState(() => {
    if (typeof window === 'undefined') return 1920;
    return Number(localStorage.getItem('opti-resize-maxdim') ?? 1920);
  });
  const [processing, setProcessing] = useState(false);
  const imagesRef = useRef<ResizeImage[]>([]);
  imagesRef.current = images;

  useEffect(() => { localStorage.setItem('opti-resize-mode', mode); }, [mode]);
  useEffect(() => { localStorage.setItem('opti-resize-lock', String(lockAspect)); }, [lockAspect]);
  useEffect(() => { localStorage.setItem('opti-resize-width', String(width)); }, [width]);
  useEffect(() => { localStorage.setItem('opti-resize-height', String(height)); }, [height]);
  useEffect(() => { localStorage.setItem('opti-resize-percent', String(percent)); }, [percent]);
  useEffect(() => { localStorage.setItem('opti-resize-maxdim', String(maxDim)); }, [maxDim]);

  useEffect(() => {
    return () => imagesRef.current.forEach((img) => URL.revokeObjectURL(img.previewUrl));
  }, []);

  const calcOutput = useCallback(
    (naturalW: number, naturalH: number) => {
      if (!naturalW || !naturalH) return { ow: 0, oh: 0 };
      if (mode === "exact") return { ow: width, oh: height };
      if (mode === "percent") {
        return {
          ow: Math.max(1, Math.round((naturalW * percent) / 100)),
          oh: Math.max(1, Math.round((naturalH * percent) / 100)),
        };
      }
      // maxdim — fit inside maxDim × maxDim preserving ratio
      const ratio = naturalW / naturalH;
      if (naturalW >= naturalH) {
        const ow = Math.min(naturalW, maxDim);
        return { ow, oh: Math.max(1, Math.round(ow / ratio)) };
      } else {
        const oh = Math.min(naturalH, maxDim);
        return { ow: Math.max(1, Math.round(oh * ratio)), oh };
      }
    },
    [mode, width, height, percent, maxDim]
  );

  const onDrop = useCallback(
    async (files: File[]) => {
      const newImages = await Promise.all(
        files.map(async (file) => {
          const { w, h } = await getImageDims(file);
          return {
            id: crypto.randomUUID(),
            file,
            previewUrl: URL.createObjectURL(file),
            naturalW: w,
            naturalH: h,
            status: "pending" as const,
          };
        })
      );
      setImages((prev) => [...prev, ...newImages]);
    },
    []
  );

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    imagesRef.current.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
  }, []);

  const resizeOne = useCallback(
    (img: ResizeImage): Promise<Blob | null> => {
      return new Promise((resolve) => {
        const el = new Image();
        const url = URL.createObjectURL(img.file);
        el.onload = () => {
          URL.revokeObjectURL(url);
          const { ow, oh } = calcOutput(img.naturalW, img.naturalH);
          const canvas = document.createElement("canvas");
          canvas.width = ow;
          canvas.height = oh;
          const ctx = canvas.getContext("2d")!;
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(el, 0, 0, ow, oh);
          const ext = img.file.name.split(".").pop()?.toLowerCase();
          const mime =
            ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
          canvas.toBlob(resolve, mime, 0.92);
        };
        el.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
        el.src = url;
      });
    },
    [calcOutput]
  );

  const processAll = useCallback(async () => {
    if (!images.length) return;
    setProcessing(true);
    const zip = new JSZip();
    let ok = 0, fail = 0;

    for (const img of images) {
      setImages((prev) =>
        prev.map((i) => (i.id === img.id ? { ...i, status: "processing" } : i))
      );
      const blob = await resizeOne(img);
      if (blob) {
        const ext = img.file.name.split(".").pop();
        const base = img.file.name.replace(/\.[^.]+$/, "");
        zip.file(`${base}-resized.${ext}`, blob);
        setImages((prev) =>
          prev.map((i) => (i.id === img.id ? { ...i, status: "done" } : i))
        );
        ok++;
      } else {
        setImages((prev) =>
          prev.map((i) => (i.id === img.id ? { ...i, status: "error" } : i))
        );
        fail++;
      }
    }

    // Download
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
      a.href = url; a.download = "resized-images.zip";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    }

    if (fail > 0) toast.warning(`Resized ${ok} images. ${fail} failed.`);
    else toast.success(`Successfully resized ${ok} image${ok > 1 ? "s" : ""}!`);
    setProcessing(false);
  }, [images, resizeOne]);

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (lockAspect && images.length > 0) {
      const first = images[0];
      if (first.naturalW && first.naturalH) {
        setHeight(Math.max(1, Math.round((val * first.naturalH) / first.naturalW)));
      }
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (lockAspect && images.length > 0) {
      const first = images[0];
      if (first.naturalW && first.naturalH) {
        setWidth(Math.max(1, Math.round((val * first.naturalW) / first.naturalH)));
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Settings Panel */}
      <div className="bg-card rounded-xl border p-5 space-y-5">
        {/* Mode */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Resize Mode</Label>
          <div className="grid grid-cols-3 gap-2">
            {(["exact", "percent", "maxdim"] as ResizeMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`py-2 px-2 sm:px-3 rounded-lg border text-xs sm:text-sm font-medium transition-colors leading-tight text-center ${
                  mode === m
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/50 hover:bg-muted border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "exact" ? "Exact Size" : m === "percent" ? "Percentage" : "Max Dimension"}
              </button>
            ))}
          </div>
        </div>

        {/* Mode-specific controls */}
        {mode === "exact" && (
          <div className="space-y-3">
            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs text-muted-foreground">Width (px)</Label>
                <Input
                  type="number" min={1} value={width}
                  onChange={(e) => handleWidthChange(Number(e.target.value))}
                />
              </div>
              <button
                onClick={() => setLockAspect((p) => !p)}
                className="mb-0.5 p-2 rounded-lg border hover:bg-muted transition-colors"
                title={lockAspect ? "Unlock aspect ratio" : "Lock aspect ratio"}
              >
                {lockAspect ? <Lock className="w-4 h-4 text-primary" /> : <Unlock className="w-4 h-4 text-muted-foreground" />}
              </button>
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs text-muted-foreground">Height (px)</Label>
                <Input
                  type="number" min={1} value={height}
                  onChange={(e) => handleHeightChange(Number(e.target.value))}
                />
              </div>
            </div>
            {lockAspect && (
              <p className="text-xs text-muted-foreground">
                Aspect ratio locked — changing one dimension auto-adjusts the other based on the first image.
              </p>
            )}
          </div>
        )}

        {mode === "percent" && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs text-muted-foreground">Scale</Label>
              <span className="text-sm font-semibold text-primary">{percent}%</span>
            </div>
            <input
              type="range" min={1} max={200} value={percent}
              onChange={(e) => setPercent(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1%</span><span className="hidden sm:inline">100% (original)</span><span>200%</span>
            </div>
          </div>
        )}

        {mode === "maxdim" && (
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Max Width or Height (px)</Label>
            <Input
              type="number" min={1} value={maxDim}
              onChange={(e) => setMaxDim(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              The longer side is scaled down to this value. Aspect ratio is always preserved.
            </p>
          </div>
        )}
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
                <Download className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">{processing ? "Resizing..." : "Resize & Download"}</span>
                <span className="sm:hidden">{processing ? "Resizing..." : "Resize"}</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {images.map((img) => {
              const { ow, oh } = calcOutput(img.naturalW, img.naturalH);
              return (
                <div key={img.id} className="bg-card border rounded-xl overflow-hidden">
                  <div className="relative h-36 bg-muted/50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.previewUrl} alt={img.file.name}
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
                  <div className="p-3 space-y-1">
                    <p className="text-xs font-medium truncate">{img.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {img.naturalW} × {img.naturalH}
                      <span className="mx-1.5 text-primary">→</span>
                      <span className="font-semibold text-foreground">{ow} × {oh} px</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
