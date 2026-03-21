"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop, convertToPixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  RotateCcw, RotateCw, Download, X, Save,
  FlipHorizontal, FlipVertical, RefreshCw, Loader2,
  Crop as CropIcon, Sliders, FileOutput,
} from 'lucide-react';
import { toast } from 'sonner';

interface ImageEditorProps {
  image: File;
  onSave: (editedImage: File) => void;
  onClose: () => void;
}

type OutputFormat = 'jpeg' | 'png' | 'webp';

interface AspectPreset {
  label: string;
  value: number | undefined;
  w: number;
  h: number;
}

interface SocialPreset {
  label: string;
  sub: string;
  w: number;
  h: number;
  ratio: number;
}

const ASPECT_PRESETS: AspectPreset[] = [
  { label: 'Free', value: undefined, w: 1, h: 1 },
  { label: '1:1', value: 1, w: 1, h: 1 },
  { label: '16:9', value: 16 / 9, w: 16, h: 9 },
  { label: '9:16', value: 9 / 16, w: 9, h: 16 },
  { label: '4:3', value: 4 / 3, w: 4, h: 3 },
  { label: '3:2', value: 3 / 2, w: 3, h: 2 },
  { label: '2:3', value: 2 / 3, w: 2, h: 3 },
  { label: '3:1', value: 3, w: 3, h: 1 },
];

const SOCIAL_PRESETS: SocialPreset[] = [
  { label: 'Square', sub: '1080×1080', w: 1080, h: 1080, ratio: 1 },
  { label: 'IG Story', sub: '1080×1920', w: 1080, h: 1920, ratio: 9 / 16 },
  { label: 'FB Cover', sub: '1200×675', w: 1200, h: 675, ratio: 16 / 9 },
  { label: 'YT Thumb', sub: '1280×720', w: 1280, h: 720, ratio: 16 / 9 },
  { label: 'LinkedIn', sub: '1200×628', w: 1200, h: 628, ratio: 1.91 },
  { label: 'Pinterest', sub: '1000×1500', w: 1000, h: 1500, ratio: 2 / 3 },
  { label: 'Twitter', sub: '1500×500', w: 1500, h: 500, ratio: 3 },
];

export function ImageEditor({ image, onSave, onClose }: ImageEditorProps) {
  // Crop state
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [activeAspect, setActiveAspect] = useState('Free');

  // Flip (applied at export, previewed via CSS)
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  // Adjustments: range -100 to +100, maps to CSS 0%–200% (0 = 100%)
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);

  // Export
  const [outputWidth, setOutputWidth] = useState(0);
  const [outputHeight, setOutputHeight] = useState(0);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('jpeg');
  const [outputQuality, setOutputQuality] = useState(92);

  // UI
  const [saving, setSaving] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [naturalDims, setNaturalDims] = useState({ w: 0, h: 0 });

  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Use refs + effect to safely handle React Strict Mode double-mount:
  // useState lazy initializer won't re-run after the cleanup/remount cycle,
  // so blob URLs must be created inside useEffect.
  const originalImgSrcRef = useRef('');
  const blobUrlsRef = useRef<Set<string>>(new Set());
  const [workingImgSrc, setWorkingImgSrc] = useState('');

  useEffect(() => {
    const url = URL.createObjectURL(image);
    originalImgSrcRef.current = url;
    blobUrlsRef.current.add(url);
    setWorkingImgSrc(url);

    // Capture ref value at effect time so the cleanup uses the correct set
    const blobUrls = blobUrlsRef.current;
    return () => {
      blobUrls.forEach(u => URL.revokeObjectURL(u));
      blobUrls.clear();
      originalImgSrcRef.current = '';
    };
  }, [image]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const initCrop = useCallback((w: number, h: number, ratio?: number) => {
    const r = ratio ?? w / h;
    const pc = makeAspectCrop({ unit: '%', width: 90 }, r, w, h);
    const px = convertToPixelCrop(pc, w, h);
    setCrop(px);
    setCompletedCrop(px);
  }, []);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight, width, height } = e.currentTarget;
    setNaturalDims({ w: naturalWidth, h: naturalHeight });
    // outputWidth/outputHeight stay 0 → output = crop dimensions (no stretching)
    setOutputWidth(0);
    setOutputHeight(0);
    initCrop(width, height);
  }, [initCrop]);

  // Derive live crop dimensions in natural pixels for display
  const cropNaturalDims = (() => {
    if (!completedCrop || !imgRef.current || !naturalDims.w) return null;
    const sx = naturalDims.w / imgRef.current.width;
    const sy = naturalDims.h / imgRef.current.height;
    const tw = outputWidth > 0 ? outputWidth : Math.round(completedCrop.width * sx);
    const th = outputHeight > 0 ? outputHeight : Math.round(completedCrop.height * sy);
    return { w: tw, h: th };
  })();

  // CSS filter string for live preview
  const cssFilter = [
    brightness !== 0 && `brightness(${100 + brightness}%)`,
    contrast !== 0 && `contrast(${100 + contrast}%)`,
    saturation !== 0 && `saturate(${100 + saturation}%)`,
  ].filter(Boolean).join(' ') || undefined;

  // Bake rotation into a new blob URL so ReactCrop coordinates are always correct
  const rotateBy = useCallback(async (deg: number) => {
    if (!imgRef.current || rotating) return;
    setRotating(true);
    try {
      const img = imgRef.current;
      const rad = (deg * Math.PI) / 180;
      const sin = Math.abs(Math.sin(rad));
      const cos = Math.abs(Math.cos(rad));
      const newW = Math.round(img.naturalWidth * cos + img.naturalHeight * sin);
      const newH = Math.round(img.naturalWidth * sin + img.naturalHeight * cos);

      const canvas = document.createElement('canvas');
      canvas.width = newW;
      canvas.height = newH;
      const ctx = canvas.getContext('2d')!;
      ctx.translate(newW / 2, newH / 2);
      ctx.rotate(rad);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

      const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/png'));
      if (!blob) return;

      const newUrl = URL.createObjectURL(blob);
      blobUrlsRef.current.add(newUrl);
      setWorkingImgSrc(newUrl);
      setCrop(undefined);
      setCompletedCrop(undefined);
      setActiveAspect('Free');
      setAspect(undefined);
    } finally {
      setRotating(false);
    }
  }, [rotating]);

  const handleAspectPreset = useCallback((preset: AspectPreset) => {
    setActiveAspect(preset.label);
    setAspect(preset.value);
    if (!imgRef.current) return;
    const { width, height } = imgRef.current;
    if (preset.value !== undefined) {
      setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 90 }, preset.value, width, height), width, height));
    } else {
      initCrop(width, height);
    }
  }, [initCrop]);

  const handleSocialPreset = useCallback((preset: SocialPreset) => {
    setOutputWidth(preset.w);
    setOutputHeight(preset.h);
    setAspect(preset.ratio);
    setActiveAspect(`${preset.w}:${preset.h}`);
    if (!imgRef.current) return;
    const { width, height } = imgRef.current;
    setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 90 }, preset.ratio, width, height), width, height));
  }, []);

  const resetAll = useCallback(() => {
    // Restore original image src
    if (originalImgSrcRef.current && workingImgSrc !== originalImgSrcRef.current) {
      setWorkingImgSrc(originalImgSrcRef.current);
    }
    setFlipH(false);
    setFlipV(false);
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
    setOutputWidth(0);
    setOutputHeight(0);
    setOutputFormat('jpeg');
    setOutputQuality(92);
    setActiveAspect('Free');
    setAspect(undefined);
    setCrop(undefined);
    setCompletedCrop(undefined);
  }, [workingImgSrc]);

  const drawToCanvas = useCallback((canvas: HTMLCanvasElement, img: HTMLImageElement): boolean => {
    const ctx = canvas.getContext('2d');
    if (!ctx || !completedCrop) return false;

    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;
    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;
    const cropW = completedCrop.width * scaleX;
    const cropH = completedCrop.height * scaleY;

    // Use crop size if no custom output size — this prevents stretching
    const targetW = outputWidth > 0 ? outputWidth : Math.round(cropW);
    const targetH = outputHeight > 0 ? outputHeight : Math.round(cropH);

    canvas.width = targetW;
    canvas.height = targetH;

    // White fill for JPEG (no transparency support)
    if (outputFormat === 'jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetW, targetH);
    }

    // Apply adjustment filters
    const filterParts: string[] = [];
    if (brightness !== 0) filterParts.push(`brightness(${100 + brightness}%)`);
    if (contrast !== 0) filterParts.push(`contrast(${100 + contrast}%)`);
    if (saturation !== 0) filterParts.push(`saturate(${100 + saturation}%)`);
    if (filterParts.length > 0) ctx.filter = filterParts.join(' ');

    ctx.save();
    ctx.translate(flipH ? targetW : 0, flipV ? targetH : 0);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    // Rotation is baked into workingImgSrc, so a simple drawImage is sufficient
    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, targetW, targetH);
    ctx.restore();

    return true;
  }, [completedCrop, outputWidth, outputHeight, flipH, flipV, outputFormat, brightness, contrast, saturation]);

  const handleSave = useCallback(async (download = false) => {
    if (!imgRef.current || !canvasRef.current || !completedCrop) {
      toast.error('Draw a crop selection first');
      return;
    }
    setSaving(true);
    try {
      const ok = drawToCanvas(canvasRef.current, imgRef.current);
      if (!ok) { toast.error('Failed to draw image'); return; }

      const mimeType = `image/${outputFormat}`;
      const quality = outputFormat === 'png' ? undefined : outputQuality / 100;
      const ext = outputFormat === 'jpeg' ? 'jpg' : outputFormat;
      const baseName = image.name.replace(/\.[^.]+$/, '');

      const blob = await new Promise<Blob | null>(res =>
        canvasRef.current!.toBlob(res, mimeType, quality)
      );
      if (!blob) { toast.error('Failed to generate image'); return; }

      const file = new File([blob], `${baseName}.${ext}`, { type: mimeType });

      if (download) {
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url; a.download = file.name;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        toast.success('Image downloaded!');
      } else {
        onSave(file);
        toast.success('Changes saved!');
      }
    } catch {
      toast.error('Failed to process image');
    } finally {
      setSaving(false);
    }
  }, [drawToCanvas, completedCrop, outputFormat, outputQuality, image.name, onSave]);

  const hasAdjustments = brightness !== 0 || contrast !== 0 || saturation !== 0;
  const hasTransforms = flipH || flipV || workingImgSrc !== originalImgSrcRef.current;

  return (
    <div className="fixed inset-0 bg-black/95 flex flex-col z-50">

      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-zinc-900 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-white font-semibold text-sm truncate max-w-[200px]">{image.name}</span>
          {cropNaturalDims && (
            <Badge variant="outline" className="font-mono text-xs text-zinc-300 border-zinc-600">
              {cropNaturalDims.w} × {cropNaturalDims.h} px
            </Badge>
          )}
          {naturalDims.w > 0 && (
            <span className="text-zinc-500 text-xs hidden sm:inline">
              original: {naturalDims.w} × {naturalDims.h}
            </span>
          )}
        </div>
        <Button
          variant="ghost" size="icon"
          onClick={onClose}
          className="text-zinc-400 hover:text-white hover:bg-white/10 rounded-full"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">

        {/* Canvas Area */}
        <div
          className="flex-1 flex items-center justify-center overflow-auto p-6"
          style={{
            backgroundImage: 'repeating-conic-gradient(#1a1a1a 0% 25%, #111 0% 50%)',
            backgroundSize: '24px 24px',
          }}
        >
          {workingImgSrc && (
            <ReactCrop
              crop={crop}
              onChange={(_, p) => setCrop(p)}
              onComplete={c => setCompletedCrop(c)}
              aspect={aspect}
              minWidth={10}
              minHeight={10}
              keepSelection
              className="shadow-2xl"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={workingImgSrc}
                alt="Edit preview"
                onLoad={onImageLoad}
                style={{
                  maxHeight: 'calc(100vh - 140px)',
                  maxWidth: '100%',
                  objectFit: 'contain',
                  display: 'block',
                  transform: `scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                  filter: cssFilter,
                  transition: 'filter 0.15s, transform 0.15s',
                }}
              />
            </ReactCrop>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Right Sidebar */}
        <div className="w-72 bg-zinc-900 border-l border-white/10 flex flex-col overflow-hidden shrink-0">
          <Tabs defaultValue="crop" className="flex flex-col flex-1 overflow-hidden">

            {/* Tab Bar */}
            <TabsList className="grid grid-cols-3 rounded-none border-b border-white/10 bg-zinc-900 h-11 shrink-0">
              <TabsTrigger value="crop" className="data-[state=active]:bg-zinc-800 text-zinc-400 data-[state=active]:text-white rounded-none text-xs gap-1.5">
                <CropIcon className="w-3.5 h-3.5" /> Crop
              </TabsTrigger>
              <TabsTrigger value="adjust" className="data-[state=active]:bg-zinc-800 text-zinc-400 data-[state=active]:text-white rounded-none text-xs gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                Adjust{hasAdjustments && <span className="w-1.5 h-1.5 rounded-full bg-primary ml-0.5" />}
              </TabsTrigger>
              <TabsTrigger value="export" className="data-[state=active]:bg-zinc-800 text-zinc-400 data-[state=active]:text-white rounded-none text-xs gap-1.5">
                <FileOutput className="w-3.5 h-3.5" /> Export
              </TabsTrigger>
            </TabsList>

            {/* ── TAB: CROP ── */}
            <TabsContent value="crop" className="flex-1 overflow-y-auto p-4 space-y-5 mt-0">

              {/* Rotate & Flip */}
              <section className="space-y-2.5">
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Rotate & Flip</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline" size="sm"
                    onClick={() => rotateBy(-90)}
                    disabled={rotating}
                    className="bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700 hover:text-white"
                  >
                    {rotating ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5 mr-1" />}
                    −90°
                  </Button>
                  <Button
                    variant="outline" size="sm"
                    onClick={() => rotateBy(90)}
                    disabled={rotating}
                    className="bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700 hover:text-white"
                  >
                    {rotating ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <RotateCw className="w-3.5 h-3.5 mr-1" />}
                    +90°
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setFlipH(p => !p)}
                    variant={flipH ? 'default' : 'outline'}
                    className={flipH ? '' : 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700 hover:text-white'}
                  >
                    <FlipHorizontal className="w-3.5 h-3.5 mr-1" /> Flip H
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setFlipV(p => !p)}
                    variant={flipV ? 'default' : 'outline'}
                    className={flipV ? '' : 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700 hover:text-white'}
                  >
                    <FlipVertical className="w-3.5 h-3.5 mr-1" /> Flip V
                  </Button>
                </div>
              </section>

              {/* Aspect Ratio */}
              <section className="space-y-2.5">
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Aspect Ratio</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {ASPECT_PRESETS.map(p => (
                    <button
                      key={p.label}
                      onClick={() => handleAspectPreset(p)}
                      className={`flex flex-col items-center gap-1 p-1.5 rounded-md border text-[10px] font-medium transition-colors
                        ${activeAspect === p.label
                          ? 'bg-primary/20 border-primary text-primary'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                        }`}
                    >
                      <div
                        className="bg-current opacity-60 rounded-sm"
                        style={{
                          width: p.label === 'Free' ? 14 : Math.min(14, 14 * (p.w / Math.max(p.w, p.h))),
                          height: p.label === 'Free' ? 14 : Math.min(14, 14 * (p.h / Math.max(p.w, p.h))),
                        }}
                      />
                      {p.label}
                    </button>
                  ))}
                </div>
              </section>

              {/* Social Presets */}
              <section className="space-y-2.5">
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Social Presets</p>
                <div className="grid grid-cols-1 gap-1">
                  {SOCIAL_PRESETS.map(p => (
                    <button
                      key={p.label}
                      onClick={() => handleSocialPreset(p)}
                      className="flex items-center justify-between px-3 py-2 rounded-md border bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors text-xs"
                    >
                      <span className="font-medium">{p.label}</span>
                      <span className="text-zinc-500">{p.sub}</span>
                    </button>
                  ))}
                </div>
              </section>

            </TabsContent>

            {/* ── TAB: ADJUST ── */}
            <TabsContent value="adjust" className="flex-1 overflow-y-auto p-4 space-y-5 mt-0">

              {[
                { label: 'Brightness', icon: '☀', value: brightness, set: setBrightness },
                { label: 'Contrast', icon: '◑', value: contrast, set: setContrast },
                { label: 'Saturation', icon: '◎', value: saturation, set: setSaturation },
              ].map(({ label, icon, value, set }) => (
                <section key={label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-300">{icon} {label}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono ${value === 0 ? 'text-zinc-500' : value > 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                        {value > 0 ? '+' : ''}{value}
                      </span>
                      {value !== 0 && (
                        <button
                          onClick={() => set(0)}
                          className="text-[10px] text-zinc-500 hover:text-zinc-300 underline"
                        >
                          reset
                        </button>
                      )}
                    </div>
                  </div>
                  <Slider
                    value={[value]}
                    onValueChange={([v]) => set(v)}
                    min={-100} max={100} step={1}
                    className="[&_[role=slider]]:bg-zinc-200"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-600">
                    <span>-100</span><span>0</span><span>+100</span>
                  </div>
                </section>
              ))}

              {hasAdjustments && (
                <Button
                  variant="ghost" size="sm"
                  onClick={() => { setBrightness(0); setContrast(0); setSaturation(0); }}
                  className="w-full text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Reset All Adjustments
                </Button>
              )}

            </TabsContent>

            {/* ── TAB: EXPORT ── */}
            <TabsContent value="export" className="flex-1 overflow-y-auto p-4 space-y-5 mt-0">

              {/* Format */}
              <section className="space-y-2">
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Format</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['jpeg', 'png', 'webp'] as OutputFormat[]).map(fmt => (
                    <button
                      key={fmt}
                      onClick={() => setOutputFormat(fmt)}
                      className={`py-2 rounded-md border text-xs font-medium uppercase transition-colors
                        ${outputFormat === fmt
                          ? 'bg-primary/20 border-primary text-primary'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                        }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-zinc-500">
                  {outputFormat === 'jpeg' && 'Best for photos. No transparency.'}
                  {outputFormat === 'png' && 'Lossless. Supports transparency.'}
                  {outputFormat === 'webp' && 'Modern format. Smallest file size.'}
                </p>
              </section>

              {/* Quality */}
              {outputFormat !== 'png' && (
                <section className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Quality</p>
                    <span className="text-xs font-mono text-zinc-300">{outputQuality}%</span>
                  </div>
                  <Slider
                    value={[outputQuality]}
                    onValueChange={([v]) => setOutputQuality(v)}
                    min={10} max={100} step={1}
                    className="[&_[role=slider]]:bg-zinc-200"
                  />
                </section>
              )}

              {/* Custom Output Size */}
              <section className="space-y-2">
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Custom Output Size</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-zinc-500">Width (px)</Label>
                    <Input
                      type="number" min={1}
                      value={outputWidth || ''}
                      onChange={e => setOutputWidth(Number(e.target.value))}
                      placeholder={String(cropNaturalDims?.w ?? 'auto')}
                      className="bg-zinc-800 border-zinc-700 text-zinc-200 text-sm h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-zinc-500">Height (px)</Label>
                    <Input
                      type="number" min={1}
                      value={outputHeight || ''}
                      onChange={e => setOutputHeight(Number(e.target.value))}
                      placeholder={String(cropNaturalDims?.h ?? 'auto')}
                      className="bg-zinc-800 border-zinc-700 text-zinc-200 text-sm h-8"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-zinc-500">
                  Leave empty to use exact crop dimensions
                </p>
                {(outputWidth > 0 || outputHeight > 0) && (
                  <button
                    onClick={() => { setOutputWidth(0); setOutputHeight(0); }}
                    className="text-[10px] text-zinc-500 hover:text-zinc-300 underline"
                  >
                    Clear custom size
                  </button>
                )}
              </section>

              {/* Output summary */}
              {cropNaturalDims && (
                <div className="bg-zinc-800 rounded-md p-3 space-y-1">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Output Preview</p>
                  <p className="text-sm font-mono text-zinc-200">
                    {cropNaturalDims.w} × {cropNaturalDims.h} px
                  </p>
                  <p className="text-[10px] text-zinc-500">
                    {outputFormat.toUpperCase()}
                    {outputFormat !== 'png' && ` · ${outputQuality}% quality`}
                  </p>
                </div>
              )}

            </TabsContent>
          </Tabs>

          {/* Bottom Action Bar */}
          <div className="p-3 border-t border-white/10 space-y-2 shrink-0 bg-zinc-900">
            <Button
              variant="ghost" size="sm"
              onClick={resetAll}
              className="w-full text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 text-xs"
            >
              <RefreshCw className="w-3 h-3 mr-1.5" /> Reset All
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => handleSave(false)}
                disabled={saving || !completedCrop}
                className="text-sm"
              >
                {saving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
                Save
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleSave(true)}
                disabled={saving || !completedCrop}
                className="text-sm bg-zinc-700 hover:bg-zinc-600 text-zinc-200"
              >
                {saving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Download className="w-4 h-4 mr-1.5" />}
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
