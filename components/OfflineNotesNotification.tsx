"use client"

import { useState, useEffect } from 'react';
import { IoCloudOfflineOutline, IoCloseOutline, IoCloudUploadOutline } from "react-icons/io5";
import { offlineStorage, localStorageOfflineNotes } from '@/lib/offline-storage';

interface OfflineNotesNotificationProps {
  onManageClick: () => void;
}

export default function OfflineNotesNotification({ onManageClick }: OfflineNotesNotificationProps) {
  const [offlineCount, setOfflineCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const updateOfflineCount = async () => {
      try {
        // Get notes from IndexedDB
        const indexedDBNotes = await offlineStorage.getOfflineNotes();
        
        // Get notes from localStorage
        const localStorageNotes = localStorageOfflineNotes.get();
        
        // Combine and deduplicate
        const allOfflineNotes = [...indexedDBNotes];
        localStorageNotes.forEach(localNote => {
          if (!allOfflineNotes.some(dbNote => dbNote.id === localNote.id)) {
            allOfflineNotes.push(localNote);
          }
        });
        
        setOfflineCount(allOfflineNotes.length);
        setIsVisible(allOfflineNotes.length > 0);
      } catch (error) {
        console.error('Error updating offline count:', error);
      }
    };

    updateOfflineCount();
    
    // Listen for sync events
    const handleNoteSynced = () => {
      updateOfflineCount();
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

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
      <div className="bg-orange-50 border border-orange-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <IoCloudOfflineOutline className="w-5 h-5 text-orange-500 mt-0.5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-orange-800">
                Offline Notes Available
              </h3>
              <button
                onClick={() => setIsVisible(false)}
                className="text-orange-400 hover:text-orange-600 transition-colors"
              >
                <IoCloseOutline className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-sm text-orange-700 mb-3">
              You have {offlineCount} note{offlineCount !== 1 ? 's' : ''} stored locally that can be synced to the cloud or safely deleted.
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={onManageClick}
                className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-white text-xs rounded-md hover:bg-orange-600 transition-colors"
              >
                <IoCloudUploadOutline className="w-3 h-3" />
                Manage Notes
              </button>
              
              {isOnline && (
                <button
                  onClick={() => {
                    // Trigger automatic sync
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new Event('online'));
                    }
                  }}
                  className="px-3 py-1.5 bg-orange-100 text-orange-700 text-xs rounded-md hover:bg-orange-200 transition-colors"
                >
                  Sync Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 