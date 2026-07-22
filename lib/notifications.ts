import { prisma } from "./prisma";

type NotificationType = "ACCOUNT" | "ERROR" | "ATTENTION" | "REPORT" | "INSIGHT" | "USAGE" | "SYSTEM";
type NotificationAudience = "ALL" | "PREMIUM" | "FREE";

/**
 * Fire-and-forget notification creator.
 * Uses a system sender (first SUPER_ADMIN) for automated notifications.
 */
export async function pushNotification(data: {
  title: string;
  body: string;
  type?: NotificationType;
  audience?: NotificationAudience;
  senderId?: string;
}) {
  try {
    let senderId = data.senderId;
    if (!senderId) {
      const admin = await prisma.user.findFirst({
        where: { role: { name: "SUPER_ADMIN" } },
        select: { id: true },
      });
      senderId = admin?.id;
    }
    if (!senderId) return;

    await prisma.notification.create({
      data: {
        title: data.title,
        body: data.body,
        type: data.type ?? "SYSTEM",
        audience: data.audience ?? "ALL",
        senderId,
      },
    });
  } catch {
    // silent — notifications should never break the main flow
  }
}

// ── Convenience helpers ──────────────────────────────────────────────

export function notifyNewUser(username: string, email: string) {
  return pushNotification({
    title: "New User Registered",
    body: `${username} (${email}) created a new account.`,
    type: "ACCOUNT",
  });
}

export function notifyFailedLogin(email: string, reason: string) {
  return pushNotification({
    title: "Failed Login Attempt",
    body: `Login failed for ${email}: ${reason}`,
    type: "ATTENTION",
  });
}

export function notifyReportSubmitted(reporter: string, targetType: string, reason: string) {
  return pushNotification({
    title: "New Report Submitted",
    body: `${reporter} reported a ${targetType}: ${reason}`,
    type: "REPORT",
  });
}

export function notifyUserBanned(targetUserId: string, adminName: string) {
  return pushNotification({
    title: "User Banned",
    body: `${adminName} banned user ${targetUserId}.`,
    type: "ATTENTION",
    audience: "ALL",
  });
}

export function notifyUserSuspended(targetUserId: string, adminName: string) {
  return pushNotification({
    title: "User Suspended",
    body: `${adminName} suspended user ${targetUserId}.`,
    type: "ATTENTION",
    audience: "ALL",
  });
}

export function notifyNoteFlagged(noteId: string, adminName: string) {
  return pushNotification({
    title: "Note Flagged",
    body: `${adminName} flagged note ${noteId} for review.`,
    type: "ATTENTION",
  });
}

export function notifyUserDeleted(targetUserId: string, adminName: string) {
  return pushNotification({
    title: "User Deleted",
    body: `${adminName} deleted user ${targetUserId}.`,
    type: "ATTENTION",
  });
}

export function notifyApiError(route: string, status: number, message: string) {
  return pushNotification({
    title: "API Error",
    body: `${status} on ${route}: ${message}`,
    type: "ERROR",
  });
}

export function notifySystemAlert(title: string, message: string) {
  return pushNotification({
    title,
    body: message,
    type: "SYSTEM",
  });
}

export function notifyUsageInsight(title: string, message: string) {
  return pushNotification({
    title,
    body: message,
    type: "INSIGHT",
  });
}
