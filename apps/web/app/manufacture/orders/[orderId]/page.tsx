'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import OrderTimeline from '@/components/OrderTimeline';
import type { TimelineEntry } from '@/lib/manufacturing-orders';
import { ORDER_STATUS_LABELS } from '@/lib/manufacturing-orders';
import type { ManufacturingOrderStatus } from '@oncovax/shared';

interface OrderDetail {
  id: string;
  status: string;
  message: string | null;
  partner: { id: string; name: string; slug: string; type: string; contactUrl: string | null };
  administrationSite: { id: string; name: string; city: string | null; state: string | null } | null;
  assessment: { id: string; recommendedPathway: string | null; pathwayRationale: string | null } | null;
  quotePrice: number | null;
  quoteCurrency: string | null;
  quoteTurnaroundWeeks: number | null;
  quoteExpiresAt: string | null;
  productionStartedAt: string | null;
  productionEstimatedCompletion: string | null;
  batchNumber: string | null;
  qcStartedAt: string | null;
  qcCompletedAt: string | null;
  qcPassed: boolean | null;
  qcNotes: string | null;
  shippedAt: string | null;
  trackingNumber: string | null;
  shippingCarrier: string | null;
  shippingConditions: string | null;
  deliveredAt: string | null;
  administeredAt: string | null;
  administeredBy: string | null;
  totalCost: number | null;
  paymentStatus: string | null;
  notes: { type: string; text: string; at: string }[] | null;
  reports: { id: string; reportType: string; status: string; createdAt: string }[];
  createdAt: string;
}

function formatCurrency(amount: number, currency?: string | null): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    fetch(`/api/manufacturing/orders/${params.orderId}`)
      .then((r) => r.json())
      .then((data) => {
        setOrder(data.order);
        setTimeline(data.timeline ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.orderId]);

  async function acceptQuote() {
    if (!order) return;
    setAccepting(true);
    try {
      const res = await fetch(`/api/manufacturing/orders/${order.id}/quote-accept`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
        window.location.reload();
      }
    } catch {
    } finally {
      setAccepting(false);
    }
  }

  async function addNote() {
    if (!order || !noteText.trim()) return;
    setAddingNote(true);
    try {
      await fetch(`/api/manufacturing/orders/${order.id}/note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: noteText, noteType: 'patient' }),
      });
      setNoteText('');
      window.location.reload();
    } catch {
    } finally {
      setAddingNote(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm text-gray-600">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <p className="text-gray-600">Order not found.</p>
      </div>
    );
  }

  const statusLabel = ORDER_STATUS_LABELS[order.status as ManufacturingOrderStatus] ?? order.status;

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <Link href="/manufacture/orders" className="text-sm text-blue-600 hover:underline">&larr; All orders</Link>

      <div className="mt-4 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{order.partner.name}</h1>
          <p className="mt-1 text-gray-600">Order #{order.id.slice(0, 8)} &middot; {statusLabel}</p>
        </div>
        {order.partner.contactUrl && (
          <a
            href={order.partner.contactUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Contact partner
          </a>
        )}
      </div>

      {/* Timeline */}
      <div className="mt-8">
        <OrderTimeline timeline={timeline} />
      </div>

      {/* Action buttons based on status */}
      <div className="mt-6 flex flex-wrap gap-3">
        {order.status === 'quote_received' && (
          <button
            onClick={acceptQuote}
            disabled={accepting}
            className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {accepting ? 'Accepting...' : 'Accept Quote'}
          </button>
        )}

        {['delivered', 'ready_for_administration'].includes(order.status) && !order.administrationSite && (
          <Link
            href={`/manufacture/providers?orderId=${order.id}`}
            className="rounded-lg bg-purple-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-purple-700"
          >
            Find administration site
          </Link>
        )}

        {order.administeredAt && (
          <Link
            href={`/manufacture/monitoring/${order.id}/report`}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Submit check-in report
          </Link>
        )}

        {order.status === 'shipped' && (
          <Link
            href={`/manufacture/orders/${order.id}/tracking`}
            className="rounded-lg border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            View tracking
          </Link>
        )}
      </div>

      {/* Quote details */}
      {order.quotePrice != null && (
        <div className="mt-8 rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900">Quote Details</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-gray-500">Price</p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(order.quotePrice, order.quoteCurrency)}
              </p>
            </div>
            {order.quoteTurnaroundWeeks && (
              <div>
                <p className="text-xs text-gray-500">Turnaround</p>
                <p className="text-lg font-bold text-gray-900">{order.quoteTurnaroundWeeks} weeks</p>
              </div>
            )}
            {order.quoteExpiresAt && (
              <div>
                <p className="text-xs text-gray-500">Quote expires</p>
                <p className="text-sm text-gray-900">{new Date(order.quoteExpiresAt).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Production */}
      {order.productionStartedAt && (
        <div className="mt-6 rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900">Production</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-gray-500">Started</p>
              <p className="text-sm text-gray-900">{new Date(order.productionStartedAt).toLocaleDateString()}</p>
            </div>
            {order.productionEstimatedCompletion && (
              <div>
                <p className="text-xs text-gray-500">Estimated completion</p>
                <p className="text-sm text-gray-900">{new Date(order.productionEstimatedCompletion).toLocaleDateString()}</p>
              </div>
            )}
            {order.batchNumber && (
              <div>
                <p className="text-xs text-gray-500">Batch number</p>
                <p className="text-sm font-mono text-gray-900">{order.batchNumber}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* QC */}
      {order.qcStartedAt && (
        <div className="mt-6 rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900">Quality Control</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-gray-500">Started</p>
              <p className="text-sm text-gray-900">{new Date(order.qcStartedAt).toLocaleDateString()}</p>
            </div>
            {order.qcCompletedAt && (
              <div>
                <p className="text-xs text-gray-500">Completed</p>
                <p className="text-sm text-gray-900">{new Date(order.qcCompletedAt).toLocaleDateString()}</p>
              </div>
            )}
            {order.qcPassed != null && (
              <div>
                <p className="text-xs text-gray-500">Result</p>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${order.qcPassed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {order.qcPassed ? 'Passed' : 'Failed'}
                </span>
              </div>
            )}
          </div>
          {order.qcNotes && <p className="mt-3 text-sm text-gray-600">{order.qcNotes}</p>}
        </div>
      )}

      {/* Shipping */}
      {order.shippedAt && (
        <div className="mt-6 rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900">Shipping</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-gray-500">Shipped</p>
              <p className="text-sm text-gray-900">{new Date(order.shippedAt).toLocaleDateString()}</p>
            </div>
            {order.trackingNumber && (
              <div>
                <p className="text-xs text-gray-500">Tracking</p>
                <p className="text-sm font-mono text-gray-900">{order.trackingNumber}</p>
              </div>
            )}
            {order.shippingCarrier && (
              <div>
                <p className="text-xs text-gray-500">Carrier</p>
                <p className="text-sm text-gray-900">{order.shippingCarrier}</p>
              </div>
            )}
            {order.shippingConditions && (
              <div>
                <p className="text-xs text-gray-500">Storage conditions</p>
                <p className="text-sm text-gray-900">{order.shippingConditions}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Administration site */}
      {order.administrationSite && (
        <div className="mt-6 rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900">Administration Site</h2>
          <p className="mt-2 text-sm text-gray-900">{order.administrationSite.name}</p>
          {order.administrationSite.city && order.administrationSite.state && (
            <p className="text-xs text-gray-500">{order.administrationSite.city}, {order.administrationSite.state}</p>
          )}
          {order.administeredAt && (
            <p className="mt-2 text-xs text-gray-500">
              Administered on {new Date(order.administeredAt).toLocaleDateString()}
              {order.administeredBy && ` by ${order.administeredBy}`}
            </p>
          )}
        </div>
      )}

      {/* Monitoring reports */}
      {order.reports.length > 0 && (
        <div className="mt-6 rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Monitoring Reports</h2>
            <Link
              href={`/manufacture/monitoring/${order.id}/history`}
              className="text-sm text-blue-600 hover:underline"
            >
              View all
            </Link>
          </div>
          <p className="mt-1 text-xs text-gray-500">{order.reports.length} report{order.reports.length !== 1 ? 's' : ''} submitted</p>
        </div>
      )}

      {/* Notes */}
      <div className="mt-6 rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900">Notes</h2>
        <div className="mt-3 space-y-2">
          {(order.notes ?? []).map((note, idx) => (
            <div key={idx} className="rounded-lg bg-gray-50 p-3">
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  note.type === 'system' ? 'bg-gray-200 text-gray-600' :
                  note.type === 'physician' ? 'bg-blue-100 text-blue-700' :
                  'bg-green-100 text-green-700'
                }`}>{note.type}</span>
                <span className="text-[10px] text-gray-400">{new Date(note.at).toLocaleString()}</span>
              </div>
              <p className="mt-1 text-sm text-gray-700">{note.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add a note..."
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
          <button
            onClick={addNote}
            disabled={addingNote || !noteText.trim()}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
