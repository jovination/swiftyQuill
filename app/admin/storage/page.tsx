import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/admin/DataTable";
import { HardDrive, Users, BarChart3, Cloud } from "lucide-react";
import { getUserStorageBytes } from "@/lib/storage";

export default async function AdminStoragePage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100
  });

  const storageData = await Promise.all(
    users.map(async (user) => {
      const storageBytes = await getUserStorageBytes(user.id);
      return { user, storageBytes };
    })
  );

  const totalStorageBytes = storageData.reduce((sum, d) => sum + d.storageBytes, 0);
  const totalStorageMB = (totalStorageBytes / (1024 * 1024)).toFixed(2);
  const totalStorageGB = (totalStorageBytes / (1024 * 1024 * 1024)).toFixed(2);
  const usersWithStorage = storageData.filter(d => d.storageBytes > 0).length;

  const formattedData = storageData.map(({ user, storageBytes }) => ({
    id: user.id,
    user: user.username || user.email,
    storageUsed: (storageBytes / (1024 * 1024)).toFixed(2) + " MB",
    updatedAt: user.updatedAt.toLocaleDateString(),
  }));

  const columns = [
    { header: "User", accessorKey: "user" },
    { header: "Storage Used (MB)", accessorKey: "storageUsed" },
    { header: "Last Updated", accessorKey: "updatedAt" },
  ];

  return (
    <div className="w-full pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-background via-muted/30 to-background p-6 rounded-3xl border border-border/50 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
              Storage Management
            </h1>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            View top storage consumers across the platform.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 font-semibold text-card-foreground">
            <HardDrive className="w-5 h-5 text-muted-foreground" />
            <span>Total Storage</span>
          </div>
          <div className="text-2xl font-black text-foreground">{totalStorageMB} MB</div>
          <div className="text-xs text-muted-foreground">{totalStorageGB} GB allocated</div>
        </div>
        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 font-semibold text-card-foreground">
            <Users className="w-5 h-5 text-muted-foreground" />
            <span>Active Uploaders</span>
          </div>
          <div className="text-2xl font-black text-foreground">{usersWithStorage}</div>
          <div className="text-xs text-muted-foreground">Users with files</div>
        </div>
        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 font-semibold text-card-foreground">
            <BarChart3 className="w-5 h-5 text-muted-foreground" />
            <span>Avg per User</span>
          </div>
          <div className="text-2xl font-black text-foreground">
            {usersWithStorage > 0 ? (totalStorageBytes / usersWithStorage / (1024 * 1024)).toFixed(2) : "0"} MB
          </div>
          <div className="text-xs text-muted-foreground">Mean storage used</div>
        </div>
        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 font-semibold text-card-foreground">
            <Cloud className="w-5 h-5 text-muted-foreground" />
            <span>Backend</span>
          </div>
          <div className="text-2xl font-black text-foreground font-mono uppercase">R2</div>
          <div className="text-xs text-muted-foreground">Cloudflare storage</div>
        </div>
      </div>

      <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm">
        <DataTable data={formattedData} columns={columns} />
      </div>
    </div>
  );
}
