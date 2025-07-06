"use client"

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registered successfully:', registration);
          
          // Register for background sync if supported
          if ('sync' in window.ServiceWorkerRegistration.prototype) {
            await registration.sync.register('sync-notes');
            console.log('Background sync registered');
          }
        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      }
    };

    registerServiceWorker();
  }, []);

  return null; // This component doesn't render anything
} 