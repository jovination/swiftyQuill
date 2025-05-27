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
import { revalidatePath } from "next/cache";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

import Navbar from "@/components/Navbar"

const prisma = new PrismaClient()

async function createTag(formData: FormData) {
  'use server'
  
  const session = await auth()
  if (!session?.user?.id) return

  const name = formData.get('name') as string
  if (!name) return

  await prisma.tag.create({
    data: {
      name: name,
      userId: session.user.id,
      isDefault: false
    },
  })

  revalidatePath('/notes')
}

export default async function NotesPage({
  searchParams,
}: {
  searchParams: { tag?: string }
}) {
  const session = await auth()

  // Check if user is authenticated
  if (!session || !session.user) {
    redirect("/login")
  }

  const activeTag = searchParams.tag || 'All'

  // Fetch user's notes
  const notes = await prisma.note.findMany({
    where: {
      userId: session.user.id,
      ...(activeTag !== 'All' && {
        tags: {
          some: {
            tag: {
              OR: [
                { name: activeTag, isDefault: true },
                { name: activeTag, userId: session.user.id }
              ]
            }
          }
        }
      })
    },
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      tags: {
        include: {
          tag: true
        }
      }
    }
  });

  // Fetch all tags (both default and user-specific)
  const tags = await prisma.tag.findMany({
    where: {
      OR: [
        { isDefault: true },
        { userId: session.user.id }
      ]
    },
    orderBy: {
      createdAt: 'asc'
    }
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

            <div className=" max-w-[650px] w-full   md:-ml-28 mt-4 flex items-center gap-3 flex-wrap"> 
              {tags.map((tag) => (
                <a
                  key={tag.id}
                  href={`/notes?tag=${tag.name}`}
                  className={`px-3 py-2 text-sm rounded-full transition-colors ${
                    activeTag === tag.name
                      ? 'bg-black text-white'
                      : 'bg-black/5 hover:bg-black/10'
                  }`}
                >
                  {tag.name}
                </a>
              ))}
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
                      We'll use these keywords to auto-tag new notes and recommend past notes.
                    </DialogDescription>
                  </DialogHeader>
                  <form action={createTag}>
                    <div className="grid gap-4 py-2">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-right">
                          Name
                        </Label>
                        <input 
                          name="name"
                          placeholder="Meeting notes, To-do, Agendas"
                          className="w-full h-[48px] rounded-[16px] border-none bg-black/5 px-6 text-sm font-medium focus:outline-none focus:border-none focus:ring-0"
                        />
                      </div>
                    </div>
                    <DialogFooter className="flex justify-end gap-2">
                      <Button className="px-5 h-11 rounded-[16px] bg-black/5 hover:bg-black/10 text-black" type="button">
                        Cancel
                      </Button>
                      <Button className="px-5 h-11 rounded-[16px]" type="submit">
                        Create
                      </Button>
                    </DialogFooter>
                  </form>
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

