'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
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
import { Loader2 } from "lucide-react"

interface Tag {
  id: string
  name: string
  isDefault: boolean
}

interface TagListProps {
  tags: Tag[]
  currentTag: string
}

export default function TagList({ tags, currentTag }: TagListProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteTag = async (tagId: string, tagName: string) => {
    setIsDeleting(true)
    const toastId = toast.loading('Deleting tag and removing it from all notes...')
    
    try {
      const response = await fetch(`/api/tags/${tagId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        toast.success('Tag deleted successfully', { id: toastId })
        router.refresh()
      } else {
        const error = await response.text()
        toast.error(error || 'Failed to delete tag', { id: toastId })
      }
    } catch (error) {
      console.error('Error deleting tag:', error)
      toast.error('Failed to delete tag', { id: toastId })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setTagToDelete(null)
    }
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
                ? 'bg-black text-white'
                : 'bg-black/5 hover:bg-black/10 text-black'
            }`}
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
              Are you sure you want to delete the tag "{tagToDelete?.name}"? This will remove the tag from all notes and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button 
              className="px-5 h-11 rounded-[16px] bg-black/5 hover:bg-black/10 text-black" 
              onClick={() => {
                setDeleteDialogOpen(false)
                setTagToDelete(null)
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              className="px-5 h-11 rounded-[16px] bg-red-300 hover:bg-red-600 text-white" 
              onClick={() => tagToDelete && handleDeleteTag(tagToDelete.id, tagToDelete.name)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 