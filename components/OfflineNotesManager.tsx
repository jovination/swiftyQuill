"use client"

import { useState, useEffect } from 'react';
import { IoCloudOfflineOutline, IoCloudUploadOutline, IoTrashOutline, IoCloseOutline } from "react-icons/io5";
import { ImSpinner8 } from "react-icons/im";
import { toast } from "sonner";
import { offlineStorage, localStorageOfflineNotes } from '@/lib/offline-storage';
import { OfflineNote } from '@/lib/offline-storage';

interface OfflineNotesManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OfflineNotesManager({ isOpen, onClose }: OfflineNotesManagerProps) {
  const [offlineNotes, setOfflineNotes] = useState<OfflineNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [syncingNotes, setSyncingNotes] = useState<Set<string>>(new Set());
  const [deletingNotes, setDeletingNotes] = useState<Set<string>>(new Set());

  // Load offline notes
  useEffect(() => {
    if (isOpen) {
      loadOfflineNotes();
    }
  }, [isOpen]);

  const loadOfflineNotes = async () => {
    try {
      // Get notes from IndexedDB
      const indexedDBNotes = await offlineStorage.getOfflineNotes();
      
      // Get notes from localStorage
      const localStorageNotes = localStorageOfflineNotes.get();
      
      // Combine and deduplicate (IndexedDB takes precedence)
      const allOfflineNotes = [...indexedDBNotes];
      localStorageNotes.forEach(localNote => {
        if (!allOfflineNotes.some(dbNote => dbNote.id === localNote.id)) {
          allOfflineNotes.push(localNote);
        }
      });
      
      setOfflineNotes(allOfflineNotes);
    } catch (error) {
      console.error('Error loading offline notes:', error);
      toast.error('Failed to load offline notes');
    }
  };

  const syncNote = async (note: OfflineNote) => {
    setSyncingNotes(prev => new Set(prev).add(note.id));
    
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: note.title,
          content: note.content,
          imageUrl: note.imageUrl,
          isStarred: note.isStarred,
          isShared: note.isShared,
          tags: note.tags
        }),
      });

      if (response.ok) {
        // Remove from both storages
        await offlineStorage.removeOfflineNote(note.id);
        localStorageOfflineNotes.remove(note.id);
        
        // Update local state
        setOfflineNotes(prev => prev.filter(n => n.id !== note.id));
        
        toast.success(`"${note.title}" synced successfully`);
        
        // Notify other components
        window.dispatchEvent(new CustomEvent('noteSynced', { detail: { noteId: note.id } }));
      } else {
        throw new Error('Failed to sync note');
      }
    } catch (error) {
      console.error('Error syncing note:', error);
      toast.error(`Failed to sync "${note.title}"`);
    } finally {
      setSyncingNotes(prev => {
        const newSet = new Set(prev);
        newSet.delete(note.id);
        return newSet;
      });
    }
  };

  const deleteNote = async (note: OfflineNote) => {
    setDeletingNotes(prev => new Set(prev).add(note.id));
    
    try {
      // Remove from both storages
      await offlineStorage.removeOfflineNote(note.id);
      localStorageOfflineNotes.remove(note.id);
      
      // Update local state
      setOfflineNotes(prev => prev.filter(n => n.id !== note.id));
      
      toast.success(`"${note.title}" deleted from local storage`);
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error(`Failed to delete "${note.title}"`);
    } finally {
      setDeletingNotes(prev => {
        const newSet = new Set(prev);
        newSet.delete(note.id);
        return newSet;
      });
    }
  };

  const syncAllNotes = async () => {
    setIsLoading(true);
    
    try {
      const notesToSync = [...offlineNotes];
      let successCount = 0;
      
      for (const note of notesToSync) {
        try {
          const response = await fetch('/api/notes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: note.title,
              content: note.content,
              imageUrl: note.imageUrl,
              isStarred: note.isStarred,
              isShared: note.isShared,
              tags: note.tags
            }),
          });

          if (response.ok) {
            await offlineStorage.removeOfflineNote(note.id);
            localStorageOfflineNotes.remove(note.id);
            successCount++;
            
            // Notify other components
            window.dispatchEvent(new CustomEvent('noteSynced', { detail: { noteId: note.id } }));
          }
        } catch (error) {
          console.error(`Failed to sync note ${note.id}:`, error);
        }
      }
      
      // Reload notes to update the list
      await loadOfflineNotes();
      
      if (successCount > 0) {
        toast.success(`${successCount} note${successCount > 1 ? 's' : ''} synced successfully`);
      }
      
      if (successCount < notesToSync.length) {
        toast.error(`${notesToSync.length - successCount} note${notesToSync.length - successCount > 1 ? 's' : ''} failed to sync`);
      }
    } catch (error) {
      console.error('Error syncing all notes:', error);
      toast.error('Failed to sync notes');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAllNotes = async () => {
    if (!confirm(`Are you sure you want to delete all ${offlineNotes.length} offline notes? This action cannot be undone.`)) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Remove all notes from both storages
      for (const note of offlineNotes) {
        await offlineStorage.removeOfflineNote(note.id);
        localStorageOfflineNotes.remove(note.id);
      }
      
      setOfflineNotes([]);
      toast.success(`All ${offlineNotes.length} offline notes deleted`);
    } catch (error) {
      console.error('Error deleting all notes:', error);
      toast.error('Failed to delete all notes');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusInfo = (status: OfflineNote['syncStatus']) => {
    switch (status) {
      case 'pending':
        return { color: 'text-orange-500', label: 'Pending' };
      case 'syncing':
        return { color: 'text-blue-500', label: 'Syncing' };
      case 'failed':
        return { color: 'text-red-500', label: 'Failed' };
      default:
        return { color: 'text-gray-500', label: 'Unknown' };
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <IoCloudOfflineOutline className="w-6 h-6 text-orange-500" />
            <div>
              <h2 className="text-xl font-semibold">Offline Notes Manager</h2>
              <p className="text-sm text-gray-600">
                {offlineNotes.length} note{offlineNotes.length !== 1 ? 's' : ''} stored locally
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <IoCloseOutline className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {offlineNotes.length === 0 ? (
            <div className="text-center py-8">
              <IoCloudOfflineOutline className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No offline notes found</p>
            </div>
          ) : (
            <div className="max-w-3xl w-full space-y-4">
              {/* Action buttons */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={syncAllNotes}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <ImSpinner8 className="w-4 h-4 animate-spin" />
                  ) : (
                    <IoCloudUploadOutline className="w-4 h-4" />
                  )}
                  Sync All
                </button>
                <button
                  onClick={deleteAllNotes}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <IoTrashOutline className="w-4 h-4" />
                  Delete All
                </button>
              </div>

              {/* Notes list */}
              <div className="space-y-3">
                {offlineNotes.map((note) => {
                  const statusInfo = getStatusInfo(note.syncStatus);
                  const isSyncing = syncingNotes.has(note.id);
                  const isDeleting = deletingNotes.has(note.id);
                  
                  return (
                    <div
                      key={note.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium text-gray-900 truncate">
                              {note.title || 'Untitled Note'}
                            </h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${statusInfo.color} bg-gray-100`}>
                              {statusInfo.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {note.content || 'No content'}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Created: {new Date(note.createdAt).toLocaleDateString()}</span>
                            <span>Updated: {new Date(note.updatedAt).toLocaleDateString()}</span>
                            {note.retryCount > 0 && (
                              <span>Retries: {note.retryCount}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => syncNote(note)}
                            disabled={isSyncing || isDeleting}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Sync to cloud"
                          >
                            {isSyncing ? (
                              <ImSpinner8 className="w-4 h-4 animate-spin" />
                            ) : (
                              <IoCloudUploadOutline className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => deleteNote(note)}
                            disabled={isSyncing || isDeleting}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Delete from local storage"
                          >
                            {isDeleting ? (
                              <ImSpinner8 className="w-4 h-4 animate-spin" />
                            ) : (
                              <IoTrashOutline className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            <p className="mb-2">
              <strong>What are offline notes?</strong>
            </p>
            <p className="mb-2">
              These are notes that were created while you were offline or when the server was unavailable. 
              They're stored locally on your device and can be safely synced to the cloud or deleted.
            </p>
            <p>
              <strong>Safe to delete:</strong> Deleting these notes only removes them from your local storage. 
              If they were successfully synced before, they'll still be available in the cloud.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 