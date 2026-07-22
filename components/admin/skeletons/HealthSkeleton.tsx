import { Skeleton } from "@/components/ui/skeleton";

export function HealthSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-background via-muted/30 to-background p-6 rounded-3xl border border-border/50 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-64 rounded-xl" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-96 rounded-full" />
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right space-y-1">
            <Skeleton className="h-3 w-20 rounded-full ml-auto" />
            <Skeleton className="h-7 w-14 rounded-xl ml-auto" />
          </div>
          <Skeleton className="h-10 w-10 rounded-2xl" />
        </div>
      </div>

      {/* 4 Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-4 w-24 rounded-full" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-3 w-20 rounded-full" />
            </div>
            <div className="space-y-2 border-t border-border/40 pt-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex justify-between py-1">
                  <Skeleton className="h-3 w-20 rounded-full" />
                  <Skeleton className="h-3 w-12 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Middle Grid: 2 + 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Env Checks (col-span-2) */}
        <div className="lg:col-span-2 rounded-3xl border border-border/50 bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-4 w-56 rounded-full" />
            </div>
            <Skeleton className="h-3 w-20 rounded-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-2xl border border-border/40 bg-muted/20"
              >
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-3 w-28 rounded-full" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* App Usage (1 col) */}
        <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-4 w-40 rounded-full" />
          </div>
          <div className="space-y-4 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/20 border border-border/40"
              >
                <div className="flex items-center gap-2.5">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-3 w-28 rounded-full" />
                </div>
                <Skeleton className="h-5 w-8 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Operational Log */}
      <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-4 w-52 rounded-full" />
          </div>
          <Skeleton className="h-3 w-32 rounded-full" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-2xl bg-muted/20 border border-border/40"
            >
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-3 w-16 rounded-full" />
                <Skeleton className="h-3 w-48 rounded-full" />
              </div>
              <Skeleton className="h-3 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
