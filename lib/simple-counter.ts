
export interface ProcessingCounts {
  totalFiles: number;
  totalSizeBytes: number;
  lastUpdated: string;
}

class SimpleCounter {
  private static DB_KEY = 'image-processor-counter-db';
  private static COUNTER_KEY = 'image-processor-counts';
  
  private static getDefaultCounts(): ProcessingCounts {
    return {
      totalFiles: 0,
      totalSizeBytes: 0,
      lastUpdated: new Date().toISOString()
    };
  }

  static getCounts(): ProcessingCounts {
    if (typeof window === 'undefined') {
      return this.getDefaultCounts();
    }

    try {
      const stored = localStorage.getItem(this.COUNTER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...this.getDefaultCounts(), ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load counts:', error);
    }

    return this.getDefaultCounts();
  }

  static updateCounts(filesProcessed: number, totalSizeBytes: number): ProcessingCounts {
    const current = this.getCounts();
    const newCounts: ProcessingCounts = {
      totalFiles: current.totalFiles + filesProcessed,
      totalSizeBytes: current.totalSizeBytes + totalSizeBytes,
      lastUpdated: new Date().toISOString()
    };

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.COUNTER_KEY, JSON.stringify(newCounts));
      } catch (error) {
        console.warn('Failed to save counts:', error);
      }
    }

    return newCounts;
  }

  static formatNumber(num: number): string {
    return num.toLocaleString();
  }

  // Format file size
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  static resetCounts(): ProcessingCounts {
    const defaultCounts = this.getDefaultCounts();
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.COUNTER_KEY, JSON.stringify(defaultCounts));
      } catch (error) {
        console.warn('Failed to reset counts:', error);
      }
    }
    
    return defaultCounts;
  }
}

export { SimpleCounter };
