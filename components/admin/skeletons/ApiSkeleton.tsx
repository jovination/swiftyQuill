import { Skeleton } from "@/components/ui/skeleton";

export function ApiSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-background via-muted/30 to-background p-6 rounded-3xl border border-border/50 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-32 rounded-xl" />
            <Skeleton className="h-6 w-14 rounded-full" />
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

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm space-y-3"
          >
            <div className="flex items-center gap-2">
              <Skeleton className="h-4.5 w-4.5 rounded-full" />
              <Skeleton className="h-4 w-28 rounded-full" />
            </div>
            <Skeleton className="h-8 w-20 rounded-xl" />
            <Skeleton className="h-3 w-24 rounded-full" />
          </div>
        ))}
      </div>

      {/* 2-Column Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Code Breakdown */}
        <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-4 w-40 rounded-full" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-14 rounded-full" />
                    <Skeleton className="h-3 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-10 rounded-full" />
                </div>
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Method Distribution */}
        <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-4 w-44 rounded-full" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-5 w-16 rounded-full shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-20 rounded-full" />
                    <Skeleton className="h-3 w-10 rounded-full" />
                  </div>
                  <Skeleton className="h-1.5 w-full rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slowest Endpoints */}
      <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-4 w-40 rounded-full" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-2xl bg-muted/20 border border-border/40"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-3 w-5 rounded-full" />
                <Skeleton className="h-3 w-48 rounded-full" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-3 w-16 rounded-full" />
                <Skeleton className="h-3 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Logs Table */}
      <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-4 w-32 rounded-full" />
          </div>
          <Skeleton className="h-3 w-40 rounded-full" />
        </div>

        {/* Table Header */}
        <div className="flex items-center gap-4 h-12 px-4 border-b border-border/40">
          <Skeleton className="h-4 w-24 rounded-full" />
          <Skeleton className="h-4 w-14 rounded-full" />
          <Skeleton className="h-4 w-32 rounded-full" />
          <Skeleton className="h-4 w-14 rounded-full" />
          <Skeleton className="h-4 w-16 rounded-full" />
          <Skeleton className="h-4 w-20 rounded-full" />
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>

        {/* Table Rows */}
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 h-14 px-4 border-b border-border/20"
          >
            <Skeleton className="h-4 w-32 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-4 w-56 rounded-full" />
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-4 w-14 rounded-full" />
            <Skeleton className="h-4 w-24 rounded-full" />
            <Skeleton className="h-4 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
