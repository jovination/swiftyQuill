"use client";

import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface LineChartCardProps {
  title: string;
  description?: string;
  data: any[];
  xDataKey: string;
  yDataKey: string;
  className?: string;
}

export function LineChartCard({
  title,
  description,
  data,
  xDataKey,
  yDataKey,
  className,
}: LineChartCardProps) {
  return (
    <div
      className={cn(
        "col-span-full lg:col-span-2 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm shadow-sm transition-all duration-300 hover:border-accent/50",
        className
      )}
    >
      {(title || description) && (
        <div className="p-6">
          {title && (
            <h3 className="text-lg font-semibold leading-none tracking-tight">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      )}
      <div className={cn("h-[350px] w-full", (title || description) ? "p-6 pt-0" : "")}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey={xDataKey}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dx={-10}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                borderRadius: "8px",
                border: "1px solid hsl(var(--border))",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              itemStyle={{ color: "hsl(var(--foreground))", fontWeight: "bold" }}
              labelStyle={{ color: "hsl(var(--muted-foreground))", marginBottom: "4px" }}
            />
            <Line
              type="monotone"
              dataKey={yDataKey}
              stroke="hsl(var(--chart-1))"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: "hsl(var(--chart-1))", stroke: "hsl(var(--background))", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
