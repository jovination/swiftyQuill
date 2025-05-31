"use client"

import { useState, useEffect } from 'react'
import { FiSend } from "react-icons/fi"
import { HiOutlineDotsHorizontal } from "react-icons/hi"
import { IoCopyOutline, IoAddSharp } from "react-icons/io5"
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { ImSpinner8 } from "react-icons/im"

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

interface NotesListProps {
  initialNotes: Note[]
  currentTag: string
}

export default function NotesList({ initialNotes, currentTag }: NotesListProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

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
          className="border border-gray-100 rounded-3xl p-5 hover:bg-black/5 transition-all duration-900"
        >
          <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
            <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
            {note.isStarred && <span className="text-yellow-500">★ Starred</span>}
          </div>
          <h2 className="font-medium text-md mb-2 truncate">{note.title}</h2>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{note.content}</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {note.tags.map(({ tag }) => (
              <span key={tag.id} className="text-xs px-3 py-2 bg-black/5 rounded-full lowercase text-gray-700">
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
                    <MenubarItem>
                      Add Tag <MenubarShortcut>
                        <IoAddSharp className="text-lg" />
                      </MenubarShortcut>
                    </MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem>
                      Share <MenubarShortcut>
                        <FiSend className="text-md" />
                      </MenubarShortcut>
                    </MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem>
                      Print... <MenubarShortcut>⌘P</MenubarShortcut>
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