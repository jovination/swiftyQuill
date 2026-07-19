import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/admin/DataTable";

export default async function AdminRevenuePage() {
  const payments = await prisma.userPayment.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" }
  });

  const formattedData = payments.map(payment => ({
    id: payment.id,
    user: payment.user.username || payment.user.email,
    amount: `$${(payment.amount / 100).toFixed(2)}`,
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">Revenue</h1>
        <p className="text-muted-foreground">Track incoming payments and platform revenue.</p>
      </div>
      <div className="rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm p-4 shadow-sm">
        <DataTable data={formattedData} columns={columns} />
      </div>
    </div>
  );
}
