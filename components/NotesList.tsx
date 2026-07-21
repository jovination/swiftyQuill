"use client"

import { useState, useEffect, useMemo } from 'react'
import { FiSend } from "react-icons/fi"
import { Mic3, Widget, List3 } from 'reicon-react';
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
import { Spinner } from "@/components/ui/spinner"
import { SpinnerBadge } from "@/components/ui/spinner-badge"
import { RiDeleteBinLine } from "react-icons/ri";
import { Sparkles, ListCheck } from "lucide-react"
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
    toggleActionItemOptimistically,
    toggleMarkdownTodoOptimistically,
  } = useNotes()

  const [isInputVisible, setIsInputVisible] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [previewNote, setPreviewNote] = useState<Note | null>(null);
  const [expandedActionItems, setExpandedActionItems] = useState<Record<string, boolean>>({});

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

  const getActionItemsArray = (raw: any): any[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const filteredNotes = useMemo(() => {
    let list = notes;
    if (currentTag !== 'All') {
      list = notes.filter(note => {
        if (currentTag === 'Starred') return note.isStarred;
        if (currentTag === 'Shared') return note.isShared;
        return note.tags.some(({ tag }) => tag.name === currentTag);
      });
    }

    // Always sort by updatedAt descending (new or recently edited notes at the top)
    return [...list].sort((a, b) => {
      const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return timeB - timeA;
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
      <div className="hidden sm:flex justify-end mb-4">
        <div className="flex bg-black/5 dark:bg-muted/50 rounded-lg p-1">
          <button 
            onClick={() => setViewMode('list')} 
            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <List3 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewMode('grid')} 
            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Widget className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className={viewMode === 'grid' ? 'columns-1 sm:columns-2 md:columns-3 gap-4 w-full' : 'flex flex-col gap-4'}>
        {filteredNotes.map((note) => (
          <div 
            key={note.id} 
            className={`break-inside-avoid ${viewMode === 'grid' ? 'mb-4' : ''} group border rounded-[20px] sm:rounded-3xl p-3 sm:p-5 transition-all duration-300 relative flex flex-col overflow-hidden z-0 ${
              note.color 
                ? 'border-transparent dark:border-transparent hover:brightness-95 dark:hover:brightness-110' 
                : 'border-gray-100 dark:border-border hover:bg-black/5 dark:hover:bg-muted/50 hover:border-transparent dark:hover:border-transparent'
            } ${note.isPending ? 'opacity-70' : ''}`}
          >
          {note.color && (
            <div className="absolute inset-0 -z-10 pointer-events-none" style={{ backgroundColor: note.color }} />
          )}
          {note.isPending && (
            <div className="absolute top-3 right-3">
              <Spinner className="text-green-400" />
            </div>
          )}
          <div className={`flex justify-between items-center text-xs mb-1 ${note.color ? 'text-gray-900' : 'text-muted-foreground'}`}>
            <span suppressHydrationWarning className="text-date">{new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            {note.isStarred && <span className="text-yellow-500">★ Starred</span>}
          </div>
          <h2 className={`font-medium text-md mb-2 truncate ${note.color ? 'text-gray-900' : ''}`}>{note.title}</h2>
          
          {(note.audioKey || note.audioUrl) && (!note.transcript && note.content === 'Voice Memo audio attached.') && (
            <div className="mb-3">
              <SpinnerBadge status="Transcribing voice memo..." variant="emerald" />
            </div>
          )}
          
          {note.imageUrls && note.imageUrls.length > 0 && (
            <div className="mb-4 flex gap-2 overflow-x-auto custom-scrollbar pb-2">
              {note.imageUrls.map((url, idx) => (
                <img 
                  key={idx} 
                  src={url} 
                  alt={`Note attachment ${idx + 1}`} 
                  className={`${note.imageUrls && note.imageUrls.length > 1 ? 'w-[85%]' : 'w-full'} h-48 ${viewMode === 'list' ? 'sm:w-32 sm:h-32' : 'sm:h-auto sm:max-h-48'} object-cover rounded-2xl shrink-0`}
                />
              ))}
            </div>
          )}

          {/* AI Action Items / Todo Checklist */}
          {(() => {
            const actionItems = getActionItemsArray(note.actionItems);
            if (actionItems.length === 0) return null;

            const isExpanded = Boolean(expandedActionItems[note.id]);
            const initialItems = actionItems.slice(0, 2);
            const extraItems = actionItems.slice(2);
            const remainingCount = actionItems.length - 2;

            return (
              <div className={`mb-4 flex flex-col gap-1.5 rounded-2xl p-3 border transition-all duration-300 ease-in-out ${note.color ? 'bg-black/10 border-black/10' : 'bg-black/5 dark:bg-muted/40 border-black/5 dark:border-white/5'}`}>
                <div className="flex items-center justify-between mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
                  <div className="flex items-center gap-1.5">
                    <ListCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Action Items ({actionItems.filter((i: any) => i.completed).length}/{actionItems.length})</span>
                  </div>
                  {actionItems.length > 2 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setExpandedActionItems(prev => ({ ...prev, [note.id]: !prev[note.id] }));
                      }}
                      className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline transition-all px-1 py-0.5"
                    >
                      {isExpanded ? "Collapse" : `+${remainingCount} more`}
                    </button>
                  )}
                </div>

                {initialItems.map((item: any, idx: number) => (
                  <div key={item.id || `item-${idx}`} className="flex items-center gap-2 group/item">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        toggleActionItemOptimistically(note.id, item.id, !item.completed);
                      }}
                      className={`w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${item.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-400 dark:border-gray-600 bg-white dark:bg-[#2C2C2E]'}`}
                    >
                      {item.completed && <span className="text-[10px] font-bold">✓</span>}
                    </button>
                    <span 
                      className={`text-xs truncate cursor-pointer select-none ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        toggleActionItemOptimistically(note.id, item.id, !item.completed);
                      }}
                    >
                      {item.text}
                    </span>
                  </div>
                ))}

                {extraItems.length > 0 && (
                  <div className={`flex flex-col gap-1.5 transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[600px] opacity-100 mt-0.5' : 'max-h-0 opacity-0 overflow-hidden pointer-events-none'}`}>
                    {extraItems.map((item: any, idx: number) => (
                      <div key={item.id || `extra-${idx}`} className="flex items-center gap-2 group/item">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            toggleActionItemOptimistically(note.id, item.id, !item.completed);
                          }}
                          className={`w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${item.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-400 dark:border-gray-600 bg-white dark:bg-[#2C2C2E]'}`}
                        >
                          {item.completed && <span className="text-[10px] font-bold">✓</span>}
                        </button>
                        <span 
                          className={`text-xs truncate cursor-pointer select-none ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            toggleActionItemOptimistically(note.id, item.id, !item.completed);
                          }}
                        >
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {note.content.trim().startsWith('- [') ? (() => {
            const lines = note.content.split('\n').filter(l => l.trim().length > 0);
            const isExpanded = Boolean(expandedActionItems[note.id]);
            const initialLines = lines.slice(0, 2);
            const extraLines = lines.slice(2);
            const remainingCount = lines.length - 2;

            return (
              <div className={`flex flex-col gap-1.5 mb-4 overflow-hidden rounded-xl p-2 px-3 transition-all duration-300 ease-in-out ${note.color ? 'bg-black/10' : 'bg-black/10 dark:bg-black/10'}`}>
                {initialLines.map((line, idx) => {
                  const isChecked = line.startsWith('- [x]') || line.startsWith('- [X]');
                  const rawText = line.replace(/^- \[[ xX]\] /, '');
                  const { emoji, rest } = extractLeadingEmoji(rawText);
                  return (
                    <div 
                      key={idx} 
                      className="flex items-center gap-2 cursor-pointer group/item"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        toggleMarkdownTodoOptimistically(note.id, idx);
                      }}
                    >
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${isChecked ? 'bg-[#00b505] border-[#00b505]' : (note.color ? 'border-gray-500 bg-transparent' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2C2C2E]')}`}>
                        {isChecked && <span className="text-white text-[10px] font-bold">✓</span>}
                      </div>
                      <span className={`text-sm truncate select-none ${isChecked ? (note.color ? 'text-gray-600/80 line-through' : 'text-gray-400 dark:text-muted-foreground line-through') : (note.color ? 'text-gray-900 font-medium' : 'text-gray-700 font-medium dark:text-gray-200 dark:font-light')}`}>
                        {emoji && <span className="mr-1.5"><FluentEmoji emoji={emoji} size={14} /></span>}
                        {rest || rawText}
                      </span>
                    </div>
                  );
                })}

                {extraLines.length > 0 && (
                  <div className={`flex flex-col gap-1.5 transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[600px] opacity-100 mt-0.5' : 'max-h-0 opacity-0 overflow-hidden pointer-events-none'}`}>
                    {extraLines.map((line, idx) => {
                      const actualIdx = idx + 2;
                      const isChecked = line.startsWith('- [x]') || line.startsWith('- [X]');
                      const rawText = line.replace(/^- \[[ xX]\] /, '');
                      const { emoji, rest } = extractLeadingEmoji(rawText);
                      return (
                        <div 
                          key={actualIdx} 
                          className="flex items-center gap-2 cursor-pointer group/item"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            toggleMarkdownTodoOptimistically(note.id, actualIdx);
                          }}
                        >
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${isChecked ? 'bg-[#00b505] border-[#00b505]' : (note.color ? 'border-gray-500 bg-transparent' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2C2C2E]')}`}>
                            {isChecked && <span className="text-white text-[10px] font-bold">✓</span>}
                          </div>
                          <span className={`text-sm truncate select-none ${isChecked ? (note.color ? 'text-gray-600/80 line-through' : 'text-gray-400 dark:text-muted-foreground line-through') : (note.color ? 'text-gray-900 font-medium' : 'text-gray-700 font-medium dark:text-gray-200 dark:font-light')}`}>
                            {emoji && <span className="mr-1.5"><FluentEmoji emoji={emoji} size={14} /></span>}
                            {rest || rawText}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {lines.length > 2 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setExpandedActionItems(prev => ({ ...prev, [note.id]: !prev[note.id] }));
                    }}
                    className={`text-[11px] font-medium mt-0.5 text-left hover:underline transition-all ${note.color ? 'text-gray-600' : 'text-gray-400 dark:text-gray-500'}`}
                  >
                    {isExpanded ? "Show less" : `+${remainingCount} more items`}
                  </button>
                )}
              </div>
            );
          })() : (
            <p className={`text-sm mb-4 line-clamp-2 ${note.color ? 'text-gray-800' : 'text-muted-foreground'}`}>{note.content}</p>
          )}

          {note.audioUrl ? (
            <div className="mb-4 bg-black/5 dark:bg-muted/50 rounded-2xl p-3 flex flex-col gap-2">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-full bg-white dark:bg-card flex items-center justify-center text-gray-700 dark:text-muted-foreground shadow-sm shrink-0">
                  <Mic3 className="w-5 h-5 shrink-0" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span 
                    className="text-sm font-medium text-gray-800 dark:text-foreground truncate block"
                    title={note.title ? `${note.title} attached` : "Audio attached"}
                  >
                    {note.title ? `${note.title} attached` : "Audio attached"}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">Audio ready to play</span>
                </div>
              </div>
              <audio controls src={note.audioUrl} className="w-full h-0 opacity-80 group-hover:h-10 group-hover:opacity-100 group-hover:mt-1 transition-all duration-300" />
            </div>
          ) : null}

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