import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"
import { prisma } from '@/lib/prisma'

const prismaClient = new PrismaClient()

export async function POST(
  request: Request,
  { params }: { params: { noteId: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const noteId = await params.noteId
    const { tagId } = await request.json()

    if (!tagId) {
      return NextResponse.json(
        { error: 'Tag ID is required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Check if note exists and belongs to user
    const note = await prismaClient.note.findFirst({
      where: {
        id: noteId,
        userId: user.id
      }
    })

    if (!note) {
      return new NextResponse("Note not found", { status: 404 })
    }

    // Check if tag exists and is accessible to user
    const tag = await prismaClient.tag.findFirst({
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
    const noteTag = await prismaClient.noteTag.create({
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
    console.error('Error adding tag:', error)
    return NextResponse.json(
      { error: 'Failed to add tag' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: { noteId: string } }
) {
  try {
    const noteId = await params.noteId

    const noteTags = await prisma.noteTag.findMany({
      where: {
        noteId,
      },
      include: {
        tag: true,
      },
    })

    return NextResponse.json(noteTags)
  } catch (error) {
    console.error('Error fetching note tags:', error)
    return NextResponse.json(
      { error: 'Failed to fetch note tags' },
      { status: 500 }
    )
  }
} 