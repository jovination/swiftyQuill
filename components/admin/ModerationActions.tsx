"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateNoteStatus, updateReportStatus } from "@/actions/admin";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, Trash2, XCircle } from "lucide-react";

export function NoteActions({ noteId, currentStatus }: { noteId: string; currentStatus: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handle(status: "ACTIVE" | "FLAGGED" | "REMOVED") {
    startTransition(async () => {
      try {
        await updateNoteStatus(noteId, status);
        toast.success(`Note marked as ${status}`);
        router.refresh();
      } catch (e: any) {
        toast.error(e.message || "Failed");
      }
    });
  }

  return (
    <div className="flex gap-1">
      {currentStatus !== "ACTIVE" && (
        <Button variant="ghost" size="sm" disabled={isPending} onClick={() => handle("ACTIVE")} className="h-7 px-2 text-muted-foreground hover:text-foreground" title="Approve">
          <CheckCircle className="w-3.5 h-3.5" />
        </Button>
      )}
      {currentStatus !== "REMOVED" && (
        <Button variant="ghost" size="sm" disabled={isPending} onClick={() => handle("REMOVED")} className="h-7 px-2 text-muted-foreground hover:text-foreground" title="Remove">
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  );
}

export function ReportActions({ reportId, currentStatus }: { reportId: string; currentStatus: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handle(status: "RESOLVED" | "DISMISSED") {
    startTransition(async () => {
      try {
        await updateReportStatus(reportId, status);
        toast.success(`Report ${status.toLowerCase()}`);
        router.refresh();
      } catch (e: any) {
        toast.error(e.message || "Failed");
      }
    });
  }

  return (
    <div className="flex gap-1">
      {currentStatus === "PENDING" && (
        <>
          <Button variant="ghost" size="sm" disabled={isPending} onClick={() => handle("RESOLVED")} className="h-7 px-2 text-muted-foreground hover:text-foreground" title="Resolve">
            <CheckCircle className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="sm" disabled={isPending} onClick={() => handle("DISMISSED")} className="h-7 px-2 text-muted-foreground hover:text-foreground" title="Dismiss">
            <XCircle className="w-3.5 h-3.5" />
          </Button>
        </>
      )}
    </div>
  );
}
