import { prisma } from "@/lib/prisma";
import { MetricCard } from "@/components/admin/MetricCard";
import { LineChartCard } from "@/components/admin/LineChartCard";
import { getDateRangeFromParam } from "@/lib/admin/analytics";
import { FileText, Tags, Share2, ImageIcon, Mic, Trash2, ArchiveRestore } from "lucide-react";

export default async function ContentAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const { start, end } = getDateRangeFromParam(params.range);

  const [
    totalNotes,
    notesInRange,
    sharedNotes,
    totalTags,
    deletedNotes,
    imagesUploaded,
  ] = await Promise.all([
    prisma.note.count(),
    prisma.note.count({ where: { createdAt: { gte: start, lte: end } } }),
    prisma.sharedNote.count({ where: { createdAt: { gte: start, lte: end } } }),
    prisma.tag.count(),
    prisma.note.count({ where: { status: "REMOVED" } }),
    prisma.note.count({
      where: {
        OR: [
          { imageUrls: { isEmpty: false } },
          { imageKeys: { isEmpty: false } }
        ]
      }
    })
  ]);

  // Notes Time Series
  const notesInRangeData = await prisma.note.findMany({
    where: { createdAt: { gte: start, lte: end } },
    select: { createdAt: true }
  });

  const dailyNotesMap = new Map<string, number>();
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dailyNotesMap.set(d.toISOString().split('T')[0], 0);
  }

  notesInRangeData.forEach(n => {
    const key = n.createdAt.toISOString().split('T')[0];
    if (dailyNotesMap.has(key)) {
      dailyNotesMap.set(key, dailyNotesMap.get(key)! + 1);
    }
  });

  const notesChartData = Array.from(dailyNotesMap.entries()).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    NotesCreated: count
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Notes"
          value={totalNotes.toLocaleString()}
          icon={<FileText className="text-blue-500" />}
          description="All time notes created"
        />
        <MetricCard
          title="Notes Created"
          value={notesInRange.toLocaleString()}
          icon={<FileText className="text-emerald-500" />}
          description="In selected range"
        />
        <MetricCard
          title="Shared Notes"
          value={sharedNotes.toLocaleString()}
          icon={<Share2 className="text-indigo-500" />}
          description="In selected range"
        />
        <MetricCard
          title="Total Tags"
          value={totalTags.toLocaleString()}
          icon={<Tags className="text-amber-500" />}
          description="Custom user tags"
        />
        <MetricCard
          title="Notes w/ Images"
          value={imagesUploaded.toLocaleString()}
          icon={<ImageIcon className="text-pink-500" />}
          description="All time notes with media"
        />
        <MetricCard
          title="Deleted Notes"
          value={deletedNotes.toLocaleString()}
          icon={<Trash2 className="text-red-500" />}
          description="Currently in trash"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <LineChartCard 
          title="Note Creation Trend" 
          description="Notes created per day"
          data={notesChartData}
          xDataKey="date"
          yDataKey="NotesCreated"
        />
        {/* Placeholder for top tags or other content metrics */}
        <div className="rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm p-6 flex flex-col justify-center items-center text-center">
            <Tags className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold">Top Tags</h3>
            <p className="text-sm text-muted-foreground mt-2">More granular tag analytics coming soon.</p>
        </div>
      </div>
    </div>
  );
}
