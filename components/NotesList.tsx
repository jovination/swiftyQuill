"use client"

import { useState, useEffect } from 'react'
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

interface Note {
  id: string
  title: string
  content: string
  updatedAt: string
  isStarred: boolean
  tags: {
    tag: {
      id: string
      name: string
    }
  }[]
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
    try {
      const response = await fetch(`/api/notes/${noteId}/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tagId }),
      })
      if (!response.ok) throw new Error('Failed to add tag')
      
      // Update the note in the local state
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
    } catch (error) {
      console.error('Error adding tag:', error)
    } finally {
      setUpdatingTags(null)
    }
  }

  const removeTagFromNote = async (noteId: string, tagId: string) => {
    setUpdatingTags({ noteId, tagId })
    try {
      const response = await fetch(`/api/notes/${noteId}/tags/${tagId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to remove tag')
      
      // Update the note in the local state
      setNotes(notes.map(note => {
        if (note.id === noteId) {
          return {
            ...note,
            tags: note.tags.filter(({ tag }) => tag.id !== tagId)
          }
        }
        return note
      }))
    } catch (error) {
      console.error('Error removing tag:', error)
    } finally {
      setUpdatingTags(null)
    }
  }

  const deleteNote = async (noteId: string) => {
    setDeletingNoteId(noteId)
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete note')
      }

      // Remove the note from the local state immediately
      setNotes(notes.filter(note => note.id !== noteId))
    } catch (error) {
      console.error('Error deleting note:', error)
      // You might want to show a toast notification here
    } finally {
      setDeletingNoteId(null)
    }
  }

  const refreshNotes = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch(`/api/notes${currentTag !== 'All' ? `?tag=${currentTag}` : ''}`)
      if (!response.ok) throw new Error('Failed to fetch notes')
      const data = await response.json()
      setNotes(data)
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

  if (isLoading) {
    return (
      <div className="max-w-3xl w-full space-y-4 mt-10 flex justify-center items-center min-h-[200px]">
        <ImSpinner8 className="animate-spin text-4xl text-gray-400" />
      </div>
    )
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-8 mt-4">
        <p className="text-muted-foreground">You don't have any notes yet.</p>
        <p className="mt-2">
          <a href="/notes/new" className="text-primary hover:underline">
            Create your first note
          </a>
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl w-full space-y-4 mt-10">
      {notes.map((note) => (
        <div 
          key={note.id} 
          className={`border border-gray-100 rounded-3xl p-5 hover:bg-black/5 transition-all duration-900 relative ${
            deletingNoteId === note.id ? 'opacity-50 pointer-events-none' : ''
          }`}
        >
          {deletingNoteId === note.id && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-3xl">
              <ImSpinner8 className="animate-spin text-2xl text-gray-400" />
            </div>
          )}
          <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
            <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
            {note.isStarred && <span className="text-yellow-500">★ Starred</span>}
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
            <a href={`/notes/${note.id}`} className="mt-3 text-primary text-sm hover:underline block">
              View Note →
            </a>
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
    </div>
  )
} 