import { MetricCard } from "@/components/admin/MetricCard";
import { UserCheck, CalendarDays, Activity, RefreshCw } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function RetentionAnalyticsPage() {
  const users = await prisma.user.findMany({
    select: { id: true, createdAt: true },
  });

  const sessions = await prisma.session.findMany({
    select: { userId: true, createdAt: true },
  });

  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;

  const sessionsByUser = new Map<string, Date[]>();
  for (const s of sessions) {
    const arr = sessionsByUser.get(s.userId) ?? [];
    arr.push(s.createdAt);
    sessionsByUser.set(s.userId, arr);
  }

  let d1Eligible = 0, d1Retained = 0;
  let d7Eligible = 0, d7Retained = 0;
  let d30Eligible = 0, d30Retained = 0;

  for (const user of users) {
    const signupMs = user.createdAt.getTime();
    const ageDays = (now - signupMs) / DAY_MS;

    if (ageDays >= 2) {
      d1Eligible++;
      const userSessions = sessionsByUser.get(user.id) ?? [];
      const returned = userSessions.some(
        (s) => s.getTime() >= signupMs + DAY_MS
      );
      if (returned) d1Retained++;
    }

    if (ageDays >= 8) {
      d7Eligible++;
      const userSessions = sessionsByUser.get(user.id) ?? [];
      const returned = userSessions.some(
        (s) => s.getTime() >= signupMs + 7 * DAY_MS
      );
      if (returned) d7Retained++;
    }

    if (ageDays >= 31) {
      d30Eligible++;
      const userSessions = sessionsByUser.get(user.id) ?? [];
      const returned = userSessions.some(
        (s) => s.getTime() >= signupMs + 30 * DAY_MS
      );
      if (returned) d30Retained++;
    }
  }

  const d1Retention =
    d1Eligible > 0 ? ((d1Retained / d1Eligible) * 100).toFixed(1) + "%" : "N/A";
  const d7Retention =
    d7Eligible > 0 ? ((d7Retained / d7Eligible) * 100).toFixed(1) + "%" : "N/A";
  const d30Retention =
    d30Eligible > 0
      ? ((d30Retained / d30Eligible) * 100).toFixed(1) + "%"
      : "N/A";

  const avgSessionLength =
    sessions.length > 0
      ? (() => {
          let totalMs = 0;
          let count = 0;
          for (const s of sessions) {
            const created = s.createdAt.getTime();
            const expires = new Date(
              Date.now() + 30 * DAY_MS
            ).getTime();
            const diff = expires - created;
            if (diff > 0 && diff < 30 * DAY_MS) {
              totalMs += diff;
              count++;
            }
          }
          if (count === 0) return "N/A";
          const avgMs = totalMs / count;
          const hours = Math.floor(avgMs / (60 * 60 * 1000));
          const mins = Math.floor(
            (avgMs % (60 * 60 * 1000)) / (60 * 1000)
          );
          return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
        })()
      : "N/A";

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="1-Day Retention"
          value={d1Retention}
          icon={<UserCheck />}
          description={
            d1Eligible > 0
              ? `${d1Retained} of ${d1Eligible} eligible users`
              : "Not enough data"
          }
        />
        <MetricCard
          title="7-Day Retention"
          value={d7Retention}
          icon={<CalendarDays />}
          description={
            d7Eligible > 0
              ? `${d7Retained} of ${d7Eligible} eligible users`
              : "Not enough data"
          }
        />
        <MetricCard
          title="30-Day Retention"
          value={d30Retention}
          icon={<RefreshCw />}
          description={
            d30Eligible > 0
              ? `${d30Retained} of ${d30Eligible} eligible users`
              : "Not enough data"
          }
        />
        <MetricCard
          title="Avg Session Length"
          value={avgSessionLength}
          icon={<Activity />}
          description={`Based on ${sessions.length} sessions`}
        />
      </div>
    </div>
  );
}
