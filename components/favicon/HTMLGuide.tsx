"use client";

import { Palette, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { GeneratedFavicon, IcoFavicon } from './types';

interface HTMLGuideProps {
  favicons: GeneratedFavicon[];
  standardIco: IcoFavicon | null;
  onCopyHTML: () => void;
}

export function HTMLGuide({ favicons, standardIco, onCopyHTML }: HTMLGuideProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const generateHTMLCode = () => {
    const lines = ['<!-- Favicon HTML Code -->'];
    
    // Standard ICO
    if (standardIco) {
      lines.push('<link rel="icon" type="image/x-icon" href="/favicon.ico">');
    }
    
    // PNG favicons
    favicons.forEach(favicon => {
      if (favicon.size.name === 'Favicon') {
        lines.push(`<link rel="icon" type="image/png" sizes="${favicon.size.size}x${favicon.size.size}" href="/${favicon.size.filename}">`);
      }
    });
    
    // Apple touch icon
    const appleIcon = favicons.find(f => f.size.name === 'iOS');
    if (appleIcon) {
      lines.push(`<link rel="apple-touch-icon" sizes="${appleIcon.size.size}x${appleIcon.size.size}" href="/${appleIcon.size.filename}">`);
    }
    
    // Android icons
    const androidIcons = favicons.filter(f => f.size.name === 'Android');
    androidIcons.forEach(icon => {
      lines.push(`<link rel="icon" type="image/png" sizes="${icon.size.size}x${icon.size.size}" href="/${icon.size.filename}">`);
    });
    
    if (androidIcons.length > 0) {
      lines.push('<link rel="manifest" href="/site.webmanifest">');
    }
    
    return lines.join('\n');
  };

  const generateManifest = () => {
    const androidIcons = favicons.filter(f => f.size.name === 'Android');
    
    return `{
  "name": "Your Website Name",
  "short_name": "Website",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
${androidIcons.map(icon => 
    `    { "src": "/${icon.size.filename}", "sizes": "${icon.size.size}x${icon.size.size}", "type": "image/png" }`
  ).join(',\n')}
  ]
}`;
  };

  const htmlCode = generateHTMLCode();
  const manifestCode = generateManifest();
  const androidIcons = favicons.filter(f => f.size.name === 'Android');

  return (
    <div className="border rounded-lg p-4 bg-muted/30 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium flex items-center">
          <Palette className="h-4 w-4 mr-2" />
          HTML Implementation Guide
        </h4>
        <Button variant="outline" size="sm" onClick={() => copyToClipboard(htmlCode, 'all')}>
          {copiedSection === 'all' ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
          {copiedSection === 'all' ? 'Copied!' : 'Copy All'}
        </Button>
      </div>

      <Section 
        title="1. Add to your <head> section:" 
        code={htmlCode}
        section="head"
        onCopy={copyToClipboard}
        copiedSection={copiedSection}
      />

      {androidIcons.length > 0 && (
        <Section 
          title="2. site.webmanifest:" 
          code={manifestCode}
          section="manifest"
          onCopy={copyToClipboard}
          copiedSection={copiedSection}
        />
      )}

      <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950 p-3 rounded">
        <strong>💡 Tip:</strong> Place all favicon files in your website&apos;s root directory. Browsers automatically pick the right size for each context.
      </div>
    </div>
  );
}

function Section({ 
  title, 
  code, 
  section, 
  onCopy, 
  copiedSection 
}: { 
  title: string; 
  code: string; 
  section: string;
  onCopy: (text: string, section: string) => void;
  copiedSection: string | null;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-medium">{title}</p>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onCopy(code, section)}
          className="h-6 px-2 text-xs"
        >
          {copiedSection === section ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
          {copiedSection === section ? 'Copied!' : 'Copy'}
        </Button>
      </div>
      <div className="bg-background border p-3 rounded">
        <pre className="text-xs overflow-x-auto whitespace-pre-wrap">{code}</pre>
      </div>
    </div>
  );
}
