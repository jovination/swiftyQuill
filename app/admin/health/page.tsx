import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/admin/DataTable";

export default async function AdminHealthPage() {
  let dbStatus = "Disconnected";
  let dbPing = "N/A";
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbPing = `${Date.now() - start}ms`;
    dbStatus = "Connected";
  } catch (e) {
    dbStatus = "Error";
  }

  const formattedData = [
    { id: "1", service: "Database (PostgreSQL)", status: dbStatus, ping: dbPing },
    { id: "2", service: "Next.js App Server", status: "Connected", ping: "N/A" },
  ];

  const columns = [
    { header: "Service", accessorKey: "service" },
    { header: "Status", accessorKey: "status" },
    { header: "Latency", accessorKey: "ping" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">System Health</h1>
        <p className="text-muted-foreground">Live infrastructure monitoring and status.</p>
      </div>
      <div className="rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm p-4 shadow-sm">
        <DataTable data={formattedData} columns={columns} />
      </div>
    </div>
  );
}
