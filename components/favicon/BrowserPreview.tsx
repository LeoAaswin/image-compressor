"use client";

import { ExternalLink } from "lucide-react";
import { useEffect, useCallback } from "react";
import { GeneratedFavicon, IcoFavicon } from "./types";

interface BrowserPreviewProps {
  favicons: GeneratedFavicon[];
  standardIco: IcoFavicon | null;
  title?: string;
}

export function BrowserPreview({
  favicons,
  standardIco,
  title = "Your Website",
}: BrowserPreviewProps) {
  const getBestFavicon = useCallback(
    (size: number) => {
      // Find the closest favicon size
      const sorted = [...favicons].sort(
        (a, b) => Math.abs(a.size.size - size) - Math.abs(b.size.size - size),
      );
      return sorted[0]?.url || standardIco?.url;
    },
    [favicons, standardIco],
  );

  // Update the actual browser tab favicon automatically
  const updateBrowserTabFavicon = useCallback(async () => {
    try {
      // Remove existing favicons
      const existingLinks = document.querySelectorAll('link[rel*="icon"]');
      existingLinks.forEach((link) => link.remove());

      // Get the best favicon for the browser tab (32px is standard)
      const bestFavicon = getBestFavicon(32);

      if (bestFavicon) {
        // Convert blob URL to data URL for browser tab
        const response = await fetch(bestFavicon);
        const blob = await response.blob();
        const reader = new FileReader();

        reader.onload = () => {
          const dataUrl = reader.result as string;

          // Create new favicon link elements
          const link32 = document.createElement("link");
          link32.rel = "icon";
          link32.type = "image/png";
          link32.setAttribute("sizes", "32x32");
          link32.href = dataUrl;

          const link16 = document.createElement("link");
          link16.rel = "icon";
          link16.type = "image/png";
          link16.setAttribute("sizes", "16x16");
          link16.href = dataUrl;

          // Add to document head
          document.head.appendChild(link32);
          document.head.appendChild(link16);

          // Also update the shortcut icon (fallback)
          const shortcutIcon = document.createElement("link");
          shortcutIcon.rel = "shortcut icon";
          shortcutIcon.href = dataUrl;
          document.head.appendChild(shortcutIcon);
        };

        reader.readAsDataURL(blob);
      }
    } catch (error) {
      console.error("Failed to update browser tab favicon:", error);
    }
  }, [favicons, standardIco, getBestFavicon]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (favicons.length > 0 || standardIco) {
      updateBrowserTabFavicon();
    }
  }, [favicons, standardIco, updateBrowserTabFavicon]);

  if (!favicons.length && !standardIco) return null;

  return (
    <div className="space-y-4">
      {/* Status Section */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-center space-x-3"></div>
        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
          ✨ Look at your browser tab above to preview your favicon!
        </p>
      </div>
    </div>
  );
}
