import type { MonitoringReportType } from '@oncovax/shared';

export interface MonitoringScheduleItem {
  reportType: MonitoringReportType;
  daysAfter: number;
  required: boolean;
  description: string;
}

export const MONITORING_SCHEDULE: MonitoringScheduleItem[] = [
  { reportType: 'immediate', daysAfter: 0, required: true, description: 'Immediate post-administration check (30 min observation)' },
  { reportType: '24hr', daysAfter: 1, required: true, description: '24-hour follow-up — injection site and systemic symptoms' },
  { reportType: '48hr', daysAfter: 2, required: true, description: '48-hour follow-up — ongoing symptom tracking' },
  { reportType: '7day', daysAfter: 7, required: true, description: '1-week check-in — delayed reactions and well-being' },
  { reportType: '14day', daysAfter: 14, required: false, description: '2-week follow-up — immune response markers' },
  { reportType: '28day', daysAfter: 28, required: true, description: '4-week assessment — lab work and immune markers' },
  { reportType: '3month', daysAfter: 90, required: true, description: '3-month follow-up — imaging and tumor response' },
  { reportType: '6month', daysAfter: 180, required: true, description: '6-month comprehensive assessment' },
];

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface ProviderSearchParams {
  lat: number;
  lng: number;
  radiusMiles?: number;
  canAdministerMrna?: boolean;
  hasInfusionCenter?: boolean;
  investigationalExp?: boolean;
}

export function filterByDistance<T extends { lat: number | null; lng: number | null }>(
  sites: T[],
  origin: { lat: number; lng: number },
  radiusMiles: number,
): (T & { distance: number })[] {
  return sites
    .filter((s): s is T & { lat: number; lng: number } => s.lat != null && s.lng != null)
    .map((s) => ({
      ...s,
      distance: haversineDistance(origin.lat, origin.lng, s.lat, s.lng),
    }))
    .filter((s) => s.distance <= radiusMiles)
    .sort((a, b) => a.distance - b.distance);
}

export async function geocodeZip(zip: string): Promise<{ lat: number; lng: number } | null> {
  const token = process.env.MAPBOX_ACCESS_TOKEN;
  if (!token) return null;

  const query = encodeURIComponent(`${zip}, United States`);
  const url = `https://api.mapbox.com/search/geocode/v6/forward?q=${query}&access_token=${token}&limit=1`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const feature = data.features?.[0];
    if (!feature) return null;
    const [longitude, latitude] = feature.geometry.coordinates;
    return { lat: latitude, lng: longitude };
  } catch {
    return null;
  }
}
