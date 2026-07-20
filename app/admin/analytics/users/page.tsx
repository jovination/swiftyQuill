import { prisma } from "@/lib/prisma";
import { MetricCard } from "@/components/admin/MetricCard";
import { LineChartCard } from "@/components/admin/LineChartCard";
import { getDateRangeFromParam } from "@/lib/admin/analytics";
import { Users, UserPlus, UserMinus, LogIn } from "lucide-react";

export default async function AnalyticsUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const { start, end } = getDateRangeFromParam(params.range);

  const [
    newUsers,
    bannedUsers,
    accounts,
  ] = await Promise.all([
    prisma.user.count({ where: { createdAt: { gte: start, lte: end } } }),
    prisma.user.count({ where: { status: "BANNED" } }),
    prisma.account.groupBy({
      by: ['provider'],
      _count: { provider: true }
    })
  ]);

  const loginMethodsMap = new Map<string, number>();
  accounts.forEach(acc => {
    loginMethodsMap.set(acc.provider, acc._count.provider);
  });
  
  const totalWithAccounts = accounts.reduce((sum, acc) => sum + acc._count.provider, 0);
  const totalUsers = await prisma.user.count();
  const emailUsers = totalUsers - totalWithAccounts;
  if (emailUsers > 0) loginMethodsMap.set("Email", emailUsers);

  const growthData = await prisma.user.findMany({
    where: { createdAt: { gte: start, lte: end } },
    select: { createdAt: true }
  });

  const dailyGrowthMap = new Map<string, number>();
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dailyGrowthMap.set(d.toISOString().split('T')[0], 0);
  }

  growthData.forEach(u => {
    const key = u.createdAt.toISOString().split('T')[0];
    if (dailyGrowthMap.has(key)) {
      dailyGrowthMap.set(key, dailyGrowthMap.get(key)! + 1);
    }
  });

  const chartData = Array.from(dailyGrowthMap.entries()).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    NewUsers: count
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Users"
          value={totalUsers.toLocaleString()}
          icon={<Users />}
          description="All registered users"
        />
        <MetricCard
          title="New Users"
          value={newUsers.toLocaleString()}
          icon={<UserPlus className="text-emerald-500" />}
          description="Joined in selected range"
        />
        <MetricCard
          title="Banned Users"
          value={bannedUsers.toLocaleString()}
          icon={<UserMinus className="text-red-500" />}
          description="Total suspended/banned"
        />
        <MetricCard
          title="Auth Providers"
          value={accounts.length.toLocaleString()}
          icon={<LogIn className="text-blue-500" />}
          description="Active login methods"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <LineChartCard 
          title="User Growth Trend" 
          description="New signups per day"
          data={chartData}
          xDataKey="date"
          yDataKey="NewUsers"
        />

        <div className="rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm p-6">
          <h3 className="text-lg font-semibold leading-none tracking-tight flex items-center">
            <LogIn className="w-5 h-5 mr-2" />
            Login Methods
          </h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Distribution of authentication providers</p>
          <div className="space-y-4">
            {Array.from(loginMethodsMap.entries()).map(([provider, count]) => (
              <div key={provider} className="flex items-center justify-between p-3 rounded-lg bg-accent/20 border border-border/50">
                <span className="font-medium capitalize">{provider}</span>
                <span className="text-muted-foreground">{count} users</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
