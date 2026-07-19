export async function getGeoLocation(ip: string): Promise<string | null> {
  // Ignore local development IPs
  if (!ip || ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.")) {
    return null;
  }
  
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}`, {
      // Don't cache so we don't accidentally cache bad IPs, or cache lightly
      cache: "no-store", 
    });
    
    if (!res.ok) return null;
    
    const data = await res.json();
    if (data.status === "success" && data.country) {
      return data.country;
    }
    return null;
  } catch (error) {
    console.error("Geo API error:", error);
    return null;
  }
}
