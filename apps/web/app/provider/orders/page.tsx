'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface ProviderOrder {
  id: string;
  status: string;
  batchNumber: string | null;
  shippingCarrier: string | null;
  shippingConditions: string | null;
  deliveredAt: string | null;
  administeredAt: string | null;
  partner: { name: string };
  administrationSite: { name: string } | null;
}

export default function ProviderOrdersPage() {
  const [orders, setOrders] = useState<ProviderOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production, this would filter by the provider's facility
    // For now, show orders that have an administration site connected
    fetch('/api/manufacturing/orders')
      .then((r) => r.json())
      .then((data) => {
        setOrders(
          (data.orders ?? []).filter(
            (o: { administrationSiteId?: string }) => o.administrationSiteId,
          ),
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900">Provider Orders</h1>
      <p className="mt-2 text-gray-600">Vaccines assigned to your facility for administration</p>

      {loading ? (
        <div className="mt-8 flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-8 rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
          <p className="font-medium text-gray-900">No orders assigned to your facility</p>
          <p className="mt-2 text-sm text-gray-500">
            Orders will appear here when patients select your facility as their administration site.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Order #{order.id.slice(0, 8)}</h3>
                  <p className="text-xs text-gray-500">
                    Manufactured by {order.partner.name}
                    {order.batchNumber && ` \u00B7 Batch ${order.batchNumber}`}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                  order.status === 'shipped' ? 'bg-teal-100 text-teal-800' :
                  order.status === 'ready_for_administration' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {order.status.replace(/_/g, ' ')}
                </span>
              </div>

              {order.shippingConditions && (
                <div className="mt-3 rounded-lg bg-blue-50 p-3">
                  <p className="text-xs font-medium text-blue-800">Storage: {order.shippingConditions}</p>
                </div>
              )}

              {order.deliveredAt && !order.administeredAt && (
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Delivered {new Date(order.deliveredAt).toLocaleDateString()}
                  </p>
                  <Link
                    href={`/provider/monitoring/${order.id}`}
                    className="rounded-lg bg-green-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-green-700"
                  >
                    Record administration
                  </Link>
                </div>
              )}

              {order.administeredAt && (
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-sm text-green-700 font-medium">
                    Administered {new Date(order.administeredAt).toLocaleDateString()}
                  </p>
                  <Link
                    href={`/provider/monitoring/${order.id}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View monitoring &rarr;
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
