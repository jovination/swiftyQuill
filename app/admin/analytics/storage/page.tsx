import { prisma } from "@/lib/prisma";
import { MetricCard } from "@/components/admin/MetricCard";
import { Database, HardDrive, ImageIcon, Music, File } from "lucide-react";
import { getStorageBreakdown } from "@/lib/storage";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

export default async function StorageAnalyticsPage() {
  const [breakdown, userCount] = await Promise.all([
    getStorageBreakdown(),
    prisma.user.count(),
  ]);

  const avgStorageMB =
    userCount > 0
      ? (breakdown.total / userCount / (1024 * 1024)).toFixed(2)
      : "0";

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Storage"
          value={formatBytes(breakdown.total)}
          icon={<Database />}
          description="Across all users"
        />
        <MetricCard
          title="Average per User"
          value={`${avgStorageMB} MB`}
          icon={<HardDrive />}
          description="Mean storage usage"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card p-5 shadow-sm text-card-foreground transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-accent/50">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Images</h3>
            <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:text-accent group-hover:bg-accent/10 transition-colors duration-300">
              <ImageIcon className="h-4 w-4" />
            </div>
          </div>
          <div className="relative z-10 pt-0">
            <div className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">{formatBytes(breakdown.image.bytes)}</div>
            <p className="text-xs text-muted-foreground mt-2">{breakdown.image.count} files</p>
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card p-5 shadow-sm text-card-foreground transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-accent/50">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Audio</h3>
            <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:text-accent group-hover:bg-accent/10 transition-colors duration-300">
              <Music className="h-4 w-4" />
            </div>
          </div>
          <div className="relative z-10 pt-0">
            <div className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">{formatBytes(breakdown.audio.bytes)}</div>
            <p className="text-xs text-muted-foreground mt-2">{breakdown.audio.count} files</p>
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card p-5 shadow-sm text-card-foreground transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-accent/50">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Other</h3>
            <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:text-accent group-hover:bg-accent/10 transition-colors duration-300">
              <File className="h-4 w-4" />
            </div>
          </div>
          <div className="relative z-10 pt-0">
            <div className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">{formatBytes(breakdown.other.bytes)}</div>
            <p className="text-xs text-muted-foreground mt-2">{breakdown.other.count} files</p>
          </div>
        </div>
      </div>
    </div>
  );
}
