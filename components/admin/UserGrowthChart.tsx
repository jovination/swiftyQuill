"use client";

import { useState, useMemo } from "react";
import { LineChartCard } from "./LineChartCard";
import { Button } from "@/components/ui/button";

interface UserGrowthChartProps {
  data: { date: string; Users: number; timestamp: number }[];
}

export function UserGrowthChart({ data }: UserGrowthChartProps) {
  const [range, setRange] = useState<"weekly" | "1month" | "3months">("1month");

  const filteredData = useMemo(() => {
    let daysToSubtract = 30;
    if (range === "weekly") daysToSubtract = 7;
    if (range === "3months") daysToSubtract = 90;

    // Use the timestamps to accurately filter the last N days.
    // The data array is already sorted chronologically.
    const cutoffData = data.slice(Math.max(data.length - daysToSubtract, 0));

    return cutoffData.map(d => ({
      ...d,
      // Format to short date for the XAxis
      date: new Date(d.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));
  }, [data, range]);

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold leading-none tracking-tight">User Growth</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Total active users over the last {range === 'weekly' ? '7 days' : range === '1month' ? '30 days' : '3 months'}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant={range === "weekly" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setRange("weekly")}
            className="rounded-full"
          >
            Weekly
          </Button>
          <Button 
            variant={range === "1month" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setRange("1month")}
            className="rounded-full"
          >
            Month
          </Button>
          <Button 
            variant={range === "3months" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setRange("3months")}
            className="rounded-full"
          >
            3 Months
          </Button>
        </div>
      </div>
      <LineChartCard 
        title="" 
        data={filteredData}
        xDataKey="date"
        yDataKey="Users"
        className="w-full lg:col-span-full border-none bg-transparent shadow-none p-0"
      />
    </div>
  );
}
