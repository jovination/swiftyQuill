"use client"

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { toast } from 'sonner'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface NoteTag {
  tag: {
    id: string
    name: string
  }
}

export interface Note {
  id: string
  title: string
  content: string
  audioUrl?: string | null
  imageUrls?: string[]
  color?: string | null
  updatedAt: string
  createdAt?: string
  isStarred: boolean
  isShared: boolean
  tags: NoteTag[]
  /** Client-only flag: true while the API call hasn't resolved yet */
  isPending?: boolean
}

export interface Tag {
  id: string
  name: string
  isDefault: boolean
  /** Client-only flag for pending tags */
  isPending?: boolean
}

interface NotesContextValue {
  // State
  notes: Note[]
  tags: Tag[]

  // Notes mutations
  addNoteOptimistically: (note: Omit<Note, 'id' | 'updatedAt' | 'isStarred' | 'isShared' | 'tags'> & { audioUrl?: string | null, color?: string | null }) => void
  updateNoteOptimistically: (noteId: string, updates: Partial<Pick<Note, 'title' | 'content' | 'imageUrls' | 'isStarred' | 'isShared' | 'audioUrl' | 'color'>>) => void
  deleteNoteOptimistically: (noteId: string) => void
  addTagToNoteOptimistically: (noteId: string, tag: { id: string; name: string }) => void
  removeTagFromNoteOptimistically: (noteId: string, tagId: string) => void

  // Tags mutations
  addTagOptimistically: (name: string) => void
  deleteTagOptimistically: (tagId: string) => void

  // Direct state setters (for server-hydrated updates)
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>
  setTags: React.Dispatch<React.SetStateAction<Tag[]>>
}

const NotesContext = createContext<NotesContextValue | null>(null)

// ─── Provider ────────────────────────────────────────────────────────────────

interface NotesProviderProps {
  initialNotes: Note[]
  initialTags: Tag[]
  children: React.ReactNode
}

export function NotesProvider({ initialNotes, initialTags, children }: NotesProviderProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [tags, setTags] = useState<Tag[]>(initialTags)

  // ── Add Note Optimistically ──────────────────────────────────────────────

  const addNoteOptimistically = useCallback((noteData: Omit<Note, 'id' | 'updatedAt' | 'isStarred' | 'isShared' | 'tags'> & { audioUrl?: string | null, color?: string | null }) => {
    const tempId = `temp-${Date.now()}`
    const tempNote: Note = {
      id: tempId,
      title: noteData.title,
      content: noteData.content,
      audioUrl: noteData.audioUrl || null,
      imageUrls: noteData.imageUrls || [],
      color: noteData.color || null,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isStarred: false,
      isShared: false,
      tags: [],
      isPending: true,
    }

    // 1. Immediately add to UI
    setNotes(prev => [tempNote, ...prev])

    // 2. Fire API in background
    fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: noteData.title,
        content: noteData.content,
        imageUrls: noteData.imageUrls || [],
        audioUrl: noteData.audioUrl || null,
        color: noteData.color || null,
      }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to save note')
        const savedNote = await res.json()
        // 3. Replace temp note with real note from server
        setNotes(prev =>
          prev.map(n =>
            n.id === tempId
              ? {
                  ...savedNote,
                  updatedAt: savedNote.updatedAt ?? new Date().toISOString(),
                  isPending: false,
                }
              : n
          )
        )
        toast.success('Note saved')
      })
      .catch(() => {
        // 4. Rollback: remove temp note
        setNotes(prev => prev.filter(n => n.id !== tempId))
        toast.error('Failed to save note. Please try again.')
      })
  }, [])

  // ── Update Note Optimistically ───────────────────────────────────────────

  const updateNoteOptimistically = useCallback((noteId: string, updates: Partial<Pick<Note, 'title' | 'content' | 'imageUrls' | 'isStarred' | 'isShared' | 'audioUrl' | 'color'>>) => {
    // 1. Snapshot for rollback
    let originalNote: Note | undefined

    setNotes(prev => {
      originalNote = prev.find(n => n.id === noteId)
      return prev.map(n => 
        n.id === noteId 
          ? { ...n, ...updates, updatedAt: new Date().toISOString() } 
          : n
      )
    })

    // 2. Fire API in background
    fetch(`/api/notes/${noteId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to update note')
        toast.success('Note updated')
      })
      .catch(() => {
        // 3. Rollback
        if (originalNote) {
          setNotes(prev => prev.map(n => n.id === noteId ? originalNote! : n))
        }
        toast.error('Failed to update note')
      })
  }, [])

  // ── Delete Note Optimistically ───────────────────────────────────────────

  const deleteNoteOptimistically = useCallback((noteId: string) => {
    // 1. Snapshot for rollback
    let removedNote: Note | undefined

    setNotes(prev => {
      removedNote = prev.find(n => n.id === noteId)
      return prev.filter(n => n.id !== noteId)
    })

    // 2. Fire API in background
    fetch(`/api/notes/${noteId}`, { method: 'DELETE' })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to delete note')
        toast.success('Note deleted')
      })
      .catch(() => {
        // 3. Rollback: re-insert note at original position
        if (removedNote) {
          setNotes(prev => {
            // Re-insert in order by updatedAt desc
            const updated = [...prev, removedNote!]
            updated.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            return updated
          })
        }
        toast.error('Failed to delete note')
      })
  }, [])

  // ── Add Tag to Note Optimistically ───────────────────────────────────────

  const addTagToNoteOptimistically = useCallback((noteId: string, tag: { id: string; name: string }) => {
    // 1. Immediately add tag to note
    setNotes(prev =>
      prev.map(note =>
        note.id === noteId
          ? { ...note, tags: [...note.tags, { tag }] }
          : note
      )
    )

    // 2. Fire API
    fetch(`/api/notes/${noteId}/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tagId: tag.id }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to add tag')
        toast.success('Tag added')
      })
      .catch(() => {
        // 3. Rollback
        setNotes(prev =>
          prev.map(note =>
            note.id === noteId
              ? { ...note, tags: note.tags.filter(t => t.tag.id !== tag.id) }
              : note
          )
        )
        toast.error('Failed to add tag')
      })
  }, [])

  // ── Remove Tag from Note Optimistically ──────────────────────────────────

  const removeTagFromNoteOptimistically = useCallback((noteId: string, tagId: string) => {
    // 1. Snapshot the tag being removed for rollback
    let removedTag: NoteTag | undefined

    setNotes(prev =>
      prev.map(note => {
        if (note.id === noteId) {
          removedTag = note.tags.find(t => t.tag.id === tagId)
          return { ...note, tags: note.tags.filter(t => t.tag.id !== tagId) }
        }
        return note
      })
    )

    // 2. Fire API
    fetch(`/api/notes/${noteId}/tags/${tagId}`, { method: 'DELETE' })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to remove tag')
        toast.success('Tag removed')
      })
      .catch(() => {
        // 3. Rollback
        if (removedTag) {
          setNotes(prev =>
            prev.map(note =>
              note.id === noteId
                ? { ...note, tags: [...note.tags, removedTag!] }
                : note
            )
          )
        }
        toast.error('Failed to remove tag')
      })
  }, [])

  // ── Add Tag Optimistically ───────────────────────────────────────────────

  const addTagOptimistically = useCallback((name: string) => {
    const tempId = `temp-tag-${Date.now()}`
    const tempTag: Tag = {
      id: tempId,
      name,
      isDefault: false,
      isPending: true,
    }

    // 1. Immediately show in tag bar
    setTags(prev => [...prev, tempTag])

    // 2. Fire API
    fetch('/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.text()
          throw new Error(data || 'Failed to create tag')
        }
        const savedTag = await res.json()
        // 3. Replace temp with real
        setTags(prev =>
          prev.map(t =>
            t.id === tempId
              ? { ...savedTag, isPending: false }
              : t
          )
        )
        toast.success('Tag created')
      })
      .catch((error) => {
        // 4. Rollback
        setTags(prev => prev.filter(t => t.id !== tempId))
        const msg = error instanceof Error ? error.message : 'Failed to create tag'
        toast.error(msg)
      })
  }, [])

  // ── Delete Tag Optimistically ────────────────────────────────────────────

  const deleteTagOptimistically = useCallback((tagId: string) => {
    // 1. Snapshot for rollback
    let removedTag: Tag | undefined
    let removedIndex = -1

    setTags(prev => {
      removedIndex = prev.findIndex(t => t.id === tagId)
      removedTag = prev[removedIndex]
      return prev.filter(t => t.id !== tagId)
    })

    // Also remove this tag from all notes
    const notesSnapshot: Note[] = []
    setNotes(prev => {
      // Save snapshot of affected notes for rollback
      prev.forEach(note => {
        if (note.tags.some(t => t.tag.id === tagId)) {
          notesSnapshot.push({ ...note })
        }
      })
      return prev.map(note => ({
        ...note,
        tags: note.tags.filter(t => t.tag.id !== tagId),
      }))
    })

    // 2. Fire API
    fetch(`/api/tags/${tagId}`, { method: 'DELETE' })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to delete tag')
        toast.success('Tag deleted')
      })
      .catch(() => {
        // 3. Rollback: re-insert tag and restore note tags
        if (removedTag) {
          setTags(prev => {
            const updated = [...prev]
            updated.splice(removedIndex, 0, removedTag!)
            return updated
          })
        }
        if (notesSnapshot.length > 0) {
          setNotes(prev =>
            prev.map(note => {
              const snapshot = notesSnapshot.find(s => s.id === note.id)
              return snapshot ? snapshot : note
            })
          )
        }
        toast.error('Failed to delete tag')
      })
  }, [])

  // ── Context Value ────────────────────────────────────────────────────────

  const value = useMemo<NotesContextValue>(
    () => ({
      notes,
      tags,
      addNoteOptimistically,
      updateNoteOptimistically,
      deleteNoteOptimistically,
      addTagToNoteOptimistically,
      removeTagFromNoteOptimistically,
      addTagOptimistically,
      deleteTagOptimistically,
      setNotes,
      setTags,
    }),
    [
      notes,
      tags,
      addNoteOptimistically,
      updateNoteOptimistically,
      deleteNoteOptimistically,
      addTagToNoteOptimistically,
      removeTagFromNoteOptimistically,
      addTagOptimistically,
      deleteTagOptimistically,
    ]
  )

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useNotes() {
  const ctx = useContext(NotesContext)
  if (!ctx) {
    throw new Error('useNotes must be used within a NotesProvider')
  }
  return ctx
}
