"use client";

import { useEffect } from 'react';
import { supabaseKeepAlive } from '@/lib/keep-alive';

interface SupabaseKeepAliveProviderProps {
  children: React.ReactNode;
}

export function SupabaseKeepAliveProvider({ children }: SupabaseKeepAliveProviderProps) {
  useEffect(() => {
    // Start the keep-alive service when the app loads
    supabaseKeepAlive.start();

    // Cleanup when the component unmounts
    return () => {
      supabaseKeepAlive.stop();
    };
  }, []);

  return <>{children}</>;
} 