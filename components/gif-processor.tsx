"use client";

import { useState, useRef, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { trackUpload } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Download, Trash2, Film, ImageIcon, GripHorizontal, Loader2 } from "lucide-react";

interface FrameItem { id: string; url: string; img: HTMLImageElement; name: string }

export function GifProcessor() {
  // GIF maker
  const [frames, setFrames] = useState<FrameItem[]>([]);
  const [delay, setDelay] = useState(100);
  const [loop, setLoop] = useState(0);
  const [making, setMaking] = useState(false);
  const [gifUrl, setGifUrl] = useState<string | null>(null);

  // GIF extractor
  const [extracting, setExtracting] = useState(false);
  const [extractedFrames, setExtractedFrames] = useState<string[]>([]);
  const [gifFile, setGifFile] = useState<string | null>(null);

  const { getRootProps: getMakerProps, getInputProps: getMakerInput, isDragActive: isMakerDrag } = useDropzone({
    onDrop: (files) => {
      trackUpload(files);
      files.filter((f) => f.type.startsWith("image/") && f.type !== "image/gif").forEach((file) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => setFrames((prev) => [...prev, { id: Math.random().toString(36).slice(2), url, img, name: file.name }]);
        img.src = url;
      });
    },
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [], "image/bmp": [] },
    multiple: true,
  });

  const { getRootProps: getExtractProps, getInputProps: getExtractInput, isDragActive: isExtractDrag } = useDropzone({
    onDrop: async (files) => {
      trackUpload(files);
      if (!files[0]) return;
      setGifFile(URL.createObjectURL(files[0]));
      setExtractedFrames([]);
      setExtracting(true);
      try {
        await extractGifFrames(files[0]);
      } finally {
        setExtracting(false);
      }
    },
    accept: { "image/gif": [] },
    multiple: false,
  });

  const extractGifFrames = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);
    // Simple GIF frame extraction by seeking frame boundaries
    // We'll use canvas + Image trick to get individual frames
    const url = URL.createObjectURL(file);
    const img = document.createElement("img");
    await new Promise((res) => { img.onload = res; img.src = url; });
    
    // Extract via canvas - gets first frame (limitation without full GIF parser)
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    const firstFrame = canvas.toDataURL("image/png");
    setExtractedFrames([firstFrame]);

    // Parse GIF frame count from binary
    let frameCount = 0;
    for (let i = 0; i < uint8.length - 3; i++) {
      if (uint8[i] === 0x21 && uint8[i + 1] === 0xF9 && uint8[i + 2] === 0x04) {
        frameCount++;
      }
    }
    toast.info(`GIF has approximately ${frameCount} frame${frameCount !== 1 ? "s" : ""}. First frame extracted as PNG.`);
    URL.revokeObjectURL(url);
  };

  const makeGif = async () => {
    if (frames.length === 0) { toast.error("Add at least one image"); return; }
    setMaking(true);
    setGifUrl(null);
    try {
      const { GIFEncoder, quantize, applyPalette } = await import("gifenc");
      const width = frames[0].img.naturalWidth;
      const height = frames[0].img.naturalHeight;
      const gif = GIFEncoder();

      for (const frame of frames) {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(frame.img, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        const rgba = imageData.data;
        const palette = quantize(rgba, 256);
        const index = applyPalette(rgba, palette);
        gif.writeFrame(index, width, height, { palette, delay, repeat: loop });
      }

      gif.finish();
      const bytes = gif.bytesView();
      const blob = new Blob([bytes], { type: "image/gif" });
      setGifUrl(URL.createObjectURL(blob));
      toast.success("GIF created!");
    } catch (err) {
      toast.error("Failed to create GIF");
      console.error(err);
    } finally {
      setMaking(false);
    }
  };

  const downloadGif = () => {
    if (!gifUrl) return;
    const a = document.createElement("a");
    a.href = gifUrl;
    a.download = "animation.gif";
    a.click();
  };

  const downloadFrame = (url: string, i: number) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `frame_${i + 1}.png`;
    a.click();
  };

  const moveFrame = (from: number, to: number) => {
    setFrames((prev) => {
      const arr = [...prev];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
  };

  return (
    <Tabs defaultValue="make">
      <TabsList className="mb-6">
        <TabsTrigger value="make"><Film className="w-4 h-4 mr-2" />Create GIF</TabsTrigger>
        <TabsTrigger value="extract"><ImageIcon className="w-4 h-4 mr-2" />Extract Frames</TabsTrigger>
      </TabsList>

      <TabsContent value="make" className="space-y-6">
        <div {...getMakerProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isMakerDrag ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"}`}>
          <input {...getMakerInput()} />
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Film className="w-7 h-7 text-primary" />
            </div>
            <p className="font-semibold">{isMakerDrag ? "Drop frames here" : "Add image frames"}</p>
            <p className="text-sm text-muted-foreground">JPG, PNG, WebP — order matters, drag to reorder</p>
          </div>
        </div>

        {frames.length > 0 && (
          <>
            <div className="flex flex-wrap gap-2">
              {frames.map((frame, i) => (
                <div key={frame.id} className="relative group">
                  <div className="w-20 h-20 rounded-lg overflow-hidden border border-border">
                    <img src={frame.url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -top-1 -left-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{i + 1}</div>
                  <div className="absolute inset-0 rounded-lg bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    {i > 0 && <button onClick={() => moveFrame(i, i - 1)} className="text-white text-xs bg-white/20 rounded px-1">←</button>}
                    {i < frames.length - 1 && <button onClick={() => moveFrame(i, i + 1)} className="text-white text-xs bg-white/20 rounded px-1">→</button>}
                    <button onClick={() => setFrames((p) => p.filter((_, j) => j !== i))} className="text-white text-xs bg-red-500/80 rounded px-1">✕</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm mb-2 block">Frame delay: {delay}ms ({Math.round(1000 / delay)} fps)</Label>
                <Slider value={[delay]} onValueChange={([v]) => setDelay(v)} min={20} max={1000} step={10} />
              </div>
              <div>
                <Label className="text-sm mb-2 block">Loop: {loop === 0 ? "infinite" : `${loop} time${loop !== 1 ? "s" : ""}`}</Label>
                <Slider value={[loop]} onValueChange={([v]) => setLoop(v)} min={0} max={10} step={1} />
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" onClick={() => { setFrames([]); setGifUrl(null); }}><Trash2 className="w-4 h-4 mr-1" />Clear</Button>
              <Button onClick={makeGif} disabled={making}>
                {making ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating…</> : <><Film className="w-4 h-4 mr-1" />Create GIF</>}
              </Button>
              {gifUrl && <Button variant="outline" onClick={downloadGif}><Download className="w-4 h-4 mr-1" />Download GIF</Button>}
            </div>

            {gifUrl && (
              <div className="border rounded-xl overflow-hidden p-4 bg-muted/30 flex flex-col items-center gap-3">
                <p className="text-sm font-medium">Preview</p>
                <img src={gifUrl} alt="Generated GIF" className="max-w-full rounded-lg max-h-96 object-contain" />
              </div>
            )}
          </>
        )}
      </TabsContent>

      <TabsContent value="extract" className="space-y-6">
        <div {...getExtractProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isExtractDrag ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"}`}>
          <input {...getExtractInput()} />
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <ImageIcon className="w-7 h-7 text-primary" />
            </div>
            <p className="font-semibold">{isExtractDrag ? "Drop GIF here" : "Upload a GIF to extract frames"}</p>
            <p className="text-sm text-muted-foreground">Upload a .gif file</p>
          </div>
        </div>

        {gifFile && (
          <div className="flex gap-6 flex-wrap">
            <div>
              <p className="text-sm font-medium mb-2">Original GIF</p>
              <img src={gifFile} alt="Original GIF" className="max-h-48 rounded-lg border border-border" />
            </div>
          </div>
        )}

        {extracting && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Extracting frames…</span>
          </div>
        )}

        {extractedFrames.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium">{extractedFrames.length} frame{extractedFrames.length !== 1 ? "s" : ""} extracted</p>
            <div className="flex flex-wrap gap-3">
              {extractedFrames.map((url, i) => (
                <div key={i} className="relative group">
                  <div className="w-24 h-24 rounded-lg overflow-hidden border border-border bg-checkerboard">
                    <img src={url} alt={`Frame ${i + 1}`} className="w-full h-full object-contain" />
                  </div>
                  <button onClick={() => downloadFrame(url, i)} className="absolute inset-0 rounded-lg bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Download className="w-5 h-5" />
                  </button>
                  <div className="text-xs text-center mt-1 text-muted-foreground">Frame {i + 1}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
