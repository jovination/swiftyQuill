"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { name: "Overview", href: "/admin/analytics" },
  { name: "Users", href: "/admin/analytics/users" },
  { name: "Content", href: "/admin/analytics/content" },
  { name: "Storage", href: "/admin/analytics/storage" },
  { name: "API", href: "/admin/analytics/api" },
  { name: "Revenue", href: "/admin/analytics/revenue" },
  { name: "Subscriptions", href: "/admin/analytics/subscriptions" },
  { name: "Affiliate", href: "/admin/analytics/affiliate" },
  { name: "AI", href: "/admin/analytics/ai" },
  { name: "Devices", href: "/admin/analytics/devices" },
  { name: "Geography", href: "/admin/analytics/geo" },
  { name: "Retention", href: "/admin/analytics/retention" },
  { name: "Reports", href: "/admin/analytics/reports" },
];

export function AnalyticsTabs() {
  const pathname = usePathname();

  return (
    <div className="w-full border-b border-border/50 overflow-x-auto pb-px">
      <div className="flex w-max min-w-full space-x-6 px-1">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                "whitespace-nowrap py-3 text-sm font-medium transition-colors border-b-2",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-muted hover:text-foreground"
              )}
            >
              {tab.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
