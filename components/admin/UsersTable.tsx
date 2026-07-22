"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "./DataTable";
import { updateUserStatus, deleteUser } from "@/actions/admin";
import { toast } from "sonner";
import { Shield, AlertTriangle, Ban, Trash2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserRow {
  id: string;
  username: string;
  email: string;
  status: string;
  role: string;
  createdAt: string;
}

export function UsersTable({ data }: { data: UserRow[] }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleStatusChange(userId: string, newStatus: "ACTIVE" | "BANNED" | "SUSPENDED") {
    startTransition(async () => {
      try {
        await updateUserStatus(userId, newStatus);
        toast.success(`User status updated to ${newStatus}`);
        router.refresh();
      } catch (e: any) {
        toast.error(e.message || "Failed to update user status");
      }
    });
  }

  function handleDelete(userId: string) {
    if (!confirm("Are you sure you want to permanently delete this user? This cannot be undone.")) return;
    startTransition(async () => {
      try {
        await deleteUser(userId);
        toast.success("User deleted permanently");
        router.refresh();
      } catch (e: any) {
        toast.error(e.message || "Failed to delete user");
      }
    });
  }

  const columns = [
    { header: "Username", accessorKey: "username" },
    { header: "Email", accessorKey: "email" },
    { header: "Role", accessorKey: "role" },
    {
      header: "Status",
      accessorKey: "status",
      cell: (item: UserRow) => (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
          item.status === "ACTIVE" ? "bg-muted text-foreground border border-border" :
          item.status === "SUSPENDED" ? "bg-muted text-muted-foreground border border-border" :
          "bg-muted text-foreground border border-border"
        }`}>
          {item.status === "ACTIVE" && <Shield className="w-3 h-3 text-muted-foreground" />}
          {item.status === "SUSPENDED" && <AlertTriangle className="w-3 h-3 text-muted-foreground" />}
          {item.status === "BANNED" && <Ban className="w-3 h-3 text-muted-foreground" />}
          {item.status}
        </span>
      ),
    },
    { header: "Joined", accessorKey: "createdAt" },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (item: UserRow) => (
        <div className="flex gap-1">
          {item.status !== "ACTIVE" && (
            <Button
              variant="ghost" size="sm" disabled={isPending}
              onClick={() => handleStatusChange(item.id, "ACTIVE")}
              className="h-7 px-2 text-muted-foreground hover:text-foreground"
              title="Reactivate"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          )}
          {item.status !== "SUSPENDED" && item.status !== "BANNED" && (
            <Button
              variant="ghost" size="sm" disabled={isPending}
              onClick={() => handleStatusChange(item.id, "SUSPENDED")}
              className="h-7 px-2 text-muted-foreground hover:text-foreground"
              title="Suspend"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
            </Button>
          )}
          {item.status !== "BANNED" && (
            <Button
              variant="ghost" size="sm" disabled={isPending}
              onClick={() => handleStatusChange(item.id, "BANNED")}
              className="h-7 px-2 text-muted-foreground hover:text-foreground"
              title="Ban"
            >
              <Ban className="w-3.5 h-3.5" />
            </Button>
          )}
          <Button
            variant="ghost" size="sm" disabled={isPending}
            onClick={() => handleDelete(item.id)}
            className="h-7 px-2 text-muted-foreground hover:text-foreground"
            title="Delete permanently"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return <DataTable data={data} columns={columns} />;
}
