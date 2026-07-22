import { Skeleton } from "@/components/ui/skeleton";

export function NotificationsSkeleton() {
  return (
    <div className="w-full pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-background via-muted/30 to-background p-6 rounded-3xl border border-border/50 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-40 rounded-xl" />
            <Skeleton className="h-6 w-8 rounded-full" />
          </div>
          <Skeleton className="h-4 w-64 rounded-full" />
        </div>
        <Skeleton className="h-9 w-36 rounded-xl" />
      </div>

      {/* 7 Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-3 w-14 rounded-full" />
            </div>
            <Skeleton className="h-7 w-8 rounded-xl" />
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm space-y-4">
        {/* Table Header */}
        <div className="flex items-center gap-4 h-12 px-4 border-b border-border/40">
          <Skeleton className="h-4 w-20 rounded-full" />
          <Skeleton className="h-4 w-32 rounded-full" />
          <Skeleton className="h-4 w-20 rounded-full" />
          <Skeleton className="h-4 w-16 rounded-full" />
          <Skeleton className="h-4 w-28 rounded-full" />
          <Skeleton className="h-4 w-8 rounded-full" />
        </div>

        {/* Table Rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 h-14 px-4 border-b border-border/20"
          >
            <Skeleton className="h-4 w-36 rounded-full" />
            <Skeleton className="h-4 w-48 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-4 w-20 rounded-full" />
            <Skeleton className="h-4 w-32 rounded-full" />
            <Skeleton className="h-4 w-8 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
