"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop, convertToPixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  RotateCcw, RotateCw, Download, X, Save, Check,
  FlipHorizontal, FlipVertical, RefreshCw, Loader2,
  Crop as CropIcon, Sliders, FileOutput, Undo2,
  Plus, Minus, Hand, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

const ZOOM_MIN = 0.1;
const ZOOM_MAX = 4;
const ZOOM_STEP = 1.25;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable;
}

interface ImageEditorProps {
  image: File;
  onSave: (editedImage: File) => void;
  onClose: () => void;
}

type OutputFormat = 'jpeg' | 'png' | 'webp';
type MobileTab = 'crop' | 'rotate' | 'adjust' | 'export';

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

interface EditorSnapshot {
  workingImgSrc: string;
  flipH: boolean;
  flipV: boolean;
  brightness: number;
  contrast: number;
  saturation: number;
  crop: Crop | undefined;
  completedCrop: PixelCrop | undefined;
  aspect: number | undefined;
  activeAspect: string;
  outputWidth: number;
  outputHeight: number;
}

const ASPECT_PRESETS: AspectPreset[] = [
  { label: 'Free', value: undefined, w: 1, h: 1 },
  { label: '1:1',  value: 1,         w: 1, h: 1 },
  { label: '16:9', value: 16 / 9,    w: 16, h: 9 },
  { label: '9:16', value: 9 / 16,    w: 9,  h: 16 },
  { label: '4:3',  value: 4 / 3,     w: 4,  h: 3 },
  { label: '3:2',  value: 3 / 2,     w: 3,  h: 2 },
  { label: '2:3',  value: 2 / 3,     w: 2,  h: 3 },
  { label: '3:1',  value: 3,         w: 3,  h: 1 },
];

const SOCIAL_PRESETS: SocialPreset[] = [
  { label: 'Square',   sub: '1080×1080', w: 1080, h: 1080, ratio: 1       },
  { label: 'IG Story', sub: '1080×1920', w: 1080, h: 1920, ratio: 9 / 16  },
  { label: 'FB Cover', sub: '1200×675',  w: 1200, h: 675,  ratio: 16 / 9  },
  { label: 'YT Thumb', sub: '1280×720',  w: 1280, h: 720,  ratio: 16 / 9  },
  { label: 'LinkedIn', sub: '1200×628',  w: 1200, h: 628,  ratio: 1.91    },
  { label: 'Pinterest',sub: '1000×1500', w: 1000, h: 1500, ratio: 2 / 3   },
  { label: 'Twitter',  sub: '1500×500',  w: 1500, h: 500,  ratio: 3       },
];

export function ImageEditor({ image, onSave, onClose }: ImageEditorProps) {
  // ── Crop
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [activeAspect, setActiveAspect] = useState('Free');

  // ── Transform
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  // ── Adjustments  (-100 → +100)
  const [brightness, setBrightness] = useState(0);
  const [contrast,   setContrast]   = useState(0);
  const [saturation, setSaturation] = useState(0);

  // ── Export
  const [outputWidth,   setOutputWidth]   = useState(0);
  const [outputHeight,  setOutputHeight]  = useState(0);
  const [outputFormat,  setOutputFormat]  = useState<OutputFormat>('jpeg');
  const [outputQuality, setOutputQuality] = useState(92);

  // ── UI
  const [saving,   setSaving]   = useState(false);
  const [rotating, setRotating] = useState(false);
  const [naturalDims, setNaturalDims] = useState({ w: 0, h: 0 });

  // ── Undo history
  const historyRef = useRef<EditorSnapshot[]>([]);
  const [historyLen, setHistoryLen] = useState(0);

  // ── Mobile
  const [isMobile, setIsMobile] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<MobileTab>('crop');

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // ── Zoom / Pan
  const [zoom, setZoom] = useState(1);
  const [isAtFit, setIsAtFit] = useState(true);
  const [handTool, setHandTool] = useState(false);
  const [isSpaceHeld, setIsSpaceHeld] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const zoomRef = useRef(zoom);
  const panStateRef = useRef<{ x: number; y: number; scrollLeft: number; scrollTop: number } | null>(null);

  useEffect(() => { zoomRef.current = zoom; }, [zoom]);

  // ── Desktop sidebar
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const imgRef       = useRef<HTMLImageElement>(null);
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const containerRef  = useRef<HTMLDivElement>(null);

  const originalImgSrcRef = useRef('');
  const blobUrlsRef       = useRef<Set<string>>(new Set());
  const [workingImgSrc, setWorkingImgSrc] = useState('');

  const pushHistory = useCallback(() => {
    historyRef.current = [
      ...historyRef.current.slice(-19),
      { workingImgSrc, flipH, flipV, brightness, contrast, saturation, crop, completedCrop, aspect, activeAspect, outputWidth, outputHeight },
    ];
    setHistoryLen(historyRef.current.length);
  }, [workingImgSrc, flipH, flipV, brightness, contrast, saturation, crop, completedCrop, aspect, activeAspect, outputWidth, outputHeight]);

  const undo = useCallback(() => {
    const snap = historyRef.current.pop();
    if (!snap) return;
    setHistoryLen(historyRef.current.length);
    setWorkingImgSrc(snap.workingImgSrc);
    setFlipH(snap.flipH);
    setFlipV(snap.flipV);
    setBrightness(snap.brightness);
    setContrast(snap.contrast);
    setSaturation(snap.saturation);
    setCrop(snap.crop);
    setCompletedCrop(snap.completedCrop);
    setAspect(snap.aspect);
    setActiveAspect(snap.activeAspect);
    setOutputWidth(snap.outputWidth);
    setOutputHeight(snap.outputHeight);
  }, []);

  useEffect(() => {
    const url = URL.createObjectURL(image);
    originalImgSrcRef.current = url;
    blobUrlsRef.current.add(url);
    setWorkingImgSrc(url);
    const blobUrls = blobUrlsRef.current;
    return () => {
      blobUrls.forEach(u => URL.revokeObjectURL(u));
      blobUrls.clear();
      originalImgSrcRef.current = '';
    };
  }, [image]);

  const computeFitZoom = useCallback((natW: number, natH: number) => {
    const el = containerRef.current;
    if (!el || !natW || !natH) return 1;
    const pad = 24;
    const availW = Math.max(50, el.clientWidth - pad);
    const availH = Math.max(50, el.clientHeight - pad);
    return Math.min(availW / natW, availH / natH, 1) || 1;
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }

      const typing = isTypingTarget(e.target);

      if (e.key === 'z' && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
        if (typing) return;
        e.preventDefault();
        undo();
        return;
      }

      if (typing) return;

      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        setIsSpaceHeld(true);
        return;
      }
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setZoom(z => clamp(z * ZOOM_STEP, ZOOM_MIN, ZOOM_MAX));
        setIsAtFit(false);
        return;
      }
      if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        setZoom(z => clamp(z / ZOOM_STEP, ZOOM_MIN, ZOOM_MAX));
        setIsAtFit(false);
        return;
      }
      if (e.key === '0') {
        if (naturalDims.w) {
          e.preventDefault();
          setZoom(computeFitZoom(naturalDims.w, naturalDims.h));
          setIsAtFit(true);
        }
        return;
      }
      if (e.key === '1') {
        e.preventDefault();
        setZoom(1);
        setIsAtFit(false);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') setIsSpaceHeld(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onClose, undo, naturalDims.w, naturalDims.h, computeFitZoom]);

  const initCrop = useCallback((w: number, h: number, ratio?: number) => {
    const r  = ratio ?? w / h;
    const pc = makeAspectCrop({ unit: '%', width: 90 }, r, w, h);
    const px = convertToPixelCrop(pc, w, h);
    setCrop(pc);
    setCompletedCrop(px);
  }, []);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setNaturalDims({ w: naturalWidth, h: naturalHeight });
    setOutputWidth(0);
    setOutputHeight(0);
    const fit = computeFitZoom(naturalWidth, naturalHeight);
    setZoom(fit);
    setIsAtFit(true);
    initCrop(naturalWidth * fit, naturalHeight * fit);
  }, [initCrop, computeFitZoom]);

  // react-image-crop keeps `crop` (percent-space) as the single source of truth for
  // where the crop box is. Mirror it in a ref so the resize handler below can reassert
  // it without depending on the effect re-running.
  const cropRef = useRef<Crop | undefined>(undefined);
  useEffect(() => { cropRef.current = crop; }, [crop]);

  // Refit on container resize (sidebar collapse, window resize) while still at "Fit".
  // When NOT at fit (user has zoomed in past the container), react-image-crop's own
  // internal reflow can reclamp the crop box against the container's new bounding
  // rect — deferring one frame and reasserting our own percent-space crop overrides
  // any such reclamping so the crop region never silently drifts on resize.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !naturalDims.w || !naturalDims.h) return;
    const ro = new ResizeObserver(() => {
      if (isAtFit) {
        setZoom(computeFitZoom(naturalDims.w, naturalDims.h));
        return;
      }
      requestAnimationFrame(() => {
        if (!imgRef.current || !cropRef.current) return;
        const px = convertToPixelCrop(cropRef.current, imgRef.current.width, imgRef.current.height);
        setCrop(cropRef.current);
        setCompletedCrop(px);
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [naturalDims.w, naturalDims.h, isAtFit, computeFitZoom]);

  // Keep completedCrop (pixel-space) in sync with crop (percent-space) whenever the
  // rendered image size changes — zoom, refit, or a rotate-triggered reload.
  useEffect(() => {
    if (!imgRef.current || !crop) return;
    const px = convertToPixelCrop(crop, imgRef.current.width, imgRef.current.height);
    setCompletedCrop(px);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom]);

  // Ctrl/Cmd+wheel zoom — native listener so preventDefault reliably blocks page scroll
  // (React's onWheel is passive by default and can't reliably preventDefault).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      const factor = Math.exp(-e.deltaY * 0.01);
      setZoom(z => clamp(z * factor, ZOOM_MIN, ZOOM_MAX));
      setIsAtFit(false);
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  // Two-finger pinch-to-zoom on touch devices
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let pinchStartDist = 0;
    let pinchStartZoom = 1;

    const getDist = (touches: TouchList) =>
      Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        pinchStartDist = getDist(e.touches);
        pinchStartZoom = zoomRef.current;
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchStartDist > 0) {
        e.preventDefault();
        const ratio = getDist(e.touches) / pinchStartDist;
        setZoom(clamp(pinchStartZoom * ratio, ZOOM_MIN, ZOOM_MAX));
        setIsAtFit(false);
      }
    };
    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) pinchStartDist = 0;
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd);
    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const handlePanMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const el = containerRef.current;
    if (!el) return;
    panStateRef.current = { x: e.clientX, y: e.clientY, scrollLeft: el.scrollLeft, scrollTop: el.scrollTop };
    setIsPanning(true);
  }, []);

  useEffect(() => {
    if (!isPanning) return;
    const handleMove = (e: MouseEvent) => {
      const el = containerRef.current;
      const start = panStateRef.current;
      if (!el || !start) return;
      el.scrollLeft = start.scrollLeft - (e.clientX - start.x);
      el.scrollTop  = start.scrollTop  - (e.clientY - start.y);
    };
    const handleUp = () => { setIsPanning(false); panStateRef.current = null; };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isPanning]);

  const zoomIn  = useCallback(() => { setZoom(z => clamp(z * ZOOM_STEP, ZOOM_MIN, ZOOM_MAX)); setIsAtFit(false); }, []);
  const zoomOut = useCallback(() => { setZoom(z => clamp(z / ZOOM_STEP, ZOOM_MIN, ZOOM_MAX)); setIsAtFit(false); }, []);
  const zoomToFit = useCallback(() => {
    if (!naturalDims.w) return;
    setZoom(computeFitZoom(naturalDims.w, naturalDims.h));
    setIsAtFit(true);
  }, [naturalDims.w, naturalDims.h, computeFitZoom]);

  const cropNaturalDims = (() => {
    if (!completedCrop || !imgRef.current || !naturalDims.w) return null;
    const sx = naturalDims.w / imgRef.current.width;
    const sy = naturalDims.h / imgRef.current.height;
    const tw = outputWidth  > 0 ? outputWidth  : Math.round(completedCrop.width  * sx);
    const th = outputHeight > 0 ? outputHeight : Math.round(completedCrop.height * sy);
    return { w: tw, h: th };
  })();

  const cssFilter = [
    brightness !== 0 && `brightness(${100 + brightness}%)`,
    contrast   !== 0 && `contrast(${100 + contrast}%)`,
    saturation !== 0 && `saturate(${100 + saturation}%)`,
  ].filter(Boolean).join(' ') || undefined;

  const rotateBy = useCallback(async (deg: number) => {
    if (!imgRef.current || rotating) return;
    pushHistory();
    setRotating(true);
    try {
      const img  = imgRef.current;
      const rad  = (deg * Math.PI) / 180;
      const sin  = Math.abs(Math.sin(rad));
      const cos  = Math.abs(Math.cos(rad));
      const newW = Math.round(img.naturalWidth * cos + img.naturalHeight * sin);
      const newH = Math.round(img.naturalWidth * sin + img.naturalHeight * cos);

      const canvas = document.createElement('canvas');
      canvas.width  = newW;
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
    pushHistory();
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
    pushHistory();
    setOutputWidth(preset.w);
    setOutputHeight(preset.h);
    setAspect(preset.ratio);
    setActiveAspect(`${preset.w}:${preset.h}`);
    if (!imgRef.current) return;
    const { width, height } = imgRef.current;
    setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 90 }, preset.ratio, width, height), width, height));
  }, []);

  const resetAll = useCallback(() => {
    pushHistory();
    if (originalImgSrcRef.current && workingImgSrc !== originalImgSrcRef.current) {
      setWorkingImgSrc(originalImgSrcRef.current);
    }
    setFlipH(false); setFlipV(false);
    setBrightness(0); setContrast(0); setSaturation(0);
    setOutputWidth(0); setOutputHeight(0);
    setOutputFormat('jpeg'); setOutputQuality(92);
    setActiveAspect('Free'); setAspect(undefined);
    setCrop(undefined); setCompletedCrop(undefined);
  }, [workingImgSrc]);

  const drawToCanvas = useCallback((canvas: HTMLCanvasElement, img: HTMLImageElement): boolean => {
    const ctx = canvas.getContext('2d');
    if (!ctx || !completedCrop) return false;

    const scaleX = img.naturalWidth  / img.width;
    const scaleY = img.naturalHeight / img.height;
    const cropX  = completedCrop.x * scaleX;
    const cropY  = completedCrop.y * scaleY;
    const cropW  = completedCrop.width  * scaleX;
    const cropH  = completedCrop.height * scaleY;
    const targetW = outputWidth  > 0 ? outputWidth  : Math.round(cropW);
    const targetH = outputHeight > 0 ? outputHeight : Math.round(cropH);

    canvas.width  = targetW;
    canvas.height = targetH;

    if (outputFormat === 'jpeg') { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, targetW, targetH); }

    const filterParts: string[] = [];
    if (brightness !== 0) filterParts.push(`brightness(${100 + brightness}%)`);
    if (contrast   !== 0) filterParts.push(`contrast(${100 + contrast}%)`);
    if (saturation !== 0) filterParts.push(`saturate(${100 + saturation}%)`);
    if (filterParts.length) ctx.filter = filterParts.join(' ');

    ctx.save();
    ctx.translate(flipH ? targetW : 0, flipV ? targetH : 0);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
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
      const quality  = outputFormat === 'png' ? undefined : outputQuality / 100;
      const ext      = outputFormat === 'jpeg' ? 'jpg' : outputFormat;
      const baseName = image.name.replace(/\.[^.]+$/, '');

      const blob = await new Promise<Blob | null>(res =>
        canvasRef.current!.toBlob(res, mimeType, quality)
      );
      if (!blob) { toast.error('Failed to generate image'); return; }

      const file = new File([blob], `${baseName}.${ext}`, { type: mimeType });

      if (download) {
        const url = URL.createObjectURL(file);
        const a   = document.createElement('a');
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
  const panMode = isSpaceHeld || handTool;
  const zoomPercent = Math.round(zoom * 100);

  // ─────────────────────────────────────────────────
  //  Zoom control pill (shared)
  // ─────────────────────────────────────────────────
  const zoomControls = naturalDims.w > 0 && (
    <div
      className={`absolute z-30 flex items-center gap-0.5 rounded-full bg-zinc-900/85 backdrop-blur border border-white/10 px-1.5 py-1 shadow-lg ${
        isMobile ? 'bottom-3 left-1/2 -translate-x-1/2' : 'bottom-4 left-4'
      }`}
    >
      <button
        onClick={zoomOut}
        className="w-7 h-7 flex items-center justify-center rounded-full text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Zoom out"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className="px-1.5 h-7 flex items-center justify-center text-xs font-mono tabular-nums text-zinc-300 min-w-[3.25rem]">
        {zoomPercent}%
      </span>
      <button
        onClick={zoomIn}
        className="w-7 h-7 flex items-center justify-center rounded-full text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Zoom in"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
      <div className="w-px h-4 bg-white/10 mx-0.5" />
      <button
        onClick={zoomToFit}
        title="Fit to screen (0)"
        className="px-2 h-7 text-[11px] font-medium text-zinc-300 hover:text-white rounded-full hover:bg-white/10 transition-colors"
      >
        Fit
      </button>
      <button
        onClick={() => setHandTool(h => !h)}
        aria-pressed={handTool}
        title="Hand tool — hold Space to pan temporarily"
        className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors ${
          handTool ? 'bg-primary/30 text-primary' : 'text-zinc-300 hover:text-white hover:bg-white/10'
        }`}
      >
        <Hand className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  // ─────────────────────────────────────────────────
  //  Shared canvas area
  // ─────────────────────────────────────────────────
  const canvasArea = (
    <div
      ref={containerRef}
      className="flex-1 min-h-0 relative overflow-auto"
      style={{
        backgroundImage: 'repeating-conic-gradient(#1a1a1a 0% 25%, #111 0% 50%)',
        backgroundSize:  '24px 24px',
        cursor: panMode ? (isPanning ? 'grabbing' : 'grab') : undefined,
      }}
      onMouseDown={panMode ? handlePanMouseDown : undefined}
    >
      <div className="min-w-full min-h-full flex items-center justify-center p-3 md:p-6">
        {workingImgSrc && (
          <ReactCrop
            crop={crop}
            onChange={(_, p) => setCrop(p)}
            onComplete={c => setCompletedCrop(c)}
            aspect={aspect}
            minWidth={10}
            minHeight={10}
            keepSelection
            disabled={panMode}
            className="shadow-2xl"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={workingImgSrc}
              alt={`Edit preview of ${image.name}`}
              onLoad={onImageLoad}
              draggable={false}
              style={{
                ...(naturalDims.w
                  ? { width: naturalDims.w * zoom, height: naturalDims.h * zoom }
                  : { maxWidth: '100%', maxHeight: isMobile ? 'calc(100dvh - 252px)' : 'calc(100vh - 140px)' }),
                display:   'block',
                transform: `scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                filter:    cssFilter,
                transition: isPanning ? 'none' : 'filter 0.15s, transform 0.15s',
              }}
            />
          </ReactCrop>
        )}
      </div>
      {zoomControls}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );

  // ─────────────────────────────────────────────────
  //  MOBILE LAYOUT
  // ─────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div className="fixed inset-0 bg-black/95 flex flex-col z-50 overflow-hidden" role="dialog" aria-modal="true">

        {/* ── Mobile Top Bar ── */}
        <div className="flex items-center justify-between px-3 py-2 bg-zinc-900 border-b border-white/10 shrink-0 h-[44px]">
          {/* Left: undo + close */}
          <div className="flex items-center gap-1">
            <button
              onClick={undo}
              disabled={historyLen === 0}
              className="flex items-center gap-1 p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Undo"
            >
              <Undo2 style={{ width: 18, height: 18 }} />
              {historyLen > 0 && <span className="text-[10px] font-mono leading-none">{historyLen}</span>}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close editor"
            >
              <X style={{ width: 18, height: 18 }} />
            </button>
          </div>

          {/* Center: filename */}
          <span className="text-white/80 text-xs font-medium truncate max-w-[120px]">
            {image.name}
          </span>

          {/* Right: Export/Save */}
          <button
            onClick={() => handleSave(false)}
            disabled={saving || !completedCrop}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-semibold disabled:opacity-40 transition-colors"
            aria-label="Save edits"
          >
            {saving
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Check className="w-4 h-4" />
            }
            Save
          </button>
        </div>

        {/* ── Canvas ── */}
        {canvasArea}

        {/* ── Context-Specific Control Strip ── */}
        <div className="shrink-0 bg-zinc-900 border-t border-white/10 overflow-y-auto max-h-[40vh]">

          {/* CROP TAB STRIP */}
          {activeMobileTab === 'crop' && (
            <div className="px-4 pt-3 pb-2 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-[10px] font-semibold uppercase tracking-widest">Aspect Ratio</span>
                <span className="text-primary text-xs font-medium">{activeAspect}</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {ASPECT_PRESETS.map(p => (
                  <button
                    key={p.label}
                    onClick={() => handleAspectPreset(p)}
                    aria-pressed={activeAspect === p.label}
                    className={`flex-none flex flex-col items-center gap-1 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                      activeAspect === p.label
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                    }`}
                  >
                    <div
                      className="bg-current opacity-60 rounded-sm"
                      style={{
                        width:  p.label === 'Free' ? 12 : Math.min(12, 12 * (p.w / Math.max(p.w, p.h))),
                        height: p.label === 'Free' ? 12 : Math.min(12, 12 * (p.h / Math.max(p.w, p.h))),
                      }}
                    />
                    {p.label}
                  </button>
                ))}
              </div>
              {/* Social presets horizontal */}
              <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {SOCIAL_PRESETS.map(p => (
                  <button
                    key={p.label}
                    onClick={() => handleSocialPreset(p)}
                    className="flex-none px-3 py-1.5 rounded-lg border bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors text-xs whitespace-nowrap"
                  >
                    {p.label} <span className="text-zinc-600 ml-1">{p.sub}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ROTATE TAB STRIP */}
          {activeMobileTab === 'rotate' && (
            <div className="px-4 pt-3 pb-2 space-y-3">
              <span className="text-white/50 text-[10px] font-semibold uppercase tracking-widest">Rotate & Flip</span>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: '−90°', icon: <RotateCcw className="w-4 h-4" />, action: () => rotateBy(-90) },
                  { label: '+90°', icon: <RotateCw  className="w-4 h-4" />, action: () => rotateBy(90)  },
                  { label: 'Flip H', icon: <FlipHorizontal className="w-4 h-4" />, action: () => { pushHistory(); setFlipH(p => !p); }, active: flipH },
                  { label: 'Flip V', icon: <FlipVertical   className="w-4 h-4" />, action: () => { pushHistory(); setFlipV(p => !p); }, active: flipV },
                ].map(b => (
                  <button
                    key={b.label}
                    onClick={b.action}
                    disabled={rotating}
                    className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border text-xs font-medium transition-colors ${
                      b.active
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                    }`}
                  >
                    {rotating && (b.label === '−90°' || b.label === '+90°')
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : b.icon
                    }
                    <span>{b.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ADJUST TAB STRIP */}
          {activeMobileTab === 'adjust' && (
            <div className="px-4 pt-3 pb-2 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-[10px] font-semibold uppercase tracking-widest">Adjustments</span>
                {hasAdjustments && (
                  <button
                    onClick={() => { setBrightness(0); setContrast(0); setSaturation(0); }}
                    className="text-[10px] text-zinc-500 hover:text-zinc-300 underline"
                  >
                    Reset
                  </button>
                )}
              </div>
              {[
                { key: 'brightness', label: 'BRIGHTNESS', value: brightness, set: setBrightness },
                { key: 'contrast',   label: 'CONTRAST',   value: contrast,   set: setContrast   },
                { key: 'saturation', label: 'SATURATION', value: saturation,  set: setSaturation },
              ].map(({ key, label, value, set }) => (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-zinc-500 tracking-widest">{label}</span>
                    <span className={`text-xs font-mono tabular-nums ${value === 0 ? 'text-zinc-600' : value > 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                      {value > 0 ? '+' : ''}{value}
                    </span>
                  </div>
                  <Slider
                    value={[value]}
                    onValueChange={([v]) => set(v)}
                    onValueCommit={() => pushHistory()}
                    min={-100} max={100} step={1}
                    className="[&_[role=slider]]:bg-white [&_[role=slider]]:w-4 [&_[role=slider]]:h-4 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-md"
                    aria-label={label}
                  />
                </div>
              ))}
            </div>
          )}

          {/* EXPORT TAB STRIP */}
          {activeMobileTab === 'export' && (
            <div className="px-4 pt-3 pb-2 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-[10px] font-semibold uppercase tracking-widest">Export</span>
                {cropNaturalDims && (
                  <span className="text-zinc-500 text-[10px] font-mono">{cropNaturalDims.w} × {cropNaturalDims.h} px</span>
                )}
              </div>
              {/* Format */}
              <div className="grid grid-cols-3 gap-2">
                {(['jpeg', 'png', 'webp'] as OutputFormat[]).map(fmt => (
                  <button
                    key={fmt}
                    onClick={() => setOutputFormat(fmt)}
                    aria-pressed={outputFormat === fmt}
                    className={`py-2 rounded-lg border text-xs font-semibold uppercase transition-colors ${
                      outputFormat === fmt
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
              {/* Quality */}
              {outputFormat !== 'png' && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-zinc-500 tracking-widest">QUALITY</span>
                    <span className="text-xs font-mono text-zinc-300">{outputQuality}%</span>
                  </div>
                  <Slider
                    value={[outputQuality]}
                    onValueChange={([v]) => setOutputQuality(v)}
                    min={10} max={100} step={1}
                    className="[&_[role=slider]]:bg-white [&_[role=slider]]:w-4 [&_[role=slider]]:h-4 [&_[role=slider]]:border-0"
                    aria-label="Output quality"
                  />
                </div>
              )}
              {/* Download */}
              <button
                onClick={() => handleSave(true)}
                disabled={saving || !completedCrop}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 hover:text-white text-sm font-medium transition-colors disabled:opacity-40"
              >
                <Download className="w-4 h-4" />
                Download {outputFormat.toUpperCase()}
              </button>
            </div>
          )}
        </div>

        {/* ── Mobile Bottom Tab Bar ── */}
        <div className="shrink-0 flex items-center bg-zinc-950 border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
          {([
            { id: 'crop',   label: 'Crop',   icon: <CropIcon className="w-5 h-5" /> },
            { id: 'rotate', label: 'Rotate', icon: <RotateCw className="w-5 h-5" /> },
            { id: 'adjust', label: 'Adjust', icon: <Sliders  className="w-5 h-5" />, dot: hasAdjustments },
            { id: 'export', label: 'Export', icon: <FileOutput className="w-5 h-5" /> },
          ] as { id: MobileTab; label: string; icon: React.ReactNode; dot?: boolean }[]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveMobileTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors ${
                activeMobileTab === tab.id
                  ? 'text-primary'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
              aria-pressed={activeMobileTab === tab.id}
              aria-label={tab.label}
            >
              <span className="relative">
                {tab.icon}
                {tab.dot && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </span>
              <span className="text-[10px] font-medium leading-none">{tab.label}</span>
            </button>
          ))}
        </div>

      </div>
    );
  }

  // ─────────────────────────────────────────────────
  //  DESKTOP LAYOUT
  // ─────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black/95 flex flex-col z-50" role="dialog" aria-modal="true" aria-label={`Editing ${image.name}`}>

      {/* Desktop Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-zinc-900 shrink-0">
        <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
          <span className="text-white font-semibold text-sm truncate">{image.name}</span>
          {cropNaturalDims && (
            <Badge variant="outline" className="font-mono text-xs text-zinc-300 border-zinc-600 shrink-0">
              {cropNaturalDims.w} × {cropNaturalDims.h} px
            </Badge>
          )}
          {naturalDims.w > 0 && (
            <span className="text-zinc-500 text-xs hidden lg:inline shrink-0">
              original: {naturalDims.w} × {naturalDims.h}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={undo}
            disabled={historyLen === 0}
            title="Undo (Ctrl+Z / ⌘Z)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs"
          >
            <Undo2 className="w-4 h-4" />
            {historyLen > 0 && <span className="font-mono tabular-nums">{historyLen}</span>}
          </button>
          <button
            onClick={() => setSidebarCollapsed(c => !c)}
            title={sidebarCollapsed ? 'Show panel' : 'Hide panel — more room for the canvas'}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors text-xs"
          >
            {sidebarCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          <Button
            variant="ghost" size="icon"
            onClick={onClose}
            aria-label="Close editor"
            className="text-zinc-400 hover:text-white hover:bg-white/10 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Desktop: canvas + sidebar */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* Canvas */}
        {canvasArea}

        {sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(false)}
            title="Show panel"
            className="absolute top-1/2 right-0 -translate-y-1/2 z-30 flex items-center justify-center w-6 h-14 rounded-l-lg bg-zinc-900 border border-white/10 border-r-0 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Desktop Right Sidebar */}
        {!sidebarCollapsed && (
        <div className="w-72 bg-zinc-900 border-l border-white/10 flex flex-col overflow-hidden shrink-0">
          <Tabs defaultValue="crop" className="flex flex-col flex-1 overflow-hidden">

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

            {/* ── CROP TAB ── */}
            <TabsContent value="crop" className="flex-1 overflow-y-auto p-4 space-y-5 mt-0">
              <section className="space-y-2.5">
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Rotate & Flip</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={() => rotateBy(-90)} disabled={rotating}
                    className="bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700 hover:text-white">
                    {rotating ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5 mr-1" />} −90°
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => rotateBy(90)} disabled={rotating}
                    className="bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700 hover:text-white">
                    {rotating ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <RotateCw className="w-3.5 h-3.5 mr-1" />} +90°
                  </Button>
                  <Button size="sm" onClick={() => { pushHistory(); setFlipH(p => !p); }} variant={flipH ? 'default' : 'outline'}
                    className={flipH ? '' : 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700 hover:text-white'}>
                    <FlipHorizontal className="w-3.5 h-3.5 mr-1" /> Flip H
                  </Button>
                  <Button size="sm" onClick={() => { pushHistory(); setFlipV(p => !p); }} variant={flipV ? 'default' : 'outline'}
                    className={flipV ? '' : 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700 hover:text-white'}>
                    <FlipVertical className="w-3.5 h-3.5 mr-1" /> Flip V
                  </Button>
                </div>
              </section>

              <section className="space-y-2.5">
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Aspect Ratio</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {ASPECT_PRESETS.map(p => (
                    <button key={p.label} onClick={() => handleAspectPreset(p)} aria-pressed={activeAspect === p.label}
                      className={`flex flex-col items-center gap-1 p-1.5 rounded-md border text-[10px] font-medium transition-colors ${
                        activeAspect === p.label
                          ? 'bg-primary/20 border-primary text-primary'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                      }`}>
                      <div className="bg-current opacity-60 rounded-sm" style={{
                        width:  p.label === 'Free' ? 14 : Math.min(14, 14 * (p.w / Math.max(p.w, p.h))),
                        height: p.label === 'Free' ? 14 : Math.min(14, 14 * (p.h / Math.max(p.w, p.h))),
                      }} />
                      {p.label}
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-2.5">
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Social Presets</p>
                <div className="grid grid-cols-1 gap-1">
                  {SOCIAL_PRESETS.map(p => (
                    <button key={p.label} onClick={() => handleSocialPreset(p)}
                      className="flex items-center justify-between px-3 py-2 rounded-md border bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors text-xs">
                      <span className="font-medium">{p.label}</span>
                      <span className="text-zinc-500">{p.sub}</span>
                    </button>
                  ))}
                </div>
              </section>
            </TabsContent>

            {/* ── ADJUST TAB ── */}
            <TabsContent value="adjust" className="flex-1 overflow-y-auto p-4 space-y-5 mt-0">
              {[
                { label: 'Brightness', icon: '☀', value: brightness, set: setBrightness },
                { label: 'Contrast',   icon: '◑', value: contrast,   set: setContrast   },
                { label: 'Saturation', icon: '◎', value: saturation,  set: setSaturation },
              ].map(({ label, icon, value, set }) => (
                <section key={label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-300">{icon} {label}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono ${value === 0 ? 'text-zinc-500' : value > 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                        {value > 0 ? '+' : ''}{value}
                      </span>
                      {value !== 0 && (
                        <button onClick={() => set(0)} aria-label={`Reset ${label}`}
                          className="text-[10px] text-zinc-500 hover:text-zinc-300 underline">reset</button>
                      )}
                    </div>
                  </div>
                  <Slider value={[value]} onValueChange={([v]) => set(v)} onValueCommit={() => pushHistory()} min={-100} max={100} step={1}
                    className="[&_[role=slider]]:bg-zinc-200" aria-label={label} />
                  <div className="flex justify-between text-[10px] text-zinc-600">
                    <span>-100</span><span>0</span><span>+100</span>
                  </div>
                </section>
              ))}
              {hasAdjustments && (
                <Button variant="ghost" size="sm"
                  onClick={() => { setBrightness(0); setContrast(0); setSaturation(0); }}
                  className="w-full text-zinc-400 hover:text-white hover:bg-zinc-800">
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Reset All Adjustments
                </Button>
              )}
            </TabsContent>

            {/* ── EXPORT TAB ── */}
            <TabsContent value="export" className="flex-1 overflow-y-auto p-4 space-y-5 mt-0">
              <section className="space-y-2">
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Format</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['jpeg', 'png', 'webp'] as OutputFormat[]).map(fmt => (
                    <button key={fmt} onClick={() => setOutputFormat(fmt)} aria-pressed={outputFormat === fmt}
                      className={`py-2 rounded-md border text-xs font-medium uppercase transition-colors ${
                        outputFormat === fmt
                          ? 'bg-primary/20 border-primary text-primary'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                      }`}>{fmt}</button>
                  ))}
                </div>
                <p className="text-[10px] text-zinc-500">
                  {outputFormat === 'jpeg' && 'Best for photos. No transparency.'}
                  {outputFormat === 'png'  && 'Lossless. Supports transparency.'}
                  {outputFormat === 'webp' && 'Modern format. Smallest file size.'}
                </p>
              </section>

              {outputFormat !== 'png' && (
                <section className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Quality</p>
                    <span className="text-xs font-mono text-zinc-300">{outputQuality}%</span>
                  </div>
                  <Slider value={[outputQuality]} onValueChange={([v]) => setOutputQuality(v)}
                    min={10} max={100} step={1} className="[&_[role=slider]]:bg-zinc-200" aria-label="Output quality" />
                </section>
              )}

              <section className="space-y-2">
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Custom Output Size</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-zinc-500">Width (px)</Label>
                    <Input type="number" min={1} value={outputWidth || ''}
                      onChange={e => setOutputWidth(Number(e.target.value))}
                      placeholder={String(cropNaturalDims?.w ?? 'auto')}
                      className="bg-zinc-800 border-zinc-700 text-zinc-200 text-sm h-8" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-zinc-500">Height (px)</Label>
                    <Input type="number" min={1} value={outputHeight || ''}
                      onChange={e => setOutputHeight(Number(e.target.value))}
                      placeholder={String(cropNaturalDims?.h ?? 'auto')}
                      className="bg-zinc-800 border-zinc-700 text-zinc-200 text-sm h-8" />
                  </div>
                </div>
                {(outputWidth > 0 || outputHeight > 0) && (
                  <button onClick={() => { setOutputWidth(0); setOutputHeight(0); }}
                    className="text-[10px] text-zinc-500 hover:text-zinc-300 underline">Clear custom size</button>
                )}
              </section>

              {cropNaturalDims && (
                <div className="bg-zinc-800 rounded-md p-3 space-y-1">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Output Preview</p>
                  <p className="text-sm font-mono text-zinc-200">{cropNaturalDims.w} × {cropNaturalDims.h} px</p>
                  <p className="text-[10px] text-zinc-500">
                    {outputFormat.toUpperCase()}{outputFormat !== 'png' && ` · ${outputQuality}% quality`}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Desktop Bottom Action Bar */}
          <div className="p-3 border-t border-white/10 space-y-2 shrink-0 bg-zinc-900">
            <Button variant="ghost" size="sm" onClick={resetAll}
              className="w-full text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 text-xs">
              <RefreshCw className="w-3 h-3 mr-1.5" /> Reset All
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => handleSave(false)} disabled={saving || !completedCrop} className="text-sm">
                {saving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
                Save
              </Button>
              <Button variant="secondary" onClick={() => handleSave(true)} disabled={saving || !completedCrop}
                className="text-sm bg-zinc-700 hover:bg-zinc-600 text-zinc-200">
                {saving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Download className="w-4 h-4 mr-1.5" />}
                Download
              </Button>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
