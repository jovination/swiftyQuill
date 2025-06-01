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
import { IoAddOutline } from "react-icons/io5"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

 function TagDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    const toastId = toast.loading('Creating tag...')
    
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      })

      if (!response.ok) {
        const data = await response.text()
        throw new Error(data || 'Failed to create tag')
      }

      setOpen(false)
      setName("")
      router.refresh()
      toast.success('Tag created successfully', { id: toastId })
    } catch (error) {
      console.error('Error creating tag:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create tag'
      setError(errorMessage)
      toast.error(errorMessage, { id: toastId })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-black/5 w-9 h-9 rounded-full hover:bg-black/10">
          <IoAddOutline className="text-lg text-black" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[400px] md:w-full w-[350px] rounded-3xl">
        <DialogHeader>
          <DialogTitle>Create tag</DialogTitle>
          <DialogDescription>
            We'll use these keywords to auto-tag new notes and recommend past notes.
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
                className="w-full h-[48px] rounded-[16px] bg-black/5 px-6 text-sm font-medium border-none focus:outline-none focus:border-none focus:ring-0"
                required
                disabled={isLoading}
              />
            </div>
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button 
              className="px-5 h-11 rounded-[16px] bg-black/5 hover:bg-black/10 text-black" 
              type="button"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              className="px-5 h-11 rounded-[16px]" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 

export default TagDialog