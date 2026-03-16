'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface OrderTracking {
  id: string;
  status: string;
  shippedAt: string | null;
  trackingNumber: string | null;
  shippingCarrier: string | null;
  shippingConditions: string | null;
  deliveredAt: string | null;
  productionEstimatedCompletion: string | null;
  batchNumber: string | null;
  partner: { name: string };
}

export default function OrderTrackingPage() {
  const params = useParams();
  const [order, setOrder] = useState<OrderTracking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/manufacturing/orders/${params.orderId}`)
      .then((r) => r.json())
      .then((data) => setOrder(data.order))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.orderId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm text-gray-600">Loading tracking info...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <p className="text-gray-600">Order not found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link href={`/manufacture/orders/${params.orderId}`} className="text-sm text-blue-600 hover:underline">
        &larr; Order details
      </Link>

      <h1 className="mt-4 text-3xl font-bold text-gray-900">Shipment Tracking</h1>
      <p className="mt-2 text-gray-600">{order.partner.name} &middot; Batch {order.batchNumber ?? 'N/A'}</p>

      <div className="mt-8 space-y-6">
        {/* Tracking number */}
        {order.trackingNumber ? (
          <div className="rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500">Tracking Number</p>
            <p className="mt-1 text-xl font-mono font-bold text-gray-900">{order.trackingNumber}</p>
            {order.shippingCarrier && (
              <p className="mt-1 text-sm text-gray-600">Carrier: {order.shippingCarrier}</p>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
            <p className="font-medium text-amber-900">No tracking information yet</p>
            <p className="mt-1 text-sm text-amber-800">
              Tracking details will appear here once your vaccine has been shipped.
            </p>
          </div>
        )}

        {/* Shipping timeline */}
        <div className="rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900">Shipment Status</h2>
          <div className="mt-4 space-y-4">
            {order.shippedAt && (
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Shipped</p>
                  <p className="text-xs text-gray-500">{new Date(order.shippedAt).toLocaleString()}</p>
                </div>
              </div>
            )}

            {order.deliveredAt ? (
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Delivered</p>
                  <p className="text-xs text-gray-500">{new Date(order.deliveredAt).toLocaleString()}</p>
                </div>
              </div>
            ) : order.shippedAt && (
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">In transit</p>
                  <p className="text-xs text-gray-500">Awaiting delivery</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Storage conditions */}
        {order.shippingConditions && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
            <h2 className="font-semibold text-blue-900">Storage Conditions</h2>
            <p className="mt-2 text-sm text-blue-800">{order.shippingConditions}</p>
            <p className="mt-2 text-xs text-blue-600">
              These conditions must be maintained through administration. Alert your
              administration site about storage requirements.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
