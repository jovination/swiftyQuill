"use client"; // Add this line

import { useState, useEffect, useCallback, createContext, useContext, ReactNode, useMemo } from 'react';
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
    tags?: string[];
  }) => Promise<{ success: boolean; note?: OptimisticNote; error?: any }>;
  deleteNote: (noteId: string) => Promise<{ success: boolean; error?: any; message?: string }>;
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
        
        const allNotesMap = new Map<string, OptimisticNote>();

        // 1. Add all initialNotes (server notes) to the map. These are the primary source.
        initialNotes.forEach(note => {
          allNotesMap.set(note.id, { ...note, syncStatus: 'synced', isTemp: false, isOffline: false });
        });

        // 2. Add offline notes. If an offline note has the same ID as a server note,
        //    and its syncStatus is NOT 'synced' (e.g., 'pending', 'failed', 'syncing'),
        //    it should override the server note to show its current local state.
        //    If the offline note's ID is 'temp-something', it's always a new local note.
        //    If an offline note with a real ID has 'synced' status, it's a stale duplicate, so the server version wins.

        const offlineNotes = await offlineStorage.getOfflineNotes();
        const localStorageNotes = localStorageOfflineNotes.get();

        [...offlineNotes, ...localStorageNotes].forEach(note => {
          const existingNote = allNotesMap.get(note.id);

          if (note.id.startsWith('temp-') || (existingNote && existingNote.syncStatus !== 'synced') || !existingNote) {
            // This is a new offline note (temp ID), or an offline note that represents a local unsynced change
            // (e.g., pending, failed, or a synced note that was locally modified before a pull).
            // Or there's no existing server note with this ID.
            allNotesMap.set(note.id, {
              ...note,
              isTemp: note.syncStatus !== 'synced',
              isOffline: true,
              tags: note.tags.map(tagName => ({
                tag: { id: `temp-${tagName}`, name: tagName }
              }))
            });
          }
        });

        setNotes(Array.from(allNotesMap.values()));
      } catch (error) {
        console.error('Failed to initialize offline storage:', error);
      }
    };

    initOfflineStorage();
  }, [initialNotes]);

  const refreshNotes = useCallback(async () => {
    console.log('Refreshing notes...');
    try {
      const response = await fetch('/api/notes');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const serverNotes: OptimisticNote[] = await response.json();

      // Get offline notes, excluding those marked for deletion or already synced
      const offlineNotes = await offlineStorage.getOfflineNotes();
      const localStorageNotes = localStorageOfflineNotes.get();

      const allNotesMap = new Map<string, OptimisticNote>();

      // 1. Add all server notes to the map.
      serverNotes.forEach(note => {
        allNotesMap.set(note.id, { ...note, syncStatus: 'synced', isTemp: false, isOffline: false });
      });

      // 2. Add offline notes. If an offline note has the same ID as a server note,
      //    and its syncStatus is NOT 'synced' (e.g., 'pending', 'failed', 'syncing'),
      //    it should override the server note to show its current local state.
      //    If the offline note's ID is 'temp-something', it's always a new local note.
      //    If an offline note with a real ID has 'synced' status, it's a stale duplicate, so the server version wins.
      [...offlineNotes, ...localStorageNotes].forEach(note => {
        const existingNote = allNotesMap.get(note.id);
        if (note.id.startsWith('temp-') || (existingNote && existingNote.syncStatus !== 'synced') || !existingNote) {
          allNotesMap.set(note.id, {
            ...note,
            isTemp: note.syncStatus !== 'synced',
            isOffline: true,
            tags: note.tags.map(tagName => ({
              tag: { id: `temp-${tagName}`, name: tagName }
            }))
          });
        }
      });

      setNotes(Array.from(allNotesMap.values()));
      console.log('Notes refreshed.', Array.from(allNotesMap.values()).length, 'notes');

    } catch (error) {
      console.error('Failed to refresh notes:', error);
    }
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
      
      // Remove the optimistically added note and refresh from server
      setNotes(prev => prev.filter(note => note.id !== noteId));
      refreshNotes(); // Fetch the latest state from the server
    };

    window.addEventListener('noteSynced', handleNoteSynced as EventListener);
    
    return () => {
      window.removeEventListener('noteSynced', handleNoteSynced as EventListener);
    };
  }, [refreshNotes]);

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
      isOffline: true,
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
          note.id === tempId ? { ...savedNote, syncStatus: 'synced', isTemp: false, isOffline: false } : note
        ));
        
        return { success: true, note: savedNote };
      } else {
        throw new Error('Failed to save note');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      
      // Save to offline storage with pending status
      const offlineNote: Omit<OfflineNote, 'syncStatus' | 'retryCount'> = {
        id: tempId,
        title: noteData.title,
        content: noteData.content,
        imageUrl: noteData.imageUrl,
        isStarred: noteData.isStarred || false,
        isShared: noteData.isShared || false,
        tags: noteData.tags || [],
        createdAt: now,
        updatedAt: now,
      };
      await offlineStorage.saveOfflineNote(offlineNote);
      
      // Update optimistic note to reflect offline status
      setNotes(prev => prev.map(note => 
        note.id === tempId ? { ...note, syncStatus: 'pending', isOffline: true } : note
      ));

      return { success: false, offline: true, note: optimisticNote };
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
    setNotes(prevNotes =>
      prevNotes.map(note =>
        note.id === noteId ? { ...note, ...updates } : note
      )
    );

    try {
      const response = await fetch(`/api/notes/${noteId}` , {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update note');
      }

      const updatedNote = await response.json();
      return { success: true, note: updatedNote };
    } catch (error) {
      console.error('Error updating note:', error);
      // Revert optimistic update on error
      refreshNotes(); // Re-fetch notes to revert to actual state
      return { success: false, error: error };
    }
  }, [refreshNotes]);

  // Delete note with sync status logic
  const deleteNote = useCallback(async (noteId: string) => {
    const noteToDelete = notes.find(note => note.id === noteId);

    if (!noteToDelete) {
      console.warn(`Attempted to delete non-existent note: ${noteId}`);
      return { success: false, message: 'Note not found.' };
    }

    // Optimistically remove the note from the UI
    setNotes(prev => prev.filter(note => note.id !== noteId));

    try {
      switch (noteToDelete.syncStatus) {
        case 'pending':
        case 'failed':
          // Delete locally
          await offlineStorage.deleteOfflineNote(noteId);
          localStorageOfflineNotes.remove(noteId); // Ensure localStorage fallback is also cleared
          return { success: true, message: 'Note deleted locally.' };
        case 'synced':
          // Delete via server API
          const response = await fetch(`/api/notes/${noteId}`, {
            method: 'DELETE',
          });
          if (!response.ok) {
            throw new Error('Failed to delete synced note from server.');
          }
          return { success: true, message: 'Note deleted from server.' };
        case 'syncing':
          // Disallow deletion during syncing and revert UI
          setNotes(prev => [noteToDelete, ...prev]); // Revert optimistic update
          return { success: false, message: 'Cannot delete note while syncing.' };
        default:
          setNotes(prev => [noteToDelete, ...prev]); // Revert optimistic update
          return { success: false, message: `Unknown sync status: ${noteToDelete.syncStatus}` };
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      setNotes(prev => [noteToDelete, ...prev]); // Revert optimistic update on error
      return { success: false, error: error, message: 'Failed to delete note.' };
    }
  }, [notes, refreshNotes]);

  const contextValue = useMemo(() => ({
    notes,
    isOnline,
    createNote,
    updateNote,
    deleteNote,
    refreshNotes,
    setNotes,
  }), [notes, isOnline, createNote, updateNote, deleteNote, refreshNotes]);

  return (
    <OptimisticNotesContext.Provider value={contextValue}>
      {children}
    </OptimisticNotesContext.Provider>
  );
}

export function useOptimisticNotes() {
  const context = useContext(OptimisticNotesContext);
  if (!context) {
    throw new Error('useOptimisticNotes must be used within an OptimisticNotesProvider');
  }
  return context;
}