import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  request: Request,
  { params }: { params: { tagId: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { tagId } = await Promise.resolve(params)

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Check if tag exists and belongs to user
    const tag = await prisma.tag.findFirst({
      where: {
        id: tagId,
        userId: user.id,
        isDefault: false // Don't allow deleting default tags
      }
    })

    if (!tag) {
      return new NextResponse("Tag not found or cannot be deleted", { status: 404 })
    }

    // Delete all note-tag associations first
    await prisma.noteTag.deleteMany({
      where: {
        tagId: tagId
      }
    })

    // Then delete the tag
    await prisma.tag.delete({
      where: {
        id: tagId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[TAGS_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 