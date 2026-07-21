import { DataTable } from "@/components/admin/DataTable";
import { Bell } from "lucide-react";

export default async function AdminNotificationsPage() {
  const formattedData: any[] = [];
  const columns = [
    { header: "Title", accessorKey: "title" },
    { header: "Audience", accessorKey: "audience" },
    { header: "Sent Date", accessorKey: "date" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">System Notifications</h1>
        <p className="text-muted-foreground">Send and track global platform announcements.</p>
      </div>
      <div className="rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm p-4 shadow-sm">
        {formattedData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bell className="w-12 h-12 text-muted-foreground mb-4 opacity-30" />
            <p className="text-sm text-muted-foreground">No notifications sent yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Notifications will appear here once the feature is implemented.</p>
          </div>
        ) : (
          <DataTable data={formattedData} columns={columns} />
        )}
      </div>
    </div>
  );
}
