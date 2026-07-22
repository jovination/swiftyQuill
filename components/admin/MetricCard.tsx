import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function MetricCard({
  title,
  value,
  icon,
  description,
  trend,
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-border/50 bg-card p-5 shadow-sm text-card-foreground transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-accent/50",
        className
      )}
    >
      {/* Subtle hover gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      <div className="relative z-10 p-6 flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{title}</h3>
        {icon && (
          <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:text-accent group-hover:bg-accent/10 transition-colors duration-300">
            {icon}
          </div>
        )}
      </div>
      <div className="relative z-10 p-6 pt-0">
        <div className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">{value}</div>
        {(description || trend) && (
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            {trend && (
              <span
                className={cn(
                  "font-medium px-1.5 py-0.5 rounded-full text-[10px]",
                  trend.isPositive 
                    ? "bg-success/10 text-success" 
                    : "bg-destructive/10 text-destructive"
                )}
              >
                {trend.isPositive ? "+" : "-"}
                {Math.abs(trend.value)}%
              </span>
            )}
            {description && <span className="opacity-80">{description}</span>}
          </p>
        )}
      </div>
    </div>
  );
}
