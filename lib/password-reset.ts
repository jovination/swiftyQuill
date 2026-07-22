import crypto from "crypto";
import { prisma } from "./prisma";

const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export async function generatePasswordResetToken(email: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + TOKEN_EXPIRY_MS);

  await prisma.passwordResetToken.deleteMany({
    where: { email },
  });

  await prisma.passwordResetToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  return token;
}

export async function verifyPasswordResetToken(token: string): Promise<{ valid: boolean; email?: string }> {
  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!record) {
    return { valid: false };
  }

  if (new Date() > record.expires) {
    await prisma.passwordResetToken.delete({
      where: { email_token: { email: record.email, token: record.token } },
    });
    return { valid: false };
  }

  return { valid: true, email: record.email };
}

export async function deletePasswordResetToken(email: string): Promise<void> {
  await prisma.passwordResetToken.deleteMany({
    where: { email },
  });
}
