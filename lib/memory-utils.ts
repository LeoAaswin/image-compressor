// Memory management utilities for handling large image batches

export class MemoryManager {
  private static objectUrls = new Set<string>();
  private static maxMemoryUsage = 500 * 1024 * 1024; // 500MB limit
  private static currentMemoryUsage = 0;

  static createObjectURL(blob: Blob): string {
    const url = URL.createObjectURL(blob);
    this.objectUrls.add(url);
    this.currentMemoryUsage += blob.size;
    return url;
  }

  static revokeObjectURL(url: string): void {
    if (this.objectUrls.has(url)) {
      URL.revokeObjectURL(url);
      this.objectUrls.delete(url);
    }
  }

  static revokeAllObjectURLs(): void {
    this.objectUrls.forEach(url => URL.revokeObjectURL(url));
    this.objectUrls.clear();
    this.currentMemoryUsage = 0;
  }

  static getMemoryUsage(): { used: number; max: number; percentage: number } {
    return {
      used: this.currentMemoryUsage,
      max: this.maxMemoryUsage,
      percentage: (this.currentMemoryUsage / this.maxMemoryUsage) * 100
    };
  }

  static isMemoryLimitReached(): boolean {
    return this.currentMemoryUsage >= this.maxMemoryUsage;
  }

  static cleanupOldestUrls(count: number = 5): void {
    const urlsToRevoke = Array.from(this.objectUrls).slice(0, count);
    urlsToRevoke.forEach(url => this.revokeObjectURL(url));
  }
}

export class ProcessingQueue {
  private queue: Array<() => Promise<void>> = [];
  private running = 0;
  private maxConcurrent = 3; // Limit concurrent processing

  async add<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.processNext();
    });
  }

  private async processNext(): Promise<void> {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.running++;
    const task = this.queue.shift();
    
    if (task) {
      try {
        await task();
      } finally {
        this.running--;
        this.processNext();
      }
    }
  }

  getQueueStatus(): { queueLength: number; running: number; maxConcurrent: number } {
    return {
      queueLength: this.queue.length,
      running: this.running,
      maxConcurrent: this.maxConcurrent
    };
  }
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const estimateMemoryUsage = (fileSize: number, count: number): number => {
  // Estimate: original + preview + processed + zip overhead
  return fileSize * count * 3.5; // Conservative estimate
};
