import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/admin/DataTable";

export default async function AdminSubscriptionsPage() {
  const subscriptions = await prisma.subscription.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" }
  });

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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">Subscriptions</h1>
        <p className="text-muted-foreground">Manage active premium and pro subscriptions.</p>
      </div>
      <div className="rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm p-4 shadow-sm">
        <DataTable data={formattedData} columns={columns} />
      </div>
    </div>
  );
}
