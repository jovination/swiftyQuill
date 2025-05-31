import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { name } = await request.json()

    if (!name) {
      return new NextResponse("Name is required", { status: 400 })
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Check if tag already exists for this user
    const existingTag = await prisma.tag.findFirst({
      where: {
        name,
        userId: user.id
      }
    })

    if (existingTag) {
      return new NextResponse("Tag already exists", { status: 400 })
    }

    // Create new tag
    const tag = await prisma.tag.create({
      data: {
        name,
        userId: user.id,
        isDefault: false
      }
    })

    return NextResponse.json(tag)
  } catch (error) {
    console.error("[TAGS_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 