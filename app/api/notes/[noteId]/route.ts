import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: { noteId: string } }
) {
  try {
    const noteId = await params.noteId

    // Delete the note
    await prisma.note.delete({
      where: {
        id: noteId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting note:', error)
    return NextResponse.json(
      { error: 'Failed to delete note' },
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

    const note = await prisma.note.findUnique({
      where: {
        id: noteId,
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
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(note)
  } catch (error) {
    console.error('Error fetching note:', error)
    return NextResponse.json(
      { error: 'Failed to fetch note' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { noteId: string } }
) {
  try {
    const noteId = await params.noteId
    const body = await request.json()

    const note = await prisma.note.update({
      where: {
        id: noteId,
      },
      data: {
        title: body.title,
        content: body.content,
        isStarred: body.isStarred,
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
    console.error('Error updating note:', error)
    return NextResponse.json(
      { error: 'Failed to update note' },
      { status: 500 }
    )
  }
} 