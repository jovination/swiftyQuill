import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"
import TakingNotesButtons from "@/components/TakingNotesButtons"
import { IoSearchOutline } from "react-icons/io5";
import { MdOutlineKeyboardCommandKey } from "react-icons/md";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input"
import { IoAddOutline } from "react-icons/io5";







import Navbar from "@/components/Navbar"

const prisma = new PrismaClient()

export default async function NotesPage() {
  const session = await auth()

  // Check if user is authenticated
  if (!session || !session.user) {
    redirect("/login")
  }

  // Fetch user's notes
  const notes = await prisma.note.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <div className="max-w-7xl w-full mx-auto  p-4 md:p-8 flex flex-col items-center  ">
     <Navbar />
     <div className="md:hidden  max-w-[650px] w-full h-10 bg-black/5 rounded-xl px-3 flex items-center justify-between mt-6">
            <div className="flex items-center gap-1">
            <IoSearchOutline className='text-2xl text-gray-400 ' />
            <input className="bg-transparent focus:outline-none focus:ring-0 focus:border-none border-none placeholder:text-md" placeholder="Search" />
            </div>
            <div className="flex items-center gap-1">
            <MdOutlineKeyboardCommandKey  className='text-xl text-gray-400' />
            <span className="text-gray-500 text-md uppercase">k</span>
            </div> 
            </div>

            <div className=" max-w-[650px] w-full   md:-ml-28 mt-4 flex items-center gap-3"> 
              <span className='px-3 py-2 bg-black  text-white text-sm rounded-full'>All</span>
              <span className='px-3 py-2 bg-black/5 hover:bg-black/10 text-sm rounded-full'>Shared</span>
              <span className='px-3 py-2 bg-black/5 hover:bg-black/10 text-sm rounded-full'>Starred</span>
              <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-black/5 w-9 h-9 rounded-full hover:bg-black/10">
        <IoAddOutline className="text-lg text-black" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[400px] md:w-full w-[350px] rounded-3xl">
        <DialogHeader>
          <DialogTitle>Create tag</DialogTitle>
          <DialogDescription>
          We’ll use these keywords to auto-tag new notes and recommend past notes.          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <input 
          placeholder="Meeting notes, To-do, Agendas"
          className="w-full h-[48px] rounded-[16px]  bg-black/5 px-6 text-sm font-medium  border-none focus:outline-none focus:border-none focus:ring-0 "
          />
          </div>
          
        </div>
        <DialogFooter className="flex justify-end gap-2">
         <Button className=" px-5 h-11 rounded-[16px] bg-black/5 hover:bg-black/10 text-black"  type="submit">Cancel</Button>
          <Button className=" px-5 h-11 rounded-[16px]"  type="submit">Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
            </div>

      {notes.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-muted-foreground">You don't have any notes yet.</p>
          <p className="mt-2">
            <a href="/notes/new" className="text-primary hover:underline">
              Create your first note
            </a>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <div key={note.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <h2 className="font-semibold text-lg mb-2 truncate">{note.title}</h2>
              <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{note.content}</p>
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                {note.isStarred && <span className="text-yellow-500">★ Starred</span>}
              </div>
              <a href={`/notes/${note.id}`} className="mt-3 text-primary text-sm hover:underline block">
                View Note →
              </a>
            </div>
          ))}
        </div>
      )}
<div className="w-full flex  justify-center fixed bottom-6 left-1/2 transform -translate-x-1/2">
    <TakingNotesButtons />
  </div>     
    </div>
  )
}