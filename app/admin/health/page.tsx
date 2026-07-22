import { getAdminSystemStatus } from "@/lib/admin-status";
import { 
  Database, 
  Cpu, 
  HardDrive, 
  Server, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw,
  Activity,
  Key,
  ShieldCheck,
  Zap,
  Users,
  FileText,
  Mic,
  Tag
} from "lucide-react";

export const revalidate = 0; // Dynamic server-side rendering

export default async function AdminHealthPage() {
  const data = await getAdminSystemStatus();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-foreground border border-border">
            <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" />
            Healthy
          </span>
        );
      case "degraded":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
            <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground" />
            Degraded
          </span>
        );
      case "warning":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
            <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground" />
            Warning
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-foreground border border-border">
            <XCircle className="w-3.5 h-3.5 text-muted-foreground" />
            Critical
          </span>
        );
    }
  };

  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-background via-muted/30 to-background p-6 rounded-3xl border border-border/50 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
              System Status & Health
            </h1>
            {getStatusBadge(data.overall.status)}
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Real-time infrastructure health, storage metrics, Groq AI status, and system telemetry.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Health Score</div>
            <div className="text-2xl font-black text-foreground">{data.overall.score}%</div>
          </div>
          <a
            href="/admin/health"
            className="p-2.5 rounded-2xl bg-muted/80 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Services Grid (4 Infrastructure Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* 1. Database Card */}
        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-card-foreground">
                <Database className="w-5 h-5 text-muted-foreground" />
                <span>PostgreSQL DB</span>
              </div>
              {getStatusBadge(data.database.status)}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1 pt-1">
              <span>Latency:</span>
              <span className="font-mono font-medium text-foreground">{data.database.latencyMs}ms</span>
            </div>
          </div>

          <div className="space-y-2 text-xs border-t border-border/40 pt-3">
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Total Users</span>
              <span className="font-semibold text-foreground">{data.database.users}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Total Notes</span>
              <span className="font-semibold text-foreground">{data.database.notes}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Voice Notes</span>
              <span className="font-semibold text-foreground">{data.database.voiceNotes}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Action Items</span>
              <span className="font-semibold text-foreground">{data.database.actionItems}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Avg Note Size</span>
              <span className="font-semibold text-foreground">{data.database.averageNoteSizeChars} chars</span>
            </div>
          </div>
        </div>

        {/* 2. Groq AI Card */}
        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-card-foreground">
                <Cpu className="w-5 h-5 text-muted-foreground" />
                <span>Groq AI Service</span>
              </div>
              {getStatusBadge(data.groq.status)}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1 pt-1">
              <span>API Ping:</span>
              <span className="font-mono font-medium text-foreground">{data.groq.latencyMs}ms</span>
            </div>
          </div>

          <div className="space-y-2 text-xs border-t border-border/40 pt-3">
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">STT Model</span>
              <span className="font-mono font-semibold text-foreground truncate max-w-[120px]" title={data.groq.sttModel}>{data.groq.sttModel}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">LLM Model</span>
              <span className="font-mono font-semibold text-foreground truncate max-w-[120px]" title={data.groq.llmModel}>llama-3.3-70b</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Transcriptions</span>
              <span className="font-semibold text-foreground">{data.groq.transcriptionsCount}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">AI Summaries</span>
              <span className="font-semibold text-foreground">{data.groq.summariesCount}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Success Rate</span>
              <span className="font-semibold text-foreground">{data.groq.successRate}</span>
            </div>
          </div>
        </div>

        {/* 3. Cloudflare R2 Storage Card */}
        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-card-foreground">
                <HardDrive className="w-5 h-5 text-muted-foreground" />
                <span>Cloudflare R2</span>
              </div>
              {getStatusBadge(data.storage.status)}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1 pt-1">
              <span>Response:</span>
              <span className="font-mono font-medium text-foreground">{data.storage.latencyMs}ms</span>
            </div>
          </div>

          <div className="space-y-2 text-xs border-t border-border/40 pt-3">
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Total Storage</span>
              <span className="font-bold text-foreground">{data.storage.storage.totalFormatted}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Audio Files</span>
              <span className="font-semibold text-foreground">{data.storage.storage.audioFormatted} ({data.storage.files.audio})</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Images</span>
              <span className="font-semibold text-foreground">{data.storage.storage.imagesFormatted} ({data.storage.files.images})</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Total Files</span>
              <span className="font-semibold text-foreground">{data.storage.files.total}</span>
            </div>
          </div>
        </div>

        {/* 4. Server Runtime Card */}
        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-card-foreground">
                <Server className="w-5 h-5 text-muted-foreground" />
                <span>App Server</span>
              </div>
              {getStatusBadge("healthy")}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1 pt-1">
              <span>Node:</span>
              <span className="font-mono font-medium text-foreground">{data.server.nodeVersion}</span>
            </div>
          </div>

          <div className="space-y-2 text-xs border-t border-border/40 pt-3">
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Uptime</span>
              <span className="font-semibold text-foreground">{formatUptime(data.server.uptimeSeconds)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Heap Used</span>
              <span className="font-semibold text-foreground">{data.server.memory.heapUsedMB} MB / {data.server.memory.heapTotalMB} MB</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">RSS Memory</span>
              <span className="font-semibold text-foreground">{data.server.memory.rssMB} MB</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Environment</span>
              <span className="font-mono font-semibold uppercase text-foreground">{data.server.environment}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Middle Grid: Environment Check & Application Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Environment Keys Validation Matrix */}
        <div className="lg:col-span-2 rounded-3xl border border-border/50 bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-card-foreground">
              <ShieldCheck className="w-5 h-5 text-muted-foreground" />
              <span>Environment Configuration Checks</span>
            </div>
            <span className="text-xs text-muted-foreground">Secrets hidden</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {Object.entries(data.env).map(([key, isConfigured]) => (
              <div
                key={key}
                className="flex items-center justify-between p-3 rounded-2xl border border-border/40 bg-muted/20"
              >
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-muted-foreground" />
                  <span className="font-mono text-xs font-medium text-foreground">{key}</span>
                </div>
                {isConfigured ? (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-muted text-foreground border border-border">
                    Configured
                  </span>
                ) : (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-muted text-foreground border border-border">
                    Missing
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Application Metrics Today */}
        <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 font-semibold text-card-foreground">
            <Activity className="w-5 h-5 text-muted-foreground" />
            <span>Today's Application Usage</span>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/20 border border-border/40">
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Notes Created</span>
              </div>
              <span className="text-base font-bold text-foreground">{data.application.notesCreatedToday}</span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/20 border border-border/40">
              <div className="flex items-center gap-2.5">
                <Mic className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Voice Memos Processed</span>
              </div>
              <span className="text-base font-bold text-foreground">{data.application.voiceNotesToday}</span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/20 border border-border/40">
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Active Users Today</span>
              </div>
              <span className="text-base font-bold text-foreground">{data.application.activeUsersToday}</span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/20 border border-border/40">
              <div className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">New Users (7 Days)</span>
              </div>
              <span className="text-base font-bold text-foreground">{data.application.newUsersThisWeek}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Operational Logs / Recent Errors */}
      <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-card-foreground">
            <Activity className="w-5 h-5 text-muted-foreground" />
            <span>Operational Log & System Events</span>
          </div>
          <span className="text-xs text-muted-foreground font-mono">Last updated {new Date(data.timestamp).toLocaleTimeString()}</span>
        </div>

        {data.recentErrors.length === 0 ? (
          <div className="p-4 rounded-2xl bg-muted/20 border border-border/40 text-xs text-muted-foreground flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-muted-foreground shrink-0" />
            <span>No operational errors or service degradations recorded. System operating at full efficiency.</span>
          </div>
        ) : (
          <div className="space-y-2">
            {data.recentErrors.map((err, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-muted/20 border border-border/40 text-xs">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="font-semibold text-foreground">{err.service}:</span>
                  <span className="text-muted-foreground">{err.message}</span>
                </div>
                <span className="font-mono text-muted-foreground shrink-0">{err.timeAgo}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
