export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
}

export async function checkVPN(ip: string, userLat: number, userLon: number) {
  const response = await fetch(`https://ipapi.co/${ip}/json/`);
  const data = await response.json();
  if (data.error) throw new Error("VPN check failed");
  const ipLat = data.latitude;
  const ipLon = data.longitude;
  const distance = haversineDistance(userLat, userLon, ipLat, ipLon);
  return distance < 10000; // Allow if within 10km
}