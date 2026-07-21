import { prisma } from "@/lib/prisma";
import { UsersTable } from "@/components/admin/UsersTable";
import { getUserStorageBytes } from "@/lib/storage";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { role: true }
  });

  const formattedUsers = await Promise.all(
    users.map(async (user) => {
      const storageBytes = await getUserStorageBytes(user.id);
      const storageInMB = storageBytes / (1024 * 1024);

      return {
        id: user.id,
        username: user.username || "N/A",
        email: user.email,
        status: user.status,
        role: user.role?.name || "USER",
        storageUsed: storageInMB.toFixed(2) + " MB",
        createdAt: user.createdAt.toLocaleDateString(),
      };
    })
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
          Users Management
        </h1>
        <p className="text-muted-foreground">Manage platform users, roles, and storage allocations.</p>
      </div>
      <div className="rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm p-4 shadow-sm">
        <UsersTable data={formattedUsers} />
      </div>
    </div>
  );
}
