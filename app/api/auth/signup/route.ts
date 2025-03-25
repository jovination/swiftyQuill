import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { email, password, username } = await request.json()

    if (!email || !password || !username) {
      return NextResponse.json({ message: "Email, password, and username are required" }, { status: 400 })
    }

    const existingUserByEmail = await prisma.user.findUnique({ where: { email } })
    if (existingUserByEmail) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 400 })
    }

    const existingUserByUsername = await prisma.user.findUnique({ where: { username } })
    if (existingUserByUsername) {
      return NextResponse.json({ message: "Username is already taken" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({ message: "User created successfully", user: userWithoutPassword }, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

