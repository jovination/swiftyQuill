import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: { noteId: string; tagId: string } }
) {
  try {
    const noteId = await params.noteId
    const tagId = await params.tagId

    // Remove the tag from the note
    await prisma.noteTag.delete({
      where: {
        noteId_tagId: {
          noteId,
          tagId,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing tag:', error)
    return NextResponse.json(
      { error: 'Failed to remove tag' },
      { status: 500 }
    )
  }
} 