import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { validateEmail } from "@/lib/email-validation";
import { generateVerificationToken } from "@/lib/verification-token";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { email, password, username } = await request.json();

    if (!email || !password || !username) {
      return NextResponse.json({ message: "Email, password, and username are required" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ message: "Password must be at least 8 characters" }, { status: 400 });
    }

    const emailValidation = await validateEmail(email);
    if (!emailValidation.valid) {
      return NextResponse.json({ message: emailValidation.error }, { status: 400 });
    }

    const existingUserByEmail = await prisma.user.findUnique({ where: { email } });
    if (existingUserByEmail) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 400 });
    }

    const existingUserByUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUserByUsername) {
      return NextResponse.json({ message: "Username is already taken" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        emailVerified: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const token = await generateVerificationToken(email);
    const emailSent = await sendVerificationEmail(email, token);

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        message: emailSent
          ? "Account created. Please check your email to verify your account."
          : "Account created. Verification email could not be sent. Please contact support.",
        user: userWithoutPassword,
        emailSent,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
