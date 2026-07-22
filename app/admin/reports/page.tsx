import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/admin/DataTable";
import { FileText, CheckCircle2, XCircle, Clock } from "lucide-react";

export default async function AdminReportsPage() {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: { reporter: true }
  });

  const totalReports = reports.length;
  const pending = reports.filter(r => r.status === "PENDING").length;
  const resolved = reports.filter(r => r.status === "RESOLVED").length;
  const dismissed = reports.filter(r => r.status === "DISMISSED").length;

  const formattedData = reports.map(report => ({
    id: report.id,
    reporter: report.reporter?.username || report.reporter?.email || "Unknown",
    target: `${report.targetType} (${report.targetId || "N/A"})`,
    reason: report.reason,
    status: report.status,
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
    <div className="w-full pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-background via-muted/30 to-background p-6 rounded-3xl border border-border/50 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
              User Reports
            </h1>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-muted text-foreground border border-border">
              {pending} pending
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage user-submitted reports and complaints.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 font-semibold text-card-foreground">
            <FileText className="w-5 h-5 text-muted-foreground" />
            <span>Total Reports</span>
          </div>
          <div className="text-2xl font-black text-foreground">{totalReports}</div>
          <div className="text-xs text-muted-foreground">All time</div>
        </div>
        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 font-semibold text-card-foreground">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <span>Pending</span>
          </div>
          <div className="text-2xl font-black text-foreground">{pending}</div>
          <div className="text-xs text-muted-foreground">Awaiting action</div>
        </div>
        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 font-semibold text-card-foreground">
            <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
            <span>Resolved</span>
          </div>
          <div className="text-2xl font-black text-foreground">{resolved}</div>
          <div className="text-xs text-muted-foreground">Action taken</div>
        </div>
        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 font-semibold text-card-foreground">
            <XCircle className="w-5 h-5 text-muted-foreground" />
            <span>Dismissed</span>
          </div>
          <div className="text-2xl font-black text-foreground">{dismissed}</div>
          <div className="text-xs text-muted-foreground">No action needed</div>
        </div>
      </div>

      <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm">
        <DataTable data={formattedData} columns={columns} />
      </div>
    </div>
  );
}
