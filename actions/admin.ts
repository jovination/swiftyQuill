"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { notifyUserBanned, notifyUserSuspended, notifyNoteFlagged, notifyUserDeleted, notifyReportSubmitted } from "@/lib/notifications";

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

export async function updateUserStatus(userId: string, newStatus: "ACTIVE" | "BANNED" | "SUSPENDED") {
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

  if (newStatus === "BANNED") {
    notifyUserBanned(userId, admin.username || admin.email);
  } else if (newStatus === "SUSPENDED") {
    notifyUserSuspended(userId, admin.username || admin.email);
  }

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

  if (newStatus === "FLAGGED") {
    notifyNoteFlagged(noteId, admin.username || admin.email);
  }

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

  notifyUserDeleted(userId, admin.username || admin.email);

  return { success: true };
}

export async function createNotification(data: {
  title: string;
  body: string;
  audience: string;
  type?: string;
}) {
  const admin = await verifySuperAdmin();

  await prisma.notification.create({
    data: {
      title: data.title,
      body: data.body,
      audience: data.audience,
      type: data.type ?? "SYSTEM",
      senderId: admin.id,
    },
  });

  revalidatePath("/admin/notifications");
  return { success: true };
}

export async function updateReportStatus(reportId: string, newStatus: "RESOLVED" | "DISMISSED") {
  const admin = await verifySuperAdmin();

  await prisma.report.update({
    where: { id: reportId },
    data: { status: newStatus },
  });

  await prisma.auditLog.create({
    data: {
      action: "UPDATE_REPORT_STATUS",
      target: `Report:${reportId}`,
      newValue: newStatus,
      actorId: admin.id,
    },
  });

  revalidatePath("/admin/moderation");
  revalidatePath("/admin/reports");
  return { success: true };
}

export async function deleteNotification(notificationId: string) {
  await verifySuperAdmin();

  await prisma.notification.delete({
    where: { id: notificationId },
  });

  revalidatePath("/admin/notifications");
  return { success: true };
}
