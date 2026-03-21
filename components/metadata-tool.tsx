"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Dropzone } from "@/components/dropzone";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Download, Shield, Trash2, X, FileImage, MapPin, Camera, Info } from "lucide-react";
import JSZip from "jszip";

interface ExifData {
  // Camera
  make?: string;
  model?: string;
  lens?: string;
  software?: string;
  // Capture settings
  iso?: number;
  fNumber?: number;
  exposureTime?: number;
  focalLength?: number;
  flash?: string;
  whiteBalance?: string;
  // Date & time
  dateTimeOriginal?: Date;
  dateTime?: Date;
  // GPS
  latitude?: number;
  longitude?: number;
  altitude?: number;
  // Image info
  orientation?: number;
  colorSpace?: string;
  // Raw flag
  hasExif: boolean;
}

interface ImageMeta {
  id: string;
  file: File;
  previewUrl: string;
  naturalW: number;
  naturalH: number;
  exif: ExifData | null;
  loadingExif: boolean;
  strippedStatus: "idle" | "processing" | "done" | "error";
  strippedBlob?: Blob;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    year: "numeric", month: "short", day: "numeric",
  });
}

function formatExifDate(d: Date): string {
  return d.toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatExposure(val: number): string {
  if (val >= 1) return `${val}s`;
  const denom = Math.round(1 / val);
  return `1/${denom}s`;
}

function formatGps(lat: number, lon: number): string {
  const latDir = lat >= 0 ? "N" : "S";
  const lonDir = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(5)}° ${latDir}, ${Math.abs(lon).toFixed(5)}° ${lonDir}`;
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

async function readExif(file: File): Promise<ExifData> {
  try {
    // Dynamic import so it only loads when needed
    const exifr = (await import("exifr")).default;
    const data = await exifr.parse(file, {
      tiff: true, exif: true, gps: true, ifd1: false,
      pick: [
        "Make", "Model", "LensModel", "Software",
        "ISO", "FNumber", "ExposureTime", "FocalLength",
        "Flash", "WhiteBalance",
        "DateTimeOriginal", "DateTime",
        "latitude", "longitude", "GPSAltitude",
        "Orientation", "ColorSpace",
      ],
    });

    if (!data) return { hasExif: false };

    return {
      hasExif: true,
      make: data.Make,
      model: data.Model,
      lens: data.LensModel,
      software: data.Software,
      iso: data.ISO,
      fNumber: data.FNumber,
      exposureTime: data.ExposureTime,
      focalLength: data.FocalLength,
      flash: data.Flash !== undefined ? String(data.Flash) : undefined,
      whiteBalance: data.WhiteBalance !== undefined ? String(data.WhiteBalance) : undefined,
      dateTimeOriginal: data.DateTimeOriginal,
      dateTime: data.DateTime,
      latitude: data.latitude,
      longitude: data.longitude,
      altitude: data.GPSAltitude,
      orientation: data.Orientation,
      colorSpace: data.ColorSpace !== undefined ? String(data.ColorSpace) : undefined,
    };
  } catch {
    return { hasExif: false };
  }
}

function stripMetadata(file: File): Promise<Blob | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
      canvas.toBlob(resolve, mime, 0.96);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-4 py-2 border-b border-border/40 last:border-0">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className="text-xs font-medium text-right break-all">{value}</span>
    </div>
  );
}

function ExifSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 pb-1">
        <span className="text-muted-foreground">{icon}</span>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
      </div>
      {children}
    </div>
  );
}

export function MetadataTool() {
  const [images, setImages] = useState<ImageMeta[]>([]);
  const [processing, setProcessing] = useState(false);
  const imagesRef = useRef<ImageMeta[]>([]);
  imagesRef.current = images;

  useEffect(() => {
    return () => imagesRef.current.forEach((img) => URL.revokeObjectURL(img.previewUrl));
  }, []);

  const onDrop = useCallback(async (files: File[]) => {
    const newImages: ImageMeta[] = await Promise.all(
      files.map(async (file) => {
        const { w, h } = await getImageDims(file);
        return {
          id: crypto.randomUUID(),
          file,
          previewUrl: URL.createObjectURL(file),
          naturalW: w,
          naturalH: h,
          exif: null,
          loadingExif: true,
          strippedStatus: "idle" as const,
        };
      })
    );

    setImages((prev) => [...prev, ...newImages]);

    // Read EXIF for each in background
    newImages.forEach(async (img) => {
      const exif = await readExif(img.file);
      setImages((prev) =>
        prev.map((i) => (i.id === img.id ? { ...i, exif, loadingExif: false } : i))
      );
    });
  }, []);

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

  const stripAll = useCallback(async () => {
    setProcessing(true);
    for (const img of imagesRef.current) {
      setImages((prev) =>
        prev.map((i) => (i.id === img.id ? { ...i, strippedStatus: "processing" } : i))
      );
      const blob = await stripMetadata(img.file);
      setImages((prev) =>
        prev.map((i) =>
          i.id === img.id
            ? { ...i, strippedStatus: blob ? "done" : "error", strippedBlob: blob ?? undefined }
            : i
        )
      );
    }
    setProcessing(false);
    toast.success("Metadata stripped from all images!");
  }, []);

  const downloadStripped = useCallback(async () => {
    const done = imagesRef.current.filter((i) => i.strippedStatus === "done" && i.strippedBlob);
    if (!done.length) { toast.error("Strip metadata first"); return; }

    if (done.length === 1) {
      const img = done[0];
      const ext = img.file.type === "image/png" ? "png" : "jpg";
      const base = img.file.name.replace(/\.[^.]+$/, "");
      const url = URL.createObjectURL(img.strippedBlob!);
      const a = document.createElement("a");
      a.href = url; a.download = `${base}-clean.${ext}`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } else {
      const zip = new JSZip();
      done.forEach((img) => {
        const ext = img.file.type === "image/png" ? "png" : "jpg";
        const base = img.file.name.replace(/\.[^.]+$/, "");
        zip.file(`${base}-clean.${ext}`, img.strippedBlob!);
      });
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "stripped-images.zip";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    }
    toast.success("Downloaded clean images!");
  }, []);

  const allStripped = images.length > 0 && images.every((i) => i.strippedStatus === "done");

  return (
    <div className="space-y-6">
      <Dropzone onDrop={onDrop} />

      {images.length > 0 && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-semibold">{images.length} image{images.length > 1 ? "s" : ""}</span>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={clearAll} disabled={processing}>
                <Trash2 className="w-4 h-4 mr-1.5" /> Clear All
              </Button>
              <Button size="sm" onClick={stripAll} disabled={processing || allStripped} className="gap-1.5">
                <Shield className="w-4 h-4" />
                {processing ? "Stripping…" : allStripped ? "All Stripped" : "Strip All Metadata"}
              </Button>
              {allStripped && (
                <Button size="sm" variant="secondary" onClick={downloadStripped} className="gap-1.5">
                  <Download className="w-4 h-4" /> Download Clean
                </Button>
              )}
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {images.map((img) => (
              <div key={img.id} className="bg-card border rounded-xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileImage className="w-4 h-4 text-muted-foreground shrink-0" />
                    <p className="font-medium text-sm truncate">{img.file.name}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {img.exif?.hasExif && (
                      <Badge variant="outline" className="text-[10px] text-orange-500 border-orange-400/40 bg-orange-500/10">
                        EXIF
                      </Badge>
                    )}
                    {img.exif?.latitude !== undefined && (
                      <Badge variant="outline" className="text-[10px] text-red-500 border-red-400/40 bg-red-500/10">
                        GPS
                      </Badge>
                    )}
                    {img.strippedStatus === "done" && (
                      <Badge variant="outline" className="text-[10px] text-green-600 border-green-500/30 bg-green-500/10">
                        Clean
                      </Badge>
                    )}
                    <button onClick={() => removeImage(img.id)} className="p-1 rounded hover:bg-muted transition-colors">
                      <X className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-4 p-4">
                  {/* Thumbnail */}
                  <div className="w-28 h-28 shrink-0 rounded-lg overflow-hidden bg-muted/50 border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.previewUrl} alt={img.file.name} className="w-full h-full object-cover" />
                  </div>

                  {/* Metadata columns */}
                  <div className="flex-1 min-w-0 space-y-3">
                    {/* Always-available file info */}
                    <ExifSection title="File" icon={<Info className="w-3.5 h-3.5" />}>
                      <Row label="Size" value={formatSize(img.file.size)} />
                      <Row label="Dimensions" value={img.naturalW > 0 ? `${img.naturalW} × ${img.naturalH} px` : "—"} />
                      <Row label="Megapixels" value={img.naturalW > 0 ? `${((img.naturalW * img.naturalH) / 1_000_000).toFixed(1)} MP` : "—"} />
                      <Row label="Type" value={img.file.type || "unknown"} />
                      <Row label="Modified" value={formatDate(img.file.lastModified)} />
                    </ExifSection>

                    {/* EXIF loading */}
                    {img.loadingExif && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                        <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        Reading EXIF data…
                      </div>
                    )}

                    {/* No EXIF */}
                    {!img.loadingExif && img.exif && !img.exif.hasExif && (
                      <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                        No EXIF metadata found in this image.
                      </div>
                    )}

                    {/* Camera info */}
                    {img.exif?.hasExif && (img.exif.make || img.exif.model || img.exif.iso || img.exif.fNumber || img.exif.focalLength || img.exif.exposureTime || img.exif.lens || img.exif.dateTimeOriginal) && (
                      <ExifSection title="Camera" icon={<Camera className="w-3.5 h-3.5" />}>
                        {img.exif.make && <Row label="Make" value={img.exif.make} />}
                        {img.exif.model && <Row label="Model" value={img.exif.model} />}
                        {img.exif.lens && <Row label="Lens" value={img.exif.lens} />}
                        {img.exif.iso && <Row label="ISO" value={img.exif.iso} />}
                        {img.exif.fNumber && <Row label="Aperture" value={`f/${img.exif.fNumber}`} />}
                        {img.exif.exposureTime && <Row label="Shutter" value={formatExposure(img.exif.exposureTime)} />}
                        {img.exif.focalLength && <Row label="Focal length" value={`${img.exif.focalLength}mm`} />}
                        {img.exif.dateTimeOriginal && <Row label="Date taken" value={formatExifDate(img.exif.dateTimeOriginal)} />}
                      </ExifSection>
                    )}

                    {/* GPS */}
                    {img.exif?.latitude !== undefined && img.exif.longitude !== undefined && (
                      <ExifSection title="Location (GPS)" icon={<MapPin className="w-3.5 h-3.5 text-red-500" />}>
                        <Row label="Coordinates" value={formatGps(img.exif.latitude, img.exif.longitude)} />
                        {img.exif.altitude !== undefined && (
                          <Row label="Altitude" value={`${Math.round(img.exif.altitude)} m`} />
                        )}
                        <a
                          href={`https://www.openstreetmap.org/?mlat=${img.exif.latitude}&mlon=${img.exif.longitude}&zoom=15`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          View on map →
                        </a>
                      </ExifSection>
                    )}
                  </div>
                </div>

                {/* Strip status bar */}
                <div className="px-4 pb-4">
                  {img.strippedStatus === "idle" && img.exif?.hasExif && (
                    <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400 bg-orange-500/10 border border-orange-400/20 rounded-lg px-3 py-2">
                      <Shield className="w-3.5 h-3.5 shrink-0" />
                      This image contains metadata. Click &quot;Strip All Metadata&quot; to remove it before sharing.
                    </div>
                  )}
                  {img.strippedStatus === "idle" && img.exif && !img.exif.hasExif && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                      <Shield className="w-3.5 h-3.5" />
                      No sensitive metadata detected.
                    </div>
                  )}
                  {img.strippedStatus === "processing" && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                      <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Stripping metadata…
                    </div>
                  )}
                  {img.strippedStatus === "done" && (
                    <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                        <Shield className="w-3.5 h-3.5" />
                        All metadata stripped — safe to share
                      </div>
                    </div>
                  )}
                  {img.strippedStatus === "error" && (
                    <div className="text-xs text-red-500 bg-red-500/10 rounded-lg px-3 py-2">
                      Failed to process this image.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
