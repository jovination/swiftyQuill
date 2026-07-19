import { Suspense, ReactNode } from "react";
import { AnalyticsTabs } from "@/components/admin/AnalyticsTabs";
import { AnalyticsDateFilter } from "@/components/admin/AnalyticsDateFilter";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function AnalyticsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
            Analytics Intelligence
          </h1>
          <p className="text-muted-foreground mt-1">
            Understand user behavior, product growth, and system health.
          </p>
        </div>
        <div className="flex items-center gap-4 mt-2 md:mt-0">
          <Suspense fallback={<div className="w-[240px] h-9 bg-muted animate-pulse rounded-md" />}>
            <AnalyticsDateFilter />
          </Suspense>
          <Button variant="outline" size="sm" className="h-9">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      <AnalyticsTabs />

      <div className="pt-2">
        {children}
      </div>
    </div>
  );
}
