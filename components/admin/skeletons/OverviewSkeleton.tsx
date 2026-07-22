import { Skeleton } from "@/components/ui/skeleton";

export function OverviewSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-4 w-80 rounded-full" />
      </div>

      {/* 4 Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="group relative overflow-hidden rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm shadow-sm p-6"
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
      <div className="w-full bg-background/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-sm">
        <Skeleton className="h-5 w-40 rounded-full mb-4" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>

      {/* Chart Card 2 */}
      <div className="w-full bg-background/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-sm">
        <div className="mb-4">
          <Skeleton className="h-5 w-36 rounded-full mb-2" />
          <Skeleton className="h-3 w-64 rounded-full" />
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    </div>
  );
}
