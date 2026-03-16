'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import OrderProgressBar from '@/components/OrderProgressBar';
import type { SequencingProviderDetails, WaitingContent } from '@oncovax/shared';

interface Order {
  id: string;
  testType: string;
  status: string;
  createdAt: string;
  provider: {
    name: string;
    type: string;
    details: SequencingProviderDetails;
  };
}

const STATUS_BADGE: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-gray-100', text: 'text-gray-700' },
  insurance_check: { bg: 'bg-blue-100', text: 'text-blue-700' },
  prior_auth: { bg: 'bg-amber-100', text: 'text-amber-700' },
  sample_needed: { bg: 'bg-orange-100', text: 'text-orange-700' },
  sample_received: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  processing: { bg: 'bg-purple-100', text: 'text-purple-700' },
  results_ready: { bg: 'bg-green-100', text: 'text-green-700' },
  completed: { bg: 'bg-green-100', text: 'text-green-800' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [waitingContent, setWaitingContent] = useState<WaitingContent | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/sequencing/orders');
      if (!res.ok) throw new Error('Failed to load orders');
      const data = await res.json();
      setOrders(data.orders);

      // Check if any order is in waiting state
      const hasWaiting = data.orders.some(
        (o: Order) => o.status === 'sample_received' || o.status === 'processing',
      );
      if (hasWaiting) {
        const wcRes = await fetch('/api/sequencing/waiting-content', { method: 'POST' });
        if (wcRes.ok) {
          const wcData = await wcRes.json();
          setWaitingContent(wcData.content);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold">Sequencing Orders</h1>
        <div className="mt-8 flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold">Sequencing Orders</h1>
        <p className="mt-4 text-sm text-red-600">{error}</p>
        <button
          onClick={() => { setLoading(true); setError(null); loadOrders(); }}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Try again
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold">Sequencing Orders</h1>
        <div className="mt-8 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
          <p className="text-gray-600">No sequencing orders yet.</p>
          <p className="mt-1 text-sm text-gray-500">Take our guided assessment to find the right test for you.</p>
          <Link
            href="/sequencing/guide"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Start sequencing guide
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold">Sequencing Orders</h1>
      <p className="mt-1 text-sm text-gray-500">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>

      <div className="mt-8 space-y-4">
        {orders.map(order => {
          const badge = STATUS_BADGE[order.status] ?? STATUS_BADGE.pending;
          return (
            <Link
              key={order.id}
              href={`/sequencing/orders/${order.id}`}
              className="block rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{order.provider.name}</h3>
                  <p className="text-sm text-gray-500">{order.testType.replace(/_/g, ' ')}</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.bg} ${badge.text}`}>
                  {order.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="mt-4">
                <OrderProgressBar currentStatus={order.status} />
              </div>
              <p className="mt-3 text-xs text-gray-400">
                Created {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </Link>
          );
        })}
      </div>

      {/* While You Wait section */}
      {waitingContent && (
        <div className="mt-10">
          <h2 className="text-xl font-bold text-gray-900">While You Wait</h2>
          <p className="mt-1 text-sm text-gray-500">Learn about what your results might show</p>

          <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50 p-5">
            <h3 className="font-semibold text-indigo-900">Common mutations in {waitingContent.cancerType}</h3>
            <div className="mt-3 space-y-3">
              {waitingContent.commonMutations.slice(0, 4).map((mut, i) => (
                <div key={i} className="rounded-lg bg-white p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{mut.name}</span>
                    <span className="text-xs text-gray-500">{mut.frequency}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{mut.significance}</p>
                  {mut.drugs.length > 0 && (
                    <p className="mt-1 text-xs text-indigo-600">
                      Targeted therapies: {mut.drugs.join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-gray-50 p-5">
            <h3 className="font-semibold text-gray-900">Timeline expectations</h3>
            <p className="mt-2 text-sm text-gray-700 leading-relaxed">{waitingContent.timelineExpectations}</p>
          </div>
        </div>
      )}
    </div>
  );
}
