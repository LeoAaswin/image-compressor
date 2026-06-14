"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Download, Trash2, RotateCcw, Minus, Square, Circle, Type, ArrowRight, PenLine, Check, X } from "lucide-react";

type Tool = "pen" | "line" | "arrow" | "rect" | "circle" | "text";

interface DrawOp {
  tool: Tool;
  color: string;
  width: number;
  points?: { x: number; y: number }[];
  x1?: number; y1?: number; x2?: number; y2?: number;
  text?: string;
  fontSize?: number;
}

interface TextPending { x: number; y: number; screenX: number; screenY: number }

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
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => {
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

  // Focus text input when it appears
  useEffect(() => {
    if (textPending) {
      setTimeout(() => textInputRef.current?.focus(), 10);
    }
  }, [textPending]);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = displayRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      canvasX: (e.clientX - rect.left) * (canvas.width / rect.width),
      canvasY: (e.clientY - rect.top) * (canvas.height / rect.height),
      screenX: e.clientX - rect.left,
      screenY: e.clientY - rect.top,
    };
  };

  const drawOp = (ctx: CanvasRenderingContext2D, op: DrawOp) => {
    ctx.strokeStyle = op.color;
    ctx.fillStyle = op.color;
    ctx.lineWidth = op.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (op.tool === "pen" && op.points && op.points.length > 1) {
      ctx.beginPath();
      ctx.moveTo(op.points[0].x, op.points[0].y);
      op.points.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    } else if (op.tool === "line" && op.x1 !== undefined) {
      ctx.beginPath();
      ctx.moveTo(op.x1!, op.y1!);
      ctx.lineTo(op.x2!, op.y2!);
      ctx.stroke();
    } else if (op.tool === "arrow" && op.x1 !== undefined) {
      const dx = op.x2! - op.x1!;
      const dy = op.y2! - op.y1!;
      const angle = Math.atan2(dy, dx);
      const headLen = Math.max(15, op.width * 4);
      ctx.beginPath();
      ctx.moveTo(op.x1!, op.y1!);
      ctx.lineTo(op.x2!, op.y2!);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(op.x2!, op.y2!);
      ctx.lineTo(op.x2! - headLen * Math.cos(angle - Math.PI / 6), op.y2! - headLen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(op.x2! - headLen * Math.cos(angle + Math.PI / 6), op.y2! - headLen * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();
    } else if (op.tool === "rect" && op.x1 !== undefined) {
      ctx.strokeRect(op.x1!, op.y1!, op.x2! - op.x1!, op.y2! - op.y1!);
    } else if (op.tool === "circle" && op.x1 !== undefined) {
      const rx = Math.abs(op.x2! - op.x1!) / 2;
      const ry = Math.abs(op.y2! - op.y1!) / 2;
      ctx.beginPath();
      ctx.ellipse(op.x1! + (op.x2! - op.x1!) / 2, op.y1! + (op.y2! - op.y1!) / 2, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (op.tool === "text" && op.text && op.x1 !== undefined) {
      ctx.font = `bold ${op.fontSize}px sans-serif`;
      ctx.fillText(op.text, op.x1!, op.y1!);
    }
  };

  const redraw = useCallback(() => {
    const canvas = displayRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    ops.forEach((op) => drawOp(ctx, op));
    if (currentOp) drawOp(ctx, currentOp);
  }, [ops, currentOp]);

  useEffect(() => { redraw(); }, [redraw]);

  const commitText = () => {
    if (!textPending || !textInput.trim()) {
      setTextPending(null);
      setTextInput("");
      return;
    }
    setOps((prev) => [...prev, {
      tool: "text",
      color,
      width: strokeWidth,
      x1: textPending.x,
      y1: textPending.y,
      text: textInput.trim(),
      fontSize,
    }]);
    setTextPending(null);
    setTextInput("");
  };

  const cancelText = () => {
    setTextPending(null);
    setTextInput("");
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (textPending) { commitText(); return; }
    const { canvasX, canvasY, screenX, screenY } = getPos(e);
    startRef.current = { x: canvasX, y: canvasY };

    if (tool === "text") {
      setTextInput("");
      setTextPending({ x: canvasX, y: canvasY, screenX, screenY });
      return;
    }

    setDrawing(true);
    const op: DrawOp = { tool, color, width: strokeWidth };
    if (tool === "pen") op.points = [{ x: canvasX, y: canvasY }];
    else { op.x1 = canvasX; op.y1 = canvasY; op.x2 = canvasX; op.y2 = canvasY; }
    setCurrentOp(op);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing || !currentOp) return;
    const { canvasX, canvasY } = getPos(e);
    if (tool === "pen") {
      setCurrentOp((prev) => prev ? { ...prev, points: [...(prev.points || []), { x: canvasX, y: canvasY }] } : prev);
    } else {
      setCurrentOp((prev) => prev ? { ...prev, x2: canvasX, y2: canvasY } : prev);
    }
  };

  const handleMouseUp = () => {
    if (currentOp) setOps((prev) => [...prev, currentOp]);
    setCurrentOp(null);
    setDrawing(false);
  };

  const download = () => {
    const img = imgRef.current;
    if (!img) return;
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    ops.forEach((op) => drawOp(ctx, op));
    canvas.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `annotated_${fileName}`;
      a.click();
      toast.success("Downloaded!");
    }, "image/png");
  };

  const tools: { id: Tool; icon: React.ReactNode; label: string }[] = [
    { id: "pen", icon: <PenLine className="w-4 h-4" />, label: "Pen" },
    { id: "line", icon: <Minus className="w-4 h-4" />, label: "Line" },
    { id: "arrow", icon: <ArrowRight className="w-4 h-4" />, label: "Arrow" },
    { id: "rect", icon: <Square className="w-4 h-4" />, label: "Rect" },
    { id: "circle", icon: <Circle className="w-4 h-4" />, label: "Circle" },
    { id: "text", icon: <Type className="w-4 h-4" />, label: "Text" },
  ];

  return (
    <div className="space-y-6">
      {!image ? (
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
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {tools.map((t) => (
                <Button key={t.id} size="sm" variant={tool === t.id ? "default" : "outline"} onClick={() => { setTool(t.id); cancelText(); }} className="gap-1.5">
                  {t.icon}{t.label}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => { setOps((p) => p.slice(0, -1)); cancelText(); }}><RotateCcw className="w-4 h-4 mr-1" />Undo</Button>
              <Button size="sm" variant="outline" onClick={() => { setImage(null); setOps([]); cancelText(); }}><Trash2 className="w-4 h-4 mr-1" />New</Button>
              <Button size="sm" onClick={download}><Download className="w-4 h-4 mr-1" />Download</Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm">Color</Label>
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-border" />
            </div>
            <div className="flex items-center gap-3 min-w-[160px]">
              <Label className="text-sm shrink-0">Size: {strokeWidth}</Label>
              <Slider value={[strokeWidth]} onValueChange={([v]) => setStrokeWidth(v)} min={1} max={20} step={1} className="flex-1" />
            </div>
            {tool === "text" && (
              <div className="flex items-center gap-3 min-w-[160px]">
                <Label className="text-sm shrink-0">Font: {fontSize}px</Label>
                <Slider value={[fontSize]} onValueChange={([v]) => setFontSize(v)} min={12} max={72} step={2} className="flex-1" />
              </div>
            )}
          </div>

          {tool === "text" && !textPending && (
            <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
              Click anywhere on the image to place text at that position.
            </p>
          )}

          {/* Text input panel — shown when user clicks on canvas in text mode */}
          {textPending && (
            <div className="flex items-center gap-2 bg-muted/60 border border-border rounded-xl px-3 py-2 shadow-sm">
              <Type className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                ref={textInputRef}
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitText();
                  if (e.key === "Escape") cancelText();
                }}
                placeholder="Type your text…"
                className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
              />
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-500/10" onClick={commitText}>
                <Check className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground" onClick={cancelText}>
                <X className="w-4 h-4" />
              </Button>
              <span className="text-xs text-muted-foreground hidden sm:block">Enter ↵ to confirm · Esc to cancel</span>
            </div>
          )}

          <div className="border rounded-xl overflow-hidden" ref={wrapperRef}>
            <canvas
              ref={displayRef}
              className={`w-full ${tool === "text" ? "cursor-text" : "cursor-crosshair"}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => { if (!textPending) handleMouseUp(); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
