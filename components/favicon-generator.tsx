"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Download, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Dropzone } from '@/components/dropzone';
import { MemoryManager, formatFileSize } from '@/lib/memory-utils';
import Image from 'next/image';

interface FaviconSize {
  size: number;
  name: string;
  filename: string;
}

const FAVICON_SIZES: FaviconSize[] = [
  { size: 16, name: 'Favicon', filename: 'favicon-16x16.png' },
  { size: 32, name: 'Favicon', filename: 'favicon-32x32.png' },
  { size: 48, name: 'Windows', filename: 'favicon-48x48.png' },
  { size: 64, name: 'Windows', filename: 'favicon-64x64.png' },
  { size: 128, name: 'Windows', filename: 'favicon-128x128.png' },
  { size: 152, name: 'iOS', filename: 'apple-touch-icon-152x152.png' },
  { size: 167, name: 'iOS', filename: 'apple-touch-icon-167x167.png' },
  { size: 180, name: 'iOS', filename: 'apple-touch-icon-180x180.png' },
  { size: 192, name: 'Android', filename: 'android-chrome-192x192.png' },
  { size: 256, name: 'Windows', filename: 'favicon-256x256.png' },
  { size: 512, name: 'Android', filename: 'android-chrome-512x512.png' },
];

// ICO sizes to generate
const ICO_SIZES = [16, 32, 48, 256];

// Get selected ICO sizes from user selection
const getSelectedIcoSizes = (selectedSizes: string[]): number[] => {
  return ICO_SIZES.filter(size => selectedSizes.includes(size.toString()));
};

interface GeneratedFavicon {
  size: FaviconSize;
  blob: Blob;
  url: string;
}

interface IcoFavicon {
  size: number;
  name: string;
  filename: string;
  blob: Blob;
  url: string;
}

type MultipleIcoFavicons = IcoFavicon[];

export function FaviconGenerator() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [generatedFavicons, setGeneratedFavicons] = useState<GeneratedFavicon[]>([]);
  const [generatedIco, setGeneratedIco] = useState<MultipleIcoFavicons | null>(null);
  const [standardIco, setStandardIco] = useState<IcoFavicon | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['32', '180', '192', '512']);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      MemoryManager.revokeAllObjectURLs();
    };
  }, []);

  const cleanupFavicons = useCallback(() => {
    generatedFavicons.forEach(favicon => {
      URL.revokeObjectURL(favicon.url);
    });
    if (generatedIco) {
      generatedIco.forEach(ico => {
        URL.revokeObjectURL(ico.url);
      });
    }
    if (standardIco) {
      URL.revokeObjectURL(standardIco.url);
    }
  }, [generatedFavicons, generatedIco, standardIco]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    // Clear previous favicons
    cleanupFavicons();
    setGeneratedFavicons([]);
    setGeneratedIco(null);
    setStandardIco(null);
  }, [cleanupFavicons]);

  const generateFavicon = async (size: number): Promise<GeneratedFavicon | null> => {
    return new Promise((resolve) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

        canvas.width = size;
        canvas.height = size;

        // Calculate crop to center and square the image
        const sourceSize = Math.min(img.width, img.height);
        const sourceX = (img.width - sourceSize) / 2;
        const sourceY = (img.height - sourceSize) / 2;

        // Draw and crop to square
        ctx.drawImage(img, sourceX, sourceY, sourceSize, sourceSize, 0, 0, size, size);

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const faviconSize = FAVICON_SIZES.find(s => s.size === size);
            if (faviconSize) {
              resolve({
                size: faviconSize,
                blob,
                url
              });
            } else {
              resolve(null);
            }
          } else {
            resolve(null);
          }
        }, 'image/png', 1.0);
      };
      
      img.onerror = () => resolve(null);
      img.src = imagePreview!;
    });
  };

  // Generate multiple ICO files based on selected sizes
  const generateMultipleIcos = async (): Promise<MultipleIcoFavicons | null> => {
    const selectedIcoSizes = getSelectedIcoSizes(selectedSizes);
    if (selectedIcoSizes.length === 0) return null;

    const icoFavicons: MultipleIcoFavicons = [];
    
    for (const size of selectedIcoSizes) {
      try {
        const icoFavicon = await generateSingleIco(size);
        if (icoFavicon) {
          icoFavicons.push(icoFavicon);
        }
      } catch (error) {
        console.error(`Error generating ${size}x${size} ICO:`, error);
      }
    }
    
    return icoFavicons.length > 0 ? icoFavicons : null;
  };

  // Generate standard favicon.ico (256x256) for browser compatibility
  const generateStandardIco = async (): Promise<IcoFavicon | null> => {
    return generateSingleIco(256);
  };

  // Generate single ICO file
  const generateSingleIco = async (size: number): Promise<IcoFavicon | null> => {
    return new Promise((resolve) => {
      const img = document.createElement('img');
      img.onload = () => {
        try {
          // Create canvas for specified size
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(null);
            return;
          }

          canvas.width = size;
          canvas.height = size;

          // Draw and crop to square
          const sourceSize = Math.min(img.width, img.height);
          const sourceX = (img.width - sourceSize) / 2;
          const sourceY = (img.height - sourceSize) / 2;
          ctx.drawImage(img, sourceX, sourceY, sourceSize, sourceSize, 0, 0, size, size);

          // Convert to PNG and create simple ICO
          canvas.toBlob((blob) => {
            if (!blob) {
              resolve(null);
              return;
            }

            // For browser compatibility, just use PNG as ICO
            // Most browsers accept PNG files with .ico extension
            const icoBlob = new Blob([blob], { type: 'image/x-icon' });
            const icoUrl = URL.createObjectURL(icoBlob);
            
            resolve({
              size,
              name: `${size}x${size}`,
              filename: size === 256 ? 'favicon.ico' : `favicon-${size}x${size}.ico`,
              blob: icoBlob,
              url: icoUrl
            });
          }, 'image/png', 1.0);
        } catch (error) {
          console.error('Error generating ICO:', error);
          resolve(null);
        }
      };
      
      img.onerror = () => resolve(null);
      img.src = imagePreview!;
    });
  };

  const generateFavicons = async () => {
    if (!imagePreview) {
      toast.error('Please upload an image first');
      return;
    }

    setProcessing(true);
    setProgress(0);
    cleanupFavicons();

    try {
      const sizesToGenerate = FAVICON_SIZES.filter(size => 
        selectedSizes.includes(size.size.toString())
      );

      const favicons: GeneratedFavicon[] = [];
      
      // Generate PNG favicons
      for (let i = 0; i < sizesToGenerate.length; i++) {
        const faviconSize = sizesToGenerate[i];
        const favicon = await generateFavicon(faviconSize.size);
        
        if (favicon) {
          favicons.push(favicon);
        }
        
        setProgress(((i + 1) / (sizesToGenerate.length + 2)) * 100); // +1 for standard ICO, +1 for multiple ICOs
      }

      // Generate multiple ICO files based on selected sizes
      const icoFavicons = await generateMultipleIcos();
      if (icoFavicons) {
        setGeneratedIco(icoFavicons);
      }

      // Always generate standard favicon.ico for browser compatibility
      const standardIco = await generateStandardIco();
      if (standardIco) {
        setStandardIco(standardIco);
      }

      setGeneratedFavicons(favicons);
      const totalGenerated = favicons.length + (icoFavicons ? icoFavicons.length : 0) + (standardIco ? 1 : 0);
      toast.success(`Generated ${totalGenerated} favicon files (including ICO)`);
    } catch (error) {
      console.error('Error generating favicons:', error);
      toast.error('Failed to generate favicons');
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  const downloadFavicon = (favicon: GeneratedFavicon) => {
    const a = document.createElement('a');
    a.href = favicon.url;
    a.download = favicon.size.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadAllFavicons = async () => {
    if (generatedFavicons.length === 0 && !generatedIco) return;

    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      // Add all PNG favicons to zip
      generatedFavicons.forEach(favicon => {
        zip.file(favicon.size.filename, favicon.blob);
      });

      // Add ICO files if generated
      if (generatedIco) {
        generatedIco.forEach(ico => {
          zip.file(ico.filename, ico.blob);
        });
      }

      // Add standard favicon.ico if generated
      if (standardIco) {
        zip.file(standardIco.filename, standardIco.blob);
      }

      // Generate HTML file
      const htmlContent = generateHTMLCode();
      zip.file('favicon-code.html', htmlContent);

      // Generate and download zip
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(zipBlob);
      
      const a = document.createElement('a');
      a.href = zipUrl;
      a.download = 'favicons.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(zipUrl);
      toast.success('Downloaded all favicons as ZIP');
    } catch (error) {
      console.error('Error creating ZIP:', error);
      toast.error('Failed to create ZIP file');
    }
  };

  const generateHTMLCode = (): string => {
    const codeLines = [
      '<!-- Favicon HTML Code -->',
      '<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">',
      '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">',
      '<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png">',
      '<link rel="icon" type="image/png" sizes="64x64" href="/favicon-64x64.png">',
      '<link rel="icon" type="image/png" sizes="128x128" href="/favicon-128x128.png">',
      '<link rel="icon" type="image/png" sizes="256x256" href="/favicon-256x256.png">',
      // Standard favicon.ico for browser compatibility
      '<link rel="icon" type="image/x-icon" href="/favicon.ico">',
      // Additional ICO files for selected sizes
      ...getSelectedIcoSizes(selectedSizes).map(size => 
        `<link rel="icon" type="image/x-icon" sizes="${size}x${size}" href="/favicon-${size}x${size}.ico">`
      ),
      '<link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png">',
      '<link rel="apple-touch-icon" sizes="167x167" href="/apple-touch-icon-167x167.png">',
      '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png">',
      '<link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png">',
      '<link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png">',
      '',
      '<!-- Web App Manifest -->',
      '<link rel="manifest" href="/site.webmanifest">',
      '<meta name="theme-color" content="#000000">',
    ];

    return codeLines.join('\n');
  };

  const copyHTMLCode = () => {
    const htmlCode = generateHTMLCode();
    navigator.clipboard.writeText(htmlCode).then(() => {
      toast.success('HTML code copied to clipboard');
    }).catch(() => {
      toast.error('Failed to copy HTML code');
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Favicon Generator</h3>
        <p className="text-sm text-muted-foreground">
          Generate favicons in multiple sizes for all platforms from a single image
        </p>
      </div>

      <div className="space-y-6">
        {/* Upload Section */}
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Upload Image</Label>
            <div className="mt-2">
              <Dropzone onDrop={onDrop} />
            </div>
          </div>

          {imagePreview && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Select Sizes</Label>
                <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                  {FAVICON_SIZES.map((size) => (
                    <div key={size.size} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`size-${size.size}`}
                        checked={selectedSizes.includes(size.size.toString())}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSizes([...selectedSizes, size.size.toString()]);
                          } else {
                            setSelectedSizes(selectedSizes.filter(s => s !== size.size.toString()));
                          }
                        }}
                        className="rounded"
                      />
                      <Label htmlFor={`size-${size.size}`} className="text-sm">
                        {size.size}x{size.size}px - {size.name} ({size.filename})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                onClick={generateFavicons} 
                disabled={processing || selectedSizes.length === 0}
                className="w-full"
              >
                {processing ? 'Generating...' : `Generate ${selectedSizes.length} Favicons`}
              </Button>
            </div>
          )}
        </div>

        {/* Generated Favicons Section */}
        {processing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Generating favicons...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {generatedFavicons.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">Generated Favicons</Label>
              <div className="space-x-2">
                <Button variant="outline" size="sm" onClick={copyHTMLCode}>
                  Copy HTML
                </Button>
                <Button variant="outline" size="sm" onClick={downloadAllFavicons}>
                  Download All
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {generatedFavicons.map((favicon, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-2">
                  <div className="aspect-square bg-muted rounded flex items-center justify-center">
                    <Image
                      src={favicon.url} 
                      alt={`${favicon.size.size}x${favicon.size.size}`}
                      className="w-full h-full object-contain rounded"
                      width={favicon.size.size}
                      height={favicon.size.size}
                    />
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="font-medium">{favicon.size.size}x{favicon.size.size}px</div>
                    <div className="text-muted-foreground">{favicon.size.name}</div>
                    <div className="text-muted-foreground">{favicon.size.filename}</div>
                    <div className="text-muted-foreground">{formatFileSize(favicon.blob.size)}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadFavicon(favicon)}
                    className="w-full"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
              ))}
              
              {/* Standard favicon.ico */}
              {standardIco && (
                <div className="border rounded-lg p-3 space-y-2">
                  <div className="aspect-square bg-muted rounded flex items-center justify-center">
                    <Image
                      src={standardIco.url} 
                      alt="favicon.ico"
                      className="w-full h-full object-contain rounded"
                      width={256}
                      height={256}
                    />
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="font-medium">256x256px</div>
                    <div className="text-muted-foreground">ICO</div>
                    <div className="text-muted-foreground">{standardIco.filename}</div>
                    <div className="text-muted-foreground">{formatFileSize(standardIco.blob.size)}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = standardIco.url;
                      a.download = standardIco.filename;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }}
                    className="w-full"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
              )}
              
              {/* Additional ICO Files */}
              {generatedIco && generatedIco.length > 0 && (
                <div className="col-span-full">
                  <h4 className="text-sm font-medium mb-3">Additional ICO Files</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {generatedIco.map((ico, index) => (
                      <div key={index} className="border rounded-lg p-3 space-y-2">
                        <div className="aspect-square bg-muted rounded flex items-center justify-center">
                          <Image
                            src={ico.url} 
                            alt={`${ico.size}x${ico.size}`}
                            className="w-full h-full object-contain rounded"
                            width={ico.size}
                            height={ico.size}
                          />
                        </div>
                        <div className="text-xs space-y-1">
                          <div className="font-medium">{ico.size}x{ico.size}px</div>
                          <div className="text-muted-foreground">ICO</div>
                          <div className="text-muted-foreground">{ico.filename}</div>
                          <div className="text-muted-foreground">{formatFileSize(ico.blob.size)}</div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const a = document.createElement('a');
                            a.href = ico.url;
                            a.download = ico.filename;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                          }}
                          className="w-full"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {!imagePreview && (
          <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
            <div className="text-center space-y-2">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Upload an image to generate favicons
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
