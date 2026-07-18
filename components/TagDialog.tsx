'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { useState } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useNotes } from './NotesContext'

function TagDialog() {
  const { addTagOptimistically } = useNotes()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    // Optimistically add tag — appears instantly, dialog closes immediately
    addTagOptimistically(name.trim())
    setOpen(false)
    setName("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button className="bg-muted w-9 h-9 rounded-full hover:bg-muted/80">
                <Plus className="h-5 w-5 text-foreground" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent sideOffset={5}>
            <p>Create tag</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent className="max-w-[400px] md:w-full w-[350px] rounded-3xl">
        <DialogHeader>
          <DialogTitle>Create tag</DialogTitle>
          <DialogDescription>
            We&apos;ll use these keywords to auto-tag new notes and recommend past notes.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Meeting notes, To-do, Agendas"
                className="w-full h-[48px] rounded-[16px] bg-muted px-6 text-sm font-medium border-none focus:outline-none focus:border-none focus:ring-0"
                required
              />
            </div>
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button 
              className="px-5 h-11 rounded-[16px] bg-muted hover:bg-muted/80 text-foreground" 
              type="button"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              className="px-5 h-11 rounded-[16px]" 
              type="submit"
            >
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 

export default TagDialog