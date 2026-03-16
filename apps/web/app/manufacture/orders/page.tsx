'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import OrderStatusCard from '@/components/OrderStatusCard';

interface Order {
  id: string;
  status: string;
  partnerName: string;
  partnerType?: string;
  quotePrice: number | null;
  quoteCurrency: string | null;
  quoteTurnaroundWeeks: number | null;
  totalCost: number | null;
  batchNumber: string | null;
  trackingNumber: string | null;
  message?: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function OrdersListPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/manufacturing/orders')
      .then((r) => r.json())
      .then((data) => setOrders(data.orders ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Orders</h1>
          <p className="mt-2 text-gray-600">Track your vaccine manufacturing orders</p>
        </div>
        <Link
          href="/manufacture/orders/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          New order
        </Link>
      </div>

      {loading ? (
        <div className="mt-8 flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm text-gray-600">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-8 rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0h.008v.008h-.008V7.5z" />
          </svg>
          <h3 className="mt-4 font-medium text-gray-900">No orders yet</h3>
          <p className="mt-2 text-sm text-gray-500">
            Start by selecting a manufacturing partner and submitting your vaccine blueprint.
          </p>
          <Link
            href="/manufacture/orders/new"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Create your first order
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-4">
          {orders.map((order) => (
            <OrderStatusCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
