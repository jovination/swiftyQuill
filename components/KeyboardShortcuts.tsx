"use client"

import { useEffect } from 'react';

interface KeyboardShortcutsProps {
  onOpenOfflineManager?: () => void;
}

export default function KeyboardShortcuts({ onOpenOfflineManager }: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if user is typing in an input field
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        return;
      }

      // Ctrl/Cmd + Shift + O to open offline notes manager
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'O') {
        event.preventDefault();
        onOpenOfflineManager?.();
      }

      // Ctrl/Cmd + K for search (placeholder for future implementation)
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        // TODO: Implement search functionality
        console.log('Search shortcut pressed');
      }

      // Ctrl/Cmd + N for new note (placeholder for future implementation)
      if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        // TODO: Implement new note functionality
        console.log('New note shortcut pressed');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onOpenOfflineManager]);

  return null; // This component doesn't render anything
} 