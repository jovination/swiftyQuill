import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/verification-token";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/auth/verify-request?error=missing-token", request.url));
  }

  const result = await verifyToken(token);

  if (!result.valid || !result.email) {
    return NextResponse.redirect(new URL("/auth/verify-request?error=invalid-token", request.url));
  }

  await prisma.user.update({
    where: { email: result.email },
    data: { emailVerified: new Date() },
  });

  return NextResponse.redirect(new URL("/auth/verify-request?success=true", request.url));
}
