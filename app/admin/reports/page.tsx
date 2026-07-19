import { DataTable } from "@/components/admin/DataTable";

export default async function AdminReportsPage() {
  const formattedData: any[] = [];
  const columns = [
    { header: "Reporter", accessorKey: "reporter" },
    { header: "Target", accessorKey: "target" },
    { header: "Reason", accessorKey: "reason" },
    { header: "Date", accessorKey: "date" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">User Reports</h1>
        <p className="text-muted-foreground">Manage user-submitted reports and complaints.</p>
      </div>
      <div className="rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm p-4 shadow-sm">
        <DataTable data={formattedData} columns={columns} />
      </div>
    </div>
  );
}
