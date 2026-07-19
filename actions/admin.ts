"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Utility to verify SUPER_ADMIN
async function verifySuperAdmin() {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { role: true }
  });
  
  if (user?.role?.name !== "SUPER_ADMIN") {
    throw new Error("Forbidden: Super Admin only");
  }
  
  return user;
}

export async function updateUserStatus(userId: string, newStatus: "ACTIVE" | "BANNED") {
  const admin = await verifySuperAdmin();
  
  await prisma.user.update({
    where: { id: userId },
    data: { status: newStatus }
  });

  await prisma.auditLog.create({
    data: {
      action: "UPDATE_USER_STATUS",
      target: `User:${userId}`,
      newValue: newStatus,
      actorId: admin.id,
    }
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function updateNoteStatus(noteId: string, newStatus: "ACTIVE" | "FLAGGED" | "REMOVED") {
  const admin = await verifySuperAdmin();
  
  await prisma.note.update({
    where: { id: noteId },
    data: { status: newStatus }
  });

  await prisma.auditLog.create({
    data: {
      action: "UPDATE_NOTE_STATUS",
      target: `Note:${noteId}`,
      newValue: newStatus,
      actorId: admin.id,
    }
  });

  revalidatePath("/admin/content");
  revalidatePath("/admin/moderation");
  return { success: true };
}

export async function deleteUser(userId: string) {
  const admin = await verifySuperAdmin();
  
  await prisma.user.delete({
    where: { id: userId }
  });

  await prisma.auditLog.create({
    data: {
      action: "DELETE_USER",
      target: `User:${userId}`,
      actorId: admin.id,
    }
  });

  revalidatePath("/admin/users");
  return { success: true };
}
