import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/admin/DataTable";
import {
  CreateNotificationDialog,
  DeleteNotificationButton,
} from "@/components/admin/NotificationActions";
import { Bell } from "lucide-react";

export const revalidate = 0;

const TYPE_LABELS: Record<string, string> = {
  ACCOUNT: "Account",
  ERROR: "Error",
  ATTENTION: "Attention",
  REPORT: "Report",
  INSIGHT: "Insight",
  USAGE: "Usage",
  SYSTEM: "System",
};

export default async function AdminNotificationsPage() {
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    include: { sender: true },
  });

  const formattedData = notifications.map((n) => ({
    id: n.id,
    type: TYPE_LABELS[n.type] || n.type,
    title: n.title,
    body: n.body,
    audience: n.audience,
    sender: n.sender.username || n.sender.email,
    date: n.createdAt.toLocaleString(),
  }));

  const columns = [
    { header: "Type", accessorKey: "type" },
    { header: "Title", accessorKey: "title" },
    { header: "Message", accessorKey: "body" },
    { header: "Audience", accessorKey: "audience" },
    { header: "From", accessorKey: "sender" },
    { header: "Date", accessorKey: "date" },
    {
      header: "",
      accessorKey: "id",
      cell: (item: any) => <DeleteNotificationButton id={item.id} />,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-background via-muted/30 to-background p-6 rounded-3xl border border-border/50 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
              Notifications
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-foreground border border-border">
              <Bell className="w-3.5 h-3.5 text-muted-foreground" />
              {notifications.length}
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Platform events, alerts, and admin announcements.
          </p>
        </div>
        <CreateNotificationDialog />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {Object.entries(TYPE_LABELS).map(([key, label]) => {
          const count = notifications.filter((n) => n.type === key).length;
          return (
            <div
              key={key}
              className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm text-center"
            >
              <div className="text-2xl font-black text-foreground">{count}</div>
              <div className="text-xs text-muted-foreground mt-1">{label}</div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bell className="w-12 h-12 text-muted-foreground mb-4 opacity-30" />
            <p className="text-sm text-muted-foreground">No notifications yet.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Events will appear here as they happen on the platform.
            </p>
          </div>
        ) : (
          <DataTable data={formattedData} columns={columns} />
        )}
      </div>
    </div>
  );
}
