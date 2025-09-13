export interface ProcessingCounts {
  totalFiles: number;
  totalSizeBytes: number;
  lastUpdated: string;
}

class GlobalCounter {
  private static CACHE_KEY = 'global-counter-cache';
  private static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private static getCachedCounts(): ProcessingCounts | null {
    if (typeof window === 'undefined') return null;

    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < this.CACHE_DURATION) {
          return data;
        }
      }
    } catch (error) {
      console.warn('Failed to load cached counts:', error);
    }

    return null;
  }

  private static setCachedCounts(counts: ProcessingCounts): void {
    if (typeof window === 'undefined') return;

    try {
      const cacheData = {
        data: counts,
        timestamp: Date.now()
      };
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to cache counts:', error);
    }
  }

  static async getCounts(): Promise<ProcessingCounts> {
    // Try cache first
    const cached = this.getCachedCounts();
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch('/api/counter');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const counts = await response.json();
      this.setCachedCounts(counts);
      return counts;
    } catch (error) {
      console.error('Failed to fetch global counts:', error);
      // Return default counts on error
      return {
        totalFiles: 0,
        totalSizeBytes: 0,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  static async updateCounts(filesProcessed: number, totalSizeBytes: number): Promise<ProcessingCounts> {
    try {
      const response = await fetch('/api/counter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filesProcessed,
          totalSizeBytes
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newCounts = await response.json();
      this.setCachedCounts(newCounts);
      return newCounts;
    } catch (error) {
      console.error('Failed to update global counts:', error);
      // Return current counts on error
      return await this.getCounts();
    }
  }

  static formatNumber(num: number): string {
    return num.toLocaleString();
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  static async resetCounts(): Promise<ProcessingCounts> {
    try {
      const response = await fetch('/api/counter', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reset: true })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const resetCounts = await response.json();
      this.setCachedCounts(resetCounts);
      return resetCounts;
    } catch (error) {
      console.error('Failed to reset global counts:', error);
      return await this.getCounts();
    }
  }
}

export { GlobalCounter };
