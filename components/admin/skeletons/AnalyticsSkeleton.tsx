import { Skeleton } from "@/components/ui/skeleton";

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

      {/* Chart Cards */}
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm p-6"
          >
            <Skeleton className="h-5 w-40 rounded-full mb-1" />
            <Skeleton className="h-3 w-56 rounded-full mb-4" />
            <Skeleton className="h-52 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
