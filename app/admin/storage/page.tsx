import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/admin/DataTable";
import { getUserStorageBytes } from "@/lib/storage";

export default async function AdminStoragePage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100
  });

  const formattedData = await Promise.all(
    users.map(async (user) => {
      const storageBytes = await getUserStorageBytes(user.id);
      const storageInMB = storageBytes / (1024 * 1024);

      return {
        id: user.id,
        user: user.username || user.email,
        storageUsed: storageInMB.toFixed(2) + " MB",
        updatedAt: user.updatedAt.toLocaleDateString(),
      };
    })
  );

  const columns = [
    { header: "User", accessorKey: "user" },
    { header: "Storage Used (MB)", accessorKey: "storageUsed" },
    { header: "Last Updated", accessorKey: "updatedAt" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">Storage Management</h1>
        <p className="text-muted-foreground">View top storage consumers across the platform.</p>
      </div>
      <div className="rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm p-4 shadow-sm">
        <DataTable data={formattedData} columns={columns} />
      </div>
    </div>
  );
}
