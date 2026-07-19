import { prisma } from "@/lib/prisma";
import { MetricCard } from "@/components/admin/MetricCard";
import { LineChartCard } from "@/components/admin/LineChartCard";
import { getDateRangeFromParam } from "@/lib/admin/analytics";
import { Database, HardDrive, Image as ImageIcon, FileAudio, FileIcon } from "lucide-react";

export default async function StorageAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const { start, end } = getDateRangeFromParam(params.range);

  const usersWithStorage = await prisma.user.findMany({ select: { storageUsed: true } });
  const totalStorageBytes = usersWithStorage.reduce((acc, user) => acc + Number(user.storageUsed), 0);
  const totalStorageMB = (totalStorageBytes / (1024 * 1024)).toFixed(2);
  const avgStorageMB = usersWithStorage.length > 0 ? ((totalStorageBytes / usersWithStorage.length) / (1024 * 1024)).toFixed(2) : "0";

  // Mock breakdown for MVP
  const imageStorage = (Number(totalStorageMB) * 0.6).toFixed(2);
  const audioStorage = (Number(totalStorageMB) * 0.3).toFixed(2);
  const fileStorage = (Number(totalStorageMB) * 0.1).toFixed(2);

  // Mock Storage Growth Time Series
  const dailyStorageMap = new Map<string, number>();
  let runningStorage = Number(totalStorageMB) * 0.8; // start lower
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    runningStorage += Math.random() * 5; // random daily growth
    dailyStorageMap.set(d.toISOString().split('T')[0], runningStorage);
  }

  const chartData = Array.from(dailyStorageMap.entries()).map(([date, amount]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    StorageMB: amount.toFixed(2)
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Storage"
          value={`${totalStorageMB} MB`}
          icon={<Database className="text-blue-500" />}
          description="Across all users"
        />
        <MetricCard
          title="Average per User"
          value={`${avgStorageMB} MB`}
          icon={<HardDrive className="text-emerald-500" />}
          description="Mean storage usage"
        />
        <MetricCard
          title="Image Storage"
          value={`${imageStorage} MB`}
          icon={<ImageIcon className="text-pink-500" />}
          description="Estimated"
        />
        <MetricCard
          title="Audio Storage"
          value={`${audioStorage} MB`}
          icon={<FileAudio className="text-amber-500" />}
          description="Estimated"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <LineChartCard 
          title="Storage Growth Trend" 
          description="Total MB over time"
          data={chartData}
          xDataKey="date"
          yDataKey="StorageMB"
        />
        <div className="rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm p-6 flex flex-col justify-center items-center text-center">
            <Database className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold">Top Storage Consumers</h3>
            <p className="text-sm text-muted-foreground mt-2">Leaderboard of heaviest users coming soon.</p>
        </div>
      </div>
    </div>
  );
}
