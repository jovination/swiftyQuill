"use client"

import { useEffect, useState } from 'react';
import { IoCloudOfflineOutline, IoWarningOutline } from "react-icons/io5";
import { offlineStorage } from '@/lib/offline-storage';

export default function GlobalSyncStatus() {
  const [pendingCount, setPendingCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const updateCounts = async () => {
      try {
        const offlineNotes = await offlineStorage.getOfflineNotes();
        
        const pending = offlineNotes.filter(note => note.syncStatus === 'pending').length;
        const failed = offlineNotes.filter(note => note.syncStatus === 'failed').length;
        
        setPendingCount(pending);
        setFailedCount(failed);
      } catch (error) {
        console.error('Error updating sync counts:', error);
      }
    };

    updateCounts();
    
    // Listen for sync events
    const handleNoteSynced = () => {
      updateCounts();
    };

    window.addEventListener('noteSynced', handleNoteSynced as EventListener);
    
    return () => {
      window.removeEventListener('noteSynced', handleNoteSynced as EventListener);
    };
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline && (pendingCount > 0 || failedCount > 0)) {
    return (
      <div className="fixed bottom-4 right-4 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
        <div className="flex items-center gap-2">
          <IoCloudOfflineOutline className="w-4 h-4" />
          <span className="text-sm">
            {pendingCount > 0 && `${pendingCount} note${pendingCount > 1 ? 's' : ''} pending sync`}
            {pendingCount > 0 && failedCount > 0 && ' • '}
            {failedCount > 0 && `${failedCount} failed`}
          </span>
        </div>
      </div>
    );
  }

  if (failedCount > 0) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
        <div className="flex items-center gap-2">
          <IoWarningOutline className="w-4 h-4" />
          <span className="text-sm">
            {failedCount} note{failedCount > 1 ? 's' : ''} failed to sync
          </span>
        </div>
      </div>
    );
  }

  return null;
} 