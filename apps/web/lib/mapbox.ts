interface GeocodeResult {
  lat: number;
  lng: number;
}

interface MapboxFeature {
  geometry: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
}

interface MapboxResponse {
  features: MapboxFeature[];
}

export async function geocodeAddress(address: {
  city?: string | null;
  state?: string | null;
  country?: string | null;
}): Promise<GeocodeResult | null> {
  const token = process.env.MAPBOX_ACCESS_TOKEN;
  if (!token) return null;

  const parts = [address.city, address.state, address.country].filter(Boolean);
  if (parts.length === 0) return null;

  const query = encodeURIComponent(parts.join(', '));
  const url = `https://api.mapbox.com/search/geocode/v6/forward?q=${query}&access_token=${token}&limit=1`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = (await res.json()) as MapboxResponse;
    const feature = data.features?.[0];
    if (!feature) return null;

    const [longitude, latitude] = feature.geometry.coordinates;
    return { lat: latitude, lng: longitude };
  } catch {
    return null;
  }
}
