import { prisma } from "@/lib/prisma";
import { ContentTable } from "@/components/admin/ContentTable";

export default async function AdminModerationPage() {
  const notes = await prisma.note.findMany({
    where: { status: "FLAGGED" },
    include: { user: true },
    orderBy: { updatedAt: "desc" }
  });

  const formattedData = notes.map(note => ({
    id: note.id,
    title: note.title || "Untitled",
    author: note.user.username || note.user.email,
    status: note.status,
    isShared: note.isShared ? "Yes" : "No",
    media: note.imageUrls.length > 0 || note.audioUrl ? "Yes" : "No",
    createdAt: note.updatedAt.toLocaleDateString(),
  }));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">Moderation Queue</h1>
        <p className="text-muted-foreground">Review flagged or reported content from users.</p>
      </div>
      <div className="rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm p-4 shadow-sm">
        <ContentTable data={formattedData} />
      </div>
    </div>
  );
}
