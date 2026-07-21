"use client"

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import { toast } from 'sonner'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface NoteTag {
  tag: {
    id: string
    name: string
  }
}

export interface ActionItem {
  id: string
  text: string
  completed: boolean
}

export interface Note {
  id: string
  title: string
  content: string
  audioUrl?: string | null
  audioKey?: string | null
  imageUrls?: string[]
  imageKeys?: string[]
  transcript?: string | null
  summary?: string | null
  actionItems?: any
  keyInsights?: any
  language?: string | null
  color?: string | null
  updatedAt: string
  createdAt?: string
  isStarred: boolean
  isPinned?: boolean
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
  addNoteOptimistically: (
    note: Omit<Note, 'id' | 'updatedAt' | 'isStarred' | 'isShared' | 'tags'> & {
      audioUrl?: string | null
      color?: string | null
      newImages?: File[]
      newAudio?: File | null
    }
  ) => void
  updateNoteOptimistically: (
    noteId: string,
    updates: Partial<Pick<Note, 'title' | 'content' | 'imageUrls' | 'imageKeys' | 'isStarred' | 'isPinned' | 'isShared' | 'audioUrl' | 'audioKey' | 'color'>> & {
      newImages?: File[]
      newAudio?: File | null
    }
  ) => void
  toggleActionItemOptimistically: (noteId: string, itemId: string, completed: boolean) => void
  toggleMarkdownTodoOptimistically: (noteId: string, lineIndex: number) => void
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

  // ── Automatic Real-Time Polling for Pending AI Transcriptions ─────────────
  useEffect(() => {
    const hasPendingAudio = notes.some(
      n => (n.audioUrl || n.audioKey) && (!n.transcript || n.content === 'Voice Memo audio attached.' || n.title.startsWith('Voice Memo '))
    );

    if (!hasPendingAudio) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/notes');
        if (!res.ok) return;
        const latestNotes: Note[] = await res.json();

        setNotes(prev => {
          let updatedAny = false;
          const updated = prev.map(currentNote => {
            const fresh = latestNotes.find(ln => ln.id === currentNote.id);
            if (fresh && fresh.transcript && (!currentNote.transcript || currentNote.content === 'Voice Memo audio attached.')) {
              updatedAny = true;
              return { ...currentNote, ...fresh, isPending: false };
            }
            return currentNote;
          });

          if (updatedAny) {
            toast.success('✨ AI Voice Memo ready!');
          }
          return updated;
        });
      } catch (err) {
        console.error('Failed to poll background notes update:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [notes]);

  // ── Add Note Optimistically ──────────────────────────────────────────────

  const addNoteOptimistically = useCallback((noteData: Omit<Note, 'id' | 'updatedAt' | 'isStarred' | 'isShared' | 'tags'> & { audioUrl?: string | null, color?: string | null, newImages?: File[], newAudio?: File | null }) => {
    const { newImages, newAudio, ...noteFields } = noteData
    const tempId = `temp-${Date.now()}`
    const tempNote: Note = {
      id: tempId,
      title: noteFields.title,
      content: noteFields.content,
      audioUrl: noteFields.audioUrl || null,
      audioKey: null,
      imageUrls: noteFields.imageUrls || [],
      imageKeys: [],
      color: noteFields.color || null,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isStarred: false,
      isPinned: false,
      isShared: false,
      tags: [],
      isPending: true,
    }

    // 1. Immediately add to UI
    setNotes(prev => [tempNote, ...prev])

    // 2. Build FormData and fire API
    const fd = new FormData()
    fd.append('title', noteFields.title)
    fd.append('content', noteFields.content)
    fd.append('color', noteFields.color || '')
    fd.append('imageKeys', JSON.stringify([]))
    fd.append('audioKey', '')
    fd.append('tags', JSON.stringify([]))
    newImages?.forEach(f => fd.append('images', f))
    if (newAudio) fd.append('audio', newAudio)

    fetch('/api/notes', { method: 'POST', body: fd })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to save note')
        const savedNote = await res.json()
        // 3. Replace temp note with real note (server returns presigned URLs + keys)
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

  const updateNoteOptimistically = useCallback((noteId: string, updates: Partial<Pick<Note, 'title' | 'content' | 'imageUrls' | 'imageKeys' | 'isStarred' | 'isPinned' | 'isShared' | 'audioUrl' | 'audioKey' | 'color'>> & { newImages?: File[], newAudio?: File | null }) => {
    const { newImages, newAudio, ...textUpdates } = updates

    // 1. Snapshot for rollback, apply text updates to UI
    let originalNote: Note | undefined

    setNotes(prev => {
      originalNote = prev.find(n => n.id === noteId)
      return prev.map(n =>
        n.id === noteId
          ? { ...n, ...textUpdates, updatedAt: new Date().toISOString() }
          : n
      )
    })

    // 2. Build FormData — use current keys from state (includes any user removals)
    const fd = new FormData()
    const titleToSend = textUpdates.title ?? originalNote?.title ?? ''
    const contentToSend = textUpdates.content ?? originalNote?.content ?? ''
    fd.append('title', titleToSend)
    fd.append('content', contentToSend)
    fd.append('color', textUpdates.color ?? originalNote?.color ?? '')
    fd.append('isStarred', String(textUpdates.isStarred ?? originalNote?.isStarred ?? false))
    fd.append('isPinned', String(textUpdates.isPinned ?? originalNote?.isPinned ?? false))
    fd.append('isShared', String(textUpdates.isShared ?? originalNote?.isShared ?? false))
    fd.append('imageKeys', JSON.stringify(textUpdates.imageKeys ?? originalNote?.imageKeys ?? []))
    fd.append('audioKey', textUpdates.audioKey ?? originalNote?.audioKey ?? '')
    newImages?.forEach(f => fd.append('images', f))
    if (newAudio) fd.append('audio', newAudio)

    fetch(`/api/notes/${noteId}`, { method: 'PUT', body: fd })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to update note')
        const savedNote = await res.json()
        // 3. Replace with server response (presigned URLs + updated keys)
        setNotes(prev =>
          prev.map(n =>
            n.id === noteId
              ? { ...n, ...savedNote, isPending: false }
              : n
          )
        )
        toast.success('Note updated')
      })
      .catch(() => {
        // 4. Rollback
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

  // ── Toggle Action Item Optimistically ───────────────────────────────────

  const toggleActionItemOptimistically = useCallback((noteId: string, itemId: string, completed: boolean) => {
    let originalNote: Note | undefined

    setNotes(prev => {
      originalNote = prev.find(n => n.id === noteId)
      return prev.map(n => {
        if (n.id === noteId) {
          const rawItems = n.actionItems
          let itemsArray: any[] = []
          if (Array.isArray(rawItems)) {
            itemsArray = rawItems
          } else if (typeof rawItems === 'string') {
            try { itemsArray = JSON.parse(rawItems) } catch { itemsArray = [] }
          }
          if (!Array.isArray(itemsArray)) itemsArray = []

          const updatedItems = itemsArray.map((item: any) =>
            (item.id === itemId || String(item.id) === String(itemId)) ? { ...item, completed } : item
          )
          return { ...n, actionItems: updatedItems }
        }
        return n
      })
    })

    fetch(`/api/notes/${noteId}/action-items`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, completed }),
    }).catch(() => {
      if (originalNote) {
        setNotes(prev => prev.map(n => n.id === noteId ? originalNote! : n))
      }
      toast.error('Failed to update task')
    })
  }, [])

  const toggleMarkdownTodoOptimistically = useCallback((noteId: string, lineIndex: number) => {
    let originalNote: Note | undefined

    setNotes(prev => {
      originalNote = prev.find(n => n.id === noteId)
      return prev.map(n => {
        if (n.id === noteId) {
          const lines = n.content.split('\n')
          if (lines[lineIndex] !== undefined) {
            const line = lines[lineIndex]
            if (line.startsWith('- [x]') || line.startsWith('- [X]')) {
              lines[lineIndex] = line.replace(/^- \[[xX]\] /, '- [ ] ')
            } else if (line.startsWith('- [ ]')) {
              lines[lineIndex] = line.replace(/^- \[ \] /, '- [x] ')
            }
          }
          return { ...n, content: lines.join('\n') }
        }
        return n
      })
    })

    if (originalNote) {
      const lines = originalNote.content.split('\n')
      if (lines[lineIndex] !== undefined) {
        const line = lines[lineIndex]
        if (line.startsWith('- [x]') || line.startsWith('- [X]')) {
          lines[lineIndex] = line.replace(/^- \[[xX]\] /, '- [ ] ')
        } else if (line.startsWith('- [ ]')) {
          lines[lineIndex] = line.replace(/^- \[ \] /, '- [x] ')
        }
      }
      const updatedContent = lines.join('\n')

      fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: originalNote.title,
          content: updatedContent,
        }),
      }).catch(() => {
        if (originalNote) {
          setNotes(prev => prev.map(n => n.id === noteId ? originalNote! : n))
        }
        toast.error('Failed to update task')
      })
    }
  }, [])

  // ── Context Value ────────────────────────────────────────────────────────

  const value = useMemo<NotesContextValue>(
    () => ({
      notes,
      tags,
      addNoteOptimistically,
      updateNoteOptimistically,
      toggleActionItemOptimistically,
      toggleMarkdownTodoOptimistically,
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
      toggleActionItemOptimistically,
      toggleMarkdownTodoOptimistically,
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
