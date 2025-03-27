import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"
import TakingNotesButtons from "@/components/TakingNotesButtons"




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
  })

  return (
    <div className="max-w-7xl w-full mx-auto p-8 flex flex-col items-center  ">
     <Navbar />

      {notes.length === 0 ? (
        <div className="text-center py-10">
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

