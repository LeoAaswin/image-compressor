"use client";

import { Progress } from '@/components/ui/progress';
import { ModeSelector } from './ModeSelector';
import { ImageModePanel } from './ImageModePanel';
import { TextModePanel } from './TextModePanel';
import { FaviconGrid } from './FaviconGrid';
import { HTMLGuide } from './HTMLGuide';
import { BrowserPreview } from './BrowserPreview';
import { useFaviconGenerator } from './hooks/useFaviconGenerator';

function downloadFile(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

export function FaviconGenerator() {
  const {
    imagePreview,
    generatedFavicons,
    standardIco,
    processing,
    progress,
    selectedSizes,
    mode,
    textSettings,
    textPreview,
    onDrop,
    generateFavicons,
    downloadAllFavicons,
    copyHTMLCode,
    setMode,
    setSelectedSizes,
    updateTextSetting,
  } = useFaviconGenerator();

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h3 className="text-lg font-semibold">Favicon Generator</h3>
        <p className="text-sm text-muted-foreground">
          Generate favicons from images or text with customizable colors and styles
        </p>
      </div>

      <ModeSelector mode={mode} onChange={setMode} />

      {mode === 'image' ? (
        <ImageModePanel
          imagePreview={imagePreview}
          selectedSizes={selectedSizes}
          processing={processing}
          onDrop={onDrop}
          onSizesChange={setSelectedSizes}
          onGenerate={generateFavicons}
        />
      ) : (
        <TextModePanel
          settings={textSettings}
          textPreview={textPreview}
          selectedSizes={selectedSizes}
          processing={processing}
          onSettingChange={updateTextSetting}
          onSizesChange={setSelectedSizes}
          onGenerate={generateFavicons}
        />
      )}

      {processing && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Generating favicons…</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      )}

      <FaviconGrid
        favicons={generatedFavicons}
        standardIco={standardIco}
        onDownloadSingle={(f) => downloadFile(f.url, f.size.filename)}
        onDownloadIco={(ico) => downloadFile(ico.url, ico.filename)}
        onDownloadAll={downloadAllFavicons}
        onCopyHTML={copyHTMLCode}
      />

      {generatedFavicons.length > 0 && (
        <BrowserPreview 
          favicons={generatedFavicons}
          standardIco={standardIco}
          title="Your Website"
        />
      )}

      {generatedFavicons.length > 0 && (
        <HTMLGuide 
          favicons={generatedFavicons}
          standardIco={standardIco}
          onCopyHTML={copyHTMLCode}
        />
      )}
    </div>
  );
}
