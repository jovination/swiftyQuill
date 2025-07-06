"use client"

import { useState, useEffect, useMemo } from 'react'
import { FiSend } from "react-icons/fi"
import { HiOutlineDotsHorizontal } from "react-icons/hi"
import { IoCopyOutline, IoAddSharp } from "react-icons/io5"
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { ImSpinner8 } from "react-icons/im"
import { RiDeleteBinLine } from "react-icons/ri";
import { toast } from "sonner"
import NoteViewModal from "./NoteViewModal"
import SyncStatusIndicator from "./SyncStatusIndicator"
import { OptimisticNote, useOptimisticNotes } from "@/lib/use-optimistic-notes"

interface Note extends OptimisticNote {
  // Extends OptimisticNote which already has all the required fields
}

interface Tag {
  id: string
  name: string
}

interface NotesListProps {
  initialNotes: Note[]
  currentTag: string
}

export default function NotesList({ initialNotes, currentTag }: NotesListProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [isLoadingTags, setIsLoadingTags] = useState(false)
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null)
  const [updatingTags, setUpdatingTags] = useState<{ noteId: string; tagId: string } | null>(null)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Get the shared optimistic notes context
  const { deleteNote: deleteNoteFromContext, updateNote: updateNoteFromContext, refreshNotes: refreshNotesFromContext } = useOptimisticNotes()

  // Filter notes based on currentTag
  const filteredNotes = useMemo(() => {
    if (currentTag === 'All') return notes;
    
    return notes.filter(note => {
      if (currentTag === 'Starred') return note.isStarred;
      if (currentTag === 'Shared') return note.isShared;
      return note.tags.some(({ tag }) => tag.name === currentTag);
    });
  }, [notes, currentTag]);

  const fetchTags = async () => {
    setIsLoadingTags(true)
    try {
      const response = await fetch('/api/tags')
      if (!response.ok) throw new Error('Failed to fetch tags')
      const data = await response.json()
      setAvailableTags(data)
    } catch (error) {
      console.error('Error fetching tags:', error)
    } finally {
      setIsLoadingTags(false)
    }
  }

  const addTagToNote = async (noteId: string, tagId: string) => {
    setUpdatingTags({ noteId, tagId })
    const toastId = toast.loading('Adding tag...')
    try {
      const response = await fetch(`/api/notes/${noteId}/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tagId }),
      })
      if (!response.ok) throw new Error('Failed to add tag')
      
      // Optimistically update the note in the local state
      setNotes(notes.map(note => {
        if (note.id === noteId) {
          const tag = availableTags.find(t => t.id === tagId)
          if (tag) {
            return {
              ...note,
              tags: [...note.tags, { tag }]
            }
          }
        }
        return note
      }))
      toast.success('Tag added successfully', { id: toastId })
    } catch (error) {
      console.error('Error adding tag:', error)
      toast.error('Failed to add tag', { id: toastId })
      // Revert the optimistic update on error
      await refreshNotes()
    } finally {
      setUpdatingTags(null)
    }
  }

  const removeTagFromNote = async (noteId: string, tagId: string) => {
    setUpdatingTags({ noteId, tagId })
    const toastId = toast.loading('Removing tag...')
    try {
      const response = await fetch(`/api/notes/${noteId}/tags/${tagId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to remove tag')
      
      // Optimistically update the note in the local state
      setNotes(notes.map(note => {
        if (note.id === noteId) {
          return {
            ...note,
            tags: note.tags.filter(({ tag }) => tag.id !== tagId)
          }
        }
        return note
      }))
      toast.success('Tag removed successfully', { id: toastId })
    } catch (error) {
      console.error('Error removing tag:', error)
      toast.error('Failed to remove tag', { id: toastId })
      // Revert the optimistic update on error
      await refreshNotes()
    } finally {
      setUpdatingTags(null)
    }
  }

  const deleteNote = async (noteId: string) => {
    setDeletingNoteId(noteId)
    
    // Get the note to check its sync status
    const noteToDelete = notes.find(note => note.id === noteId)
    const isNoteSynced = noteToDelete?.syncStatus === 'synced'
    const isTempNote = noteId.startsWith('temp-')
    
    // Show appropriate loading message based on note type
    let loadingMessage = 'Deleting note...'
    if (noteToDelete?.syncStatus === 'pending' || noteToDelete?.syncStatus === 'failed') {
      loadingMessage = 'Removing unsynced note...'
    } else if (noteToDelete?.syncStatus === 'synced') {
      loadingMessage = 'Deleting synced note...'
    }
    
    const toastId = toast.loading(loadingMessage)
    try {
      const result = await deleteNoteFromContext(noteId)
      
      if (result.success) {
        // Remove the note from the local state immediately (already done optimistically in context)
        // setNotes(notes.filter(note => note.id !== noteId)) // This line is no longer needed here
        
        // Show appropriate success message
        toast.success(result.message || 'Note deleted successfully', { id: toastId })
      } else {
        throw new Error(result.message || 'Failed to delete note')
      }
    } catch (error: unknown) {
      console.error('Error deleting note:', error)
      const errorMessage = (error instanceof Error) ? error.message : 'Failed to delete note';
      toast.error(errorMessage, { id: toastId })
    } finally {
      setDeletingNoteId(null)
    }
  }

  const refreshNotes = async () => {
    setIsRefreshing(true)
    try {
      await refreshNotesFromContext()
      // The notes will be updated through the context
    } catch (error) {
      console.error('Error refreshing notes:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Listen for note creation events
  useEffect(() => {
    const handleNoteCreated = () => {
      refreshNotes()
    }

    window.addEventListener('noteCreated', handleNoteCreated)
    return () => window.removeEventListener('noteCreated', handleNoteCreated)
  }, [currentTag])

  // Fetch tags when component mounts
  useEffect(() => {
    fetchTags()
  }, [])

  // Update local notes when initialNotes change (from context)
  useEffect(() => {
    setNotes(initialNotes)
  }, [initialNotes])

  if (isLoading) {
    return (
      <div className="max-w-7xl w-full space-y-4 mt-5 flex justify-center items-center min-h-[200px]">
        <ImSpinner8 className="animate-spin text-4xl text-gray-400" />
      </div>
    )
  }

  if (filteredNotes.length === 0) {
    return (
      <div className="max-w-7xl  w-full text-center py-8 mt-4">
        <p className="text-muted-foreground">No notes found for this tag.</p>
        <p className="mt-2">
          <a href="/notes/new" className="text-primary hover:underline">
            Create a new note
          </a>
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl  w-full space-y-4 mt-10">
      {filteredNotes.map((note) => (
        <div 
          key={note.id}
          className={`w-full border border-gray-100 rounded-3xl p-5 hover:bg-black/5 transition-all duration-900 relative ${
            deletingNoteId === note.id ? 'opacity-50 pointer-events-none' : ''
          }`}
        >
          {deletingNoteId === note.id && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-3xl">
              <ImSpinner8 className="animate-spin text-2xl text-gray-400" />
            </div>
          )}
          <div className=" flex items-center justify-between text-xs text-muted-foreground mb-1">
            <div className="flex items-center  gap-2">
              <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
              {note.isStarred && <span className="text-yellow-500">★ Starred</span>}
            </div>
            {/* Sync status indicator */}
            {note.syncStatus && (
              <SyncStatusIndicator 
                status={note.syncStatus} 
                isOnline={navigator.onLine}
                isTemp={note.isTemp}
                isOfflineNote={note.isOffline}
                className="ml-2"
              />
            )}
          </div>
          <h2 className="font-medium text-md mb-2 truncate">{note.title}</h2>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{note.content}</p>
          <div className="flex flex-wrap gap-2">
            {note.tags.map(({ tag }) => (
              <span key={tag.id} className="text-xs px-3 py-1 bg-black/5 rounded-full lowercase text-gray-700">
                {tag.name}
              </span>
            ))}
          </div>
         
          <div className="flex justify-between items-center">
            <button
              onClick={() => {
                setSelectedNote(note)
                setIsModalOpen(true)
              }}
              className="mt-3 text-primary text-sm hover:underline block"
            >
              View Note →
            </button>
            <div className="flex gap-2 items-center">
              <span className="flex items-center text-sm px-3 py-1 bg-black/5 rounded-full gap-1 cursor-pointer hover:black/20 transition-all duration-300">
                <FiSend />
                Share 
              </span>

              <Menubar>
                <MenubarMenu>
                  <MenubarTrigger className="flex items-center bg-black/5 hover:bg-black/10 rounded-full">
                    <HiOutlineDotsHorizontal />
                  </MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem>
                      Copy Note <MenubarShortcut>
                        <IoCopyOutline className="" />
                      </MenubarShortcut>
                    </MenubarItem>
                    <MenubarSub>
                      <MenubarSubTrigger>Add Tag</MenubarSubTrigger>
                      <MenubarSubContent>
                        {isLoadingTags ? (
                          <div className="flex items-center justify-center p-2">
                            <ImSpinner8 className="animate-spin text-sm" />
                          </div>
                        ) : (
                          availableTags.map((tag) => {
                            const isTagAdded = note.tags.some(({ tag: noteTag }) => noteTag.id === tag.id)
                            const isUpdating = updatingTags?.noteId === note.id && updatingTags?.tagId === tag.id
                            return (
                              <MenubarItem
                                key={tag.id}
                                onClick={() => {
                                  if (isTagAdded) {
                                    removeTagFromNote(note.id, tag.id)
                                  } else {
                                    addTagToNote(note.id, tag.id)
                                  }
                                }}
                                disabled={isUpdating}
                              >
                                {isUpdating ? (
                                  <div className="flex items-center gap-2">
                                    <ImSpinner8 className="animate-spin text-sm" />
                                    {isTagAdded ? 'Removing...' : 'Adding...'}
                                  </div>
                                ) : (
                                  <>
                                    {tag.name}
                                    {isTagAdded && <span className="ml-2 text-primary">✓</span>}
                                  </>
                                )}
                              </MenubarItem>
                            )
                          })
                        )}
                      </MenubarSubContent>
                    </MenubarSub>
                    <MenubarSeparator />
                    <MenubarItem>
                      Share <MenubarShortcut>
                        <FiSend className="text-md" />
                      </MenubarShortcut>
                    </MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem
                      onClick={(e) => {
                        e.preventDefault();
                        deleteNote(note.id);
                      }}
                      disabled={note.syncStatus === 'syncing' || deletingNoteId === note.id}
                      className={note.syncStatus === 'syncing' ? 'cursor-not-allowed opacity-50' : ''}
                    >
                      Delete Note <MenubarShortcut>
                        <RiDeleteBinLine className="text-md text-pink-300" />
                      </MenubarShortcut>
                    </MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
              </Menubar>
            </div>
          </div>
        </div>
      ))}
      {isRefreshing && (
        <div className="fixed bottom-20 right-4 bg-white rounded-full p-2 shadow-lg">
          <ImSpinner8 className="animate-spin text-xl text-gray-400" />
        </div>
      )}
      {isModalOpen && selectedNote && (
        <NoteViewModal
          note={selectedNote}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedNote(null)
          }}
        />
      )}
    </div>
  )
} 