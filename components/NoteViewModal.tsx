import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ImSpinner8 } from "react-icons/im"
import { useState } from "react"
import Image from "next/image"

interface Note {
  id: string
  title: string
  content: string
  updatedAt: string
  isStarred: boolean
  isShared: boolean
  imageUrl?: string
  tags: {
    tag: {
      id: string
      name: string
    }
  }[]
}

interface NoteViewModalProps {
  note: Note | null
  isOpen: boolean
  onClose: () => void
}

export default function NoteViewModal({ note, isOpen, onClose }: NoteViewModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  if (!note) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium">{note.title}</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
            {note.isStarred && <span className="text-yellow-500">★ Starred</span>}
          </div>

         

          <div className="prose max-w-none">
            <p className="text-muted-foreground whitespace-pre-wrap">{note.content}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {note.tags.map(({ tag }) => (
              <span 
                key={tag.id} 
                className="text-xs px-3 py-1 bg-black/5 rounded-full lowercase text-gray-700"
              >
                {tag.name}
              </span>
            ))}
          </div>

          {note.imageUrl && (
            <div className="relative w-auto h-[300px] rounded-xl overflow-hidden mt-4">
              <Image
                src={note.imageUrl}
                alt={note.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {note.isShared && (
            <div className="mt-4 p-4 bg-black/5 rounded-xl">
              <h4 className="text-sm font-medium mb-2">Shared Note</h4>
              <p className="text-xs text-muted-foreground">
                This note has been shared with others. You can manage sharing settings in the note options.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 