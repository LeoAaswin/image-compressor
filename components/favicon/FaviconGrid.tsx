"use client";

import Image from 'next/image';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { GeneratedFavicon, IcoFavicon } from './types';
import { formatFileSize } from '@/lib/memory-utils';

interface FaviconGridProps {
  favicons: GeneratedFavicon[];
  standardIco: IcoFavicon | null;
  onDownloadSingle: (favicon: GeneratedFavicon) => void;
  onDownloadIco: (ico: IcoFavicon) => void;
  onDownloadAll: () => void;
  onCopyHTML: () => void;
}

function downloadFile(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

export function FaviconGrid({
  favicons, standardIco,
  onDownloadSingle, onDownloadIco, onDownloadAll, onCopyHTML,
}: FaviconGridProps) {
  if (!favicons.length && !standardIco) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-sm font-medium">Generated Favicons</Label>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={onCopyHTML}>Copy HTML</Button>
          <Button variant="outline" size="sm" onClick={onDownloadAll}>Download All</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {favicons.map((favicon, i) => (
          <div key={i} className="border rounded-lg p-3 space-y-2">
            <div className="aspect-square bg-muted rounded flex items-center justify-center">
              <Image
                src={favicon.url}
                alt={`${favicon.size.size}×${favicon.size.size}`}
                width={favicon.size.size}
                height={favicon.size.size}
                className="w-full h-full object-contain rounded"
              />
            </div>
            <div className="text-xs space-y-1">
              <div className="font-medium">{favicon.size.size}×{favicon.size.size}px</div>
              <div className="text-muted-foreground">{favicon.size.name}</div>
              <div className="text-muted-foreground truncate">{favicon.size.filename}</div>
              <div className="text-muted-foreground">{formatFileSize(favicon.blob.size)}</div>
            </div>
            <Button variant="outline" size="sm" onClick={() => onDownloadSingle(favicon)} className="w-full">
              <Download className="h-3 w-3 mr-1" /> Download
            </Button>
          </div>
        ))}

        {standardIco && (
          <div className="border rounded-lg p-3 space-y-2">
            <div className="aspect-square bg-muted rounded flex items-center justify-center">
              <Image src={standardIco.url} alt="favicon.ico" width={256} height={256} className="w-full h-full object-contain rounded" />
            </div>
            <div className="text-xs space-y-1">
              <div className="font-medium">256×256px</div>
              <div className="text-muted-foreground">ICO</div>
              <div className="text-muted-foreground">{standardIco.filename}</div>
              <div className="text-muted-foreground">{formatFileSize(standardIco.blob.size)}</div>
            </div>
            <Button variant="outline" size="sm" onClick={() => onDownloadIco(standardIco)} className="w-full">
              <Download className="h-3 w-3 mr-1" /> Download
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
