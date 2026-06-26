"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { trackUpload } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Download, Trash2, RotateCcw, Eye, EyeOff, ScanEye } from "lucide-react";

type RedactMode = "blur" | "pixelate" | "black";
interface Rect { x: number; y: number; w: number; h: number }

export function RedactProcessor() {
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [mode, setMode] = useState<RedactMode>("blur");
  const [intensity, setIntensity] = useState(15);
  const [rects, setRects] = useState<Rect[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [current, setCurrent] = useState<Rect | null>(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const displayRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => {
      trackUpload(files);
      if (!files[0]) return;
      setFileName(files[0].name);
      const url = URL.createObjectURL(files[0]);
      const img = new Image();
      img.onload = () => {
        imgRef.current = img;
        setImage(url);
        setRects([]);
        setPreviewUrl(null);
        setShowPreview(false);
      };
      img.src = url;
    },
    accept: { "image/*": [] },
    multiple: false,
  });

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = displayRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const redrawDisplay = useCallback(() => {
    const canvas = displayRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    [...rects, ...(current ? [current] : [])].forEach((r) => {
      if (showOverlay) {
        ctx.fillStyle = "rgba(239,68,68,0.3)";
        ctx.strokeStyle = "rgba(239,68,68,0.8)";
        ctx.lineWidth = 2;
        ctx.fillRect(r.x, r.y, r.w, r.h);
        ctx.strokeRect(r.x, r.y, r.w, r.h);
      }
    });
  }, [rects, current, showOverlay]);

  useEffect(() => { redrawDisplay(); }, [redrawDisplay]);
  useEffect(() => { setPreviewUrl(null); setShowPreview(false); }, [rects, mode, intensity]);

  const applyRedaction = (ctx: CanvasRenderingContext2D, r: Rect, img: HTMLImageElement) => {
    if (mode === "black") {
      ctx.fillStyle = "#000000";
      ctx.fillRect(r.x, r.y, r.w, r.h);
    } else if (mode === "pixelate") {
      const blockSize = Math.max(4, intensity);
      const tmp = document.createElement("canvas");
      tmp.width = img.width; tmp.height = img.height;
      const tctx = tmp.getContext("2d")!;
      tctx.drawImage(img, 0, 0);
      for (let y = r.y; y < r.y + r.h; y += blockSize) {
        for (let x = r.x; x < r.x + r.w; x += blockSize) {
          const px = tctx.getImageData(x, y, 1, 1).data;
          ctx.fillStyle = `rgba(${px[0]},${px[1]},${px[2]},1)`;
          ctx.fillRect(x, y, blockSize, blockSize);
        }
      }
    } else {
      const bc = document.createElement("canvas");
      const scale = Math.max(2, intensity);
      bc.width = Math.max(1, Math.floor(r.w / scale));
      bc.height = Math.max(1, Math.floor(r.h / scale));
      const bctx = bc.getContext("2d")!;
      bctx.drawImage(img, r.x, r.y, r.w, r.h, 0, 0, bc.width, bc.height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "low";
      ctx.drawImage(bc, 0, 0, bc.width, bc.height, r.x, r.y, r.w, r.h);
    }
  };

  const buildResultCanvas = () => {
    const img = imgRef.current;
    if (!img) return null;
    const canvas = document.createElement("canvas");
    canvas.width = img.width; canvas.height = img.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    rects.forEach((r) => applyRedaction(ctx, r, img));
    return canvas;
  };

  const generatePreview = () => {
    if (rects.length === 0) { toast.error("Draw at least one region first"); return; }
    const canvas = buildResultCanvas();
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(blob));
      setShowPreview(true);
    }, "image/png");
  };

  const download = () => {
    if (rects.length === 0) { toast.error("Draw at least one region first"); return; }
    const canvas = buildResultCanvas();
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `redacted_${fileName}`; a.click();
      URL.revokeObjectURL(url);
      toast.success("Downloaded!");
    }, "image/png");
  };

  if (!image) {
    return (
      <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"}`}>
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <EyeOff className="w-7 h-7 text-primary" />
          </div>
          <p className="font-semibold text-lg">{isDragActive ? "Drop image here" : "Upload an image to redact"}</p>
          <p className="text-sm text-muted-foreground">Click or drag & drop a single image</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:h-[70vh]">
      {/* ── Left control panel ── */}
      <div className="w-full lg:w-52 shrink-0 flex flex-col gap-5 lg:overflow-y-auto pr-0 lg:pr-1">
        {/* Mode */}
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Redact mode</Label>
          <div className="flex flex-col gap-1.5">
            {(["blur", "pixelate", "black"] as RedactMode[]).map((m) => (
              <Button key={m} size="sm" variant={mode === m ? "default" : "outline"} onClick={() => setMode(m)} className="capitalize justify-start">{m}</Button>
            ))}
          </div>
        </div>

        {mode !== "black" && (
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Intensity: {intensity}</Label>
            <Slider value={[intensity]} onValueChange={([v]) => setIntensity(v)} min={2} max={30} step={1} />
          </div>
        )}

        <div className="flex flex-col gap-1.5 pt-3 border-t border-border/50">
          <Button size="sm" variant="outline" onClick={() => setShowOverlay(!showOverlay)}>
            {showOverlay ? <Eye className="w-4 h-4 mr-1.5" /> : <EyeOff className="w-4 h-4 mr-1.5" />}
            {showOverlay ? "Hide" : "Show"} overlay
          </Button>
          <Button size="sm" variant="outline" onClick={generatePreview} disabled={rects.length === 0}>
            <ScanEye className="w-4 h-4 mr-1.5" />Preview result
          </Button>
          <Button size="sm" onClick={download} disabled={rects.length === 0}>
            <Download className="w-4 h-4 mr-1.5" />Download
          </Button>
        </div>

        <div className="flex flex-col gap-1.5 pt-3 border-t border-border/50">
          <Button size="sm" variant="outline" onClick={() => { setRects([]); setPreviewUrl(null); setShowPreview(false); }}>
            <RotateCcw className="w-4 h-4 mr-1.5" />Clear regions
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { setImage(null); setRects([]); setPreviewUrl(null); }}>
            <Trash2 className="w-4 h-4 mr-1.5" />New image
          </Button>
        </div>

        {rects.length > 0 && (
          <Badge variant="secondary" className="self-start text-xs">{rects.length} region{rects.length !== 1 ? "s" : ""} marked</Badge>
        )}
      </div>

      {/* ── Right canvas area ── */}
      <div className="flex-1 min-w-0 flex flex-col border rounded-xl overflow-hidden">
        {/* Header bar */}
        <div className="shrink-0 flex items-center justify-between px-3 py-1.5 bg-muted/50 border-b border-border/40">
          <span className="text-xs text-muted-foreground">
            {showPreview ? "Preview — final redacted result" : `Drag to mark regions · ${rects.length} region${rects.length !== 1 ? "s" : ""}`}
          </span>
          {showPreview && (
            <button onClick={() => setShowPreview(false)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              ← back to edit
            </button>
          )}
        </div>

        {/* Canvas / preview */}
        <div className="flex-1 min-h-0 overflow-auto bg-checkerboard">
          {showPreview && previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="Redacted preview" className="w-full block" />
          ) : (
            <canvas
              ref={displayRef}
              className="w-full block cursor-crosshair"
              onMouseDown={(e) => { const p = getPos(e); startRef.current = p; setDrawing(true); }}
              onMouseMove={(e) => {
                if (!drawing || !startRef.current) return;
                const p = getPos(e);
                setCurrent({ x: Math.min(startRef.current.x, p.x), y: Math.min(startRef.current.y, p.y), w: Math.abs(p.x - startRef.current.x), h: Math.abs(p.y - startRef.current.y) });
              }}
              onMouseUp={() => {
                if (current && current.w > 5 && current.h > 5) setRects((prev) => [...prev, current]);
                setCurrent(null); setDrawing(false); startRef.current = null;
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
