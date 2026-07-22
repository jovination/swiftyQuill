"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  Database,
  BarChart,
  DollarSign,
  CreditCard,
  Server,
  ShieldAlert,
  FileBarChart,
  History,
  Bell,
  Settings,
  Activity,
} from "lucide-react";

const navigation = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Content", href: "/admin/content", icon: FileText },
  { name: "Storage", href: "/admin/storage", icon: Database },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart },
  { name: "Revenue", href: "/admin/revenue", icon: DollarSign },
  { name: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
  { name: "API", href: "/admin/api", icon: Server },
  { name: "Moderation", href: "/admin/moderation", icon: ShieldAlert },
  { name: "Reports", href: "/admin/reports", icon: FileBarChart },
  { name: "Audit Logs", href: "/admin/audit-logs", icon: History },
  { name: "Notifications", href: "/admin/notifications", icon: Bell },
  { name: "Settings", href: "/admin/settings", icon: Settings },
  { name: "System Health", href: "/admin/health", icon: Activity },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-muted/20">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px]">
        <Link href="/admin" className="flex items-center gap-2 font-bold">
          <Image src="/logo.svg" alt="Swifty Quill Logo" width={33} height={33} className="rounded-md object-contain dark:invert" />
          <span className="text-lg">Swifty Quill</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            // Exact match for /admin to avoid highlighting it everywhere
            const isReallyActive = item.href === "/admin" ? pathname === "/admin" : isActive;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  isReallyActive && "bg-muted text-primary"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
