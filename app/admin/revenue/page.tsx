import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/admin/DataTable";
import { DollarSign, TrendingUp, CreditCard, Clock } from "lucide-react";

export default async function AdminRevenuePage() {
  const payments = await prisma.userPayment.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" }
  });

  const totalPayments = payments.length;
  const successfulPayments = payments.filter(p => p.status === "COMPLETED");
  const totalRevenue = successfulPayments.reduce((sum, p) => sum + p.amount, 0);
  const pendingPayments = payments.filter(p => p.status === "PENDING").length;

  const formattedData = payments.map(payment => ({
    id: payment.id,
    user: payment.user.username || payment.user.email,
    amount: `$${payment.amount.toFixed(2)}`,
    currency: payment.currency.toUpperCase(),
    status: payment.status,
    date: payment.createdAt.toLocaleDateString(),
  }));

  const columns = [
    { header: "User", accessorKey: "user" },
    { header: "Amount", accessorKey: "amount" },
    { header: "Currency", accessorKey: "currency" },
    { header: "Status", accessorKey: "status" },
    { header: "Date", accessorKey: "date" },
  ];

  return (
    <div className="w-full pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-background via-muted/30 to-background p-6 rounded-3xl border border-border/50 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
              Revenue
            </h1>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Track incoming payments and platform revenue.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 font-semibold text-card-foreground">
            <DollarSign className="w-5 h-5 text-muted-foreground" />
            <span>Total Revenue</span>
          </div>
          <div className="text-2xl font-black text-foreground">${totalRevenue.toFixed(2)}</div>
          <div className="text-xs text-muted-foreground">All time</div>
        </div>
        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 font-semibold text-card-foreground">
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
            <span>Successful</span>
          </div>
          <div className="text-2xl font-black text-foreground">{successfulPayments.length}</div>
          <div className="text-xs text-muted-foreground">Completed payments</div>
        </div>
        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 font-semibold text-card-foreground">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <span>Pending</span>
          </div>
          <div className="text-2xl font-black text-foreground">{pendingPayments}</div>
          <div className="text-xs text-muted-foreground">Awaiting confirmation</div>
        </div>
        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 font-semibold text-card-foreground">
            <CreditCard className="w-5 h-5 text-muted-foreground" />
            <span>Total Transactions</span>
          </div>
          <div className="text-2xl font-black text-foreground">{totalPayments}</div>
          <div className="text-xs text-muted-foreground">All payment attempts</div>
        </div>
      </div>

      <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm">
        <DataTable data={formattedData} columns={columns} />
      </div>
    </div>
  );
}
