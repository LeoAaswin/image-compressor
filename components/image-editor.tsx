"use client";

import { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Crop as CropIcon, Scale, Download, X } from 'lucide-react';
import { toast } from 'sonner';

interface ImageEditorProps {
  image: File;
  onSave: (editedImage: File) => void;
  onClose: () => void;
}

interface ScalePreset {
  name: string;
  width: number;
  height: number;
  ratio: number;
}

const SCALE_PRESETS: ScalePreset[] = [
  { name: 'Original', width: 0, height: 0, ratio: 0 },
  { name: 'Square (1:1)', width: 512, height: 512, ratio: 1 },
  { name: 'Instagram Post (1:1)', width: 1080, height: 1080, ratio: 1 },
  { name: 'Instagram Story (9:16)', width: 1080, height: 1920, ratio: 9/16 },
  { name: 'Facebook Cover (16:9)', width: 1200, height: 675, ratio: 16/9 },
  { name: 'Twitter Header (16:9)', width: 1500, height: 844, ratio: 16/9 },
  { name: 'LinkedIn Post (1.91:1)', width: 1200, height: 628, ratio: 1.91 },
  { name: 'YouTube Thumbnail (16:9)', width: 1280, height: 720, ratio: 16/9 },
  { name: 'Pinterest Pin (2:3)', width: 1000, height: 1500, ratio: 2/3 },
  { name: 'Web Banner (3:1)', width: 1200, height: 400, ratio: 3 },
];

export function ImageEditor({ image, onSave, onClose }: ImageEditorProps) {
  
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [customWidth, setCustomWidth] = useState(0);
  const [customHeight, setCustomHeight] = useState(0);
  const [useCustomSize, setUseCustomSize] = useState(false);
  const [activeTab, setActiveTab] = useState('crop');
  
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgSrc, setImgSrc] = useState(URL.createObjectURL(image));

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        width / height,
        width,
        height
      ),
      width,
      height
    );
    setCrop(crop);
  }, []);

  const onCropChange = useCallback((crop: Crop) => {
    setCrop(crop);
  }, []);

  const onCropComplete = useCallback((crop: PixelCrop, percentageCrop: Crop) => {
    setCompletedCrop(crop);
  }, []);

  const applyCrop = useCallback(async (): Promise<File | undefined> => {
    if (!completedCrop || !imgRef.current || !canvasRef.current) {
      return;
    }

    const image = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;
    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;

    canvas.width = cropWidth;
    canvas.height = cropHeight;

    // Apply transformations (scale and rotate) to the canvas
    ctx.save();
    
    // Apply rotation
    if (rotate !== 0) {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotate * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }

    // Apply scale
    if (scale !== 1) {
      ctx.scale(scale, scale);
    }

    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    ctx.restore();

    return new Promise<File>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], image.name || 'cropped-image.jpg', { type: blob.type });
          resolve(file);
        }
      }, 'image/jpeg', 0.9);
    });
  }, [completedCrop, scale, rotate]);

  const applyScale = useCallback(async (targetWidth: number, targetHeight: number): Promise<File | undefined> => {
    if (!imgRef.current || !canvasRef.current) {
      return;
    }

    const image = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Apply transformations (scale and rotate) to the canvas
    ctx.save();
    
    // Apply rotation
    if (rotate !== 0) {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotate * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }

    // Apply scale
    if (scale !== 1) {
      ctx.scale(scale, scale);
    }

    ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

    ctx.restore();

    return new Promise<File>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], image.name || 'scaled-image.jpg', { type: blob.type });
          resolve(file);
        }
      }, 'image/jpeg', 0.9);
    });
  }, [scale, rotate]);

  const handlePresetSelect = (preset: ScalePreset) => {
    if (preset.name === 'Original') {
      setUseCustomSize(false);
      return;
    }
    
    setCustomWidth(preset.width);
    setCustomHeight(preset.height);
    setUseCustomSize(true);
  };

  const handleSave = async () => {
    try {
      let editedImage: File | undefined;

      if (activeTab === 'crop' && completedCrop) {
        editedImage = await applyCrop();
      } else if (activeTab === 'scale') {
        if (useCustomSize && customWidth > 0 && customHeight > 0) {
          editedImage = await applyScale(customWidth, customHeight);
        } else {
          toast.error('Please select a preset or enter custom dimensions');
          return;
        }
      } else {
        toast.error('Please make your edits before saving');
        return;
      }

      if (editedImage) {
        onSave(editedImage);
        toast.success('Image edited successfully!');
      }
    } catch (error) {
      toast.error('Error editing image');
    }
  };

  const resetCrop = () => {
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      const crop = centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 90,
          },
          width / height,
          width,
          height
        ),
        width,
        height
      );
      setCrop(crop);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">Image Editor</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Image Preview */}
            <div className="lg:col-span-2">
              <div className="relative bg-muted rounded-lg overflow-hidden">
                <ReactCrop
                  crop={crop}
                  onChange={onCropChange}
                  onComplete={onCropComplete}
                  aspect={aspect}
                  minWidth={50}
                  minHeight={50}
                >
                  <img
                    ref={imgRef}
                    alt="Crop me"
                    src={imgSrc}
                    onLoad={onImageLoad}
                    className="max-h-[400px] w-auto mx-auto"
                    style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                  />
                </ReactCrop>
              </div>
              
              {/* Hidden canvas for processing */}
              <canvas
                ref={canvasRef}
                style={{ display: 'none' }}
              />
            </div>

            {/* Controls */}
            <div className="space-y-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="crop" className="flex items-center gap-2">
                    <CropIcon className="h-4 w-4" />
                    Crop
                  </TabsTrigger>
                  <TabsTrigger value="scale" className="flex items-center gap-2">
                    <Scale className="h-4 w-4" />
                    Scale
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="crop" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Aspect Ratio</Label>
                      <Select
                        value={aspect?.toString() || 'free'}
                        onValueChange={(value) => setAspect(value === 'free' ? undefined : parseFloat(value))}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="1">1:1</SelectItem>
                          <SelectItem value="16/9">16:9</SelectItem>
                          <SelectItem value="4/3">4:3</SelectItem>
                          <SelectItem value="3/2">3:2</SelectItem>
                          <SelectItem value="2/3">2:3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Scale</Label>
                      <Badge variant="secondary">
                        {Math.round(scale * 100)}%
                      </Badge>
                    </div>
                    <Slider
                      value={[scale]}
                      onValueChange={([value]) => setScale(value)}
                      min={0.1}
                      max={3}
                      step={0.1}
                      className="w-full"
                    />

                    <div className="flex items-center justify-between">
                      <Label>Rotate</Label>
                      <Badge variant="secondary">
                        {rotate}°
                      </Badge>
                    </div>
                    <Slider
                      value={[rotate]}
                      onValueChange={([value]) => setRotate(value)}
                      min={-180}
                      max={180}
                      step={1}
                      className="w-full"
                    />

                    <Button onClick={resetCrop} variant="outline" className="w-full">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset Crop
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="scale" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label>Preset Sizes</Label>
                      <Select onValueChange={(value) => {
                        const preset = SCALE_PRESETS.find(p => p.name === value);
                        if (preset) handlePresetSelect(preset);
                      }}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a preset" />
                        </SelectTrigger>
                        <SelectContent>
                          {SCALE_PRESETS.map((preset) => (
                            <SelectItem key={preset.name} value={preset.name}>
                              {preset.name} {preset.width > 0 && `(${preset.width}×${preset.height})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Custom Dimensions</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="width" className="text-xs">Width</Label>
                          <Input
                            id="width"
                            type="number"
                            value={customWidth || ''}
                            onChange={(e) => setCustomWidth(parseInt(e.target.value) || 0)}
                            placeholder="Width"
                          />
                        </div>
                        <div>
                          <Label htmlFor="height" className="text-xs">Height</Label>
                          <Input
                            id="height"
                            type="number"
                            value={customHeight || ''}
                            onChange={(e) => setCustomHeight(parseInt(e.target.value) || 0)}
                            placeholder="Height"
                          />
                        </div>
                      </div>
                    </div>

                    {customWidth > 0 && customHeight > 0 && (
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground">
                          <div>Target Size: {customWidth} × {customHeight}</div>
                          <div>Aspect Ratio: {(customWidth / customHeight).toFixed(2)}:1</div>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button 
                  variant="outline" 
                  onClick={async () => {
                    try {
                      let editedImage: File | undefined;

                      if (activeTab === 'crop' && completedCrop) {
                        editedImage = await applyCrop();
                      } else if (activeTab === 'scale') {
                        if (useCustomSize && customWidth > 0 && customHeight > 0) {
                          editedImage = await applyScale(customWidth, customHeight);
                        } else {
                          toast.error('Please select a preset or enter custom dimensions');
                          return;
                        }
                      } else {
                        toast.error('Please make your edits before downloading');
                        return;
                      }

                      if (editedImage) {
                        const downloadUrl = URL.createObjectURL(editedImage);
                        const link = document.createElement('a');
                        link.href = downloadUrl;
                        
                        // Create a filename that indicates it's edited
                        const originalName = image.name;
                        const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
                        const extension = originalName.substring(originalName.lastIndexOf('.'));
                        const editedFileName = `${nameWithoutExt}_edited${extension}`;
                        
                        link.download = editedFileName;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(downloadUrl);
                        toast.success('Image downloaded successfully!');
                      }
                    } catch (error) {
                      toast.error('Error downloading image');
                    }
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
