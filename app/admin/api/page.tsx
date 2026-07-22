import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/admin/DataTable";
import { 
  Activity, 
  CheckCircle2, 
  Clock, 
  Globe, 
  RefreshCw, 
  ArrowUpDown,
  XCircle,
  AlertTriangle
} from "lucide-react";

export const revalidate = 0;

export default async function AdminApiLogsPage() {
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [recentLogs, totalLogs, logs24h, statusCounts, methodCounts, avgDuration, slowestRoutes] = await Promise.all([
    prisma.apiLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.apiLog.count(),
    prisma.apiLog.count({
      where: { createdAt: { gte: twentyFourHoursAgo } },
    }),
    prisma.apiLog.groupBy({
      by: ["status"],
      _count: { id: true },
      where: { createdAt: { gte: sevenDaysAgo } },
      orderBy: { _count: { id: "desc" } },
    }),
    prisma.apiLog.groupBy({
      by: ["method"],
      _count: { id: true },
      where: { createdAt: { gte: sevenDaysAgo } },
      orderBy: { _count: { id: "desc" } },
    }),
    prisma.apiLog.aggregate({
      _avg: { duration: true },
      where: { createdAt: { gte: sevenDaysAgo } },
    }),
    prisma.apiLog.groupBy({
      by: ["route"],
      _avg: { duration: true },
      _count: { id: true },
      where: { 
        createdAt: { gte: sevenDaysAgo },
        duration: { gt: 0 },
      },
      orderBy: { _avg: { duration: "desc" } },
      take: 5,
    }),
  ]);

  const errorCount = statusCounts
    .filter((s) => s.status >= 400)
    .reduce((sum, s) => sum + s._count.id, 0);

  const successCount = statusCounts
    .filter((s) => s.status < 400)
    .reduce((sum, s) => sum + s._count.id, 0);

  const successRate = totalLogs > 0 ? ((successCount / totalLogs) * 100).toFixed(1) : "0";
  const avgMs = avgDuration._avg.duration ? Math.round(avgDuration._avg.duration) : 0;

  const getStatusLabel = (status: number) => {
    if (status < 300) return `${status} ✓`;
    if (status < 400) return `${status}`;
    if (status < 500) return `${status} ⚠`;
    return `${status} ✗`;
  };

  const getStatusBadge = (status: number) => {
    if (status < 300) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-foreground border border-border">
          <CheckCircle2 className="w-3 h-3 text-muted-foreground" />
          {status}
        </span>
      );
    }
    if (status < 400) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-muted-foreground border border-border">
          {status}
        </span>
      );
    }
    if (status < 500) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-muted-foreground border border-border">
          <AlertTriangle className="w-3 h-3 text-muted-foreground" />
          {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-foreground border border-border">
        <XCircle className="w-3 h-3 text-muted-foreground" />
        {status}
      </span>
    );
  };

  const getMethodBadge = (method: string) => {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border bg-muted text-foreground border-border">
        {method}
      </span>
    );
  };

  const formattedData = recentLogs.map((log) => ({
    id: log.id,
    time: log.createdAt.toLocaleString(),
    method: log.method,
    endpoint: log.route,
    status: getStatusLabel(log.status),
    statusRaw: log.status,
    duration: `${log.duration}ms`,
    durationRaw: log.duration,
    ip: log.ipAddress || "N/A",
    device: log.device || "N/A",
  }));

  const columns = [
    { header: "Time", accessorKey: "time" },
    { header: "Method", accessorKey: "method" },
    { header: "Endpoint", accessorKey: "endpoint" },
    { header: "Status", accessorKey: "status" },
    { header: "Duration", accessorKey: "duration" },
    { header: "IP", accessorKey: "ip" },
    { header: "Device", accessorKey: "device" },
  ];

  const topRoutes = slowestRoutes.map((r) => ({
    route: r.route,
    avgDuration: Math.round(r._avg.duration || 0),
    count: r._count.id,
  }));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-background via-muted/30 to-background p-6 rounded-3xl border border-border/50 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
              API Logs
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-foreground border border-border">
              <Activity className="w-3.5 h-3.5 text-muted-foreground" />
              Live
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Monitor API health, response times, status codes, and endpoint performance.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Last 7 Days</div>
            <div className="text-2xl font-black text-foreground">{totalLogs.toLocaleString()}</div>
          </div>
          <a
            href="/admin/health"
            className="p-2.5 rounded-2xl bg-muted/80 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title="Refresh Logs"
          >
            <RefreshCw className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-card-foreground text-sm">
              <Activity className="w-4.5 h-4.5 text-muted-foreground" />
              <span>Total Requests (7d)</span>
            </div>
          </div>
          <div className="text-3xl font-black text-foreground">{totalLogs.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">{logs24h.toLocaleString()} in last 24h</div>
        </div>

        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-card-foreground text-sm">
              <CheckCircle2 className="w-4.5 h-4.5 text-muted-foreground" />
              <span>Success Rate</span>
            </div>
          </div>
          <div className="text-3xl font-black text-foreground">{successRate}%</div>
          <div className="text-xs text-muted-foreground">{successCount.toLocaleString()} successful</div>
        </div>

        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-card-foreground text-sm">
              <Clock className="w-4.5 h-4.5 text-muted-foreground" />
              <span>Avg Response Time</span>
            </div>
          </div>
          <div className="text-3xl font-black text-foreground">{avgMs}ms</div>
          <div className="text-xs text-muted-foreground">across all endpoints</div>
        </div>

        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-card-foreground text-sm">
              <XCircle className="w-4.5 h-4.5 text-muted-foreground" />
              <span>Errors (4xx / 5xx)</span>
            </div>
          </div>
          <div className="text-3xl font-black text-foreground">{errorCount.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">last 7 days</div>
        </div>
      </div>

      {/* Status Code & Method Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Code Breakdown */}
        <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-semibold text-card-foreground">
            <Globe className="w-5 h-5 text-muted-foreground" />
            <span>Status Code Breakdown</span>
          </div>
          <div className="space-y-2">
            {statusCounts.map((item) => {
              const pct = totalLogs > 0 ? ((item._count.id / totalLogs) * 100).toFixed(1) : "0";
              return (
                <div key={item.status} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(item.status)}
                      <span className="text-muted-foreground font-mono">{item._count.id.toLocaleString()} requests</span>
                    </div>
                    <span className="font-semibold text-foreground">{pct}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-muted/50 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-foreground transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {statusCounts.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">No data available</p>
            )}
          </div>
        </div>

        {/* Method Breakdown */}
        <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-semibold text-card-foreground">
            <ArrowUpDown className="w-5 h-5 text-muted-foreground" />
            <span>HTTP Method Distribution</span>
          </div>
          <div className="space-y-3">
            {methodCounts.map((item) => {
              const pct = totalLogs > 0 ? ((item._count.id / totalLogs) * 100).toFixed(1) : "0";
              return (
                <div key={item.method} className="flex items-center gap-4">
                  <div className="w-20 shrink-0">{getMethodBadge(item.method)}</div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-mono">{item._count.id.toLocaleString()} requests</span>
                      <span className="font-semibold text-foreground">{pct}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-muted/50 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-foreground transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            {methodCounts.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">No data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Slowest Routes */}
      {topRoutes.length > 0 && (
        <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-semibold text-card-foreground">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <span>Slowest Endpoints (Top 5)</span>
          </div>
          <div className="space-y-2">
            {topRoutes.map((r, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-muted/20 border border-border/40">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground w-5">#{idx + 1}</span>
                  <span className="font-mono text-xs font-medium text-foreground">{r.route}</span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-muted-foreground">{r.count.toLocaleString()} calls</span>
                  <span className="font-mono font-bold text-foreground">{r.avgDuration}ms avg</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Logs Table */}
      <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-card-foreground">
            <Activity className="w-5 h-5 text-muted-foreground" />
            <span>Recent Requests</span>
          </div>
          <span className="text-xs text-muted-foreground font-mono">Showing {formattedData.length} of {totalLogs.toLocaleString()}</span>
        </div>
        <DataTable data={formattedData} columns={columns} />
      </div>
    </div>
  );
}
