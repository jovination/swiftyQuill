import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"
import TakingNotesButtons from "@/components/TakingNotesButtons"
import { IoSearchOutline } from "react-icons/io5";
import { MdOutlineKeyboardCommandKey } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { FiSend } from "react-icons/fi";
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
        <div className="max-w-3xl w-full space-y-4 mt-10">
          {notes.map((note) => (
            <div key={note.id} className="border border-gray-100 rounded-3xl p-5 hover:bg-black/5 transition-all duration-900">
               <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                {note.isStarred && <span className="text-yellow-500">★ Starred</span>}
              </div>
              <h2 className="font-medium text-md mb-2 truncate">{note.title}</h2>
              <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{note.content}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {note.tags.map(({ tag }) => (
                  <span key={tag.id} className="text-xs px-3 py-2 bg-black/5 rounded-full lowercase text-gray-700">
                    {tag.name}
                  </span>
                ))}
              </div>
             
             <div className="flex justify-between items-center">
              <a href={`/notes/${note.id}`} className="mt-3 text-primary text-sm hover:underline block">
                View Note →
              </a>
              <div className="flex gap-2 items-center">
              <span  className="flex items-center text-sm px-3 py-1 bg-black/5 rounded-full gap-1 cursor-pointer hover:black/20 transition-all duration-300">
              <FiSend />
                  Share 
                </span>

                <Menubar>
                <MenubarMenu >
                <MenubarTrigger className="flex items-center bg-black/5 hover:bg-black/10  rounded-full">
                <HiOutlineDotsHorizontal />
                </MenubarTrigger>
                <MenubarContent>
          <MenubarItem>
            Copy Note <MenubarShortcut>
              <IoCopyOutline className="" />
            </MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Add Tag <MenubarShortcut>
              <IoAddSharp className="text-lg" />
            </MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            Share <MenubarShortcut>
            <FiSend className="text-md" />
            </MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            Print... <MenubarShortcut>⌘P</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
                 </MenubarMenu> 
                 </Menubar>
              </div>
              </div>
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