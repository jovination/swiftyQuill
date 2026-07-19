import { prisma } from "@/lib/prisma";
import { MetricCard } from "@/components/admin/MetricCard";
import { LineChartCard } from "@/components/admin/LineChartCard";
import { getDateRangeFromParam } from "@/lib/admin/analytics";
import { DollarSign, TrendingUp, CreditCard, Receipt } from "lucide-react";

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

  // MRR & ARR Mocking (assuming total revenue is lifetime or based on active subs)
  // Realistically MRR = active subscriptions * plan price
  const activeSubs = await prisma.subscription.count({ where: { status: "ACTIVE" } });
  const MRR = activeSubs * 9.99; // Mocking a $9.99/mo plan
  const ARR = MRR * 12;

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
          title="MRR"
          value={`$${MRR.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<TrendingUp className="text-blue-500" />}
          description="Monthly Recurring Revenue"
        />
        <MetricCard
          title="ARR"
          value={`$${ARR.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<TrendingUp className="text-indigo-500" />}
          description="Annual Recurring Revenue"
        />
        <MetricCard
          title="Completed Payments"
          value={payments.length.toLocaleString()}
          icon={<CreditCard className="text-amber-500" />}
          description="Successful transactions"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <LineChartCard 
          title="Revenue Trend" 
          description="Daily revenue in USD"
          data={chartData}
          xDataKey="date"
          yDataKey="Revenue"
        />
        <div className="rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm p-6 flex flex-col justify-center items-center text-center">
            <Receipt className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold">Payment History</h3>
            <p className="text-sm text-muted-foreground mt-2">Recent transactions and refunds coming soon.</p>
        </div>
      </div>
    </div>
  );
}
