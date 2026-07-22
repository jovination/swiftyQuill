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
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-foreground border border-border">
          {item.status === "ACTIVE" && <CheckCircle className="w-3 h-3 text-muted-foreground" />}
          {item.status === "FLAGGED" && <AlertTriangle className="w-3 h-3 text-muted-foreground" />}
          {item.status === "REMOVED" && <Trash2 className="w-3 h-3 text-muted-foreground" />}
          {item.status}
        </span>
      ),
    },
    { header: "Shared", accessorKey: "isShared" },
    { header: "Media", accessorKey: "media" },
    { header: "Created", accessorKey: "createdAt" },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (item: any) => (
        <div className="flex gap-1">
          {item.status !== "ACTIVE" && (
            <Button
              variant="ghost" size="sm" disabled={isPending}
              onClick={() => handleStatusChange(item.id, "ACTIVE")}
              className="h-7 px-2 text-muted-foreground hover:text-foreground"
              title="Restore to Active"
            >
              <CheckCircle className="w-3.5 h-3.5" />
            </Button>
          )}
          {item.status !== "FLAGGED" && (
            <Button
              variant="ghost" size="sm" disabled={isPending}
              onClick={() => handleStatusChange(item.id, "FLAGGED")}
              className="h-7 px-2 text-muted-foreground hover:text-foreground"
              title="Flag Content"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
            </Button>
          )}
          {item.status !== "REMOVED" && (
            <Button
              variant="ghost" size="sm" disabled={isPending}
              onClick={() => handleStatusChange(item.id, "REMOVED")}
              className="h-7 px-2 text-muted-foreground hover:text-foreground"
              title="Remove Content"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return <DataTable data={data} columns={columns} />;
}
