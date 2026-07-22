import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/admin/DataTable";
import { CreditCard, CheckCircle2, XCircle, Clock } from "lucide-react";

export default async function AdminSubscriptionsPage() {
  const subscriptions = await prisma.subscription.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" }
  });

  const totalSubs = subscriptions.length;
  const activeSubs = subscriptions.filter(s => s.status === "ACTIVE").length;
  const cancelledSubs = subscriptions.filter(s => s.status === "CANCELED").length;
  const pastDueSubs = subscriptions.filter(s => s.status === "PAUSED").length;

  const formattedData = subscriptions.map(sub => ({
    id: sub.id,
    user: sub.user.username || sub.user.email,
    plan: sub.plan,
    status: sub.status,
    periodEnd: sub.endDate.toLocaleDateString(),
  }));

  const columns = [
    { header: "User", accessorKey: "user" },
    { header: "Plan", accessorKey: "plan" },
    { header: "Status", accessorKey: "status" },
    { header: "Period End", accessorKey: "periodEnd" },
  ];

  return (
    <div className="w-full pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-background via-muted/30 to-background p-6 rounded-3xl border border-border/50 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
              Subscriptions
            </h1>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-muted text-foreground border border-border">
              {activeSubs} active
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage active premium and pro subscriptions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 font-semibold text-card-foreground">
            <CreditCard className="w-5 h-5 text-muted-foreground" />
            <span>Total Subscriptions</span>
          </div>
          <div className="text-2xl font-black text-foreground">{totalSubs}</div>
          <div className="text-xs text-muted-foreground">All subscriptions</div>
        </div>
        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 font-semibold text-card-foreground">
            <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
            <span>Active</span>
          </div>
          <div className="text-2xl font-black text-foreground">{activeSubs}</div>
          <div className="text-xs text-muted-foreground">Currently subscribed</div>
        </div>
        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 font-semibold text-card-foreground">
            <XCircle className="w-5 h-5 text-muted-foreground" />
            <span>Cancelled</span>
          </div>
          <div className="text-2xl font-black text-foreground">{cancelledSubs}</div>
          <div className="text-xs text-muted-foreground">Churned users</div>
        </div>
        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 font-semibold text-card-foreground">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <span>Past Due</span>
          </div>
          <div className="text-2xl font-black text-foreground">{pastDueSubs}</div>
          <div className="text-xs text-muted-foreground">Payment issues</div>
        </div>
      </div>

      <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm">
        <DataTable data={formattedData} columns={columns} />
      </div>
    </div>
  );
}
