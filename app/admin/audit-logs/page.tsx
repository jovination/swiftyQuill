import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/admin/DataTable";
import { ScrollText, Shield, Globe, Monitor } from "lucide-react";

export default async function AdminAuditLogsPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    include: { actor: true },
    take: 200
  });

  const totalLogs = logs.length;
  const uniqueActors = new Set(logs.map(l => l.actor?.id).filter(Boolean)).size;
  const adminActions = logs.filter(l => l.action.includes("ADMIN") || l.action.includes("BAN") || l.action.includes("DELETE")).length;

  const formattedLogs = logs.map(log => ({
    id: log.id,
    actor: log.actor?.username || log.actor?.email || "System",
    action: log.action,
    target: log.target,
    ip: log.ipAddress || "N/A",
    location: log.location || "N/A",
    device: log.device || "N/A",
    createdAt: log.createdAt.toLocaleString(),
  }));

  const columns = [
    { header: "Timestamp", accessorKey: "createdAt" },
    { header: "Actor", accessorKey: "actor" },
    { header: "Action", accessorKey: "action" },
    { header: "Target", accessorKey: "target" },
    { header: "Location", accessorKey: "location" },
    { header: "Device", accessorKey: "device" },
    { header: "IP Address", accessorKey: "ip" },
  ];

  return (
    <div className="w-full pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-background via-muted/30 to-background p-6 rounded-3xl border border-border/50 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
              System Audit Logs
            </h1>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Chronological record of all administrative and system actions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 font-semibold text-card-foreground">
            <ScrollText className="w-5 h-5 text-muted-foreground" />
            <span>Total Entries</span>
          </div>
          <div className="text-2xl font-black text-foreground">{totalLogs}</div>
          <div className="text-xs text-muted-foreground">Recent log entries</div>
        </div>
        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 font-semibold text-card-foreground">
            <Shield className="w-5 h-5 text-muted-foreground" />
            <span>Unique Actors</span>
          </div>
          <div className="text-2xl font-black text-foreground">{uniqueActors}</div>
          <div className="text-xs text-muted-foreground">Distinct users active</div>
        </div>
        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 font-semibold text-card-foreground">
            <Globe className="w-5 h-5 text-muted-foreground" />
            <span>Admin Actions</span>
          </div>
          <div className="text-2xl font-black text-foreground">{adminActions}</div>
          <div className="text-xs text-muted-foreground">Sensitive operations</div>
        </div>
        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 font-semibold text-card-foreground">
            <Monitor className="w-5 h-5 text-muted-foreground" />
            <span>Max Retention</span>
          </div>
          <div className="text-2xl font-black text-foreground">200</div>
          <div className="text-xs text-muted-foreground">Entries per query</div>
        </div>
      </div>

      <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm">
        <DataTable data={formattedLogs} columns={columns} />
      </div>
    </div>
  );
}
