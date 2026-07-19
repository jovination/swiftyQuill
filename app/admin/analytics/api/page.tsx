import { prisma } from "@/lib/prisma";
import { MetricCard } from "@/components/admin/MetricCard";
import { LineChartCard } from "@/components/admin/LineChartCard";
import { getDateRangeFromParam } from "@/lib/admin/analytics";
import { Activity, Server, Zap, AlertTriangle, Clock } from "lucide-react";

export default async function ApiAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const { start, end } = getDateRangeFromParam(params.range);

  const apiLogs = await prisma.apiLog.findMany({
    where: { createdAt: { gte: start, lte: end } },
    select: { status: true, duration: true, createdAt: true, method: true }
  });

  const totalRequests = apiLogs.length;
  const errors = apiLogs.filter(log => log.status >= 400).length;
  const errorRate = totalRequests > 0 ? ((errors / totalRequests) * 100).toFixed(2) : "0";
  
  const totalDuration = apiLogs.reduce((acc, log) => acc + log.duration, 0);
  const avgResponseTime = totalRequests > 0 ? Math.round(totalDuration / totalRequests) : 0;

  // Requests Time Series
  const dailyRequestsMap = new Map<string, number>();
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dailyRequestsMap.set(d.toISOString().split('T')[0], 0);
  }

  apiLogs.forEach(log => {
    const key = log.createdAt.toISOString().split('T')[0];
    if (dailyRequestsMap.has(key)) {
      dailyRequestsMap.set(key, dailyRequestsMap.get(key)! + 1);
    }
  });

  const chartData = Array.from(dailyRequestsMap.entries()).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    Requests: count
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Requests"
          value={totalRequests.toLocaleString()}
          icon={<Server className="text-blue-500" />}
          description="In selected range"
        />
        <MetricCard
          title="Error Rate"
          value={`${errorRate}%`}
          icon={<AlertTriangle className={Number(errorRate) > 5 ? "text-red-500" : "text-emerald-500"} />}
          description={`${errors} failed requests`}
        />
        <MetricCard
          title="Avg Response Time"
          value={`${avgResponseTime}ms`}
          icon={<Clock className="text-amber-500" />}
          description="Overall latency"
        />
        <MetricCard
          title="System Health"
          value={Number(errorRate) < 1 ? "Optimal" : Number(errorRate) < 5 ? "Stable" : "Degraded"}
          icon={<Zap className={Number(errorRate) < 1 ? "text-emerald-500" : "text-amber-500"} />}
          description="Based on error rate"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <LineChartCard 
          title="API Requests Trend" 
          description="Total requests per day"
          data={chartData}
          xDataKey="date"
          yDataKey="Requests"
        />
        <div className="rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm p-6 flex flex-col justify-center items-center text-center">
            <Activity className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold">Endpoint Breakdown</h3>
            <p className="text-sm text-muted-foreground mt-2">Latency & Method breakdown coming soon.</p>
        </div>
      </div>
    </div>
  );
}
