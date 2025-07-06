export interface OfflineNote {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  isStarred: boolean;
  isShared: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed';
  retryCount: number;
}

class OfflineStorageService {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'SwiftyQuillDB';
  private readonly DB_VERSION = 1;
  private readonly STORE_NAME = 'offlineNotes';

  async init() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
          store.createIndex('syncStatus', 'syncStatus', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });
  }

  async saveOfflineNote(note: Omit<OfflineNote, 'syncStatus' | 'retryCount'>): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      
      const offlineNote: OfflineNote = {
        ...note,
        syncStatus: 'pending',
        retryCount: 0
      };

      const request = store.put(offlineNote);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getOfflineNotes(): Promise<OfflineNote[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingNotes(): Promise<OfflineNote[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const index = store.index('syncStatus');
      const request = index.getAll('pending');

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async removeOfflineNote(noteId: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.delete(noteId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteOfflineNote(noteId: string): Promise<void> {
    if (!this.db) await this.init();

    const note = await this.getOfflineNote(noteId);

    if (!note) {
      console.warn(`Attempted to delete non-existent offline note: ${noteId}`);
      return;
    }

    switch (note.syncStatus) {
      case 'pending':
      case 'failed':
        console.log(`Deleting local note (status: ${note.syncStatus}): ${noteId}`);
        return this.removeOfflineNote(noteId);
      case 'synced':
        console.warn(`Deletion of synced note must be done via server call: ${noteId}`);
        throw new Error('Synced notes can only be deleted via the server.');
      case 'syncing':
        console.warn(`Cannot delete note while syncing: ${noteId}`);
        throw new Error('Cannot delete note while syncing.');
      default:
        throw new Error(`Unknown sync status: ${note.syncStatus}`);
    }
  }

  async updateNoteStatus(noteId: string, status: OfflineNote['syncStatus'], retryCount?: number): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      
      const getRequest = store.get(noteId);
      
      getRequest.onsuccess = () => {
        const note = getRequest.result;
        if (note) {
          note.syncStatus = status;
          if (retryCount !== undefined) {
            note.retryCount = retryCount;
          }
          
          const putRequest = store.put(note);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async clearAllOfflineNotes(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getOfflineNote(noteId: string): Promise<OfflineNote | null> {
    if (!this.db) await this.init();

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.get(noteId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
  }
}

export const offlineStorage = new OfflineStorageService();

// --- localStorage fallback helpers ---
const LOCAL_STORAGE_KEY = 'swiftyquill_offline_notes';

function getLocalStorageNotes(): OfflineNote[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveNoteToLocalStorage(note: OfflineNote) {
  if (typeof window === 'undefined') return;
  
  try {
    const notes = getLocalStorageNotes();
    notes.push(note);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

function removeNoteFromLocalStorage(noteId: string) {
  if (typeof window === 'undefined') return;
  
  try {
    const notes = getLocalStorageNotes().filter(n => n.id !== noteId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
  }
}

function clearLocalStorageNotes() {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }
}

export const localStorageOfflineNotes = {
  get: getLocalStorageNotes,
  save: saveNoteToLocalStorage,
  remove: removeNoteFromLocalStorage,
  clear: clearLocalStorageNotes,
};

// Debug utility to check localStorage state
export function debugLocalStorage() {
  if (typeof window === 'undefined') return null;
  
  try {
    const notes = getLocalStorageNotes();
    console.log('localStorage notes:', notes);
    return notes;
  } catch (error) {
    console.error('Error reading localStorage:', error);
    return null;
  }
}

// Sync service for background sync
export class SyncService {
  private isOnline = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private retryDelays = [1000, 2000, 5000, 10000, 30000]; // Exponential backoff

  constructor() {
    // Only initialize if we're in the browser
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;
      this.setupEventListeners();
      this.startPeriodicSync();
    }
  }

  private setupEventListeners() {
    if (typeof window === 'undefined') return;
    
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncOfflineNotes();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Listen for service worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'NOTE_SYNCED') {
          this.handleNoteSynced(event.data.noteId);
        }
      });
    }
  }

  private startPeriodicSync() {
    if (typeof window === 'undefined') return;
    
    // Sync every 2 minutes when online
    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.syncOfflineNotes();
      }
    }, 2 * 60 * 1000);
  }

  async syncOfflineNotes() {
    if (!this.isOnline || typeof window === 'undefined') return;

    try {
      // Sync notes from IndexedDB as before
      const pendingNotes = await offlineStorage.getPendingNotes();
      for (const note of pendingNotes) {
        await this.syncNote(note);
      }

      // --- Sync notes from localStorage fallback ---
      const localNotes = localStorageOfflineNotes.get();
      for (const note of localNotes) {
        try {
          // Check if the note still exists in localStorage before syncing
          const currentLocalNotes = localStorageOfflineNotes.get();
          const noteStillExists = currentLocalNotes.some(n => n.id === note.id);
          if (!noteStillExists) {
            // Note was deleted from localStorage during sync, skip it
            console.log('Note was deleted from localStorage during sync, skipping:', note.id);
            continue;
          }

          const response = await fetch('/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
            // Check again if the note still exists before removing it
            const finalLocalNotes = localStorageOfflineNotes.get();
            const noteStillExistsAfterSync = finalLocalNotes.some(n => n.id === note.id);
            if (noteStillExistsAfterSync) {
              localStorageOfflineNotes.remove(note.id);
              this.notifyNoteSynced(note.id);
            } else {
              console.log('Note was deleted from localStorage after sync, skipping removal:', note.id);
            }
          }
        } catch (error) {
          // If still fails, keep in localStorage
        }
      }
      // --- end localStorage sync ---
    } catch (error) {
      console.error('Error syncing offline notes:', error);
    }
  }

  private async syncNote(note: OfflineNote) {
    try {
      // Check if the note still exists in offline storage before proceeding
      const existingNote = await offlineStorage.getOfflineNote(note.id);
      if (!existingNote) {
        // Note was deleted while syncing, abort the sync operation
        console.log('Note was deleted during sync, aborting:', note.id);
        return;
      }

      // Update status to syncing
      await offlineStorage.updateNoteStatus(note.id, 'syncing');

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
        // Check again if the note still exists before removing it
        const noteStillExists = await offlineStorage.getOfflineNote(note.id);
        if (!noteStillExists) {
          // Note was deleted during sync, don't proceed with removal
          console.log('Note was deleted during sync, skipping removal:', note.id);
          return;
        }

        // Success - remove from offline storage
        await offlineStorage.removeOfflineNote(note.id);
        
        // Also remove from localStorage if it exists there
        try {
          localStorageOfflineNotes.remove(note.id);
        } catch (error) {
          console.error('Failed to remove from localStorage:', error);
        }
        
        // Notify UI
        this.notifyNoteSynced(note.id);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to sync note:', error);
      
      // Check if the note still exists before updating status
      const noteStillExists = await offlineStorage.getOfflineNote(note.id);
      if (!noteStillExists) {
        // Note was deleted during sync, don't update status
        console.log('Note was deleted during sync, skipping status update:', note.id);
        return;
      }
      
      const newRetryCount = note.retryCount + 1;
      const maxRetries = this.retryDelays.length;
      
      if (newRetryCount >= maxRetries) {
        // Max retries reached, mark as failed
        await offlineStorage.updateNoteStatus(note.id, 'failed', newRetryCount);
      } else {
        // Schedule retry with exponential backoff
        await offlineStorage.updateNoteStatus(note.id, 'pending', newRetryCount);
        setTimeout(() => this.syncNote(note), this.retryDelays[newRetryCount - 1]);
      }
    }
  }

  private notifyNoteSynced(noteId: string) {
    // Dispatch custom event for UI updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('noteSynced', { detail: { noteId } }));
    }
  }

  private handleNoteSynced(noteId: string) {
    this.notifyNoteSynced(noteId);
  }

  // Register service worker for background sync
  async registerServiceWorker() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }
    
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      // Register for background sync if supported
      if ('sync' in registration) {
        await (registration as any).sync.register('sync-notes');
      }
      
      return registration;
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  }

  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }
}

// Create sync service only on the client side
export const syncService = typeof window !== 'undefined' ? new SyncService() : null; 