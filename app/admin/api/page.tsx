import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/admin/DataTable";

export default async function AdminApiLogsPage() {
  const logs = await prisma.apiLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100
  });

  const formattedData = logs.map(log => ({
    id: log.id,
    method: log.method,
    endpoint: log.route,
    status: log.status,
    duration: `${log.duration}ms`,
    ip: log.ipAddress || "N/A",
    time: log.createdAt.toLocaleString(),
  }));

  const columns = [
    { header: "Time", accessorKey: "time" },
    { header: "Method", accessorKey: "method" },
    { header: "Endpoint", accessorKey: "endpoint" },
    { header: "Status", accessorKey: "status" },
    { header: "Duration", accessorKey: "duration" },
    { header: "IP", accessorKey: "ip" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">API Logs</h1>
        <p className="text-muted-foreground">Monitor API health, response times, and status codes.</p>
      </div>
      <div className="rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm p-4 shadow-sm">
        <DataTable data={formattedData} columns={columns} />
      </div>
    </div>
  );
}
