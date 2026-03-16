'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AdministrationSiteCard from '@/components/AdministrationSiteCard';
import AdministrationSiteMap from '@/components/AdministrationSiteMap';

interface Site {
  id: string;
  name: string;
  type: string;
  city: string | null;
  state: string | null;
  lat: number | null;
  lng: number | null;
  distance?: number;
  canAdministerMrna: boolean;
  hasInfusionCenter: boolean;
  hasEmergencyResponse: boolean;
  hasMonitoringCapacity: boolean;
  investigationalExp: boolean;
  irbAffiliation: string | null;
  verified: boolean;
  contactPhone: string | null;
  website: string | null;
}

export default function ProviderDirectoryPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-5xl px-6 py-16"><p className="text-sm text-gray-600">Loading...</p></div>}>
      <ProviderDirectoryContent />
    </Suspense>
  );
}

function ProviderDirectoryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');

  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(false);
  const [zip, setZip] = useState('');
  const [radius, setRadius] = useState('50');
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(null);
  const [filters, setFilters] = useState({ canAdministerMrna: false, hasInfusionCenter: false, investigationalExp: false });
  const [connecting, setConnecting] = useState(false);

  async function search() {
    setLoading(true);
    const params = new URLSearchParams();
    if (zip) params.set('zip', zip);
    params.set('radius', radius);
    if (filters.canAdministerMrna) params.set('canAdministerMrna', 'true');
    if (filters.hasInfusionCenter) params.set('hasInfusionCenter', 'true');
    if (filters.investigationalExp) params.set('investigationalExp', 'true');

    try {
      const res = await fetch(`/api/providers?${params}`);
      const data = await res.json();
      setSites(data.sites ?? []);
      setOrigin(data.origin ?? null);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    search();
  }, []); // Load all verified sites on mount

  async function connectSite(siteId: string) {
    if (!orderId) {
      router.push(`/manufacture/providers/${siteId}`);
      return;
    }
    setConnecting(true);
    try {
      const res = await fetch(`/api/manufacturing/orders/${orderId}/connect-site`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId }),
      });
      if (res.ok) {
        router.push(`/manufacture/orders/${orderId}`);
      }
    } catch {
    } finally {
      setConnecting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Administration Sites</h1>
          <p className="mt-2 text-gray-600">
            Find facilities that can administer your personalized vaccine
          </p>
        </div>
        <Link
          href="/provider/register"
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Register your facility
        </Link>
      </div>

      {/* Search bar */}
      <div className="mt-8 flex flex-wrap gap-3">
        <input
          type="text"
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          placeholder="ZIP code"
          className="w-32 rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
        <select
          value={radius}
          onChange={(e) => setRadius(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
        >
          <option value="25">25 miles</option>
          <option value="50">50 miles</option>
          <option value="100">100 miles</option>
          <option value="250">250 miles</option>
        </select>
        <label className="flex items-center gap-1.5 text-sm text-gray-700">
          <input type="checkbox" checked={filters.canAdministerMrna} onChange={(e) => setFilters((f) => ({ ...f, canAdministerMrna: e.target.checked }))} className="rounded" />
          mRNA capable
        </label>
        <label className="flex items-center gap-1.5 text-sm text-gray-700">
          <input type="checkbox" checked={filters.hasInfusionCenter} onChange={(e) => setFilters((f) => ({ ...f, hasInfusionCenter: e.target.checked }))} className="rounded" />
          Infusion center
        </label>
        <label className="flex items-center gap-1.5 text-sm text-gray-700">
          <input type="checkbox" checked={filters.investigationalExp} onChange={(e) => setFilters((f) => ({ ...f, investigationalExp: e.target.checked }))} className="rounded" />
          Investigational experience
        </label>
        <button
          onClick={search}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Map */}
      <div className="mt-6">
        <AdministrationSiteMap
          sites={sites}
          selectedSiteId={selectedSiteId}
          onSelect={setSelectedSiteId}
          center={origin ?? undefined}
        />
      </div>

      {/* Results */}
      <div className="mt-6">
        <p className="text-sm text-gray-500">{sites.length} site{sites.length !== 1 ? 's' : ''} found</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {sites.map((site) => (
            <AdministrationSiteCard
              key={site.id}
              site={site}
              onSelect={orderId ? connectSite : undefined}
            />
          ))}
        </div>
      </div>

      {connecting && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/20">
          <div className="rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <p className="text-sm">Connecting site to your order...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
