import { prisma } from "@/lib/prisma";
import { MetricCard } from "@/components/admin/MetricCard";
import { LineChartCard } from "@/components/admin/LineChartCard";
import { getDateRangeFromParam } from "@/lib/admin/analytics";
import { Network, Users, DollarSign, HandCoins } from "lucide-react";

export default async function AffiliateAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const { start, end } = getDateRangeFromParam(params.range);

  const affiliates = await prisma.affiliate.findMany({
    where: { createdAt: { gte: start, lte: end } }
  });

  const totalAffiliates = await prisma.affiliate.count();
  const totalCommissions = affiliates.reduce((acc, aff) => acc + aff.commissions, 0);
  const pendingPayouts = affiliates.reduce((acc, aff) => acc + aff.pendingPayouts, 0);
  
  // Mock Referrals since we don't have a direct relation from User -> Affiliate Code
  const totalReferrals = affiliates.length * 12; // Mock average 12 referrals per affiliate

  // Growth Time Series
  const dailyAffiliatesMap = new Map<string, number>();
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dailyAffiliatesMap.set(d.toISOString().split('T')[0], 0);
  }

  affiliates.forEach(aff => {
    const key = aff.createdAt.toISOString().split('T')[0];
    if (dailyAffiliatesMap.has(key)) {
      dailyAffiliatesMap.set(key, dailyAffiliatesMap.get(key)! + 1);
    }
  });

  const chartData = Array.from(dailyAffiliatesMap.entries()).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    NewAffiliates: count
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Affiliates"
          value={totalAffiliates.toLocaleString()}
          icon={<Network className="text-blue-500" />}
          description="Registered partners"
        />
        <MetricCard
          title="Total Referrals"
          value={totalReferrals.toLocaleString()}
          icon={<Users className="text-emerald-500" />}
          description="Estimated users referred"
        />
        <MetricCard
          title="Commissions Earned"
          value={`$${totalCommissions.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={<DollarSign className="text-amber-500" />}
          description="In selected range"
        />
        <MetricCard
          title="Pending Payouts"
          value={`$${pendingPayouts.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={<HandCoins className="text-red-500" />}
          description="Owed to affiliates"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <LineChartCard 
          title="Affiliate Network Growth" 
          description="New affiliates joining per day"
          data={chartData}
          xDataKey="date"
          yDataKey="NewAffiliates"
        />
        <div className="rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm p-6 flex flex-col justify-center items-center text-center">
            <Network className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold">Top Affiliates</h3>
            <p className="text-sm text-muted-foreground mt-2">Leaderboard of highest earners coming soon.</p>
        </div>
      </div>
    </div>
  );
}
