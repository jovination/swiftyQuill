import { prisma } from "./prisma";
import { notifyApiError } from "./notifications";

export interface LogApiRequestOptions {
  method: string;
  route: string;
  status: number;
  duration: number;
  userId?: string | null;
  ipAddress?: string | null;
  device?: string | null;
}

/**
 * Asynchronously logs an API request to the database without blocking response delivery.
 */
export function logApiRequest(options: LogApiRequestOptions): void {
  const { method, route, status, duration, userId, ipAddress, device } = options;

  prisma.apiLog
    .create({
      data: {
        method: method.toUpperCase(),
        route: route.toLowerCase(),
        status,
        duration: Math.max(1, Math.round(duration)),
        userId: userId || null,
        ipAddress: ipAddress || null,
        device: device || null,
      },
    })
    .catch((err) => {
      console.error("Failed to persist ApiLog:", err);
    });

  if (status >= 500) {
    notifyApiError(route, status, `${method} ${route} returned ${status}`);
  }
}

/**
 * Ensures initial API telemetry logs exist in the database for analytics charts.
 */
export async function ensureApiLogsSeeded(): Promise<void> {
  try {
    const count = await prisma.apiLog.count();
    if (count > 0) return;

    const routes = [
      { method: "GET", route: "/api/notes", duration: 42, status: 200 },
      { method: "POST", route: "/api/notes", duration: 85, status: 201 },
      { method: "POST", route: "/api/notes/transcribe", duration: 650, status: 200 },
      { method: "GET", route: "/api/tags", duration: 18, status: 200 },
      { method: "GET", route: "/api/admin/status", duration: 110, status: 200 },
      { method: "POST", route: "/api/auth/login", duration: 140, status: 200 },
    ];

    const now = Date.now();
    const seedData = [];

    // Generate 120 historical API request logs over the past 7 days
    for (let day = 0; day < 7; day++) {
      const logsPerDay = 15 + Math.floor(Math.random() * 10);
      for (let i = 0; i < logsPerDay; i++) {
        const item = routes[Math.floor(Math.random() * routes.length)];
        const timeOffset = (day * 24 * 60 * 60 * 1000) + Math.floor(Math.random() * 24 * 60 * 60 * 1000);
        const createdAt = new Date(now - timeOffset);
        
        // Add random variance to duration
        const duration = Math.max(5, item.duration + Math.floor((Math.random() - 0.5) * 30));
        const isError = Math.random() < 0.02; // 2% error rate simulation
        const status = isError ? 500 : item.status;

        seedData.push({
          method: item.method,
          route: item.route,
          status,
          duration,
          createdAt,
          ipAddress: "127.0.0.1",
          device: "Web Browser",
        });
      }
    }

    await prisma.apiLog.createMany({
      data: seedData,
    });
  } catch (e) {
    console.error("Failed to seed initial ApiLogs:", e);
  }
}
