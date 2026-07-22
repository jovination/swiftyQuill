import { prisma } from "@/lib/prisma";
import { ContentTable } from "@/components/admin/ContentTable";
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Image, 
  Share2, 
  RefreshCw,
  Mic
} from "lucide-react";

export const revalidate = 0;

export default async function AdminContentPage() {
  const [notes, totalCount, activeCount, flaggedCount, removedCount, mediaCount, sharedCount] = await Promise.all([
    prisma.note.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: true },
    }),
    prisma.note.count(),
    prisma.note.count({ where: { status: "ACTIVE" } }),
    prisma.note.count({ where: { status: "FLAGGED" } }),
    prisma.note.count({ where: { status: "REMOVED" } }),
    prisma.note.count({
      where: {
        OR: [
          { imageKeys: { isEmpty: false } },
          { audioKey: { not: null } },
        ],
      },
    }),
    prisma.note.count({ where: { isShared: true } }),
  ]);

  const formattedNotes = notes.map((note) => ({
    id: note.id,
    title: note.title || "Untitled",
    author: note.user.username || note.user.email,
    status: note.status,
    isShared: note.isShared ? "Yes" : "No",
    isStarred: note.isStarred ? "Yes" : "No",
    media:
      (note.imageUrls && note.imageUrls.length > 0) ||
      (note.imageKeys && note.imageKeys.length > 0) ||
      note.audioUrl ||
      note.audioKey
        ? "Yes"
        : "No",
    createdAt: note.createdAt.toLocaleDateString(),
  }));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-background via-muted/30 to-background p-6 rounded-3xl border border-border/50 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
              Content Management
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-foreground border border-border">
              <FileText className="w-3.5 h-3.5 text-muted-foreground" />
              {totalCount} notes
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage user notes, review flagged content, and oversee sharing.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="/admin/content"
            className="p-2.5 rounded-2xl bg-muted/80 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
            <FileText className="w-4 h-4 text-muted-foreground" />
            Total
          </div>
          <div className="text-3xl font-black text-foreground">{totalCount}</div>
          <div className="text-xs text-muted-foreground">all notes</div>
        </div>
        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
            <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
            Active
          </div>
          <div className="text-3xl font-black text-foreground">{activeCount}</div>
          <div className="text-xs text-muted-foreground">published</div>
        </div>
        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
            Flagged
          </div>
          <div className="text-3xl font-black text-foreground">{flaggedCount}</div>
          <div className="text-xs text-muted-foreground">needs review</div>
        </div>
        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
            <XCircle className="w-4 h-4 text-muted-foreground" />
            Removed
          </div>
          <div className="text-3xl font-black text-foreground">{removedCount}</div>
          <div className="text-xs text-muted-foreground">deleted</div>
        </div>
        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
            <Image className="w-4 h-4 text-muted-foreground" />
            With Media
          </div>
          <div className="text-3xl font-black text-foreground">{mediaCount}</div>
          <div className="text-xs text-muted-foreground">images & audio</div>
        </div>
        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
            <Share2 className="w-4 h-4 text-muted-foreground" />
            Shared
          </div>
          <div className="text-3xl font-black text-foreground">{sharedCount}</div>
          <div className="text-xs text-muted-foreground">public links</div>
        </div>
      </div>

      {/* Notes Table */}
      <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-card-foreground">
            <FileText className="w-5 h-5 text-muted-foreground" />
            <span>All Notes</span>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {formattedNotes.length} of {totalCount}
          </span>
        </div>
        <ContentTable data={formattedNotes} />
      </div>
    </div>
  );
}
