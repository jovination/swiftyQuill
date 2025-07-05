import { supabase } from './supabase';

export class SupabaseKeepAlive {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(private intervalHours: number = 6) {}

  async ping() {
    try {
      console.log('🔄 Keeping Supabase alive...');
      
      // Make a simple query to keep the connection active
      const { data, error } = await supabase
        .from('User')
        .select('id')
        .limit(1);
      
      if (error) {
        console.log('⚠️  Keep-alive query failed:', error.message);
        return false;
      } else {
        console.log('✅ Supabase is active and responding');
        return true;
      }
    } catch (error) {
      console.error('❌ Keep-alive failed:', error);
      return false;
    }
  }

  start() {
    if (this.isRunning) {
      console.log('⚠️  Keep-alive service is already running');
      return;
    }

    this.isRunning = true;
    const intervalMs = this.intervalHours * 60 * 60 * 1000;
    
    console.log('🚀 Starting Supabase keep-alive service...');
    console.log(`⏰ Will ping every ${this.intervalHours} hours`);

    // Run immediately
    this.ping();

    // Then run on interval
    this.intervalId = setInterval(() => {
      this.ping();
    }, intervalMs);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isRunning = false;
      console.log('🛑 Keep-alive service stopped');
    }
  }

  isActive() {
    return this.isRunning;
  }
}

// Create a singleton instance
export const supabaseKeepAlive = new SupabaseKeepAlive(); 