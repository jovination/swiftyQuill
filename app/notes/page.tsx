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
import Link from "next/link";
import Navbar from "@/components/Navbar"
import TagDialog from "@/components/TagDialog"

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

  // Fetch user's notes with tag filtering
  const notes = await prisma.note.findMany({
    where: {
      userId: user.id,
      ...(currentTag !== 'All' ? {
        OR: [
          {
            tags: {
              some: {
                tag: {
                  name: currentTag,
                  OR: [
                    { isDefault: true },
                    { userId: user.id }
                  ]
                }
              }
            }
          },
          ...(currentTag === 'Starred' ? [{ isStarred: true }] : []),
          ...(currentTag === 'Shared' ? [{ isShared: true }] : [])
        ]
      } : {})
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
      {notes.length === 0 ? (
        <div className="text-center py-8 mt-4">
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
              <div className="flex flex-wrap gap-2 mb-3">
                {note.tags.map(({ tag }) => (
                  <span key={tag.id} className="text-xs px-2 py-1 bg-black/5 rounded-full">
                    {tag.name}
                  </span>
                ))}
              </div>
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
      <div className="w-full flex justify-center fixed bottom-6 left-1/2 transform -translate-x-1/2">
        <TakingNotesButtons />
      </div>
    </div>
  )
}