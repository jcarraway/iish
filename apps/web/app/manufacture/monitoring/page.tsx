'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface OrderWithMonitoring {
  id: string;
  status: string;
  partnerName: string;
  administeredAt: string | null;
  schedule?: { reportType: string; status: string; dueDate: string; description: string }[];
}

export default function MonitoringDashboardPage() {
  const [orders, setOrders] = useState<OrderWithMonitoring[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/manufacturing/orders');
        const data = await res.json();

        const administered = (data.orders ?? []).filter(
          (o: { administeredAt?: string }) => o.administeredAt,
        );

        // Fetch schedule for each administered order
        const withSchedule = await Promise.all(
          administered.map(async (order: OrderWithMonitoring) => {
            try {
              const schedRes = await fetch(`/api/manufacturing/monitoring/${order.id}/schedule`);
              if (schedRes.ok) {
                const schedData = await schedRes.json();
                return { ...order, schedule: schedData.schedule };
              }
            } catch {}
            return order;
          }),
        );

        setOrders(withSchedule);
      } catch {
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900">Post-Administration Monitoring</h1>
        <div className="mt-8 flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm text-gray-600">Loading monitoring schedule...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900">Post-Administration Monitoring</h1>
        <div className="mt-8 rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
          <p className="font-medium text-gray-900">No administered vaccines yet</p>
          <p className="mt-2 text-sm text-gray-500">
            Once your vaccine has been administered, your monitoring schedule will appear here.
          </p>
          <Link
            href="/manufacture/orders"
            className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline"
          >
            View your orders &rarr;
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900">Post-Administration Monitoring</h1>
      <p className="mt-2 text-gray-600">Track your post-vaccine check-ins and report any symptoms</p>

      <div className="mt-8 space-y-8">
        {orders.map((order) => {
          const overdue = (order.schedule ?? []).filter((s) => s.status === 'overdue');
          const dueToday = (order.schedule ?? []).filter((s) => s.status === 'due_today');
          const nextDue = overdue[0] ?? dueToday[0];

          return (
            <div key={order.id} className="rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">{order.partnerName}</h2>
                  <p className="text-xs text-gray-500">
                    Administered {order.administeredAt ? new Date(order.administeredAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                {overdue.length > 0 && (
                  <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                    {overdue.length} overdue
                  </span>
                )}
              </div>

              {/* Quick action */}
              {nextDue && (
                <div className={`mt-4 rounded-lg p-3 ${nextDue.status === 'overdue' ? 'bg-red-50' : 'bg-blue-50'}`}>
                  <p className={`text-sm font-medium ${nextDue.status === 'overdue' ? 'text-red-800' : 'text-blue-800'}`}>
                    {nextDue.status === 'overdue' ? 'Overdue: ' : 'Due today: '}
                    {nextDue.description}
                  </p>
                  <Link
                    href={`/manufacture/monitoring/${order.id}/report?type=${nextDue.reportType}`}
                    className={`mt-2 inline-block rounded-lg px-4 py-1.5 text-sm font-medium text-white ${
                      nextDue.status === 'overdue' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    Submit check-in
                  </Link>
                </div>
              )}

              {/* Schedule summary */}
              <div className="mt-4 flex gap-4 text-xs text-gray-500">
                <span>{(order.schedule ?? []).filter((s) => s.status === 'completed').length} completed</span>
                <span>{(order.schedule ?? []).filter((s) => s.status === 'upcoming').length} upcoming</span>
                <Link href={`/manufacture/monitoring/${order.id}/history`} className="text-blue-600 hover:underline">
                  View full history
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
