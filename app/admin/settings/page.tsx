import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/admin/DataTable";
import { Settings, Key, RefreshCw, Hash } from "lucide-react";

export default async function AdminSettingsPage() {
  const settings = await prisma.platformSetting.findMany({
    orderBy: { key: "asc" }
  });

  const totalSettings = settings.length;
  const recentlyUpdated = settings.filter(s => {
    const daysSinceUpdate = Math.floor((Date.now() - s.updatedAt.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceUpdate <= 7;
  }).length;

  const formattedData = settings.map(s => ({
    id: s.id,
    key: s.key,
    value: s.value,
    description: s.description || "N/A",
    updatedAt: s.updatedAt.toLocaleDateString(),
  }));

  const columns = [
    { header: "Key", accessorKey: "key" },
    { header: "Value", accessorKey: "value" },
    { header: "Description", accessorKey: "description" },
    { header: "Updated", accessorKey: "updatedAt" },
  ];

  return (
    <div className="w-full pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-background via-muted/30 to-background p-6 rounded-3xl border border-border/50 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
              Platform Settings
            </h1>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Global configuration key-values for the application.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 font-semibold text-card-foreground">
            <Key className="w-5 h-5 text-muted-foreground" />
            <span>Total Settings</span>
          </div>
          <div className="text-2xl font-black text-foreground">{totalSettings}</div>
          <div className="text-xs text-muted-foreground">Configuration keys</div>
        </div>
        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 font-semibold text-card-foreground">
            <RefreshCw className="w-5 h-5 text-muted-foreground" />
            <span>Recently Updated</span>
          </div>
          <div className="text-2xl font-black text-foreground">{recentlyUpdated}</div>
          <div className="text-xs text-muted-foreground">Changed in last 7 days</div>
        </div>
        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 font-semibold text-card-foreground">
            <Hash className="w-5 h-5 text-muted-foreground" />
            <span>Environment</span>
          </div>
          <div className="text-2xl font-black text-foreground font-mono uppercase">{process.env.NODE_ENV || "production"}</div>
          <div className="text-xs text-muted-foreground">Current node environment</div>
        </div>
      </div>

      <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm">
        <DataTable data={formattedData} columns={columns} />
      </div>
    </div>
  );
}
