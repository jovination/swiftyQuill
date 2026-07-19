import { MetricCard } from "@/components/admin/MetricCard";
import { UserCheck, CalendarDays, Activity, RefreshCw } from "lucide-react";

export default async function RetentionAnalyticsPage() {
  // Mock Retention Data
  const d1Retention = 45;
  const d7Retention = 28;
  const d30Retention = 15;
  const avgSessionLength = "4m 12s";

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="1-Day Retention"
          value={`${d1Retention}%`}
          icon={<UserCheck className="text-blue-500" />}
          description="Users returning next day"
        />
        <MetricCard
          title="7-Day Retention"
          value={`${d7Retention}%`}
          icon={<CalendarDays className="text-amber-500" />}
          description="Users returning after week"
        />
        <MetricCard
          title="30-Day Retention"
          value={`${d30Retention}%`}
          icon={<RefreshCw className="text-indigo-500" />}
          description="Users returning after month"
        />
        <MetricCard
          title="Avg Session Length"
          value={avgSessionLength}
          icon={<Activity className="text-emerald-500" />}
          description="Time spent per visit"
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
