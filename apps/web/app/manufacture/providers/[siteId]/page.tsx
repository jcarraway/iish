'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface SiteDetail {
  id: string;
  name: string;
  type: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string;
  lat: number | null;
  lng: number | null;
  canAdministerMrna: boolean;
  hasInfusionCenter: boolean;
  hasEmergencyResponse: boolean;
  hasMonitoringCapacity: boolean;
  investigationalExp: boolean;
  irbAffiliation: string | null;
  verified: boolean;
  willingToAdminister: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  academic_medical_center: 'Academic Medical Center',
  community_oncology: 'Community Oncology',
  infusion_center: 'Infusion Center',
  hospital: 'Hospital',
};

const CAPABILITIES: { key: keyof SiteDetail; label: string; description: string }[] = [
  { key: 'canAdministerMrna', label: 'mRNA Administration', description: 'Experienced in administering mRNA-based therapies' },
  { key: 'hasInfusionCenter', label: 'Infusion Center', description: 'Dedicated infusion center for IV and injectable therapies' },
  { key: 'hasEmergencyResponse', label: 'Emergency Response', description: 'On-site emergency response capability for adverse reactions' },
  { key: 'hasMonitoringCapacity', label: 'Post-Admin Monitoring', description: 'Capacity for post-administration observation and monitoring' },
  { key: 'investigationalExp', label: 'Investigational Products', description: 'Experience handling investigational or experimental therapies' },
];

export default function ProviderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [site, setSite] = useState<SiteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<{ id: string; status: string; partnerName: string }[]>([]);

  useEffect(() => {
    Promise.all([
      fetch(`/api/providers/${params.siteId}`).then((r) => r.json()),
      fetch('/api/manufacturing/orders').then((r) => r.ok ? r.json() : { orders: [] }).catch(() => ({ orders: [] })),
    ])
      .then(([siteData, orderData]) => {
        setSite(siteData.site);
        setOrders(
          (orderData.orders ?? []).filter(
            (o: { status: string; administrationSiteId?: string }) =>
              !o.administrationSiteId && ['delivered', 'ready_for_administration', 'shipped'].includes(o.status),
          ),
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.siteId]);

  async function selectForOrder(orderId: string) {
    try {
      const res = await fetch(`/api/manufacturing/orders/${orderId}/connect-site`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId: params.siteId }),
      });
      if (res.ok) {
        router.push(`/manufacture/orders/${orderId}`);
      }
    } catch {}
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm text-gray-600">Loading site details...</p>
        </div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-gray-600">Site not found.</p>
      </div>
    );
  }

  const fullAddress = [site.address, site.city, site.state, site.zip].filter(Boolean).join(', ');

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/manufacture/providers" className="text-sm text-blue-600 hover:underline">&larr; All sites</Link>

      <div className="mt-4">
        <h1 className="text-3xl font-bold text-gray-900">{site.name}</h1>
        <p className="mt-1 text-gray-600">{TYPE_LABELS[site.type] ?? site.type}</p>
      </div>

      {/* Verified badge */}
      {site.verified && (
        <span className="mt-3 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
          Verified facility
        </span>
      )}

      {/* Address */}
      {fullAddress && (
        <div className="mt-6 rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900">Location</h2>
          <p className="mt-2 text-sm text-gray-700">{fullAddress}, {site.country}</p>
        </div>
      )}

      {/* Capabilities */}
      <div className="mt-6 rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900">Capabilities</h2>
        <div className="mt-3 space-y-3">
          {CAPABILITIES.map((cap) => (
            <div key={cap.key} className="flex items-center gap-3">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full ${
                site[cap.key] ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {site[cap.key] ? (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <div>
                <p className={`text-sm font-medium ${site[cap.key] ? 'text-gray-900' : 'text-gray-400'}`}>{cap.label}</p>
                <p className="text-xs text-gray-500">{cap.description}</p>
              </div>
            </div>
          ))}
        </div>
        {site.irbAffiliation && (
          <p className="mt-4 text-sm text-gray-600">IRB Affiliation: {site.irbAffiliation}</p>
        )}
      </div>

      {/* Contact */}
      <div className="mt-6 rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900">Contact</h2>
        <div className="mt-3 space-y-2 text-sm text-gray-700">
          {site.contactName && <p>{site.contactName}</p>}
          {site.contactEmail && <p>{site.contactEmail}</p>}
          {site.contactPhone && <p>{site.contactPhone}</p>}
          {site.website && (
            <a href={site.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {site.website}
            </a>
          )}
        </div>
      </div>

      {/* Select for order */}
      {orders.length > 0 && (
        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
          <h2 className="font-semibold text-blue-900">Select for your order</h2>
          <p className="mt-1 text-sm text-blue-800">You have active orders that need an administration site.</p>
          <div className="mt-3 space-y-2">
            {orders.map((order) => (
              <button
                key={order.id}
                onClick={() => selectForOrder(order.id)}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 text-left"
              >
                Select for {order.partnerName} order (#{order.id.slice(0, 8)})
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
