import { Monitor } from "lucide-react";

export default async function DeviceAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 px-4 py-3 rounded-lg flex items-center">
        <Monitor className="w-5 h-5 mr-3" />
        <p className="text-sm font-medium">Device analytics will appear here once device tracking is implemented in the API logs.</p>
      </div>

      <div className="rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm p-6 flex flex-col justify-center items-center text-center">
        <Monitor className="w-12 h-12 text-muted-foreground mb-4 opacity-30" />
        <h3 className="text-lg font-semibold">No Device Data</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">Device, OS, and browser breakdown will be available once user-agent parsing is added to API logging.</p>
      </div>
    </div>
  );
}
