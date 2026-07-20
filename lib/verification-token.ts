import crypto from "crypto";
import { prisma } from "./prisma";

const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function generateVerificationToken(email: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + TOKEN_EXPIRY_MS);

  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  return token;
}

export async function verifyToken(token: string): Promise<{ valid: boolean; email?: string }> {
  const record = await prisma.verificationToken.findFirst({
    where: { token },
  });

  if (!record) {
    return { valid: false };
  }

  if (new Date() > record.expires) {
    await prisma.verificationToken.delete({
      where: { identifier_token: { identifier: record.identifier, token: record.token } },
    });
    return { valid: false };
  }

  await prisma.verificationToken.delete({
    where: { identifier_token: { identifier: record.identifier, token: record.token } },
  });

  return { valid: true, email: record.identifier };
}
