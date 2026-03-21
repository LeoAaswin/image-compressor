"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Dropzone } from "@/components/dropzone";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Download, RefreshCw, X } from "lucide-react";

interface PaletteColor {
  hex: string;
  rgb: { r: number; g: number; b: number };
  count: number;
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function luminance({ r, g, b }: { r: number; g: number; b: number }) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function extractPalette(imageEl: HTMLImageElement, count = 8): PaletteColor[] {
  // Downsample to 150×150 for speed
  const SIZE = 150;
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(imageEl, 0, 0, SIZE, SIZE);
  const data = ctx.getImageData(0, 0, SIZE, SIZE).data;

  const STEP = 24; // quantize bucket size
  const map = new Map<string, number>();

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 128) continue; // skip transparent pixels

    const r = Math.round(data[i] / STEP) * STEP;
    const g = Math.round(data[i + 1] / STEP) * STEP;
    const b = Math.round(data[i + 2] / STEP) * STEP;

    // Skip near-white and near-black (often background noise)
    const lum = luminance({ r, g, b });
    if (lum > 245 || lum < 10) continue;

    const key = `${Math.min(r, 255)},${Math.min(g, 255)},${Math.min(b, 255)}`;
    map.set(key, (map.get(key) || 0) + 1);
  }

  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([key, cnt]) => {
      const [r, g, b] = key.split(",").map(Number);
      const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
      return { hex, rgb: { r, g, b }, count: cnt };
    });
}

export function ColorPaletteExtractor() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [palette, setPalette] = useState<PaletteColor[]>([]);
  const [loading, setLoading] = useState(false);
  const [colorCount, setColorCount] = useState(8);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => { if (urlRef.current) URL.revokeObjectURL(urlRef.current); };
  }, []);

  const processFile = useCallback(
    (file: File) => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      const url = URL.createObjectURL(file);
      urlRef.current = url;
      setPreviewUrl(url);
      setLoading(true);
      setPalette([]);

      const img = new Image();
      img.onload = () => {
        const colors = extractPalette(img, colorCount);
        setPalette(colors);
        setLoading(false);
      };
      img.onerror = () => {
        toast.error("Failed to load image");
        setLoading(false);
      };
      img.src = url;
    },
    [colorCount]
  );

  const onDrop = useCallback(
    (files: File[]) => {
      const file = files[0];
      if (!file) return;
      processFile(file);
    },
    [processFile]
  );

  const reExtract = useCallback(() => {
    if (!previewUrl) return;
    setLoading(true);
    const img = new Image();
    img.onload = () => {
      setPalette(extractPalette(img, colorCount));
      setLoading(false);
    };
    img.src = previewUrl;
  }, [previewUrl, colorCount]);

  const copyHex = useCallback((hex: string) => {
    navigator.clipboard.writeText(hex)
      .then(() => toast.success(`Copied ${hex}`))
      .catch(() => toast.error("Failed to copy"));
  }, []);

  const copyAllHex = useCallback(() => {
    const text = palette.map((c) => c.hex).join(", ");
    navigator.clipboard.writeText(text)
      .then(() => toast.success("All hex values copied!"))
      .catch(() => toast.error("Failed to copy"));
  }, [palette]);

  const copyAsCss = useCallback(() => {
    const css = palette
      .map((c, i) => `  --color-${i + 1}: ${c.hex};`)
      .join("\n");
    const text = `:root {\n${css}\n}`;
    navigator.clipboard.writeText(text)
      .then(() => toast.success("CSS variables copied!"))
      .catch(() => toast.error("Failed to copy"));
  }, [palette]);

  const downloadPalette = useCallback(() => {
    if (!palette.length) return;
    const json = JSON.stringify(
      palette.map((c) => ({ hex: c.hex, rgb: c.rgb })),
      null, 2
    );
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "palette.json";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }, [palette]);

  const clearAll = useCallback(() => {
    if (urlRef.current) { URL.revokeObjectURL(urlRef.current); urlRef.current = null; }
    setPreviewUrl(null);
    setPalette([]);
  }, []);

  return (
    <div className="space-y-6">
      {!previewUrl ? (
        <Dropzone onDrop={onDrop} />
      ) : (
        <div className="space-y-6">
          {/* Top row: image + palette */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Source Image</h3>
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Change image
                </button>
              </div>
              <div className="rounded-xl border overflow-hidden bg-muted/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="Source" className="w-full h-64 object-contain" />
              </div>
              {/* Gradient preview */}
              {palette.length > 0 && (
                <div
                  className="h-8 rounded-lg"
                  style={{
                    background: `linear-gradient(to right, ${palette.map((c) => c.hex).join(", ")})`,
                  }}
                />
              )}
            </div>

            {/* Palette */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Extracted Palette</h3>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">Colors:</label>
                  <select
                    value={colorCount}
                    onChange={(e) => setColorCount(Number(e.target.value))}
                    className="text-xs bg-muted border rounded px-1.5 py-0.5"
                  >
                    {[4, 6, 8, 10, 12].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  <button
                    onClick={reExtract}
                    disabled={loading}
                    className="p-1 rounded hover:bg-muted transition-colors"
                    title="Re-extract"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-48 text-muted-foreground text-sm gap-2">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Extracting colors…
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {palette.map((color) => {
                    const lum = luminance(color.rgb);
                    const textColor = lum > 128 ? "#000000" : "#ffffff";
                    return (
                      <button
                        key={color.hex}
                        onClick={() => copyHex(color.hex)}
                        className="group rounded-xl overflow-hidden border hover:scale-[1.02] transition-transform"
                        title={`Click to copy ${color.hex}`}
                      >
                        <div
                          className="h-16 flex items-center justify-center"
                          style={{ backgroundColor: color.hex }}
                        >
                          <span
                            className="text-xs font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ color: textColor }}
                          >
                            <Copy className="w-4 h-4 inline mr-1" />
                            Copy
                          </span>
                        </div>
                        <div className="p-2 bg-card text-left">
                          <p className="text-xs font-mono font-semibold">{color.hex}</p>
                          <p className="text-[10px] text-muted-foreground">
                            rgb({color.rgb.r}, {color.rgb.g}, {color.rgb.b})
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Action bar */}
          {palette.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" onClick={copyAllHex}>
                <Copy className="w-4 h-4 mr-1.5" /> Copy All Hex
              </Button>
              <Button variant="outline" size="sm" onClick={copyAsCss}>
                <Copy className="w-4 h-4 mr-1.5" /> Copy as CSS Variables
              </Button>
              <Button variant="outline" size="sm" onClick={downloadPalette}>
                <Download className="w-4 h-4 mr-1.5" /> Download JSON
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
