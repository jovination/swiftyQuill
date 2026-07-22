import { prisma } from "@/lib/prisma";
import { MetricCard } from "@/components/admin/MetricCard";
import { LineChartCard } from "@/components/admin/LineChartCard";
import { getDateRangeFromParam } from "@/lib/admin/analytics";
import { Users, FileText, Database, CreditCard, Activity } from "lucide-react";
import { getAllUserStorageBytes } from "@/lib/storage";
import { ensureApiLogsSeeded } from "@/lib/api-logger";

export default async function AnalyticsOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await ensureApiLogsSeeded();
  const params = await searchParams;
  const { start, end } = getDateRangeFromParam(params.range);

  // Parallelize data fetching
  const [
    totalUsers,
    newUsersInRange,
    totalNotes,
    notesInRange,
    activeSubscriptions,
    apiLogsInRange,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: start, lte: end } } }),
    prisma.note.count(),
    prisma.note.count({ where: { createdAt: { gte: start, lte: end } } }),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.apiLog.count({ where: { createdAt: { gte: start, lte: end } } })
  ]);

  const storageMap = await getAllUserStorageBytes();
  const totalStorageBytes = Array.from(storageMap.values()).reduce((acc, bytes) => acc + bytes, 0);
  const totalStorageMB = (totalStorageBytes / (1024 * 1024)).toFixed(2);

  // Time Series Data for User Growth in Range
  const usersInRangeData = await prisma.user.findMany({
    where: { createdAt: { gte: start, lte: end } },
    select: { createdAt: true }
  });

  const dailyGrowthMap = new Map<string, number>();
  // Pre-fill map to avoid gaps
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dailyGrowthMap.set(d.toISOString().split('T')[0], 0);
  }

  usersInRangeData.forEach(u => {
    const key = u.createdAt.toISOString().split('T')[0];
    if (dailyGrowthMap.has(key)) {
      dailyGrowthMap.set(key, dailyGrowthMap.get(key)! + 1);
    }
  });

  const chartData = Array.from(dailyGrowthMap.entries()).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    NewUsers: count
  }));

  // Notes Time Series
  const notesInRangeData = await prisma.note.findMany({
    where: { createdAt: { gte: start, lte: end } },
    select: { createdAt: true }
  });

  const dailyNotesMap = new Map<string, number>();
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dailyNotesMap.set(d.toISOString().split('T')[0], 0);
  }

  notesInRangeData.forEach(n => {
    const key = n.createdAt.toISOString().split('T')[0];
    if (dailyNotesMap.has(key)) {
      dailyNotesMap.set(key, dailyNotesMap.get(key)! + 1);
    }
  });

  const notesChartData = Array.from(dailyNotesMap.entries()).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    NotesCreated: count
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* KPI Cards */}
        <MetricCard
          title="Total Users"
          value={totalUsers.toLocaleString()}
          icon={<Users />}
          description="Registered users across platform"
        />
        <MetricCard
          title="New Users (Range)"
          value={newUsersInRange.toLocaleString()}
          icon={<Users className="text-emerald-500" />}
          description={`Joined between selected dates`}
        />
        <MetricCard
          title="Total Notes"
          value={totalNotes.toLocaleString()}
          icon={<FileText />}
          description="Total notes ever created"
        />
        <MetricCard
          title="Notes Created (Range)"
          value={notesInRange.toLocaleString()}
          icon={<FileText className="text-emerald-500" />}
          description="Created within selected dates"
        />
        <MetricCard
          title="Storage Used"
          value={`${totalStorageMB} MB`}
          icon={<Database />}
          description="Total uploaded media"
        />
        <MetricCard
          title="Active Subscriptions"
          value={activeSubscriptions.toLocaleString()}
          icon={<CreditCard />}
          description="Current premium users"
        />
        <MetricCard
          title="API Requests (Range)"
          value={apiLogsInRange.toLocaleString()}
          icon={<Activity />}
          description="Platform API usage"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <LineChartCard 
          title="User Growth (Selected Range)" 
          description="New users joining per day"
          data={chartData}
          xDataKey="date"
          yDataKey="NewUsers"
        />
        <LineChartCard 
          title="Note Creation (Selected Range)" 
          description="Notes created per day"
          data={notesChartData}
          xDataKey="date"
          yDataKey="NotesCreated"
        />
      </div>
    </div>
  );
}
