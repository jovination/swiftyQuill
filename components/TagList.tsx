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
import { useState } from "react"
import { RiDeleteBinLine } from "react-icons/ri"
import { useNotes, type Tag } from './NotesContext'

interface TagListProps {
  currentTag: string
}

export default function TagList({ currentTag }: TagListProps) {
  const { tags, deleteTagOptimistically } = useNotes()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null)

  const handleDeleteTag = (tagId: string) => {
    deleteTagOptimistically(tagId)
    setDeleteDialogOpen(false)
    setTagToDelete(null)
  }

  const openDeleteDialog = (tag: Tag) => {
    setTagToDelete(tag)
    setDeleteDialogOpen(true)
  }

  return (
    <>
      <div className="max-w-[650px] w-full md:-ml-28 mt-4 flex items-center gap-3">
        {tags.map((tag) => (
          <Link
            key={tag.id}
            href={`/notes${tag.name === 'All' ? '' : `?tag=${tag.name}`}`}
            className={`px-3 py-2 text-sm rounded-full transition-all duration-200 ${
              (!currentTag || currentTag === 'All' ? tag.name === 'All' : currentTag === tag.name)
                ? 'bg-primary text-primary-foreground'
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
            {tag.name}
          </Link>
        ))}
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