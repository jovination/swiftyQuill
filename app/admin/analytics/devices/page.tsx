import { MetricCard } from "@/components/admin/MetricCard";
import { Monitor, Smartphone, Tablet, Globe, Apple, Chrome } from "lucide-react";

export default async function DeviceAnalyticsPage() {
  // Mock Data since we don't parse device OS/Browser from User-Agent yet
  const totalDesktop = 45000;
  const totalMobile = 32000;
  const totalTablet = 8500;
  const totalPWA = 1200;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Desktop Users"
          value={totalDesktop.toLocaleString()}
          icon={<Monitor className="text-blue-500" />}
          description="Web app usage"
        />
        <MetricCard
          title="Mobile Users"
          value={totalMobile.toLocaleString()}
          icon={<Smartphone className="text-emerald-500" />}
          description="Mobile web & native"
        />
        <MetricCard
          title="Tablet Users"
          value={totalTablet.toLocaleString()}
          icon={<Tablet className="text-indigo-500" />}
          description="iPad & Android tablets"
        />
        <MetricCard
          title="PWA Installs"
          value={totalPWA.toLocaleString()}
          icon={<Globe className="text-amber-500" />}
          description="Installed to home screen"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm p-6">
            <h3 className="text-lg font-semibold flex items-center mb-4">
                <Apple className="w-5 h-5 mr-2" />
                Operating Systems
            </h3>
            <div className="space-y-4">
                {/* Mock OS bars */}
                {[
                  { name: "macOS", pct: 45, color: "bg-blue-500" },
                  { name: "Windows", pct: 30, color: "bg-indigo-500" },
                  { name: "iOS", pct: 15, color: "bg-emerald-500" },
                  { name: "Android", pct: 8, color: "bg-green-500" },
                  { name: "Linux", pct: 2, color: "bg-amber-500" }
                ].map(os => (
                  <div key={os.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{os.name}</span>
                      <span className="text-muted-foreground">{os.pct}%</span>
                    </div>
                    <div className="w-full bg-accent rounded-full h-2">
                      <div className={`${os.color} h-2 rounded-full`} style={{ width: `${os.pct}%` }}></div>
                    </div>
                  </div>
                ))}
            </div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm p-6">
            <h3 className="text-lg font-semibold flex items-center mb-4">
                <Chrome className="w-5 h-5 mr-2" />
                Browsers
            </h3>
            <div className="space-y-4">
                {/* Mock Browser bars */}
                {[
                  { name: "Chrome", pct: 55, color: "bg-emerald-500" },
                  { name: "Safari", pct: 25, color: "bg-blue-500" },
                  { name: "Firefox", pct: 10, color: "bg-amber-500" },
                  { name: "Edge", pct: 8, color: "bg-indigo-500" },
                  { name: "Other", pct: 2, color: "bg-gray-500" }
                ].map(b => (
                  <div key={b.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{b.name}</span>
                      <span className="text-muted-foreground">{b.pct}%</span>
                    </div>
                    <div className="w-full bg-accent rounded-full h-2">
                      <div className={`${b.color} h-2 rounded-full`} style={{ width: `${b.pct}%` }}></div>
                    </div>
                  </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
