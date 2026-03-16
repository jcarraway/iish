'use client';

import Link from 'next/link';
import { ORDER_STATUS_LABELS } from '@/lib/manufacturing-orders';
import type { ManufacturingOrderStatus } from '@oncovax/shared';

interface OrderStatusCardProps {
  order: {
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
  };
}

const STATUS_BADGE_COLORS: Record<string, string> = {
  inquiry_sent: 'bg-yellow-100 text-yellow-800',
  quote_received: 'bg-blue-100 text-blue-800',
  quote_accepted: 'bg-indigo-100 text-indigo-800',
  blueprint_transferred: 'bg-purple-100 text-purple-800',
  in_production: 'bg-orange-100 text-orange-800',
  qc_in_progress: 'bg-cyan-100 text-cyan-800',
  shipped: 'bg-teal-100 text-teal-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  ready_for_administration: 'bg-green-100 text-green-800',
};

function formatCurrency(amount: number, currency?: string | null): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function OrderStatusCard({ order }: OrderStatusCardProps) {
  const statusLabel = ORDER_STATUS_LABELS[order.status as ManufacturingOrderStatus] ?? order.status;
  const badgeColor = STATUS_BADGE_COLORS[order.status] ?? 'bg-gray-100 text-gray-800';

  return (
    <Link
      href={`/manufacture/orders/${order.id}`}
      className="block rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{order.partnerName}</h3>
          <p className="mt-0.5 text-xs text-gray-500">
            Created {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeColor}`}>
          {statusLabel}
        </span>
      </div>

      {/* Quote info */}
      {order.quotePrice != null && (
        <div className="mt-3 flex items-center gap-4 text-sm">
          <div>
            <span className="text-gray-500">Quote: </span>
            <span className="font-medium text-gray-900">
              {formatCurrency(order.quotePrice, order.quoteCurrency)}
            </span>
          </div>
          {order.quoteTurnaroundWeeks != null && (
            <div>
              <span className="text-gray-500">Turnaround: </span>
              <span className="font-medium text-gray-900">{order.quoteTurnaroundWeeks} weeks</span>
            </div>
          )}
        </div>
      )}

      {/* Production details */}
      {order.batchNumber && (
        <p className="mt-2 text-xs text-gray-500">
          Batch: <span className="font-mono">{order.batchNumber}</span>
        </p>
      )}

      {/* Shipping */}
      {order.trackingNumber && (
        <p className="mt-1 text-xs text-gray-500">
          Tracking: <span className="font-mono">{order.trackingNumber}</span>
        </p>
      )}

      {/* Last updated */}
      <p className="mt-3 text-[11px] text-gray-400">
        Last updated {new Date(order.updatedAt).toLocaleDateString()}
      </p>
    </Link>
  );
}
