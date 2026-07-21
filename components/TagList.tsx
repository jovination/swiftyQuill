'use client'

import Link from "next/link"
import { toast } from "sonner"
import TagDialog from "./TagDialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState, useMemo } from "react"
import { RiDeleteBinLine } from "react-icons/ri"
import { useNotes, type Tag } from './NotesContext'

interface TagListProps {
  currentTag: string
}

export default function TagList({ currentTag }: TagListProps) {
  const { tags, deleteTagOptimistically } = useNotes()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null)
  const [showAll, setShowAll] = useState(false)

  const handleDeleteTag = (tagId: string) => {
    deleteTagOptimistically(tagId)
    setDeleteDialogOpen(false)
    setTagToDelete(null)
  }

  const openDeleteDialog = (tag: Tag) => {
    setTagToDelete(tag)
    setDeleteDialogOpen(true)
  }

  // Display top 5 tags by default, keeping active tag visible
  const visibleTags = useMemo(() => {
    if (showAll || tags.length <= 5) return tags;

    const top5 = tags.slice(0, 5);
    const isCurrentInTop5 = top5.some(t => t.name === currentTag || (currentTag === 'All' && t.name === 'All'));

    if (isCurrentInTop5) {
      return top5;
    }

    const activeTagObj = tags.find(t => t.name === currentTag);
    if (activeTagObj) {
      return [...tags.slice(0, 4), activeTagObj];
    }

    return top5;
  }, [tags, currentTag, showAll]);

  return (
    <>
      <div className="max-w-4xl w-full mx-auto mt-4 flex flex-wrap items-center gap-2">
        {visibleTags.map((tag) => (
          <Link
            key={tag.id}
            href={`/notes${tag.name === 'All' ? '' : `?tag=${encodeURIComponent(tag.name)}`}`}
            title={tag.name}
            className={`px-3.5 py-1.5 text-sm rounded-full transition-all duration-200 inline-flex items-center max-w-[140px] ${
              (!currentTag || currentTag === 'All' ? tag.name === 'All' : currentTag === tag.name)
                ? 'bg-primary text-primary-foreground font-medium'
                : 'bg-muted hover:bg-muted/80 text-foreground'
            } ${tag.isPending ? 'opacity-60' : ''}`}
            onContextMenu={(e) => {
              if (!tag.isDefault) {
                e.preventDefault()
                openDeleteDialog(tag)
              }
            }}
            onTouchStart={(e) => {
              if (!tag.isDefault) {
                const touchTimeout = setTimeout(() => {
                  openDeleteDialog(tag)
                }, 100) 
                const touchEndHandler = () => {
                  clearTimeout(touchTimeout)
                  e.currentTarget.removeEventListener('touchend', touchEndHandler)
                }

                e.currentTarget.addEventListener('touchend', touchEndHandler)
              }
            }}
          >
            <span className="truncate">{tag.name}</span>
          </Link>
        ))}

        {!showAll && tags.length > 5 && (
          <button
            onClick={() => setShowAll(true)}
            className="bg-muted w-9 h-9 rounded-full hover:bg-muted/80 text-foreground text-xs font-semibold flex items-center justify-center shrink-0 transition-all"
            title="Show all tags"
          >
            +{tags.length - 5}
          </button>
        )}

        {showAll && tags.length > 5 && (
          <button
            onClick={() => setShowAll(false)}
            className="bg-muted px-3 h-9 rounded-full hover:bg-muted/80 text-foreground text-xs font-semibold flex items-center justify-center shrink-0 transition-all"
            title="Show less"
          >
            Less
          </button>
        )}

        <TagDialog />
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-[400px] md:w-full w-[350px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-300">
              <RiDeleteBinLine className="text-xl" />
              Delete Tag
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the tag &quot;{tagToDelete?.name}&quot;? This will remove the tag from all notes and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button 
              className="px-5 h-11 rounded-[16px] bg-muted hover:bg-muted/80 text-foreground" 
              onClick={() => {
                setDeleteDialogOpen(false)
                setTagToDelete(null)
              }}
            >
              Cancel
            </Button>
            <Button 
              className="px-5 h-11 rounded-[16px] bg-destructive hover:bg-destructive/90 text-destructive-foreground" 
              onClick={() => tagToDelete && handleDeleteTag(tagToDelete.id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 