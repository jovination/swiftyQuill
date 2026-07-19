"use client";

import { useTransition } from "react";
import { DataTable } from "./DataTable";
import { updateNoteStatus } from "@/actions/admin";
import { toast } from "sonner";
import { Trash2, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ContentTable({ data }: { data: any[] }) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (noteId: string, newStatus: "ACTIVE" | "FLAGGED" | "REMOVED") => {
    startTransition(async () => {
      try {
        await updateNoteStatus(noteId, newStatus);
        toast.success(`Note status updated to ${newStatus}`);
      } catch (error: any) {
        toast.error(error.message || "Failed to update note status");
      }
    });
  };

  const columns = [
    { header: "Title", accessorKey: "title" },
    { header: "Author", accessorKey: "author" },
    { 
      header: "Status", 
      accessorKey: "status",
      cell: (item: any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          item.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 
          item.status === 'FLAGGED' ? 'bg-yellow-500/20 text-yellow-400' : 
          'bg-red-500/20 text-red-400'
        }`}>
          {item.status}
        </span>
      )
    },
    { header: "Shared", accessorKey: "isShared" },
    { header: "Media", accessorKey: "media" },
    { header: "Created", accessorKey: "createdAt" },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (item: any) => (
        <div className="flex gap-2">
          {item.status !== "ACTIVE" && (
            <Button 
              variant="ghost" size="sm" disabled={isPending}
              onClick={() => handleStatusChange(item.id, "ACTIVE")}
              className="text-green-400 hover:bg-green-500/10 px-2"
              title="Restore to Active"
            >
              <CheckCircle className="w-4 h-4" />
            </Button>
          )}
          {item.status !== "FLAGGED" && (
            <Button 
              variant="ghost" size="sm" disabled={isPending}
              onClick={() => handleStatusChange(item.id, "FLAGGED")}
              className="text-yellow-400 hover:bg-yellow-500/10 px-2"
              title="Flag Content"
            >
              <AlertTriangle className="w-4 h-4" />
            </Button>
          )}
          {item.status !== "REMOVED" && (
            <Button 
              variant="ghost" size="sm" disabled={isPending}
              onClick={() => handleStatusChange(item.id, "REMOVED")}
              className="text-red-400 hover:bg-red-500/10 px-2"
              title="Remove Content"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      )
    }
  ];

  return <DataTable data={data} columns={columns} />;
}
