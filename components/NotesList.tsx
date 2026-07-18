"use client"

import { useState, useEffect, useMemo } from 'react'
import { FiSend, FiGrid, FiList } from "react-icons/fi"
import { Mic3 } from 'reicon-react';
import { FluentEmoji } from '@lobehub/fluent-emoji';
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
import { NotePreviewDialog } from './NotePreviewDialog'

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
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [previewNote, setPreviewNote] = useState<Note | null>(null);

  const toggleInputField = () => {
    setIsInputVisible(!isInputVisible);
  };

  const extractLeadingEmoji = (text: string): { emoji: string | null; rest: string } => {
    if (!text) return { emoji: null, rest: text };
    const code = text.codePointAt(0)!;
    if (
      (code >= 0x1F600 && code <= 0x1F64F) ||
      (code >= 0x1F300 && code <= 0x1F5FF) ||
      (code >= 0x1F680 && code <= 0x1F6FF) ||
      (code >= 0x1F1E0 && code <= 0x1F1FF) ||
      (code >= 0x1F900 && code <= 0x1F9FF) ||
      (code >= 0x2600 && code <= 0x26FF) ||
      (code >= 0x2700 && code <= 0x27BF) ||
      (code >= 0xFE00 && code <= 0xFE0F) ||
      code === 0x200D
    ) {
      let end = text.length;
      while (end > 0 && /[\uFE0F\u200D]/.test(text[end - 1])) end--;
      const emoji = text.slice(0, end);
      const rest = text.slice(end);
      return { emoji: emoji.trimStart() || null, rest: rest.trimStart() };
    }
    return { emoji: null, rest: text };
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
    <div className="w-full mt-10 max-w-4xl mx-auto">
      <div className="flex justify-end mb-4">
        <div className="flex bg-black/5 dark:bg-muted/50 rounded-lg p-1">
          <button 
            onClick={() => setViewMode('list')} 
            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <FiList className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewMode('grid')} 
            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <FiGrid className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start' : 'flex flex-col gap-4'}>
        {filteredNotes.map((note) => (
          <div 
            key={note.id} 
            className={`group border border-gray-100 dark:border-border rounded-3xl p-5 hover:bg-black/5 dark:hover:bg-muted/50 hover:border-none transition-all duration-300 relative flex flex-col ${
              note.isPending ? 'opacity-70' : ''
            }`}
          >
          {note.isPending && (
            <div className="absolute top-3 right-3">
              <ImSpinner8 className="animate-spin text-sm text-gray-400" />
            </div>
          )}
          <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
            <span suppressHydrationWarning className="text-date">{new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
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
                const rawText = line.replace(/^- \[[ xX]\] /, '');
                const { emoji, rest } = extractLeadingEmoji(rawText);
                return (
                  <div key={idx} className="flex items-center gap-2">
                    <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center flex-shrink-0 ${isChecked ? 'bg-[#58A942] border-[#58A942]' : 'border-gray-300 dark:border-border bg-white dark:bg-card'}`}>
                      {isChecked && <span className="text-white text-[8px] font-bold">✓</span>}
                    </div>
                    <span className={`text-sm truncate ${isChecked ? 'text-gray-400 dark:text-muted-foreground line-through' : 'text-gray-600 dark:text-muted-foreground'}`}>
                      {emoji && <span className="mr-1"><FluentEmoji emoji={emoji} size={14} /></span>}
                      {rest || rawText}
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
         
          <div className="flex justify-between items-center mt-auto">
            <button onClick={() => setPreviewNote(note)} className="mt-3 text-primary text-sm hover:underline block text-left">
              View Note →
            </button>
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
      
      <NotePreviewDialog 
        note={previewNote} 
        isOpen={!!previewNote} 
        onClose={() => setPreviewNote(null)} 
      />
    </div>
  )
}