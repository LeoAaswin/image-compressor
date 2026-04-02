"use client";

import { useState, useEffect } from 'react';

interface ProcessingCounts {
  totalFiles: number;
  totalSizeBytes: number;
}

// Format numbers locally
const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

function AnimatedCounter({ value, duration = 1500 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (value === displayValue) return;
    
    setIsAnimating(true);
    const startValue = displayValue;
    const endValue = value;
    const difference = endValue - startValue;
    
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(startValue + (difference * easeOutCubic));
      
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        setIsAnimating(false);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value, duration, displayValue]);

  return (
    <span className="relative inline-block">
      <span 
        className={`transition-all duration-300 ease-out ${
          isAnimating ? 'scale-105 text-primary' : 'scale-100'
        }`}
      >
        {formatNumber(displayValue || 0)}
      </span>
    </span>
  );
}

function AnimatedFileSize({ value, duration = 1500 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (value === displayValue) return;
    
    setIsAnimating(true);
    const startValue = displayValue;
    const endValue = value;
    const difference = endValue - startValue;
    
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(startValue + (difference * easeOutCubic));
      
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        setIsAnimating(false);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value, duration, displayValue]);

  return (
    <span className="relative inline-block">
      <span 
        className={`transition-all duration-300 ease-out ${
          isAnimating ? 'scale-105 text-primary' : 'scale-100'
        }`}
      >
        {formatFileSize(displayValue || 0)}
      </span>
    </span>
  );
}

export function SimpleCounterDisplay() {
  const [counts, setCounts] = useState<ProcessingCounts>({
    totalFiles: 12450,
    totalSizeBytes: 45 * 1024 * 1024 * 1024 // 45 GB
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Fetch real-time stats from the API
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (response.ok) {
          const data = await response.json();
          setCounts(data);
        }
      } catch (error) {
        console.error('Failed to fetch processing stats', error);
      }
    };

    // Initial fetch
    fetchStats();

    // Poll for updates every 10 seconds
    const interval = setInterval(fetchStats, 10000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
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
          We&apos;ve already processed{' '}
          <span className="text-primary font-bold">
            <AnimatedCounter value={counts.totalFiles} />
          </span>{' '}
          files
        </h3>
        <p className="text-muted-foreground">
          with a total size of{' '}
          <span className="font-medium text-primary">
            <AnimatedFileSize value={counts.totalSizeBytes} />
          </span>
        </p>
      </div>
    </div>
  );
}
