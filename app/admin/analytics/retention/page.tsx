import { MetricCard } from "@/components/admin/MetricCard";
import { UserCheck, CalendarDays, Activity, RefreshCw } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function RetentionAnalyticsPage() {
  const users = await prisma.user.findMany({
    select: { id: true, createdAt: true }
  });
  
  const auditLogs = await prisma.auditLog.findMany({
    where: { action: "LOGIN" },
    select: { actorId: true, createdAt: true }
  });

  const userMap = new Map(users.map(u => [u.id, u.createdAt.getTime()]));

  let d1Eligible = 0, d1Retained = 0;
  let d7Eligible = 0, d7Retained = 0;
  let d30Eligible = 0, d30Retained = 0;

  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;

  for (const [userId, createdAtMs] of userMap.entries()) {
    const ageMs = now - createdAtMs;

    // Check Day 1 (24-48 hours after signup)
    if (ageMs > 2 * DAY_MS) {
      d1Eligible++;
      const returned = auditLogs.some(l => l.actorId === userId && l.createdAt.getTime() - createdAtMs >= DAY_MS && l.createdAt.getTime() - createdAtMs <= 2 * DAY_MS);
      if (returned) d1Retained++;
    }

    // Check Day 7
    if (ageMs > 8 * DAY_MS) {
      d7Eligible++;
      const returned = auditLogs.some(l => l.actorId === userId && l.createdAt.getTime() - createdAtMs >= 7 * DAY_MS && l.createdAt.getTime() - createdAtMs <= 8 * DAY_MS);
      if (returned) d7Retained++;
    }

    // Check Day 30
    if (ageMs > 31 * DAY_MS) {
      d30Eligible++;
      const returned = auditLogs.some(l => l.actorId === userId && l.createdAt.getTime() - createdAtMs >= 30 * DAY_MS && l.createdAt.getTime() - createdAtMs <= 31 * DAY_MS);
      if (returned) d30Retained++;
    }
  }

  const d1Retention = d1Eligible > 0 ? ((d1Retained / d1Eligible) * 100).toFixed(1) + "%" : "N/A";
  const d7Retention = d7Eligible > 0 ? ((d7Retained / d7Eligible) * 100).toFixed(1) + "%" : "N/A";
  const d30Retention = d30Eligible > 0 ? ((d30Retained / d30Eligible) * 100).toFixed(1) + "%" : "N/A";

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="1-Day Retention"
          value={d1Retention}
          icon={<UserCheck className="text-blue-500" />}
          description={d1Eligible > 0 ? `Based on ${d1Eligible} eligible users` : "Not enough data"}
        />
        <MetricCard
          title="7-Day Retention"
          value={d7Retention}
          icon={<CalendarDays className="text-amber-500" />}
          description={d7Eligible > 0 ? `Based on ${d7Eligible} eligible users` : "Not enough data"}
        />
        <MetricCard
          title="30-Day Retention"
          value={d30Retention}
          icon={<RefreshCw className="text-indigo-500" />}
          description={d30Eligible > 0 ? `Based on ${d30Eligible} eligible users` : "Not enough data"}
        />
        <MetricCard
          title="Avg Session Length"
          value="N/A"
          icon={<Activity className="text-emerald-500" />}
          description="Session tracking inactive"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm p-6 flex flex-col justify-center items-center text-center lg:col-span-2 min-h-[300px]">
            <RefreshCw className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold">Cohort Analysis Matrix</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-md">
                A detailed heatmap matrix showing retention cohorts over time requires complex SQL window functions or a dedicated event analytics pipeline. It will be implemented in a future update.
            </p>
        </div>
      </div>
    </div>
  );
}
