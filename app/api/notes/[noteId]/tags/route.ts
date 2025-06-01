import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(
  request: Request,
  context: { params: { noteId: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const noteId = context.params.noteId
    const { tagId } = await request.json()

    if (!tagId) {
      return new NextResponse("Tag ID is required", { status: 400 })
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Check if note exists and belongs to user
    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        userId: user.id
      }
    })

    if (!note) {
      return new NextResponse("Note not found", { status: 404 })
    }

    // Check if tag exists and is accessible to user
    const tag = await prisma.tag.findFirst({
      where: {
        id: tagId,
        OR: [
          { userId: user.id },
          { isDefault: true }
        ]
      }
    })

    if (!tag) {
      return new NextResponse("Tag not found", { status: 404 })
    }

    // Add tag to note
    const noteTag = await prisma.noteTag.create({
      data: {
        noteId,
        tagId
      },
      include: {
        tag: true
      }
    })

    return NextResponse.json(noteTag)
  } catch (error) {
    console.error("[NOTES_TAGS_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 