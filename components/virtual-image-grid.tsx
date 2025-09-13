"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ProcessedImage } from '@/lib/types';
import { ImageCardEnhanced } from '@/components/image-card-enhanced';

interface VirtualImageGridProps {
  images: ProcessedImage[];
  onRemove: (id: string) => void;
  itemHeight?: number;
  containerHeight?: number;
  overscan?: number;
}

export function VirtualImageGrid({ 
  images, 
  onRemove, 
  itemHeight = 300,
  containerHeight = 600,
  overscan = 5
}: VirtualImageGridProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  // Calculate items per row based on container width
  const itemsPerRow = Math.max(1, Math.floor(containerWidth / 300)); // Assuming 300px min width per item
  const totalRows = Math.ceil(images.length / itemsPerRow);
  const rowHeight = itemHeight + 16; // 16px gap

  // Calculate visible range
  const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const endRow = Math.min(totalRows, Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan);

  // Get visible images
  const visibleImages = images.slice(
    startRow * itemsPerRow,
    endRow * itemsPerRow
  );

  // Update container width on resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Calculate total height
  const totalHeight = totalRows * rowHeight;

  // Calculate offset for visible items
  const offsetY = startRow * rowHeight;

  return (
    <div 
      ref={containerRef}
      className="w-full"
      style={{ height: containerHeight }}
    >
      <div
        ref={scrollElementRef}
        className="overflow-auto h-full"
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div
            style={{
              transform: `translateY(${offsetY}px)`,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
            }}
          >
            <div 
              className="grid gap-4"
              style={{
                gridTemplateColumns: `repeat(${itemsPerRow}, 1fr)`,
                width: '100%'
              }}
            >
              {visibleImages.map((image, index) => (
                <div key={image.id} style={{ height: itemHeight }}>
                  <ImageCardEnhanced
                    image={image}
                    onRemove={onRemove}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Fallback component for small lists
export function SimpleImageGrid({ 
  images, 
  onRemove 
}: { 
  images: ProcessedImage[]; 
  onRemove: (id: string) => void; 
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {images.map((image) => (
        <ImageCardEnhanced
          key={image.id}
          image={image}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}
