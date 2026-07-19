import { MetricCard } from "@/components/admin/MetricCard";
import { Globe, MapPin, Users, DollarSign } from "lucide-react";

export default async function GeoAnalyticsPage() {
  // Mock Geographic Data
  const topCountries = [
    { name: "Tanzania", users: 1240, revenue: 980, active: 215, flag: "🇹🇿" },
    { name: "Kenya", users: 530, revenue: 410, active: 82, flag: "🇰🇪" },
    { name: "United States", users: 480, revenue: 1200, active: 110, flag: "🇺🇸" },
    { name: "United Kingdom", users: 320, revenue: 850, active: 65, flag: "🇬🇧" },
    { name: "Nigeria", users: 210, revenue: 150, active: 45, flag: "🇳🇬" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Countries"
          value="42"
          icon={<Globe className="text-blue-500" />}
          description="Active regions"
        />
        <MetricCard
          title="Top Region"
          value="East Africa"
          icon={<MapPin className="text-emerald-500" />}
          description="Highest user concentration"
        />
        <MetricCard
          title="Global Reach"
          value="18%"
          icon={<Users className="text-indigo-500" />}
          description="Of addressable market"
        />
        <MetricCard
          title="Top Revenue Geo"
          value="United States"
          icon={<DollarSign className="text-amber-500" />}
          description="Highest ARPU"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm p-6 flex flex-col justify-center items-center text-center">
            <Globe className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold">Interactive World Map</h3>
            <p className="text-sm text-muted-foreground mt-2">D3.js / React-Simple-Maps integration coming soon to plot IP-based locations.</p>
        </div>

        <div className="rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm p-6">
            <h3 className="text-lg font-semibold flex items-center mb-4">
                <MapPin className="w-5 h-5 mr-2" />
                Top Countries
            </h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-accent/20">
                        <tr>
                            <th className="px-4 py-3 rounded-tl-lg">Country</th>
                            <th className="px-4 py-3">Users</th>
                            <th className="px-4 py-3">Revenue</th>
                            <th className="px-4 py-3 rounded-tr-lg">Active</th>
                        </tr>
                    </thead>
                    <tbody>
                        {topCountries.map((c, i) => (
                            <tr key={c.name} className="border-b border-border/50 last:border-0">
                                <td className="px-4 py-3 font-medium flex items-center gap-2">
                                    <span className="text-xl">{c.flag}</span> {c.name}
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">{c.users.toLocaleString()}</td>
                                <td className="px-4 py-3 text-emerald-500 font-medium">${c.revenue.toLocaleString()}</td>
                                <td className="px-4 py-3 text-muted-foreground">{c.active.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
}
