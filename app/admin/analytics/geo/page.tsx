import { MapPin, DatabaseZap } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getDateRangeFromParam } from "@/lib/admin/analytics";

async function getCountryFlag(name: string) {
  try {
    const res = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fields=flag`, {
      next: { revalidate: 86400 } // Cache for 24 hours
    });
    const data = await res.json();
    return data[0]?.flag || "🌍";
  } catch (e) {
    return "🌍";
  }
}

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

  // Map and sort countries
  const topCountriesRaw = Object.entries(geoCounts).sort((a, b) => b[1] - a[1]);
  
  // Fetch flags for each country
  const topCountries = await Promise.all(
    topCountriesRaw.map(async ([name, count]) => ({
      name,
      users: count, 
      active: count,
      flag: await getCountryFlag(name)
    }))
  );

  const totalCountries = topCountries.length;

  return (
    <div className="space-y-6">
      {totalCountries === 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 px-4 py-3 rounded-lg flex items-center">
          <DatabaseZap className="w-5 h-5 mr-3" />
          <p className="text-sm font-medium">Geolocation tracking is active but waiting for incoming user traffic to populate these metrics.</p>
        </div>
      )}

      <div className="rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm p-6 w-full">
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
                                  <td className="px-4 py-3 text-muted-foreground">{c.active.toLocaleString()}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          )}
      </div>
    </div>
  );
}
