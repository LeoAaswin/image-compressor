import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

export interface ProcessingCounts {
  totalFiles: number;
  totalSizeBytes: number;
  lastUpdated: string;
}

interface DatabaseCounter {
  id: number;
  total_files: number;
  total_size_bytes: number;
  last_updated: string;
  created_at: string;
  updated_at: string;
}

export class SupabaseCounter {
  private static TABLE_NAME = 'global_counter';

  static async getCounts(): Promise<ProcessingCounts> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .single();

      if (error) {
        console.error('Error fetching counts:', error);
        return {
          totalFiles: 0,
          totalSizeBytes: 0,
          lastUpdated: new Date().toISOString()
        };
      }

      // Handle null values and ensure proper data structure
      const counts = {
        totalFiles: data?.total_files || 0,
        totalSizeBytes: data?.total_size_bytes || 0,
        lastUpdated: data?.last_updated || new Date().toISOString()
      };

      return counts;
    } catch (error) {
      console.error('Error fetching counts:', error);
      return {
        totalFiles: 0,
        totalSizeBytes: 0,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  static async updateCounts(filesProcessed: number, totalSizeBytes: number): Promise<ProcessingCounts> {
    try {
      // First, get current counts
      const currentCounts = await this.getCounts();
      
      const newCounts: ProcessingCounts = {
        totalFiles: currentCounts.totalFiles + filesProcessed,
        totalSizeBytes: currentCounts.totalSizeBytes + totalSizeBytes,
        lastUpdated: new Date().toISOString()
      };

      // Upsert the new counts
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .upsert({
          id: 1, // Single row for global counter
          total_files: newCounts.totalFiles,
          total_size_bytes: newCounts.totalSizeBytes,
          last_updated: newCounts.lastUpdated
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating counts:', error);
        return currentCounts;
      }

      return newCounts;
    } catch (error) {
      console.error('Error updating counts:', error);
      return await this.getCounts();
    }
  }

  static async resetCounts(): Promise<ProcessingCounts> {
    try {
      const resetCounts: ProcessingCounts = {
        totalFiles: 0,
        totalSizeBytes: 0,
        lastUpdated: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .upsert({
          id: 1,
          total_files: 0,
          total_size_bytes: 0,
          last_updated: resetCounts.lastUpdated
        })
        .select()
        .single();

      if (error) {
        console.error('Error resetting counts:', error);
        return await this.getCounts();
      }

      return resetCounts;
    } catch (error) {
      console.error('Error resetting counts:', error);
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

  // Real-time subscription for counter updates
  static subscribeToCounterUpdates(callback: (counts: ProcessingCounts) => void) {
    console.log('Setting up real-time subscription...');
    
    const subscription = supabase
      .channel('global_counter_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'global_counter'
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          
          if (payload.new) {
            const newData = payload.new as DatabaseCounter;
            const counts: ProcessingCounts = {
              totalFiles: newData.total_files || 0,
              totalSizeBytes: newData.total_size_bytes || 0,
              lastUpdated: newData.last_updated || new Date().toISOString()
            };
            callback(counts);
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to real-time updates');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Failed to subscribe to real-time updates');
        }
      });

    return subscription;
  }

  // Unsubscribe from real-time updates
  static unsubscribeFromCounterUpdates(subscription: any) {
    if (subscription) {
      supabase.removeChannel(subscription);
    }
  }
}
