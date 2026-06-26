"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { trackUpload } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Download, Trash2, RotateCcw, Minus, Square, Circle, Type, ArrowRight, PenLine, Check, X } from "lucide-react";

type Tool = "pen" | "line" | "arrow" | "rect" | "circle" | "text";

interface DrawOp {
  tool: Tool; color: string; width: number;
  points?: { x: number; y: number }[];
  x1?: number; y1?: number; x2?: number; y2?: number;
  text?: string; fontSize?: number;
}
interface TextPending { x: number; y: number }

const TOOLS: { id: Tool; icon: React.ReactNode; label: string }[] = [
  { id: "pen",    icon: <PenLine className="w-4 h-4" />,    label: "Pen" },
  { id: "line",   icon: <Minus className="w-4 h-4" />,      label: "Line" },
  { id: "arrow",  icon: <ArrowRight className="w-4 h-4" />, label: "Arrow" },
  { id: "rect",   icon: <Square className="w-4 h-4" />,     label: "Rect" },
  { id: "circle", icon: <Circle className="w-4 h-4" />,     label: "Circle" },
  { id: "text",   icon: <Type className="w-4 h-4" />,       label: "Text" },
];

export function AnnotateProcessor() {
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#ef4444");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [fontSize, setFontSize] = useState(24);
  const [ops, setOps] = useState<DrawOp[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [currentOp, setCurrentOp] = useState<DrawOp | null>(null);
  const [textPending, setTextPending] = useState<TextPending | null>(null);
  const [textInput, setTextInput] = useState("");
  const displayRef = useRef<HTMLCanvasElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => {
      trackUpload(files);
      if (!files[0]) return;
      setFileName(files[0].name);
      const url = URL.createObjectURL(files[0]);
      const img = new Image();
      img.onload = () => { imgRef.current = img; setImage(url); setOps([]); };
      img.src = url;
    },
    accept: { "image/*": [] },
    multiple: false,
  });

  useEffect(() => {
    if (textPending) setTimeout(() => textInputRef.current?.focus(), 10);
  }, [textPending]);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = displayRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      canvasX: (e.clientX - rect.left) * (canvas.width / rect.width),
      canvasY: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const drawOp = (ctx: CanvasRenderingContext2D, op: DrawOp) => {
    ctx.strokeStyle = op.color; ctx.fillStyle = op.color;
    ctx.lineWidth = op.width; ctx.lineCap = "round"; ctx.lineJoin = "round";
    if (op.tool === "pen" && op.points && op.points.length > 1) {
      ctx.beginPath(); ctx.moveTo(op.points[0].x, op.points[0].y);
      op.points.forEach((p) => ctx.lineTo(p.x, p.y)); ctx.stroke();
    } else if (op.tool === "line" && op.x1 !== undefined) {
      ctx.beginPath(); ctx.moveTo(op.x1!, op.y1!); ctx.lineTo(op.x2!, op.y2!); ctx.stroke();
    } else if (op.tool === "arrow" && op.x1 !== undefined) {
      const dx = op.x2! - op.x1!, dy = op.y2! - op.y1!;
      const angle = Math.atan2(dy, dx), headLen = Math.max(15, op.width * 4);
      ctx.beginPath(); ctx.moveTo(op.x1!, op.y1!); ctx.lineTo(op.x2!, op.y2!); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(op.x2!, op.y2!);
      ctx.lineTo(op.x2! - headLen * Math.cos(angle - Math.PI / 6), op.y2! - headLen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(op.x2! - headLen * Math.cos(angle + Math.PI / 6), op.y2! - headLen * Math.sin(angle + Math.PI / 6));
      ctx.closePath(); ctx.fill();
    } else if (op.tool === "rect" && op.x1 !== undefined) {
      ctx.strokeRect(op.x1!, op.y1!, op.x2! - op.x1!, op.y2! - op.y1!);
    } else if (op.tool === "circle" && op.x1 !== undefined) {
      const rx = Math.abs(op.x2! - op.x1!) / 2, ry = Math.abs(op.y2! - op.y1!) / 2;
      ctx.beginPath(); ctx.ellipse(op.x1! + (op.x2! - op.x1!) / 2, op.y1! + (op.y2! - op.y1!) / 2, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
    } else if (op.tool === "text" && op.text && op.x1 !== undefined) {
      ctx.font = `bold ${op.fontSize}px sans-serif`; ctx.fillText(op.text, op.x1!, op.y1!);
    }
  };

  const redraw = useCallback(() => {
    const canvas = displayRef.current, img = imgRef.current;
    if (!canvas || !img) return;
    canvas.width = img.width; canvas.height = img.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    ops.forEach((op) => drawOp(ctx, op));
    if (currentOp) drawOp(ctx, currentOp);
  }, [ops, currentOp]);

  useEffect(() => { redraw(); }, [redraw]);

  const commitText = () => {
    if (!textPending || !textInput.trim()) { setTextPending(null); setTextInput(""); return; }
    setOps((prev) => [...prev, { tool: "text", color, width: strokeWidth, x1: textPending.x, y1: textPending.y, text: textInput.trim(), fontSize }]);
    setTextPending(null); setTextInput("");
  };
  const cancelText = () => { setTextPending(null); setTextInput(""); };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (textPending) { commitText(); return; }
    const { canvasX, canvasY } = getPos(e);
    startRef.current = { x: canvasX, y: canvasY };
    if (tool === "text") { setTextInput(""); setTextPending({ x: canvasX, y: canvasY }); return; }
    setDrawing(true);
    const op: DrawOp = { tool, color, width: strokeWidth };
    if (tool === "pen") op.points = [{ x: canvasX, y: canvasY }];
    else { op.x1 = canvasX; op.y1 = canvasY; op.x2 = canvasX; op.y2 = canvasY; }
    setCurrentOp(op);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing || !currentOp) return;
    const { canvasX, canvasY } = getPos(e);
    if (tool === "pen") setCurrentOp((prev) => prev ? { ...prev, points: [...(prev.points || []), { x: canvasX, y: canvasY }] } : prev);
    else setCurrentOp((prev) => prev ? { ...prev, x2: canvasX, y2: canvasY } : prev);
  };

  const handleMouseUp = () => {
    if (currentOp) setOps((prev) => [...prev, currentOp]);
    setCurrentOp(null); setDrawing(false);
  };

  const download = () => {
    const img = imgRef.current;
    if (!img) return;
    const canvas = document.createElement("canvas");
    canvas.width = img.width; canvas.height = img.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    ops.forEach((op) => drawOp(ctx, op));
    canvas.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = `annotated_${fileName}`; a.click();
      toast.success("Downloaded!");
    }, "image/png");
  };

  if (!image) {
    return (
      <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"}`}>
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <PenLine className="w-7 h-7 text-primary" />
          </div>
          <p className="font-semibold text-lg">{isDragActive ? "Drop image here" : "Upload an image to annotate"}</p>
          <p className="text-sm text-muted-foreground">Click or drag & drop a single image</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:h-[70vh]">
      {/* ── Left control panel ── */}
      <div className="w-full lg:w-52 shrink-0 flex flex-col gap-5 lg:overflow-y-auto pr-0 lg:pr-1">
        {/* Tool picker */}
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Tool</Label>
          <div className="grid grid-cols-3 gap-1.5">
            {TOOLS.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTool(t.id); cancelText(); }}
                className={`flex flex-col items-center gap-1 py-2 rounded-lg border text-xs font-medium transition-all ${tool === t.id ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"}`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Color + stroke */}
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Color</Label>
          <div className="flex items-center gap-2">
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-9 h-9 rounded cursor-pointer border border-border" />
            <span className="text-sm font-mono text-muted-foreground">{color}</span>
          </div>
        </div>

        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Stroke: {strokeWidth}px</Label>
          <Slider value={[strokeWidth]} onValueChange={([v]) => setStrokeWidth(v)} min={1} max={20} step={1} />
        </div>

        {tool === "text" && (
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Font size: {fontSize}px</Label>
            <Slider value={[fontSize]} onValueChange={([v]) => setFontSize(v)} min={12} max={72} step={2} />
          </div>
        )}

        {/* Text input (shown when user clicks canvas in text mode) */}
        {textPending && (
          <div className="rounded-lg border border-primary/40 bg-primary/5 p-3 space-y-2">
            <Label className="text-xs text-muted-foreground block">Type your text</Label>
            <input
              ref={textInputRef}
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") commitText(); if (e.key === "Escape") cancelText(); }}
              placeholder="Type here…"
              className="w-full bg-transparent text-sm focus:outline-none border-b border-border pb-1"
            />
            <div className="flex gap-1.5 pt-1">
              <Button size="sm" className="flex-1 h-7 text-xs" onClick={commitText}><Check className="w-3.5 h-3.5 mr-1" />Place</Button>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={cancelText}><X className="w-3.5 h-3.5" /></Button>
            </div>
          </div>
        )}

        {tool === "text" && !textPending && (
          <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2 leading-relaxed">
            Click anywhere on the image to place text.
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-1.5 pt-3 border-t border-border/50 mt-auto">
          <Button size="sm" variant="outline" onClick={() => { setOps((p) => p.slice(0, -1)); cancelText(); }} disabled={ops.length === 0}>
            <RotateCcw className="w-4 h-4 mr-1.5" />Undo
          </Button>
          <Button size="sm" onClick={download} disabled={ops.length === 0}>
            <Download className="w-4 h-4 mr-1.5" />Download
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { setImage(null); setOps([]); cancelText(); }}>
            <Trash2 className="w-4 h-4 mr-1.5" />New image
          </Button>
        </div>

        {ops.length > 0 && (
          <p className="text-xs text-muted-foreground">{ops.length} annotation{ops.length !== 1 ? "s" : ""}</p>
        )}
      </div>

      {/* ── Right canvas area ── */}
      <div className="flex-1 min-w-0 flex flex-col border rounded-xl overflow-hidden">
        <div className="shrink-0 px-3 py-1.5 bg-muted/50 border-b border-border/40">
          <span className="text-xs text-muted-foreground">
            {tool === "text" && textPending ? "Enter text in the panel → then click Place" : tool === "text" ? "Click on the image to place text" : "Draw on the image"}
          </span>
        </div>
        <div className="flex-1 min-h-0 overflow-auto bg-checkerboard">
          <canvas
            ref={displayRef}
            className={`w-full block ${tool === "text" ? "cursor-text" : "cursor-crosshair"}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => { if (!textPending) handleMouseUp(); }}
          />
        </div>
      </div>
    </div>
  );
}
