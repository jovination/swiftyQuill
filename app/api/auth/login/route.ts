import { signIn } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false
    })

    if (result?.error) {
      return NextResponse.json({ message: result.error }, { status: 401 })
    }

    return NextResponse.json({ message: "Login successful" }, { status: 200 })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}