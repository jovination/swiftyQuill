"use client"

import { useState, useEffect, useMemo } from 'react'
import { FiSend } from "react-icons/fi"
import { Mic3 } from 'reicon-react';
import { HiOutlineDotsHorizontal } from "react-icons/hi"
import { IoCopyOutline } from "react-icons/io5"
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { ImSpinner8 } from "react-icons/im"
import { RiDeleteBinLine } from "react-icons/ri";
import { Button } from './ui/button'
import { useNotes, type Note } from './NotesContext'

interface NotesListProps {
  currentTag: string
}

export default function NotesList({ currentTag }: NotesListProps) {
  const {
    notes,
    tags: availableTags,
    deleteNoteOptimistically,
    addTagToNoteOptimistically,
    removeTagFromNoteOptimistically,
  } = useNotes()

  const [isInputVisible, setIsInputVisible] = useState(false);

  const toggleInputField = () => {
    setIsInputVisible(!isInputVisible);
  };

  const filteredNotes = useMemo(() => {
    if (currentTag === 'All') return notes;
    
    return notes.filter(note => {
      if (currentTag === 'Starred') return note.isStarred;
      if (currentTag === 'Shared') return note.isShared;
      return note.tags.some(({ tag }) => tag.name === currentTag);
    });
  }, [notes, currentTag]);

  if (filteredNotes.length === 0) {
    return (
      <div className="text-center py-8 mt-4">
        <p className="text-muted-foreground">No notes found for this tag.</p>
        <p className="mt-2">
          <Button variant="ghost" onClick={() => toggleInputField()} className="text-primary hover:underline">
            Create a new note
          </Button>
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl w-full space-y-4 mt-10">
      {filteredNotes.map((note) => (
        <div 
          key={note.id} 
          className={`group border border-gray-100 dark:border-border rounded-3xl p-5 hover:bg-black/5 dark:hover:bg-muted/50 transition-all duration-300 relative ${
            note.isPending ? 'opacity-70' : ''
          }`}
        >
          {note.isPending && (
            <div className="absolute top-3 right-3">
              <ImSpinner8 className="animate-spin text-sm text-gray-400" />
            </div>
          )}
          <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
            <span suppressHydrationWarning>{new Date(note.updatedAt).toLocaleDateString()}</span>
            {note.isStarred && <span className="text-yellow-500">★ Starred</span>}
          </div>
          <h2 className="font-medium text-md mb-2 truncate">{note.title}</h2>
          
          {note.imageUrl && (
            <div className="mb-4">
              <img src={note.imageUrl} alt="Note attachment" className="w-full max-h-48 object-cover rounded-2xl border border-gray-100 dark:border-border" />
            </div>
          )}

          {note.content.trim().startsWith('- [') ? (
            <div className="flex flex-col gap-1.5 mb-4">
              {note.content.split('\n').slice(0, 3).map((line, idx) => {
                const isChecked = line.startsWith('- [x]') || line.startsWith('- [X]');
                const text = line.replace(/^- \[[ xX]\] /, '');
                return (
                  <div key={idx} className="flex items-center gap-2">
                    <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center flex-shrink-0 ${isChecked ? 'bg-[#58A942] border-[#58A942]' : 'border-gray-300 dark:border-border bg-white dark:bg-card'}`}>
                      {isChecked && <span className="text-white text-[8px] font-bold">✓</span>}
                    </div>
                    <span className={`text-sm truncate ${isChecked ? 'text-gray-400 dark:text-muted-foreground line-through' : 'text-gray-600 dark:text-muted-foreground'}`}>
                      {text}
                    </span>
                  </div>
                );
              })}
              {note.content.split('\n').length > 3 && (
                <span className="text-xs text-gray-400 dark:text-muted-foreground mt-0.5">+{note.content.split('\n').length - 3} more items...</span>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{note.content}</p>
          )}

          {note.audioUrl && (
            <div className="mb-4 bg-black/5 dark:bg-muted/50 rounded-2xl p-3 flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white dark:bg-card flex items-center justify-center text-gray-700 dark:text-muted-foreground shadow-sm">
                  <Mic3 className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-800 dark:text-foreground">Voice Memo attached</span>
                  <span className="text-xs text-muted-foreground">Audio ready to play</span>
                </div>
              </div>
              <audio controls src={note.audioUrl} className="w-full h-0 opacity-80 group-hover:h-10 group-hover:opacity-100 group-hover:mt-1 transition-all duration-300" />
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {note.tags.map(({ tag }) => (
              <span key={tag.id} className="text-xs px-3 py-1 bg-black/5 dark:bg-muted rounded-full lowercase text-gray-700 dark:text-muted-foreground">
                {tag.name}
              </span>
            ))}
          </div>
         
          <div className="flex justify-between items-center">
            <a href={`/notes/${note.id}`} className="mt-3 text-primary text-sm hover:underline block">
              View Note →
            </a>
            <div className="flex gap-2 items-center">
              <span className="flex items-center text-sm px-3 py-1 bg-black/5 dark:bg-muted rounded-full gap-1 cursor-pointer hover:bg-black/10 dark:hover:bg-muted/80 transition-all duration-300">
                <FiSend />
                Share 
              </span>

              <Menubar>
                <MenubarMenu>
                  <MenubarTrigger className="flex items-center bg-black/5 dark:bg-muted hover:bg-black/10 dark:hover:bg-muted/80 rounded-full">
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
                        {availableTags
                          .filter(tag => !tag.isDefault || tag.name === 'Starred')
                          .filter(tag => tag.name !== 'All' && tag.name !== 'Shared')
                          .map((tag) => {
                            const isTagAdded = note.tags.some(({ tag: noteTag }) => noteTag.id === tag.id)
                            return (
                              <MenubarItem
                                key={tag.id}
                                onSelect={() => {
                                  if (isTagAdded) {
                                    removeTagFromNoteOptimistically(note.id, tag.id)
                                  } else {
                                    addTagToNoteOptimistically(note.id, { id: tag.id, name: tag.name })
                                  }
                                }}
                              >
                                {tag.name}
                                {isTagAdded && <span className="ml-2 text-primary">✓</span>}
                              </MenubarItem>
                            )
                          })}
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
                      onSelect={() => {
                        deleteNoteOptimistically(note.id);
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
    </div>
  )
} 