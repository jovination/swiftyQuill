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