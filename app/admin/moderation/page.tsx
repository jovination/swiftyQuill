import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/admin/DataTable";
import { NoteActions, ReportActions } from "@/components/admin/ModerationActions";
import { Shield, AlertTriangle, FileText, CheckCircle2, Clock } from "lucide-react";

export const revalidate = 0;

export default async function AdminModerationPage() {
  const [flaggedNotes, reports, flaggedCount, pendingReports, resolvedCount, dismissedCount] = await Promise.all([
    prisma.note.findMany({
      where: { status: { in: ["FLAGGED", "REMOVED"] } },
      include: { user: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      include: { reporter: true },
      take: 100,
    }),
    prisma.note.count({ where: { status: "FLAGGED" } }),
    prisma.report.count({ where: { status: "PENDING" } }),
    prisma.report.count({ where: { status: "RESOLVED" } }),
    prisma.report.count({ where: { status: "DISMISSED" } }),
  ]);

  const formattedNotes = flaggedNotes.map((note) => ({
    id: note.id,
    title: note.title || "Untitled",
    author: note.user.username || note.user.email,
    status: note.status,
    hasMedia: (note.imageKeys && note.imageKeys.length > 0) || note.audioKey ? "Yes" : "No",
    updated: note.updatedAt.toLocaleString(),
    _rawStatus: note.status,
  }));

  const noteColumns = [
    { header: "Title", accessorKey: "title" },
    { header: "Author", accessorKey: "author" },
    { header: "Status", accessorKey: "status" },
    { header: "Media", accessorKey: "hasMedia" },
    { header: "Updated", accessorKey: "updated" },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (item: any) => <NoteActions noteId={item.id} currentStatus={item._rawStatus} />,
    },
  ];

  const formattedReports = reports.map((r) => ({
    id: r.id,
    reporter: r.reporter?.username || r.reporter?.email || "Unknown",
    target: `${r.targetType}${r.targetId ? ` · ${r.targetId.slice(0, 8)}` : ""}`,
    reason: r.reason,
    status: r.status,
    date: r.createdAt.toLocaleString(),
    _rawStatus: r.status,
  }));

  const reportColumns = [
    { header: "Date", accessorKey: "date" },
    { header: "Reporter", accessorKey: "reporter" },
    { header: "Target", accessorKey: "target" },
    { header: "Reason", accessorKey: "reason" },
    { header: "Status", accessorKey: "status" },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (item: any) => <ReportActions reportId={item.id} currentStatus={item._rawStatus} />,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-background via-muted/30 to-background p-6 rounded-3xl border border-border/50 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
              Moderation Queue
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-foreground border border-border">
              <Shield className="w-3.5 h-3.5 text-muted-foreground" />
              {flaggedCount + pendingReports} pending
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Review flagged content, user reports, and take action.
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
            Flagged Notes
          </div>
          <div className="text-3xl font-black text-foreground">{flaggedCount}</div>
          <div className="text-xs text-muted-foreground">awaiting review</div>
        </div>
        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
            <Clock className="w-4 h-4 text-muted-foreground" />
            Pending Reports
          </div>
          <div className="text-3xl font-black text-foreground">{pendingReports}</div>
          <div className="text-xs text-muted-foreground">user submissions</div>
        </div>
        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
            <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
            Resolved
          </div>
          <div className="text-3xl font-black text-foreground">{resolvedCount}</div>
          <div className="text-xs text-muted-foreground">reports handled</div>
        </div>
        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
            <FileText className="w-4 h-4 text-muted-foreground" />
            Dismissed
          </div>
          <div className="text-3xl font-black text-foreground">{dismissedCount}</div>
          <div className="text-xs text-muted-foreground">no action needed</div>
        </div>
      </div>

      {/* Flagged Notes */}
      <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 font-semibold text-card-foreground">
          <AlertTriangle className="w-5 h-5 text-muted-foreground" />
          <span>Flagged & Removed Content</span>
          <span className="text-xs text-muted-foreground font-normal ml-auto">{flaggedNotes.length} items</span>
        </div>
        {flaggedNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-muted-foreground mb-3 opacity-30" />
            <p className="text-sm text-muted-foreground">No flagged content. All clear.</p>
          </div>
        ) : (
          <DataTable data={formattedNotes} columns={noteColumns} />
        )}
      </div>

      {/* Reports */}
      <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 font-semibold text-card-foreground">
          <FileText className="w-5 h-5 text-muted-foreground" />
          <span>User Reports</span>
          <span className="text-xs text-muted-foreground font-normal ml-auto">{reports.length} total</span>
        </div>
        {reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-muted-foreground mb-3 opacity-30" />
            <p className="text-sm text-muted-foreground">No reports submitted yet.</p>
          </div>
        ) : (
          <DataTable data={formattedReports} columns={reportColumns} />
        )}
      </div>
    </div>
  );
}
