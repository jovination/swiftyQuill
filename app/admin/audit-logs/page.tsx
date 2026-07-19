import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/admin/DataTable";

export default async function AdminAuditLogsPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    include: { actor: true },
    take: 100 // Limit to recent 100 for performance
  });

  const formattedLogs = logs.map(log => ({
    id: log.id,
    actor: log.actor?.username || log.actor?.email || "System",
    action: log.action,
    target: log.target,
    ip: log.ipAddress || "N/A",
    createdAt: log.createdAt.toLocaleString(),
  }));

  const columns = [
    { header: "Timestamp", accessorKey: "createdAt" },
    { header: "Actor", accessorKey: "actor" },
    { header: "Action", accessorKey: "action" },
    { header: "Target", accessorKey: "target" },
    { header: "IP Address", accessorKey: "ip" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
          System Audit Logs
        </h1>
        <p className="text-muted-foreground">Chronological record of all administrative and system actions.</p>
      </div>
      <div className="rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm p-4 shadow-sm">
        <DataTable data={formattedLogs} columns={columns} />
      </div>
    </div>
  );
}
