"use client";

import { useState, useEffect, useRef } from 'react';
import { SupabaseCounter, ProcessingCounts } from '@/lib/supabase';

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
        {SupabaseCounter.formatNumber(displayValue || 0)}
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
        {SupabaseCounter.formatFileSize(displayValue || 0)}
      </span>
    </span>
  );
}

export function SimpleCounterDisplay() {
  const [counts, setCounts] = useState<ProcessingCounts | null>(null);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
    
    const loadCounts = async () => {
      try {
        setError(null);
        const currentCounts = await SupabaseCounter.getCounts();
        setCounts(currentCounts);
      } catch (err) {
        console.error('Failed to load counts:', err);
        setError('Failed to load statistics');
      }
    };

    loadCounts();

    const handleRealtimeUpdate = (newCounts: ProcessingCounts) => {
      console.log('Real-time counter update:', newCounts);
      setCounts(newCounts);
    };

    let fallbackInterval: NodeJS.Timeout | null = null;
    
    try {
      subscriptionRef.current = SupabaseCounter.subscribeToCounterUpdates(handleRealtimeUpdate);
      console.log('Real-time subscription established');
      
      fallbackInterval = setInterval(loadCounts, 30000);
    } catch (error) {
      console.error('Failed to establish real-time subscription:', error);
      fallbackInterval = setInterval(loadCounts, 5000); // Poll every 5 seconds
    }

    // Cleanup function
    return () => {
      if (subscriptionRef.current) {
        SupabaseCounter.unsubscribeFromCounterUpdates(subscriptionRef.current);
      }
      if (fallbackInterval) {
        clearInterval(fallbackInterval);
      }
    };
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

  if (error) {
    return (
      <div className="bg-gradient-to-r from-destructive/10 to-destructive/5 rounded-lg p-6 text-center border border-destructive/20">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-destructive">
            Unable to load statistics
          </h3>
          <p className="text-sm text-muted-foreground">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!counts) {
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
