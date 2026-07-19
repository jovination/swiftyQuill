"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ActivityHeatmapProps {
  data: Record<string, number>;
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  // Determine available years from data
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    const currentYear = new Date().getFullYear();
    years.add(currentYear);
    
    Object.keys(data).forEach(dateStr => {
      const year = parseInt(dateStr.split('-')[0], 10);
      if (!isNaN(year)) years.add(year);
    });
    
    return Array.from(years).sort((a, b) => b - a);
  }, [data]);

  const [selectedYear, setSelectedYear] = useState<number>(availableYears[0]);

  const calendar = useMemo(() => {
    const isCurrentYear = selectedYear === new Date().getFullYear();
    const endDate = isCurrentYear ? new Date() : new Date(selectedYear, 11, 31);
    endDate.setHours(0, 0, 0, 0);
    
    const startDate = new Date(selectedYear, 0, 1);
    startDate.setHours(0, 0, 0, 0);

    // Adjust to start on a Sunday
    const dayOfWeek = startDate.getDay();
    if (dayOfWeek !== 0) {
      startDate.setDate(startDate.getDate() - dayOfWeek);
    }

    let finalEndDate = new Date(endDate);
    if (!isCurrentYear) {
      const endDayOfWeek = finalEndDate.getDay();
      if (endDayOfWeek !== 6) {
        finalEndDate.setDate(finalEndDate.getDate() + (6 - endDayOfWeek));
      }
    }

    const totalDays = Math.ceil((finalEndDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const weeks = Math.ceil(totalDays / 7);

    const grid = Array.from({ length: weeks }, () => Array(7).fill(null));

    let currentDate = new Date(startDate);
    for (let w = 0; w < weeks; w++) {
      for (let d = 0; d < 7; d++) {
        if (currentDate <= finalEndDate) {
          const dateString = currentDate.toISOString().split('T')[0];
          grid[w][d] = {
            date: dateString,
            count: data[dateString] || 0,
            dateObj: new Date(currentDate),
            inYear: currentDate.getFullYear() === selectedYear
          };
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    return grid;
  }, [data, selectedYear]);

  const getColorClass = (count: number) => {
    if (count === 0) return "bg-muted/50";
    if (count < 3) return "bg-emerald-200/60 dark:bg-emerald-900/40";
    if (count < 6) return "bg-emerald-400/80 dark:bg-emerald-700/60";
    if (count < 10) return "bg-emerald-500 dark:bg-emerald-600/80";
    return "bg-emerald-600 dark:bg-emerald-500";
  };

  const monthLabels = useMemo(() => {
    const labels: { label: string; colIndex: number }[] = [];
    let lastMonth = -1;
    calendar.forEach((week, i) => {
      const firstDay = week.find((day) => day !== null && day.inYear);
      if (firstDay) {
        const month = firstDay.dateObj.getMonth();
        if (month !== lastMonth) {
          labels.push({ label: firstDay.dateObj.toLocaleString('default', { month: 'short' }), colIndex: i });
          lastMonth = month;
        }
      }
    });
    return labels;
  }, [calendar]);

  return (
    <div className="w-full flex flex-col md:flex-row gap-8">
      {/* Heatmap Grid Container */}
      <div className="flex-1 overflow-x-auto pb-4 w-full">
        <div className="min-w-max flex flex-col gap-1 w-full">
          <div className="flex text-xs text-muted-foreground mb-1 relative ml-8 h-4">
            {monthLabels.map((m, i) => (
              <span
                key={i}
                className="absolute"
                style={{ left: `${m.colIndex * (12 + 4)}px` }} // 12px width + 4px gap = 16px per col
              >
                {m.label}
              </span>
            ))}
          </div>
          <div className="flex gap-1">
            <div className="flex flex-col gap-1 text-xs text-muted-foreground mr-2 mt-1 justify-between h-[108px]">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>
            <TooltipProvider delayDuration={0}>
              {calendar.map((week, wIndex) => (
                <div key={wIndex} className="flex flex-col gap-1">
                  {week.map((day, dIndex) => {
                    if (!day) return <div key={dIndex} className="w-3 h-3 rounded-sm opacity-0" />;
                    
                    if (!day.inYear) return <div key={dIndex} className="w-3 h-3 rounded-sm opacity-0" />;

                    return (
                      <Tooltip key={dIndex}>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "w-3 h-3 rounded-sm transition-colors hover:ring-2 hover:ring-offset-1 hover:ring-emerald-500 dark:hover:ring-offset-background",
                              getColorClass(day.count)
                            )}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p className="text-sm font-medium">
                            {day.count} {day.count === 1 ? "note" : "notes"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {day.dateObj.toLocaleDateString('default', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              ))}
            </TooltipProvider>
          </div>
          <div className="flex items-center justify-start md:justify-end gap-2 text-xs text-muted-foreground mt-3 w-full pr-[14px]">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-muted/50" />
              <div className="w-3 h-3 rounded-sm bg-emerald-200/60 dark:bg-emerald-900/40" />
              <div className="w-3 h-3 rounded-sm bg-emerald-400/80 dark:bg-emerald-700/60" />
              <div className="w-3 h-3 rounded-sm bg-emerald-500 dark:bg-emerald-600/80" />
              <div className="w-3 h-3 rounded-sm bg-emerald-600 dark:bg-emerald-500" />
            </div>
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Year Navigation Sidebar */}
      <div className="w-full md:w-32 flex flex-row md:flex-col gap-2 overflow-x-auto shrink-0 pb-2 md:pb-0">
        {availableYears.map(year => (
          <Button
            key={year}
            variant={selectedYear === year ? "default" : "ghost"}
            className={cn(
              "justify-center md:justify-start text-sm h-8 shrink-0",
              selectedYear === year ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:bg-muted"
            )}
            onClick={() => setSelectedYear(year)}
          >
            {year}
          </Button>
        ))}
      </div>
    </div>
  );
}
