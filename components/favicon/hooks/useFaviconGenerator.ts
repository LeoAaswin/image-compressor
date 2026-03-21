"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { FAVICON_SIZES, DEFAULT_TEXT_SETTINGS } from '../lib/constants';
import {
  generateTextFavicon,
  generateImageFavicon,
  generateTextIco,
  generateImageIco,
} from '../lib/favicon-generators';
import { createTextCanvas } from '../lib/canvas-utils';
import { generateHTMLCode, generateWebManifest } from '../lib/code-generators';
import {
  GeneratedFavicon,
  IcoFavicon,
  GenerationMode,
  TextFaviconSettings,
} from '../types';

export function useFaviconGenerator() {
  // Image mode state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Generation state
  const [generatedFavicons, setGeneratedFavicons] = useState<GeneratedFavicon[]>([]);
  const [standardIco, setStandardIco] = useState<IcoFavicon | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['16', '32', '180', '192', '512']);

  // Mode
  const [mode, setMode] = useState<GenerationMode>('image');

  // Text settings
  const [textSettings, setTextSettings] = useState<TextFaviconSettings>(DEFAULT_TEXT_SETTINGS);
  const [textPreview, setTextPreview] = useState<string | null>(null);

  // Keep a ref to always have the latest values for unmount cleanup
  const faviconStateRef = useRef({ generatedFavicons, standardIco });
  useEffect(() => {
    faviconStateRef.current = { generatedFavicons, standardIco };
  }, [generatedFavicons, standardIco]);

  // Cleanup all object URLs on unmount
  useEffect(() => {
    return () => {
      faviconStateRef.current.generatedFavicons.forEach((f) => URL.revokeObjectURL(f.url));
      if (faviconStateRef.current.standardIco) URL.revokeObjectURL(faviconStateRef.current.standardIco.url);
    };
  }, []);

  // Generate text preview whenever settings change
  useEffect(() => {
    if (mode !== 'text') return;
    const canvas = createTextCanvas(256, textSettings);
    if (canvas) setTextPreview(canvas.toDataURL('image/png'));
  }, [mode, textSettings]);

  const cleanupFavicons = useCallback(() => {
    generatedFavicons.forEach((f) => URL.revokeObjectURL(f.url));
    if (standardIco) URL.revokeObjectURL(standardIco.url);
  }, [generatedFavicons, standardIco]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return; }
      if (file.size > 10 * 1024 * 1024) { toast.error('Image size must be less than 10MB'); return; }

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);

      cleanupFavicons();
      setGeneratedFavicons([]);
      setStandardIco(null);
    },
    [cleanupFavicons]
  );

  const generateFavicons = useCallback(async () => {
    if (mode === 'image' && !imagePreview) { toast.error('Please upload an image first'); return; }
    if (mode === 'text' && !textSettings.faviconText.trim()) { toast.error('Please enter text for the favicon'); return; }

    setProcessing(true);
    setProgress(0);
    cleanupFavicons();

    try {
      const sizesToGenerate = FAVICON_SIZES.filter((s) => selectedSizes.includes(s.size.toString()));
      const favicons: GeneratedFavicon[] = [];

      for (let i = 0; i < sizesToGenerate.length; i++) {
        const { size } = sizesToGenerate[i];
        const favicon =
          mode === 'text'
            ? await generateTextFavicon(size, textSettings)
            : await generateImageFavicon(size, imagePreview!);

        if (favicon) favicons.push(favicon);
        setProgress(((i + 1) / (sizesToGenerate.length + 1)) * 100);
      }

      const ico =
        mode === 'text'
          ? await generateTextIco(256, textSettings)
          : await generateImageIco(256, imagePreview!);

      setStandardIco(ico);
      setGeneratedFavicons(favicons);
      setProgress(100);
      toast.success(`Generated ${favicons.length + (ico ? 1 : 0)} favicon files (including ICO)`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate favicons');
    } finally {
      setProcessing(false);
    }
  }, [mode, imagePreview, textSettings, selectedSizes, cleanupFavicons]);

  const downloadAllFavicons = useCallback(async () => {
    if (!generatedFavicons.length) return;
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      generatedFavicons.forEach((f) => zip.file(f.size.filename, f.blob));
      if (standardIco) zip.file(standardIco.filename, standardIco.blob);
      zip.file('favicon-code.html', generateHTMLCode());
      zip.file('site.webmanifest', generateWebManifest(mode, textSettings.backgroundColor));

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url; a.download = 'favicons.zip';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Downloaded favicon package');
    } catch (err) {
      console.error(err);
      toast.error('Failed to create ZIP file');
    }
  }, [generatedFavicons, standardIco, mode, textSettings.backgroundColor]);

  const copyHTMLCode = useCallback(() => {
    navigator.clipboard.writeText(generateHTMLCode())
      .then(() => toast.success('HTML code copied to clipboard'))
      .catch(() => toast.error('Failed to copy HTML code'));
  }, []);

  const updateTextSetting = useCallback(<K extends keyof TextFaviconSettings>(key: K, value: TextFaviconSettings[K]) => {
    setTextSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  return {
    // state
    imageFile, imagePreview, generatedFavicons, standardIco,
    processing, progress, selectedSizes, mode, textSettings, textPreview,
    // actions
    onDrop, generateFavicons, downloadAllFavicons, copyHTMLCode,
    setMode, setSelectedSizes, updateTextSetting,
  };
}
