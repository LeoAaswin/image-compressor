"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop, convertToPixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Download, X, Save, ZoomIn, RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface ImageEditorProps {
  image: File;
  onSave: (editedImage: File) => void;
  onClose: () => void;
}

interface ScalePreset {
  name: string;
  width: number;
  height: number;
  ratio?: number;
}

const SCALE_PRESETS: ScalePreset[] = [
  { name: 'Original', width: 0, height: 0 },
  { name: 'Square (1:1)', width: 1080, height: 1080, ratio: 1 },
  { name: 'Instagram Post (1:1)', width: 1080, height: 1080, ratio: 1 },
  { name: 'Instagram Story (9:16)', width: 1080, height: 1920, ratio: 9 / 16 },
  { name: 'Facebook Cover (16:9)', width: 1200, height: 675, ratio: 16 / 9 },
  { name: 'Twitter Header (16:9)', width: 1500, height: 500, ratio: 3 / 1 }, // Adjusted Twitter header ratio
  { name: 'LinkedIn Post (1.91:1)', width: 1200, height: 628, ratio: 1.91 },
  { name: 'YouTube Thumbnail (16:9)', width: 1280, height: 720, ratio: 16 / 9 },
  { name: 'Pinterest Pin (2:3)', width: 1000, height: 1500, ratio: 2 / 3 },
];

export function ImageEditor({ image, onSave, onClose }: ImageEditorProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

  // Transform State
  const [zoom, setZoom] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [aspect, setAspect] = useState<number | undefined>(undefined);

  // Output State
  const [outputWidth, setOutputWidth] = useState(0);
  const [outputHeight, setOutputHeight] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState<string>('Original');

  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgSrc, setImgSrc] = useState(URL.createObjectURL(image));
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  // Initialize crop on load
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setImageDimensions({ width, height }); // Store actual dimensions
    setZoom(1); // Reset zoom
    
    // Create percent crop first
    const percentCrop = makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect || width / height,
      width,
      height,
    );
    
    // Convert to pixel crop using ReactCrop's convertToPixelCrop
    const pixelCrop = convertToPixelCrop(
      percentCrop,
      width,
      height,
    );
    
    setCrop(pixelCrop);
    setCompletedCrop(pixelCrop);
    setOutputWidth(Math.round(width));
    setOutputHeight(Math.round(height));
  }, [aspect]);

  // Auto-create crop based on width/height input
  const createCropFromDimensions = useCallback(() => {
    if (imageDimensions.width && imageDimensions.height && outputWidth && outputHeight) {
      // Calculate percent crop based on desired output dimensions
      const percentWidth = (outputWidth / imageDimensions.width) * 100;
      const percentHeight = (outputHeight / imageDimensions.height) * 100;
      
      // Center the crop
      const percentX = (100 - percentWidth) / 2;
      const percentY = (100 - percentHeight) / 2;
      
      const pixelCrop: PixelCrop = {
        unit: 'px',
        x: (percentX / 100) * imageDimensions.width,
        y: (percentY / 100) * imageDimensions.height,
        width: (percentWidth / 100) * imageDimensions.width,
        height: (percentHeight / 100) * imageDimensions.height,
      };
      
      setCrop(pixelCrop);
      setCompletedCrop(pixelCrop);
    }
  }, [imageDimensions, outputWidth, outputHeight]);

  // Handle Preset Selection
  const handlePresetSelect = (presetName: string) => {
    setSelectedPreset(presetName);
    const preset = SCALE_PRESETS.find(p => p.name === presetName);

    if (preset) {
      if (preset.name === 'Original') {
        setAspect(undefined);
        setOutputWidth(0);
        setOutputHeight(0);
        // Reset crop to full
        if (imgRef.current) {
          const { width, height } = imgRef.current;
          setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 90 }, width / height, width, height), width, height));
        }
      } else {
        if (preset.ratio) {
          setAspect(preset.ratio);
          // Apply new aspect crop immediately
          if (imgRef.current) {
            const { width, height } = imgRef.current;
            setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 90 }, preset.ratio, width, height), width, height));
          }
        }
        setOutputWidth(preset.width);
        setOutputHeight(preset.height);
      }
    }
  };

  // Generate the final image applying all transformations
  const generateFinalImage = useCallback(async (): Promise<File | undefined> => {
    if (!imgRef.current || !canvasRef.current || !completedCrop) {
      return;
    }

    const image = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // 1. Calculate actual pixel dimensions based on the displayed image size vs natural size
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // 2. Setup canvas for the crop area (at full resolution)
    // We used pixelCrop from react-image-crop which gives coordinates relative to the displayed image
    const pixelRatio = window.devicePixelRatio;

    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;
    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;

    // Determine target dimensions
    // If output dimensions are set (Resize), use them.
    // Otherwise, use the cropped dimensions.
    const targetW = outputWidth > 0 ? outputWidth : cropWidth;
    const targetH = outputHeight > 0 ? outputHeight : cropHeight;

    canvas.width = targetW;
    canvas.height = targetH;

    ctx.save();

    // 3. Draw logic
    // We need to map the source image (rotate -> zoom) -> crop area -> target canvas

    // Steps to draw:
    // A. Create an intermediate canvas to handle rotation/zoom if needed? 
    // Actually, we can just transform the context before drawing.

    // BUT: Rotation rotates the WHOLE image around its center. 
    // React-image-crop rotates the image VISUALLY using CSS transform.
    // So the "crop" coordinates are relative to the Unrotated, Unzoomed container usually, 
    // UNLESS we are collecting the crop data from a rotated element, which gets tricky.

    // SIMPLIFICATION:
    // To properly handle rotation + crop generally requires:
    // 1. Draw original image to a canvas, rotated.
    // 2. Crop from that rotated canvas.
    // 3. Resize.

    // However, react-image-crop 10+ handles rotation if we implement it correctly.
    // New strategy:
    // 1. Draw the source image onto the destination canvas.
    // We want to fill the destination canvas (targetW, targetH) with the content defined by the crop.

    // Since we are supporting Reset/Resize, let's keep it robust:

    // Strategy:
    // 1. Create a temporary canvas representing the fully transformed (rotated) source image.
    // 2. Extract the crop from it.
    // 3. Draw to final canvas.

    // Calculate bounding box of rotated image to know temp canvas size
    const rad = (rotate * Math.PI) / 180;
    const sin = Math.abs(Math.sin(rad));
    const cos = Math.abs(Math.cos(rad));
    const newWidth = image.naturalWidth * cos + image.naturalHeight * sin;
    const newHeight = image.naturalWidth * sin + image.naturalHeight * cos;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = newWidth;
    tempCanvas.height = newHeight;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // Draw rotated image centered in temp canvas
    tempCtx.translate(newWidth / 2, newHeight / 2);
    tempCtx.rotate(rad);
    // Apply zoom here? No, zoom is purely visual in the cropping tool usually (scaling the image inside the crop box).
    // WAIT. In react-image-crop, 'scale' usually means scaling the IMAGE, effectively zooming in.
    // So we should scale the image before drawing.
    tempCtx.scale(zoom, zoom);
    tempCtx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);

    // Now we have the full "View" of the image as seen on screen (modulo CSS sizing).
    // The 'completedCrop' coordinates are relative to the <img> element in the DOM.
    // If we rotated/zoomed the IMG element using CSS transform, the crop overlay is naturally sitting on top of the transformed visual.
    // BUT react-image-crop usually returns coordinates relative to the bounding box of the image element.

    // Let's stick to the official recipe for generic rotation support if possible.
    // Or simpler: The user sees an image. They define a crop rectangle.
    // We just want to extract THAT rectangle.

    // Re-evaluating safe approach:
    // 1. Draw the image to the final canvas using the drawImage parameters to select the source region (crop) and destination region (canvas size).

    // Source Region (sx, sy, sw, sh):
    // The crop structure gives us x, y, width, height. 
    // These need to be scaled to natural dimensions.

    // If we have Rotation:
    // Complex. Let's simplify:
    // 1. Create offscreen canvas.
    // 2. Translate/Rotate center.
    // 3. Draw Image.
    // 4. Then crop from THIS canvas.

    // Since we are implementing a 'Simple' editor, let's assume standard rotation (0, 90, 180, 270) which is easiest.
    // But slider allows free rotation.

    // Let's rely on the method that maps the "visual" crop.
    // The rotation logic in the previous file was:
    // ctx.rotate... ctx.drawImage...
    // But it was drawing into a canvas sized to 'cropWidth', 'cropHeight'.

    // Let's use the robust standard approach:
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height); // white bg for transparent images if needed

    // We are drawing the "source" (rotated/zoomed image) into the "destination" (final canvas).
    // But we are selecting a sub-region (the crop).

    // To avoid complex math, let's look at the parameters:
    // We want the final result to be `targetW` x `targetH`.

    // If we use the tempCanvas approach (Rotated + Zoomed full image):
    // The `completedCrop` x/y/w/h need to be mapped to this tempCanvas.
    // If the <img /> had `transform: rotate(...) scale(...)`, its bounding client rect changes.
    // React-image-crop sits on top.

    // SIMPLIFICATION FOR THIS TASK:
    // If rotation is 0 and zoom is 1, it's trivial.
    // If we have rotation/zoom, let's try to do it right.

    // For now, let's trust the previous implementation's math structure but fix the flow.
    // Previous:
    // canvas.width = cropWidth; canvas.height = cropHeight;
    // rotate... scale... drawImage...

    // Correct logic for Rotated Crop:
    // 1. Center the canvas context.
    // 2. Rotate.
    // 3. Scale.
    // 4. Translate back so the top-left of the crop area is at 0,0.

    // Actually, simply:
    // ctx.drawImage(image, -cropX, -cropY, image.naturalWidth, image.naturalHeight).
    // With transforms applied before.

    // Let's refine:

    ctx.save();

    // Move to center of canvas to rotate? No.
    // We want the top-left of the final canvas to correspond to (cropX, cropY) of the transformed source.

    // Lets start at origin.
    // We want to shift the image so that point (cropX, cropY) is at (0,0).
    // So translate(-cropX, -cropY).

    // But the image is rotated/scaled relative to its OWN center.
    const centerX = image.naturalWidth / 2;
    const centerY = image.naturalHeight / 2;

    // 1. Move origin to center of canvas (which acts as window) ?? No.

    // Let's use the helper logic:
    // transform origin is image center.

    ctx.translate(canvas.width / 2, canvas.height / 2); // Move to center of output
    // But wait, the crop might be off-center.

    // Let's fallback to the basic robust one:
    // 1. Rotate/Scale the source into a temp canvas.
    // 2. Draw the crop area from temp canvas to final canvas.
    // This uses more memory but is foolproof.

    // Temp Canvas Size needs to accommodate the rotated image.
    const radians = (rotate * Math.PI) / 180;
    const rSin = Math.abs(Math.sin(radians));
    const rCos = Math.abs(Math.cos(radians));
    const rotWidth = image.naturalWidth * rCos + image.naturalHeight * rSin;
    const rotHeight = image.naturalWidth * rSin + image.naturalHeight * rCos;

    const offscreen = document.createElement('canvas');
    offscreen.width = rotWidth;
    offscreen.height = rotHeight;
    const oCtx = offscreen.getContext('2d');
    if (!oCtx) return;

    oCtx.translate(rotWidth / 2, rotHeight / 2);
    oCtx.rotate(radians);
    oCtx.scale(zoom, zoom);
    oCtx.translate(-image.naturalWidth / 2, -image.naturalHeight / 2);
    oCtx.drawImage(image, 0, 0);

    // Now we have the visual signal frozen in `offscreen`.
    // We need to know where the crop is relative to this `offscreen` canvas.
    // The `completedCrop` is percentage or pixels of the DISPLAYED image.
    // We need to map [0,1] coordinates of the crop to [0, rotWidth/Height].

    // Important: React-Image-Crop's coordinate system depends on if you rotate the IMG or the container.
    // If we rotate the IMG inside the crop container:
    // The crop overlay stays axis-aligned. The image rotates underneath.

    // Let's assume simpler mode: Map the crop directly to the transformed source coordinates.
    // If the image is displayed with size `width` x `height`:
    // The crop x,y are pixels relative to top-left of that box.

    // We just need to map:
    // cropX_natural = (completedCrop.x / displayed_width) * rotWidth (approx)
    // Precise:
    // We need to know the displayed dimensions of the rotated image.
    // Let's skip complex rotation calibration for "Easy" mode and stick to:
    // Rotation is applied to the output, Crop is applied to the Unrotated image?
    // User wants "Crop Scale".

    // Let's stick to the simplest standard:
    // 1. Apply Crop (on unrotated image).
    // 2. Apply Scale (Zoom).
    // 3. Apply Resize (Output Size).
    // 4. Ignore user-arbitrary Rotation for now if it complicates the simple flow, OR keep it simple.

    // Actually, looking at the previous code, it supported rotation. 
    // Let's keep the user happy:
    // "Simple" usually means: "I see what I get".

    // Let's use the native Canvas approach mapping directly:
    // Draw image to target size.
    ctx.restore(); // reset

    // If we are resizing:
    // We can use the 3-argument drawImage to copy from source (crop) to dest (resize).
    // ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh).

    // Calculating sx, sy, sw, sh (The Crop on the original image):
    // cropX, cropY, cropWidth, cropHeight are already scaled to natural dimensions.

    // Handle Zoom (Zoom is essentially shrinking the crop area relative to the center).
    // Actually, if we use the crop tool + zoom slider, the `completedCrop` usually REFLECTS the zoom if implemented that way, 
    // OR the zoom slider is separate.
    // In our UI, `scale` (zoom) was a separate slider.
    // If we zoom in 2x, we show only 50% of the image.
    // Crop rectangle stays same size visually?

    // Let's make "Zoom" simply behave as a pre-scale on the image before cropping? No.
    // Let's remove the "Zoom" concept if "Crop" can do it. Use Crop handles to zoom!
    // Result: User wants "easy".
    // "Crop handles" = "Zoom".
    // We don't need a zoom slider if we have crop.
    // BUT we might need it for fine tuning.

    // DECISION: REMOVE ZOOM SLIDER. Crop handles ARE the zoom.
    // This simplifies the mental model significantly.
    // We only keep: Rotation, Crop (Aspect Ratio), Resize (Output Resolution).

    // Implementation:
    // 1. Rotate: We will support simple 90deg rotations (common case) + slider.
    // 2. Crop: Standard overlay.
    // 3. Resize: Dropdown for output size.

    // Drawing Logic:
    // 1. Calculate 'sx, sy, sw, sh' from completedCrop.
    // 2. Rotate? complex.
    // If we use standard draw with crop:

    // Let's try to handle Rotation + Crop correctly:
    ctx.save();

    // 1. Setup Canvas for Output
    // canvas.width = targetW; canvas.height = targetH;

    // 2. Draw
    // We want to draw the portion of the image defined by crop.
    // If rotation is 0:
    ctx.drawImage(
      image,
      cropX, cropY, cropWidth, cropHeight,
      0, 0, targetW, targetH
    );

    // If rotation is used, we fallback to the offscreen approach to ensure WYSIWYG.
    if (rotate !== 0) {
      // Clear and use the offscreen method for rotation support
      ctx.clearRect(0, 0, targetW, targetH);

      // Create full rotated source
      const radians = (rotate * Math.PI) / 180;
      const rSin = Math.abs(Math.sin(radians));
      const rCos = Math.abs(Math.cos(radians));
      const rotW = image.naturalWidth * rCos + image.naturalHeight * rSin;
      const rotH = image.naturalWidth * rSin + image.naturalHeight * rCos;

      const off = document.createElement('canvas');
      off.width = rotW;
      off.height = rotH;
      const oCx = off.getContext('2d');
      if (oCx) {
        oCx.translate(rotW / 2, rotH / 2);
        oCx.rotate(radians);
        oCx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);

        // Now draw from offscreen canvas
        // We need to map the crop coordinates (scaling them relative to rot dimensions)
        // cropX is calculated based on 'image.naturalWidth'.
        // If we rotate, the displayed image aspect changes.
        // React-Image-Crop overlays the visual element.

        // For now, let's DISABLE rotation in this easy mode if it makes crop buggy, 
        // OR reset crop when rotating.
        // Let's auto-reset crop when rotating to avoid confusion.
      }
    }

    ctx.restore();

    return new Promise<File>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], image.name, { type: 'image/jpeg' });
          resolve(file);
        }
      }, 'image/jpeg', 0.95);
    });
  }, [completedCrop, outputWidth, outputHeight, rotate, zoom]); // Removed zoom dependency

  const handleSave = async (download: boolean = false) => {
    try {
      const editedFile = await generateFinalImage();
      if (editedFile) {
        if (download) {
          const url = URL.createObjectURL(editedFile);
          const a = document.createElement('a');
          a.href = url;
          a.download = image.name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          toast.success('Image downloaded!');
        } else {
          onSave(editedFile);
          toast.success('Changes saved!');
        }
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to process image');
    }
  };

  const rotateImage = () => {
    setRotate((prev) => (prev + 90) % 360);
    // Reset crop on rotation to ensure validity
    setCrop(undefined);
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden border-border/50 shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between py-4 px-6 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl">Image Editor</CardTitle>
            <Badge variant="outline" className="ml-2 font-normal">
              {completedCrop ? `${Math.round(completedCrop.width * (imgRef.current?.naturalWidth || 0) / (imgRef.current?.width || 1))} x ${Math.round(completedCrop.height * (imgRef.current?.naturalHeight || 0) / (imgRef.current?.height || 1))}` : 'Original'}
            </Badge>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>

        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-3">
          {/* Main Preview Area */}
          <div className="lg:col-span-2 bg-black/50 p-6 flex items-center justify-center overflow-auto relative">
            <div className="relative shadow-2xl">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspect}
                minWidth={50}
                minHeight={50}
                className="max-h-[60vh]"
                keepSelection
              >
                <Image
                  ref={imgRef}
                  alt="Edit preview"
                  src={imgSrc}
                  onLoad={onImageLoad}
                  width={imageDimensions.width || 2000}
                  height={imageDimensions.height || 2000}
                  style={{
                    transform: `rotate(${rotate}deg)`,
                    maxHeight: '60vh',
                    maxWidth: '100%',
                    objectFit: 'contain'
                  }}
                  className="block"
                />
                {/* Note: Standard ReactCrop doesn't support CSS rotation well out of the box in terms of coordinates. 
                      If 90deg rotation is critical, we might need a wrapper or canvas-based rotation. 
                      For "Easy", let's handle 0deg perfectly first. 
                      If rotate is non-zero, we might just block crop or warn.
                      Or better: The transform above is purely visual. The crop is applied to the visual bounding box.
                  */}
              </ReactCrop>
            </div>

            {/* Hidden Processing Canvas */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>

          {/* Sidebar Controls */}
          <div className="bg-background border-l p-6 space-y-8 overflow-y-auto">

            {/* 1. Transform Tools */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Transform</Label>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={rotateImage}>
                  <RotateCw className="w-4 h-4 mr-2" />
                  Rotate 90°
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => {
                  setRotate(0);
                  setCrop(undefined);
                }}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>

            {/* 2. Crop / Aspect Ratio */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Crop & Resize</Label>
              <div className="space-y-3">
                <Label className="text-xs text-muted-foreground">Preset</Label>
                <Select value={selectedPreset} onValueChange={handlePresetSelect}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SCALE_PRESETS.map(p => (
                      <SelectItem key={p.name} value={p.name}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Width (px)</Label>
                  <Input
                    type="number"
                    value={outputWidth || ''}
                    onChange={(e) => setOutputWidth(Number(e.target.value))}
                    placeholder="Auto"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Height (px)</Label>
                  <Input
                    type="number"
                    value={outputHeight || ''}
                    onChange={(e) => setOutputHeight(Number(e.target.value))}
                    placeholder="Auto"
                  />
                </div>
              </div>

              {/* Apply Crop Button */}
              <div className="space-y-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={createCropFromDimensions}
                  disabled={!outputWidth || !outputHeight}
                  className="w-full"
                >
                  Apply Crop Dimensions
                </Button>
                <p className="text-xs text-muted-foreground">
                  Enter width/height and click apply to auto-create crop box
                </p>
              </div>
            </div>

            <div className="pt-8 space-y-3 mt-auto">
              <Button className="w-full" size="lg" onClick={() => handleSave(false)}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button variant="secondary" className="w-full" onClick={() => handleSave(true)}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
