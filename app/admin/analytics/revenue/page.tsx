import { prisma } from "@/lib/prisma";
import { MetricCard } from "@/components/admin/MetricCard";
import { LineChartCard } from "@/components/admin/LineChartCard";
import { getDateRangeFromParam } from "@/lib/admin/analytics";
import { DollarSign, CreditCard } from "lucide-react";

export default async function RevenueAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const { start, end } = getDateRangeFromParam(params.range);

  const payments = await prisma.userPayment.findMany({
    where: { 
      createdAt: { gte: start, lte: end },
      status: "COMPLETED"
    },
    select: { amount: true, createdAt: true }
  });

  const totalRevenue = payments.reduce((acc, pay) => acc + pay.amount, 0);

  // Revenue Time Series
  const dailyRevenueMap = new Map<string, number>();
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dailyRevenueMap.set(d.toISOString().split('T')[0], 0);
  }

  payments.forEach(pay => {
    const key = pay.createdAt.toISOString().split('T')[0];
    if (dailyRevenueMap.has(key)) {
      dailyRevenueMap.set(key, dailyRevenueMap.get(key)! + pay.amount);
    }
  });

  const chartData = Array.from(dailyRevenueMap.entries()).map(([date, amount]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    Revenue: amount
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<DollarSign className="text-emerald-500" />}
          description="In selected range"
        />
        <MetricCard
          title="Completed Payments"
          value={payments.length.toLocaleString()}
          icon={<CreditCard className="text-amber-500" />}
          description="Successful transactions"
        />
      </div>

      <div className="rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm p-6">
        <LineChartCard 
          title="Revenue Trend" 
          description="Daily revenue in USD"
          data={chartData}
          xDataKey="date"
          yDataKey="Revenue"
        />
      </div>
    </div>
  );
}
