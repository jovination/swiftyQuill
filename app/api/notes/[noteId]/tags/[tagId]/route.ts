import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ noteId: string; tagId: string }> }
) {
  try {
    const { noteId, tagId } = await Promise.resolve(params)

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
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 