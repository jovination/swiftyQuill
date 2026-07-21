import { prisma } from "@/lib/prisma";
import { MetricCard } from "@/components/admin/MetricCard";
import { LineChartCard } from "@/components/admin/LineChartCard";
import { getDateRangeFromParam } from "@/lib/admin/analytics";
import { CreditCard, Repeat, UserX, UserPlus } from "lucide-react";

export default async function SubscriptionAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const { start, end } = getDateRangeFromParam(params.range);

  const [
    activeSubs,
    cancelledSubs,
    newSubsInRange
  ] = await Promise.all([
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.subscription.count({ where: { status: "CANCELED" } }),
    prisma.subscription.count({ where: { startDate: { gte: start, lte: end } } }),
  ]);

  const totalHistoricalSubs = await prisma.subscription.count();
  const renewalRate = totalHistoricalSubs > 0 ? (((activeSubs) / totalHistoricalSubs) * 100).toFixed(1) : "0";

  // Subscription Time Series
  const subsInRangeData = await prisma.subscription.findMany({
    where: { startDate: { gte: start, lte: end } },
    select: { startDate: true }
  });

  const dailySubsMap = new Map<string, number>();
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dailySubsMap.set(d.toISOString().split('T')[0], 0);
  }

  subsInRangeData.forEach(sub => {
    if (!sub.startDate) return;
    const key = sub.startDate.toISOString().split('T')[0];
    if (dailySubsMap.has(key)) {
      dailySubsMap.set(key, dailySubsMap.get(key)! + 1);
    }
  });

  const chartData = Array.from(dailySubsMap.entries()).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    NewSubscriptions: count
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Active Subscriptions"
          value={activeSubs.toLocaleString()}
          icon={<CreditCard className="text-emerald-500" />}
          description="Currently paying users"
        />
        <MetricCard
          title="New Subscriptions"
          value={newSubsInRange.toLocaleString()}
          icon={<UserPlus className="text-blue-500" />}
          description="In selected range"
        />
        <MetricCard
          title="Renewal Rate"
          value={`${renewalRate}%`}
          icon={<Repeat className="text-indigo-500" />}
          description="Estimated overall retention"
        />
        <MetricCard
          title="Cancelled / Churned"
          value={cancelledSubs.toLocaleString()}
          icon={<UserX className="text-red-500" />}
          description="Historically cancelled"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <LineChartCard 
          title="Subscription Growth" 
          description="New subscriptions per day"
          data={chartData}
          xDataKey="date"
          yDataKey="NewSubscriptions"
        />
        <div className="rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm p-6 flex flex-col justify-center items-center text-center">
            <CreditCard className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold">Plan Distribution</h3>
            <p className="text-sm text-muted-foreground mt-2">Breakdown of Free vs Pro vs Elite coming soon.</p>
        </div>
      </div>
    </div>
  );
}
