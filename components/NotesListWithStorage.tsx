"use client"

import { useEffect, useState } from 'react'
import NotesList from './NotesList'

interface Note {
  id: string
  title: string
  content: string
  imageUrl: string | null
  createdAt: string
  updatedAt: string
  isTemp?: boolean
  tags?: any[]
}

interface NotesListWithStorageProps {
  initialNotes: Note[]
  currentTag: string
}

export default function NotesListWithStorage({ initialNotes, currentTag }: NotesListWithStorageProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes)

  useEffect(() => {
    // Check for temporary note in local storage
    const tempNote = localStorage.getItem('tempNote')
    if (tempNote) {
      const parsedNote = JSON.parse(tempNote)
      setNotes(prevNotes => [parsedNote, ...prevNotes])
    }

    // Listen for note creation events
    const handleNoteCreated = () => {
      // Clear local storage when a note is successfully created
      localStorage.removeItem('tempNote')
      // Refresh the page to get the latest notes from the server
      window.location.reload()
    }

    window.addEventListener('noteCreated', handleNoteCreated)
    return () => window.removeEventListener('noteCreated', handleNoteCreated)
  }, [])

  return <NotesList initialNotes={notes} currentTag={currentTag} />
} 