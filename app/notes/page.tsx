import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import TakingNotesButtons from "@/components/TakingNotesButtons"
import { IoSearchOutline } from "react-icons/io5";
import { MdOutlineKeyboardCommandKey } from "react-icons/md";
import { Toaster } from "sonner";
import Navbar from "@/components/Navbar"
import TagList from "@/components/TagList"
import { ImSpinner8 } from "react-icons/im";
import { Suspense } from 'react'
import NotesList from "@/components/NotesList";
import { NotesProvider } from "@/components/NotesContext";

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

  // Serialize dates for client components
  const serializedNotes = notes.map(note => ({
    ...note,
    updatedAt: note.updatedAt.toISOString(),
    createdAt: note.createdAt.toISOString(),
  }));

  const serializedTags = tags.map(tag => ({
    ...tag,
    createdAt: tag.createdAt.toISOString(),
    updatedAt: tag.updatedAt.toISOString(),
  }));

  return (
    <div className="max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col items-center">
      <Toaster position="top-right" />
      <Navbar />
      <NotesProvider initialNotes={serializedNotes} initialTags={serializedTags}>
        <div className="md:hidden max-w-4xl w-full h-10 bg-muted rounded-xl px-3 flex items-center justify-between mt-6">
          <div className="flex items-center gap-1">
            <IoSearchOutline className='text-2xl text-muted-foreground' />
            <input className="bg-transparent focus:outline-none focus:ring-0 focus:border-none border-none placeholder:text-md" placeholder="Search" />
          </div>
          <div className="flex items-center gap-1">
            <MdOutlineKeyboardCommandKey className='text-xl text-muted-foreground' />
            <span className="text-muted-foreground text-md uppercase">k</span>
          </div>
        </div>
        <TagList currentTag={currentTag} />
        
        <Suspense fallback={
          <div className="max-w-4xl md:-ml-28 w-full space-y-4 mt-10 flex justify-center items-center min-h-[200px]">
            <ImSpinner8 className="animate-spin text-4xl text-gray-400" />
          </div>
        }>
          <NotesList currentTag={currentTag} />
        </Suspense>
        
        <div className="max-w-4xl w-full flex justify-center fixed bottom-6 left-1/2 transform -translate-x-1/2">
          <TakingNotesButtons />
        </div>
      </NotesProvider>
    </div>
  )
}