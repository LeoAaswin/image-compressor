"use client";

import { useState, useRef, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { trackUpload } from "@/lib/utils";
import jsQR from "jsqr";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, QrCode, Copy, Check, X, ImageIcon } from "lucide-react";

interface QrResult {
  id: string;
  fileName: string;
  preview: string;
  codes: { data: string; location: string }[];
  status: "processing" | "done" | "error";
  error?: string;
}

export function QrReader() {
  const [results, setResults] = useState<QrResult[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const processImage = useCallback((file: File): Promise<QrResult> => {
    return new Promise((resolve) => {
      const id = Math.random().toString(36).slice(2);
      const preview = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
          resolve({
            id,
            fileName: file.name,
            preview,
            codes: [{ data: code.data, location: "detected" }],
            status: "done",
          });
        } else {
          resolve({
            id,
            fileName: file.name,
            preview,
            codes: [],
            status: "done",
            error: "No QR code found in this image",
          });
        }
      };
      img.onerror = () =>
        resolve({ id, fileName: file.name, preview, codes: [], status: "error", error: "Failed to load image" });
      img.src = preview;
    });
  }, []);

  const onDrop = useCallback(
    async (files: File[]) => {
      trackUpload(files);
      const placeholders: QrResult[] = files.map((f) => ({
        id: Math.random().toString(36).slice(2),
        fileName: f.name,
        preview: "",
        codes: [],
        status: "processing" as const,
      }));
      setResults((prev) => [...prev, ...placeholders]);

      const processed = await Promise.all(files.map(processImage));
      setResults((prev) => {
        const updated = [...prev];
        placeholders.forEach((p, i) => {
          const idx = updated.findIndex((r) => r.id === p.id);
          if (idx !== -1) updated[idx] = processed[i];
        });
        return updated;
      });
    },
    [processImage]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
  });

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(null), 2000);
  };

  const removeResult = (id: string) => {
    setResults((prev) => prev.filter((r) => r.id !== id));
  };

  const clearAll = () => setResults([]);

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragActive ? "border-primary bg-primary/5 scale-[1.01]" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <QrCode className="w-7 h-7 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-lg">{isDragActive ? "Drop images here" : "Upload images with QR codes"}</p>
            <p className="text-sm text-muted-foreground mt-1">Drag & drop or click to select — supports JPG, PNG, WebP</p>
          </div>
        </div>
      </div>

      {results.length > 0 && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">{results.length} image{results.length !== 1 ? "s" : ""} processed</p>
          <Button variant="outline" size="sm" onClick={clearAll}>Clear All</Button>
        </div>
      )}

      <div className="space-y-4">
        {results.map((result) => (
          <div key={result.id} className="border rounded-xl overflow-hidden bg-card">
            <div className="flex items-start gap-4 p-4">
              {result.preview && (
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                  <img src={result.preview} alt={result.fileName} className="w-full h-full object-contain" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <p className="font-medium text-sm truncate">{result.fileName}</p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {result.status === "processing" && <Badge variant="secondary">Processing…</Badge>}
                    {result.status === "done" && result.codes.length > 0 && <Badge className="bg-green-500/10 text-green-600 border-green-500/20">{result.codes.length} QR found</Badge>}
                    {result.status === "done" && result.codes.length === 0 && <Badge variant="destructive" className="text-xs">Not found</Badge>}
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => removeResult(result.id)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {result.codes.map((code, i) => (
                  <div key={i} className="bg-muted/50 rounded-lg p-3 mt-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-mono break-all flex-1">{code.data}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 flex-shrink-0"
                        onClick={() => copyToClipboard(code.data, `${result.id}-${i}`)}
                      >
                        {copied === `${result.id}-${i}` ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    {code.data.startsWith("http") && (
                      <a href={code.data} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-1 block">
                        Open link ↗
                      </a>
                    )}
                  </div>
                ))}

                {result.error && <p className="text-sm text-muted-foreground mt-2">{result.error}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
