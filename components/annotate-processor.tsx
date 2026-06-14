"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Download, Trash2, RotateCcw, Minus, Square, Circle, Type, ArrowRight, PenLine } from "lucide-react";

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
  const displayRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);

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

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = displayRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
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

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const p = getPos(e);
    startRef.current = p;
    setDrawing(true);
    if (tool === "text") {
      const text = window.prompt("Enter text:");
      if (text) setOps((prev) => [...prev, { tool: "text", color, width: strokeWidth, x1: p.x, y1: p.y, text, fontSize }]);
      return;
    }
    const op: DrawOp = { tool, color, width: strokeWidth };
    if (tool === "pen") op.points = [p];
    else { op.x1 = p.x; op.y1 = p.y; op.x2 = p.x; op.y2 = p.y; }
    setCurrentOp(op);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing || !currentOp) return;
    const p = getPos(e);
    if (tool === "pen") {
      setCurrentOp((prev) => prev ? { ...prev, points: [...(prev.points || []), p] } : prev);
    } else {
      setCurrentOp((prev) => prev ? { ...prev, x2: p.x, y2: p.y } : prev);
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
                <Button key={t.id} size="sm" variant={tool === t.id ? "default" : "outline"} onClick={() => setTool(t.id)} className="gap-1.5">
                  {t.icon}{t.label}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setOps((p) => p.slice(0, -1))}><RotateCcw className="w-4 h-4 mr-1" />Undo</Button>
              <Button size="sm" variant="outline" onClick={() => { setImage(null); setOps([]); }}><Trash2 className="w-4 h-4 mr-1" />New</Button>
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

          <div className="border rounded-xl overflow-hidden">
            <canvas
              ref={displayRef}
              className="w-full cursor-crosshair"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>
        </div>
      )}
    </div>
  );
}
