import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"
import TakingNotesButtons from "@/components/TakingNotesButtons"
import { IoSearchOutline } from "react-icons/io5";
import { MdOutlineKeyboardCommandKey } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { FiSend } from "react-icons/fi";
import { Toaster } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { IoAddOutline } from "react-icons/io5";
import Link from "next/link";
import Navbar from "@/components/Navbar"
import TagDialog from "@/components/TagDialog"
import NotesListWithStorage from "@/components/NotesListWithStorage"
import { ImSpinner8 } from "react-icons/im";
import { Suspense } from 'react'

import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { IoCopyOutline } from "react-icons/io5";
import { IoAddSharp } from "react-icons/io5";

const prisma = new PrismaClient()

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await auth()
  
  if (!session?.user?.email) {
    redirect("/login")
  }

  // Get user by email
  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user) {
    redirect("/login")
  }

  // Await searchParams before accessing its properties
  const resolvedSearchParams = await searchParams
  
  // Safely get the tag parameter
  const tagParam = typeof resolvedSearchParams.tag === 'string' ? resolvedSearchParams.tag : undefined
  const currentTag = tagParam || 'All'

  // Fetch user's tags
  const tags = await prisma.tag.findMany({
    where: {
      OR: [
        { isDefault: true },
        { userId: user.id }
      ]
    },
    orderBy: [
      { isDefault: 'desc' },
      { name: 'asc' }
    ]
  });

  // Fetch all user's notes
  const notes = await prisma.note.findMany({
    where: {
      userId: user.id,
    },
    include: {
      tags: {
        include: {
          tag: true
        }
      }
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <div className="max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col items-center">
      <Toaster position="top-right" />
      <Navbar />
      <div className="md:hidden max-w-[650px] w-full h-10 bg-black/5 rounded-xl px-3 flex items-center justify-between mt-6">
        <div className="flex items-center gap-1">
          <IoSearchOutline className='text-2xl text-gray-400' />
          <input className="bg-transparent focus:outline-none focus:ring-0 focus:border-none border-none placeholder:text-md" placeholder="Search" />
        </div>
        <div className="flex items-center gap-1">
          <MdOutlineKeyboardCommandKey className='text-xl text-gray-400' />
          <span className="text-gray-500 text-md uppercase">k</span>
        </div>
      </div>
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
          >
            {tag.name}
          </Link>
        ))}
        <TagDialog />
      </div>
      
      <Suspense fallback={
        <div className="max-w-3xl w-full space-y-4 mt-10 flex justify-center items-center min-h-[200px]">
          <ImSpinner8 className="animate-spin text-4xl text-gray-400" />
        </div>
      }>
        <NotesListWithStorage 
          initialNotes={notes.map(note => ({
            ...note,
            updatedAt: note.updatedAt.toISOString(),
            createdAt: note.createdAt.toISOString()
          }))} 
          currentTag={currentTag} 
        />
      </Suspense>
      
      <div className="w-full flex justify-center fixed bottom-6 left-1/2 transform -translate-x-1/2">
        <TakingNotesButtons />
      </div>
    </div>
  )
}