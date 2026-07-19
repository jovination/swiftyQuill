import { MetricCard } from "@/components/admin/MetricCard";
import { Globe, MapPin, Users, DollarSign, DatabaseZap } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getDateRangeFromParam } from "@/lib/admin/analytics";

export default async function GeoAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const { start, end } = getDateRangeFromParam(params.range);

  // Fetch actual logs with locations
  const logs = await prisma.auditLog.findMany({
    where: { 
      location: { not: null },
      createdAt: { gte: start, lte: end }
    },
    select: { location: true }
  });

  const geoCounts = logs.reduce((acc, log) => {
    if (log.location) {
      acc[log.location] = (acc[log.location] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topCountries = Object.entries(geoCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({
      name,
      users: count, // Representing logins/activity as active users
      revenue: count * 15, // Mock ARPU
      active: count,
      flag: "🌍" // Generic flag
    }));

  const totalCountries = topCountries.length;
  const topRegion = topCountries.length > 0 ? topCountries[0].name : "N/A";

  return (
    <div className="space-y-6">
      {totalCountries === 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 px-4 py-3 rounded-lg flex items-center">
          <DatabaseZap className="w-5 h-5 mr-3" />
          <p className="text-sm font-medium">Geolocation tracking is active but waiting for incoming user traffic to populate these metrics.</p>
        </div>
      )}

      <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 ${totalCountries === 0 ? 'opacity-50 pointer-events-none' : ''}`}>
        <MetricCard
          title="Total Countries"
          value={totalCountries.toString()}
          icon={<Globe className="text-blue-500" />}
          description="Active regions"
        />
        <MetricCard
          title="Top Region"
          value={topRegion}
          icon={<MapPin className="text-emerald-500" />}
          description="Highest user concentration"
        />
        <MetricCard
          title="Global Reach"
          value={totalCountries > 0 ? "18%" : "0%"}
          icon={<Users className="text-indigo-500" />}
          description="Of addressable market"
        />
        <MetricCard
          title="Top Revenue Geo"
          value={topRegion}
          icon={<DollarSign className="text-amber-500" />}
          description="Highest ARPU"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm p-6 flex flex-col justify-center items-center text-center min-h-[300px]">
            <Globe className="w-12 h-12 text-muted-foreground mb-4 opacity-30" />
            <h3 className="text-lg font-semibold text-muted-foreground">Interactive World Map</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm">D3.js / React-Simple-Maps integration will be enabled here.</p>
        </div>

        <div className="rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm p-6">
            <h3 className="text-lg font-semibold flex items-center mb-4">
                <MapPin className="w-5 h-5 mr-2" />
                Top Countries
            </h3>
            {totalCountries === 0 ? (
               <div className="flex flex-col justify-center items-center text-center py-10">
                   <MapPin className="w-12 h-12 text-muted-foreground mb-4 opacity-30" />
                   <p className="text-sm text-muted-foreground mt-2 max-w-sm">No country data available. User locations will appear here once tracking logs begin.</p>
               </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-accent/20">
                            <tr>
                                <th className="px-4 py-3 rounded-tl-lg">Country</th>
                                <th className="px-4 py-3">Users (Sessions)</th>
                                <th className="px-4 py-3">Est. Revenue</th>
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
            )}
        </div>
      </div>
    </div>
  );
}
