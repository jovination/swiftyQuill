import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET specific note by ID
export async function GET(req: Request, { params }: { params: Promise<{ noteId: string }> }) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Await the params object to get the noteId
    const { noteId } = await params

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        userId: user.id, // Ensure user can only access their own notes
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    })

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    return NextResponse.json(note)
  } catch (error) {
    console.error("Error fetching note:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ noteId: string }> }) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Await the params object to get the noteId
    const { noteId } = await params
    const body = await req.json()
    const { title, content, imageUrl, isStarred, isShared } = body

    // Get user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update the note
    const note = await prisma.note.update({
      where: {
        id: noteId,
        userId: user.id, // Ensure user can only update their own notes
      },
      data: {
        title,
        content,
        imageUrl,
        isStarred,
        isShared,
        updatedAt: new Date(),
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    })

    return NextResponse.json(note)
  } catch (error) {
    console.error("Error updating note:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ noteId: string }> }) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Await the params object to get the noteId
    const { noteId } = await params

    // Get user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Delete the note
    await prisma.note.delete({
      where: {
        id: noteId,
        userId: user.id, // Ensure user can only delete their own notes
      },
    })

    return NextResponse.json({ message: "Note deleted successfully" })
  } catch (error) {
    console.error("Error deleting note:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
