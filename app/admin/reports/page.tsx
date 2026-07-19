import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/admin/DataTable";

export default async function AdminReportsPage() {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: { reporter: true }
  });

  const formattedData = reports.map(report => ({
    id: report.id,
    reporter: report.reporter?.username || report.reporter?.email || "Unknown",
    target: `${report.targetType} (${report.targetId || "N/A"})`,
    reason: report.reason,
    status: (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
        report.status === 'RESOLVED' ? 'bg-green-500/20 text-green-400' : 
        report.status === 'DISMISSED' ? 'bg-muted text-muted-foreground' : 
        'bg-amber-500/20 text-amber-400'
      }`}>
        {report.status}
      </span>
    ),
    date: report.createdAt.toLocaleString(),
  }));

  const columns = [
    { header: "Date", accessorKey: "date" },
    { header: "Reporter", accessorKey: "reporter" },
    { header: "Target", accessorKey: "target" },
    { header: "Reason", accessorKey: "reason" },
    { header: "Status", accessorKey: "status" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">User Reports</h1>
        <p className="text-muted-foreground">Manage user-submitted reports and complaints.</p>
      </div>
      <div className="rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm p-4 shadow-sm">
        <DataTable data={formattedData} columns={columns} />
      </div>
    </div>
  );
}
