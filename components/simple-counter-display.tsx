"use client";

import { useState, useEffect } from 'react';
import { SimpleCounter, ProcessingCounts } from '@/lib/simple-counter';

export function SimpleCounterDisplay() {
  const [counts, setCounts] = useState<ProcessingCounts | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const loadCounts = () => {
      const currentCounts = SimpleCounter.getCounts();
      setCounts(currentCounts);
    };

    loadCounts();
    
    // Update every 10 seconds
    const interval = setInterval(loadCounts, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted || !counts) {
    return (
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 text-center">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-64 mx-auto mb-2"></div>
          <div className="h-4 bg-muted rounded w-48 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 text-center border">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">
          We've already processed{' '}
          <span className="text-primary font-bold">
            {SimpleCounter.formatNumber(counts.totalFiles)}
          </span>{' '}
          files
        </h3>
        <p className="text-muted-foreground">
          with a total size of{' '}
          <span className="font-medium text-primary">
            {SimpleCounter.formatFileSize(counts.totalSizeBytes)}
          </span>
        </p>
        <p className="text-xs text-muted-foreground">
          Last updated: {new Date(counts.lastUpdated).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
