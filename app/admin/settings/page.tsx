import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/admin/DataTable";

export default async function AdminSettingsPage() {
  const settings = await prisma.platformSetting.findMany({
    orderBy: { key: "asc" }
  });

  const formattedData = settings.map(s => ({
    id: s.id,
    key: s.key,
    value: s.value,
    description: s.description || "N/A",
    updatedAt: s.updatedAt.toLocaleDateString(),
  }));

  const columns = [
    { header: "Key", accessorKey: "key" },
    { header: "Value", accessorKey: "value" },
    { header: "Description", accessorKey: "description" },
    { header: "Updated", accessorKey: "updatedAt" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">Platform Settings</h1>
        <p className="text-muted-foreground">Global configuration key-values for the application.</p>
      </div>
      <div className="rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm p-4 shadow-sm">
        <DataTable data={formattedData} columns={columns} />
      </div>
    </div>
  );
}
