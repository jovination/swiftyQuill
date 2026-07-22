import { Skeleton } from "@/components/ui/skeleton";

export function OverviewSkeleton() {
  return (
    <div className="w-full pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-background via-muted/30 to-background p-6 rounded-3xl border border-border/50 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-48 rounded-xl" />
          </div>
          <Skeleton className="h-4 w-80 rounded-full" />
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card p-5 shadow-sm"
          >
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <Skeleton className="h-8 w-20 rounded-xl mt-2" />
            <Skeleton className="h-3 w-32 rounded-full mt-3" />
          </div>
        ))}
      </div>

      {/* Chart Card 1 */}
      <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm">
        <Skeleton className="h-5 w-40 rounded-full mb-4" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>

      {/* Chart Card 2 */}
      <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm">
        <div className="mb-4">
          <Skeleton className="h-5 w-36 rounded-full mb-2" />
          <Skeleton className="h-3 w-64 rounded-full" />
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    </div>
  );
}
