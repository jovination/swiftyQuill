import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: { noteId: string } }
) {
  try {
    const { noteId } = await Promise.resolve(params)

    // Delete the note
    await prisma.note.delete({
      where: {
        id: noteId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting note:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function GET(
  request: Request,
  { params }: { params: { noteId: string } }
) {
  try {
    const { noteId } = await Promise.resolve(params)

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
      return new NextResponse('Note not found', { status: 404 })
    }

    return NextResponse.json(note)
  } catch (error) {
    console.error('Error fetching note:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { noteId: string } }
) {
  try {
    const { noteId } = await Promise.resolve(params)
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
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 