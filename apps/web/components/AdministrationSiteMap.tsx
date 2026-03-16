'use client';

import { useEffect, useRef } from 'react';

interface Site {
  id: string;
  name: string;
  lat: number | null;
  lng: number | null;
  type: string;
  city: string | null;
  state: string | null;
}

interface AdministrationSiteMapProps {
  sites: Site[];
  selectedSiteId?: string | null;
  onSelect?: (siteId: string) => void;
  center?: { lat: number; lng: number };
}

export default function AdministrationSiteMap({
  sites,
  selectedSiteId,
  onSelect,
  center,
}: AdministrationSiteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  const validSites = sites.filter(
    (s): s is Site & { lat: number; lng: number } => s.lat != null && s.lng != null,
  );

  // Compute center from sites if not provided
  const mapCenter = center ?? (validSites.length > 0
    ? {
        lat: validSites.reduce((sum, s) => sum + s.lat, 0) / validSites.length,
        lng: validSites.reduce((sum, s) => sum + s.lng, 0) / validSites.length,
      }
    : { lat: 39.8283, lng: -98.5795 }); // Center of US

  useEffect(() => {
    // Mapbox GL JS would be loaded here in production
    // For now, render a placeholder map with site markers
  }, [validSites, selectedSiteId, mapCenter]);

  return (
    <div ref={mapRef} className="relative h-[400px] w-full rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
      {/* Static map placeholder */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
          </svg>
          <p className="mt-2 text-sm text-gray-500">{validSites.length} site{validSites.length !== 1 ? 's' : ''} found</p>
          <p className="mt-1 text-xs text-gray-400">
            Map centered on {mapCenter.lat.toFixed(2)}, {mapCenter.lng.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Site list overlay */}
      <div className="absolute bottom-0 left-0 right-0 max-h-[150px] overflow-y-auto bg-white/90 backdrop-blur-sm border-t border-gray-200 p-2">
        <div className="flex flex-wrap gap-1.5">
          {validSites.map((site) => (
            <button
              key={site.id}
              onClick={() => onSelect?.(site.id)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                selectedSiteId === site.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-blue-50'
              }`}
            >
              {site.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
