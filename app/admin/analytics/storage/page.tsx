import { prisma } from "@/lib/prisma";
import { MetricCard } from "@/components/admin/MetricCard";
import { Database, HardDrive } from "lucide-react";
import { getAllUserStorageBytes } from "@/lib/storage";

export default async function StorageAnalyticsPage() {
  const storageMap = await getAllUserStorageBytes();
  const totalStorageBytes = Array.from(storageMap.values()).reduce((acc, bytes) => acc + bytes, 0);
  const totalStorageMB = (totalStorageBytes / (1024 * 1024)).toFixed(2);
  const userCount = await prisma.user.count();
  const avgStorageMB = userCount > 0 ? (totalStorageBytes / userCount / (1024 * 1024)).toFixed(2) : "0";

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Storage"
          value={`${totalStorageMB} MB`}
          icon={<Database className="text-blue-500" />}
          description="Across all users"
        />
        <MetricCard
          title="Average per User"
          value={`${avgStorageMB} MB`}
          icon={<HardDrive className="text-emerald-500" />}
          description="Mean storage usage"
        />
      </div>

      <div className="rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm p-6 flex flex-col justify-center items-center text-center">
        <Database className="w-12 h-12 text-muted-foreground mb-4 opacity-30" />
        <h3 className="text-lg font-semibold">Storage Breakdown</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">Image, audio, and file storage breakdown will be available once file type tracking is implemented.</p>
      </div>
    </div>
  );
}
