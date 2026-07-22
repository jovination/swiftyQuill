import { Skeleton } from "@/components/ui/skeleton";

export function ModerationSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-background via-muted/30 to-background p-6 rounded-3xl border border-border/50 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-48 rounded-xl" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-4 w-72 rounded-full" />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-24 rounded-full" />
            </div>
            <Skeleton className="h-8 w-12 rounded-xl" />
            <Skeleton className="h-3 w-20 rounded-full" />
          </div>
        ))}
      </div>

      {/* Flagged Notes Table */}
      <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-4 w-44 rounded-full" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 h-14 px-4 border-b border-border/20">
              <Skeleton className="h-4 w-32 rounded-full" />
              <Skeleton className="h-4 w-20 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 w-10 rounded-full" />
              <Skeleton className="h-4 w-28 rounded-full" />
              <Skeleton className="h-4 w-12 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Reports Table */}
      <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-4 w-28 rounded-full" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 h-14 px-4 border-b border-border/20">
              <Skeleton className="h-4 w-28 rounded-full" />
              <Skeleton className="h-4 w-20 rounded-full" />
              <Skeleton className="h-4 w-36 rounded-full" />
              <Skeleton className="h-4 w-40 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 w-12 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
