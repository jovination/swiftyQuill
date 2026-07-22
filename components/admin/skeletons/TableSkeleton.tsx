import { Skeleton } from "@/components/ui/skeleton";

export function TableSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-64 rounded-xl" />
        <Skeleton className="h-4 w-96 rounded-full" />
      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm p-4 shadow-sm">
        {/* Table Header */}
        <div className="flex items-center gap-4 h-12 px-4 border-b border-border/40">
          <Skeleton className="h-4 w-20 rounded-full" />
          <Skeleton className="h-4 w-16 rounded-full" />
          <Skeleton className="h-4 w-24 rounded-full" />
          <Skeleton className="h-4 w-14 rounded-full" />
          <Skeleton className="h-4 w-20 rounded-full" />
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>

        {/* Table Rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 h-14 px-4 border-b border-border/20"
          >
            <Skeleton className="h-4 w-28 rounded-full" />
            <Skeleton className="h-4 w-14 rounded-full" />
            <Skeleton className="h-4 w-40 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-4 w-12 rounded-full" />
            <Skeleton className="h-4 w-24 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
