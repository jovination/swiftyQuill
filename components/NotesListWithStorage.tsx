"use client"

import { useEffect, useState } from 'react'
import NotesList from './NotesList'
import { useOptimisticNotes } from '@/lib/use-optimistic-notes'
import { NetworkStatusIndicator, OfflineNotesCounter } from './SyncStatusIndicator'
import OfflineNotesManager from './OfflineNotesManager'
import OfflineNotesNotification from './OfflineNotesNotification'
import KeyboardShortcuts from './KeyboardShortcuts'

interface NotesListWithStorageProps {
  currentTag: string
}

export default function NotesListWithStorage({ currentTag }: NotesListWithStorageProps) {
  const { notes, isOnline, refreshNotes } = useOptimisticNotes()
  const [isOfflineManagerOpen, setIsOfflineManagerOpen] = useState(false)
  
  // Count offline notes
  const offlineCount = notes.filter(note => note.isOffline).length

  useEffect(() => {
    // Listen for note creation events
    const handleNoteCreated = () => {
      refreshNotes()
    }

    window.addEventListener('noteCreated', handleNoteCreated)
    return () => window.removeEventListener('noteCreated', handleNoteCreated)
  }, [refreshNotes])

  const handleManageOfflineNotes = () => {
    setIsOfflineManagerOpen(true)
  }

  return (
    <div className="max-w-3xl w-full space-y-4">
      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts onOpenOfflineManager={handleManageOfflineNotes} />
      
      {/* Offline Notes Notification */}
      <OfflineNotesNotification onManageClick={handleManageOfflineNotes} />
      
      {/* Network status and offline counter */}
      <div className="flex items-center justify-between">
        <NetworkStatusIndicator isOnline={isOnline} />
        <OfflineNotesCounter 
          count={offlineCount} 
          onManageClick={offlineCount > 0 ? handleManageOfflineNotes : undefined}
        />
      </div>
      
      <NotesList initialNotes={notes} currentTag={currentTag} />
      
      {/* Offline Notes Manager Modal */}
      <OfflineNotesManager 
        isOpen={isOfflineManagerOpen}
        onClose={() => setIsOfflineManagerOpen(false)}
      />
    </div>
  )
} 