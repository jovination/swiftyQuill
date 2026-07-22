import { prisma } from "@/lib/prisma";
import { UsersTable } from "@/components/admin/UsersTable";
import { Users, Shield, AlertTriangle, Ban } from "lucide-react";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { role: true }
  });

  const totalUsers = users.length;
  const bannedUsers = users.filter(u => u.status === "BANNED").length;
  const suspendedUsers = users.filter(u => u.status === "SUSPENDED").length;
  const activeUsers = users.filter(u => u.status === "ACTIVE").length;

  const formattedUsers = users.map(user => ({
    id: user.id,
    username: user.username || "N/A",
    email: user.email,
    status: user.status,
    role: user.role?.name || "USER",
    createdAt: user.createdAt.toLocaleDateString(),
  }));

  return (
    <div className="w-full pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-background via-muted/30 to-background p-6 rounded-3xl border border-border/50 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
              Users Management
            </h1>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-muted text-foreground border border-border">
              {totalUsers}
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage platform users, roles, and storage allocations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 font-semibold text-card-foreground">
            <Users className="w-5 h-5 text-muted-foreground" />
            <span>Total Users</span>
          </div>
          <div className="text-2xl font-black text-foreground">{totalUsers}</div>
          <div className="text-xs text-muted-foreground">Registered accounts</div>
        </div>
        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 font-semibold text-card-foreground">
            <Shield className="w-5 h-5 text-muted-foreground" />
            <span>Active</span>
          </div>
          <div className="text-2xl font-black text-foreground">{activeUsers}</div>
          <div className="text-xs text-muted-foreground">In good standing</div>
        </div>
        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 font-semibold text-card-foreground">
            <AlertTriangle className="w-5 h-5 text-muted-foreground" />
            <span>Suspended</span>
          </div>
          <div className="text-2xl font-black text-foreground">{suspendedUsers}</div>
          <div className="text-xs text-muted-foreground">Temporarily restricted</div>
        </div>
        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 font-semibold text-card-foreground">
            <Ban className="w-5 h-5 text-muted-foreground" />
            <span>Banned</span>
          </div>
          <div className="text-2xl font-black text-foreground">{bannedUsers}</div>
          <div className="text-xs text-muted-foreground">Suspended accounts</div>
        </div>
      </div>

      <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm">
        <UsersTable data={formattedUsers} />
      </div>
    </div>
  );
}
