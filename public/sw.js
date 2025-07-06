const CACHE_NAME = 'swiftyquill-v1';
const OFFLINE_CACHE = 'swiftyquill-offline-v1';

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/notes',
        '/login',
        '/signup',
        '/api/notes',
        '/api/tags'
      ]);
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    // Handle API requests
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful API responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached response if available
          return caches.match(event.request);
        })
    );
  } else {
    // Handle static assets
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});

// Background sync for offline notes
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-notes') {
    event.waitUntil(syncOfflineNotes());
  }
});

// Sync offline notes when back online
async function syncOfflineNotes() {
  try {
    // Sync notes from IndexedDB
    const offlineNotes = await getOfflineNotes();
    
    for (const note of offlineNotes) {
      try {
        // Check if the note still exists in IndexedDB before syncing
        const noteStillExists = await checkNoteExists(note.id);
        if (!noteStillExists) {
          // Note was deleted during sync, skip it
          console.log('Note was deleted during sync, skipping:', note.id);
          continue;
        }

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
          const noteStillExistsAfterSync = await checkNoteExists(note.id);
          if (noteStillExistsAfterSync) {
            // Remove from offline storage on successful sync
            await removeOfflineNote(note.id);
            
            // Also remove from localStorage if it exists there
            try {
              const localNotes = JSON.parse(localStorage.getItem('swiftyquill_offline_notes') || '[]');
              const filteredNotes = localNotes.filter(n => n.id !== note.id);
              localStorage.setItem('swiftyquill_offline_notes', JSON.stringify(filteredNotes));
            } catch (error) {
              console.error('Failed to remove from localStorage:', error);
            }
            
            // Notify the main thread
            self.clients.matchAll().then((clients) => {
              clients.forEach((client) => {
                client.postMessage({
                  type: 'NOTE_SYNCED',
                  noteId: note.id
                });
              });
            });
          } else {
            console.log('Note was deleted during sync, skipping removal:', note.id);
          }
        }
      } catch (error) {
        console.error('Failed to sync note:', error);
      }
    }


  } catch (error) {
    console.error('Error syncing offline notes:', error);
  }
}

// Get offline notes from IndexedDB
async function getOfflineNotes() {
  return new Promise((resolve) => {
    const request = indexedDB.open('SwiftyQuillDB', 1);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['offlineNotes'], 'readonly');
      const store = transaction.objectStore('offlineNotes');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result);
      };
    };
    
    request.onerror = () => {
      resolve([]);
    };
  });
}

// Remove offline note from IndexedDB
async function removeOfflineNote(noteId) {
  return new Promise((resolve) => {
    const request = indexedDB.open('SwiftyQuillDB', 1);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['offlineNotes'], 'readwrite');
      const store = transaction.objectStore('offlineNotes');
      const deleteRequest = store.delete(noteId);
      
      deleteRequest.onsuccess = () => {
        resolve();
      };
    };
    
    request.onerror = () => {
      resolve();
    };
  });
}

// Check if a note still exists in IndexedDB
async function checkNoteExists(noteId) {
  return new Promise((resolve) => {
    const request = indexedDB.open('SwiftyQuillDB', 1);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['offlineNotes'], 'readonly');
      const store = transaction.objectStore('offlineNotes');
      const getRequest = store.get(noteId);
      
      getRequest.onsuccess = () => {
        resolve(!!getRequest.result);
      };
      
      getRequest.onerror = () => {
        resolve(false);
      };
    };
    
    request.onerror = () => {
      resolve(false);
    };
  });
}


// Handle push notifications (for future use)
self.addEventListener('push', (event) => {
  const options = {
    body: 'You have unsynced notes!',
    icon: '/swiftyquill.png',
    badge: '/swiftyquill.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('SwiftyQuill', options)
  );
}); 