"use client"; // Add this line

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { offlineStorage, syncService, OfflineNote, localStorageOfflineNotes } from './offline-storage';

export interface OptimisticNote {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  isStarred: boolean;
  isShared: boolean;
  isTemp?: boolean;
  syncStatus?: 'pending' | 'syncing' | 'synced' | 'failed';
  isOffline?: boolean;
  tags: {
    tag: {
      id: string;
      name: string;
    };
  }[];
}

interface OptimisticNotesContextType {
  notes: OptimisticNote[];
  isOnline: boolean;
  createNote: (noteData: {
    title: string;
    content: string;
    imageUrl: string | null;
    isStarred?: boolean;
    isShared?: boolean;
    tags?: string[];
  }) => Promise<{ success: boolean; note: OptimisticNote; offline?: boolean }>;
  updateNote: (noteId: string, updates: {
    title?: string;
    content?: string;
    imageUrl?: string | null;
    isStarred?: boolean;
    isShared?: boolean;
  }) => Promise<{ success: boolean; note?: OptimisticNote; error?: any }>;
  deleteNote: (noteId: string) => Promise<{ success: boolean; error?: any }>;
  refreshNotes: () => Promise<void>;
  setNotes: React.Dispatch<React.SetStateAction<OptimisticNote[]>>;
}

const OptimisticNotesContext = createContext<OptimisticNotesContextType | null>(null);

export function OptimisticNotesProvider({ children, initialNotes }: { children: ReactNode; initialNotes: OptimisticNote[] }) {
  const [notes, setNotes] = useState<OptimisticNote[]>(initialNotes);
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : true);

  // Initialize offline storage and sync service
  useEffect(() => {
    const initOfflineStorage = async () => {
      try {
        await offlineStorage.init();
        
        // Only register service worker if syncService exists (client-side only)
        if (syncService) {
          await syncService.registerServiceWorker();
        }
        
        // Load offline notes from IndexedDB
        const offlineNotes = await offlineStorage.getOfflineNotes();
        const optimisticOfflineNotes = offlineNotes.map(note => ({
          ...note,
          isTemp: true,
          tags: note.tags.map(tagName => ({
            tag: { id: `temp-${tagName}`, name: tagName }
          }))
        }));
        
        // --- Load offline notes from localStorage fallback ---
        const localNotes = localStorageOfflineNotes.get();
        const optimisticLocalNotes = localNotes.map(note => ({
          ...note,
          isTemp: true,
          tags: note.tags.map(tagName => ({
            tag: { id: `temp-${tagName}`, name: tagName }
          }))
        }));
        // --- end localStorage loading ---
        
        // Combine all offline notes and add to UI
        const allOfflineNotes = [...optimisticOfflineNotes, ...optimisticLocalNotes];
        setNotes(prev => [...allOfflineNotes, ...prev]);
      } catch (error) {
        console.error('Failed to initialize offline storage:', error);
      }
    };

    initOfflineStorage();
  }, []);

  // Listen for online/offline status
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Listen for note sync events
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleNoteSynced = (event: CustomEvent) => {
      const { noteId } = event.detail;
      
      setNotes(prev => prev.filter(note => note.id !== noteId));
      
      // Refresh notes from server
      window.dispatchEvent(new Event('noteCreated'));
    };

    window.addEventListener('noteSynced', handleNoteSynced as EventListener);
    
    return () => {
      window.removeEventListener('noteSynced', handleNoteSynced as EventListener);
    };
  }, []);

  // Create note with optimistic UI
  const createNote = useCallback(async (noteData: {
    title: string;
    content: string;
    imageUrl: string | null;
    isStarred?: boolean;
    isShared?: boolean;
    tags?: string[];
  }) => {
    const tempId = `temp-${Date.now()}`;
    const now = new Date().toISOString();

    // Create optimistic note
    const optimisticNote: OptimisticNote = {
      id: tempId,
      title: noteData.title,
      content: noteData.content,
      imageUrl: noteData.imageUrl,
      createdAt: now,
      updatedAt: now,
      isStarred: noteData.isStarred || false,
      isShared: noteData.isShared || false,
      isTemp: true,
      syncStatus: 'pending',
      tags: (noteData.tags || []).map(tagName => ({
        tag: { id: `temp-${tagName}`, name: tagName }
      }))
    };

    // Add to UI immediately (optimistic update)
    setNotes(prev => [optimisticNote, ...prev]);

    try {
      // Try to save to server
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData),
      });

      if (response.ok) {
        const savedNote = await response.json();
        
        // Replace optimistic note with real note
        setNotes(prev => prev.map(note => 
          note.id === tempId ? { ...savedNote, syncStatus: 'synced' } : note
        ));
        
        return { success: true, note: savedNote };
      } else {
        throw new Error('Failed to save note');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      
      // Save to offline storage
      const offlineNote: Omit<OfflineNote, 'syncStatus' | 'retryCount'> = {
        id: tempId,
        title: noteData.title,
        content: noteData.content,
        imageUrl: noteData.imageUrl,
        isStarred: noteData.isStarred || false,
        isShared: noteData.isShared || false,
        tags: noteData.tags || [],
        createdAt: now,
        updatedAt: now
      };

      await offlineStorage.saveOfflineNote(offlineNote);
      // --- Also save to localStorage as backup ---
      try {
        localStorageOfflineNotes.save({
          ...offlineNote,
          syncStatus: 'pending',
          retryCount: 0
        });
      } catch (e) {
        // Ignore localStorage errors
      }
      // --- end localStorage backup ---
      // Update note status to pending
      setNotes(prev => prev.map(note => 
        note.id === tempId ? { ...note, syncStatus: 'pending' } : note
      ));

      return { success: false, note: optimisticNote, offline: true };
    }
  }, []);

  // Update note with optimistic UI
  const updateNote = useCallback(async (noteId: string, updates: {
    title?: string;
    content?: string;
    imageUrl?: string | null;
    isStarred?: boolean;
    isShared?: boolean;
  }) => {
    // Optimistically update the note
    setNotes(prev => prev.map(note => 
      note.id === noteId 
        ? { ...note, ...updates, updatedAt: new Date().toISOString() }
        : note
    ));

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update note');
      }

      const updatedNote = await response.json();
      
      // Replace with server response
      setNotes(prev => prev.map(note => 
        note.id === noteId ? { ...updatedNote, syncStatus: 'synced' } : note
      ));

      return { success: true, note: updatedNote };
    } catch (error) {
      console.error('Error updating note:', error);
      
      // Revert optimistic update on error
      setNotes(prev => prev.map(note => 
        note.id === noteId 
          ? { ...note, ...updates, syncStatus: 'failed' }
          : note
      ));

      return { success: false, error };
    }
  }, []);

  // Delete note with optimistic UI
  const deleteNote = useCallback(async (noteId: string) => {
    // Check if this is a temporary note
    const isTempNote = noteId.startsWith('temp-');
    
    // Get the note before deletion to check its sync status
    const noteToDelete = notes.find(note => note.id === noteId);
    const isNoteSynced = noteToDelete?.syncStatus === 'synced';
    
    // Optimistically remove the note
    setNotes(prev => prev.filter(note => note.id !== noteId));

    // Always clean up from localStorage regardless of note type
    try {
      localStorageOfflineNotes.remove(noteId);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }

    // If it's a temporary note, also remove from IndexedDB
    if (isTempNote) {
      try {
        // Remove from IndexedDB
        await offlineStorage.removeOfflineNote(noteId);
        return { success: true };
      } catch (error) {
        console.error('Error removing temporary note:', error);
        // Revert optimistic update on error
        window.dispatchEvent(new Event('noteCreated'));
        return { success: false, error };
      }
    }

    // For real notes, check if they're synced
    if (isNoteSynced) {
      // Note is synced - try to delete from server
      try {
        const response = await fetch(`/api/notes/${noteId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete note');
        }

        // Successfully deleted from server - ensure it's removed from local storage
        try {
          await offlineStorage.removeOfflineNote(noteId);
        } catch (error) {
          console.error('Error removing synced note from offline storage:', error);
        }

        return { success: true };
      } catch (error) {
        console.error('Error deleting synced note:', error);
        
        // Revert optimistic update on error
        window.dispatchEvent(new Event('noteCreated'));
        
        return { success: false, error };
      }
    } else {
      // Note is not synced - reverse all sync operations to avoid inconsistencies
      try {
        // Remove from IndexedDB offline storage
        await offlineStorage.removeOfflineNote(noteId);
        
        // Remove from localStorage
        localStorageOfflineNotes.remove(noteId);
        
        // If the note was in a syncing state, we need to clean up any pending sync operations
        if (noteToDelete?.syncStatus === 'syncing') {
          // Cancel any ongoing sync operations for this note
          // This is handled by the sync service automatically when the note is removed
          console.log('Cancelled sync operation for note:', noteId);
        }
        
        return { success: true };
      } catch (error) {
        console.error('Error removing unsynced note:', error);
        
        // Even if there's an error removing from storage, we still want to proceed
        // with the deletion since the user intended to delete it
        return { success: true };
      }
    }
  }, [notes]);

  // Refresh notes from server
  const refreshNotes = useCallback(async () => {
    try {
      const response = await fetch('/api/notes');
      if (response.ok) {
        const serverNotes = await response.json();
        setNotes(serverNotes.map((note: any) => ({ ...note, syncStatus: 'synced' })));
      }
    } catch (error) {
      console.error('Error refreshing notes:', error);
    }
  }, []);

  // Get notes with sync status
  const getNotesWithStatus = useCallback(() => {
    return notes.map(note => ({
      ...note,
      isOffline: note.syncStatus === 'pending' || note.syncStatus === 'failed',
      isSyncing: note.syncStatus === 'syncing'
    }));
  }, [notes]);

  const contextValue: OptimisticNotesContextType = {
    notes: getNotesWithStatus(),
    isOnline,
    createNote,
    updateNote,
    deleteNote,
    refreshNotes,
    setNotes
  };

  return (
    <OptimisticNotesContext.Provider value={contextValue}>
      {children}
    </OptimisticNotesContext.Provider>
  );
}

export function useOptimisticNotes(initialNotes?: OptimisticNote[]) {
  const context = useContext(OptimisticNotesContext);
  
  if (!context) {
    throw new Error('useOptimisticNotes must be used within an OptimisticNotesProvider');
  }
  
  return context;
}