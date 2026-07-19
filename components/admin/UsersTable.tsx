"use client";

import { useTransition } from "react";
import { DataTable } from "./DataTable";
import { updateUserStatus, deleteUser } from "@/actions/admin";
import { toast } from "sonner";
import { Ban, CheckCircle, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";

export function UsersTable({ data }: { data: any[] }) {
  const [isPending, startTransition] = useTransition();

  const handleStatusToggle = (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "BANNED" : "ACTIVE";
    startTransition(async () => {
      try {
        await updateUserStatus(userId, newStatus);
        toast.success(`User status updated to ${newStatus}`);
      } catch (error: any) {
        toast.error(error.message || "Failed to update user status");
      }
    });
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      startTransition(async () => {
        try {
          await deleteUser(userId);
          toast.success("User deleted successfully");
        } catch (error: any) {
          toast.error(error.message || "Failed to delete user");
        }
      });
    }
  };

  const columns = [
    { header: "Username", accessorKey: "username" },
    { header: "Email", accessorKey: "email" },
    { 
      header: "Status", 
      accessorKey: "status",
      cell: (item: any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {item.status}
        </span>
      )
    },
    { header: "Role", accessorKey: "role" },
    { header: "Storage", accessorKey: "storageUsed" },
    { header: "Joined", accessorKey: "createdAt" },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (item: any) => (
        <Menubar className="border-none bg-transparent w-fit justify-end ml-auto">
          <MenubarMenu>
            <MenubarTrigger className="cursor-pointer" disabled={isPending}>
              <MoreHorizontal className="w-4 h-4" />
            </MenubarTrigger>
            <MenubarContent align="end">
              <MenubarItem 
                className={item.status === "ACTIVE" ? "text-amber-400 focus:text-amber-300 focus:bg-amber-500/10 cursor-pointer" : "text-green-400 focus:text-green-300 focus:bg-green-500/10 cursor-pointer"}
                onClick={() => handleStatusToggle(item.id, item.status)}
              >
                {item.status === "ACTIVE" ? <Ban className="w-4 h-4 mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                {item.status === "ACTIVE" ? "Ban User" : "Unban User"}
              </MenubarItem>
              <MenubarItem 
                className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer"
                onClick={() => handleDeleteUser(item.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete User
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )
    }
  ];

  return <DataTable data={data} columns={columns} />;
}
