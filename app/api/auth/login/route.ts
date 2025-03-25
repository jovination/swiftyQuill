import { signIn } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
    try {
      const { email, password } = await request.json()
  
      if (!email || !password) {
        return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
      }
  
      try {
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        })
  
        if (!result?.error) {
          return NextResponse.json({ message: "Login successful" }, { status: 200 })
        } else {
          return NextResponse.json({ message: result.error || "Invalid credentials" }, { status: 401 })
        }
      } catch (error) {
        console.error("Authentication error:", error)
        return NextResponse.json({ message: "Authentication failed" }, { status: 401 })
      }
    } catch (error) {
      console.error("Error during login:", error)
      return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
  }