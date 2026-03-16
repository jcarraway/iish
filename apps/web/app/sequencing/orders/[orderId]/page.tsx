'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import OrderProgressBar from '@/components/OrderProgressBar';
import { SEQUENCING_ORDER_STATUSES } from '@oncovax/shared';
import type { SequencingProviderDetails, InsuranceCoverageResult, WaitingContent } from '@oncovax/shared';

interface OrderDetail {
  id: string;
  testType: string;
  status: string;
  insuranceCoverage: InsuranceCoverageResult | null;
  lomnContent: string | null;
  results: unknown;
  createdAt: string;
  updatedAt: string;
  provider: {
    id: string;
    name: string;
    type: string;
    testTypes: string[];
    details: SequencingProviderDetails;
  };
}

const STATUS_FLOW = [
  SEQUENCING_ORDER_STATUSES.PENDING,
  SEQUENCING_ORDER_STATUSES.INSURANCE_CHECK,
  SEQUENCING_ORDER_STATUSES.PRIOR_AUTH,
  SEQUENCING_ORDER_STATUSES.SAMPLE_NEEDED,
  SEQUENCING_ORDER_STATUSES.SAMPLE_RECEIVED,
  SEQUENCING_ORDER_STATUSES.PROCESSING,
  SEQUENCING_ORDER_STATUSES.RESULTS_READY,
  SEQUENCING_ORDER_STATUSES.COMPLETED,
] as const;

const STATUS_LABELS: Record<string, string> = {
  pending: 'Order Created',
  insurance_check: 'Checking Insurance',
  prior_auth: 'Prior Authorization',
  sample_needed: 'Sample Needed',
  sample_received: 'Sample Received',
  processing: 'Processing in Lab',
  results_ready: 'Results Ready',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [waitingContent, setWaitingContent] = useState<WaitingContent | null>(null);

  const loadOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/sequencing/orders/${orderId}`);
      if (!res.ok) throw new Error('Failed to load order');
      const data = await res.json();
      setOrder(data.order);

      // Load waiting content if in waiting state
      if (data.order.status === 'sample_received' || data.order.status === 'processing') {
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
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const advanceStatus = useCallback(async () => {
    if (!order) return;
    const currentIndex = STATUS_FLOW.indexOf(order.status as typeof STATUS_FLOW[number]);
    if (currentIndex < 0 || currentIndex >= STATUS_FLOW.length - 1) return;

    const nextStatus = STATUS_FLOW[currentIndex + 1];
    setUpdating(true);
    try {
      const res = await fetch(`/api/sequencing/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      const data = await res.json();
      setOrder(data.order);

      // Load waiting content if entering waiting state
      if (nextStatus === 'sample_received' || nextStatus === 'processing') {
        const wcRes = await fetch('/api/sequencing/waiting-content', { method: 'POST' });
        if (wcRes.ok) {
          const wcData = await wcRes.json();
          setWaitingContent(wcData.content);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setUpdating(false);
    }
  }, [order, orderId]);

  const cancelOrder = useCallback(async () => {
    if (!order) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/sequencing/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      if (!res.ok) throw new Error('Failed to cancel order');
      const data = await res.json();
      setOrder(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel');
    } finally {
      setUpdating(false);
    }
  }, [order, orderId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold">Order Details</h1>
        <p className="mt-4 text-sm text-red-600">{error ?? 'Order not found'}</p>
        <button onClick={() => router.push('/sequencing/orders')} className="mt-4 rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
          Back to orders
        </button>
      </div>
    );
  }

  const currentIndex = STATUS_FLOW.indexOf(order.status as typeof STATUS_FLOW[number]);
  const isCancelled = order.status === 'cancelled';
  const isCompleted = order.status === 'completed';
  const canAdvance = !isCancelled && !isCompleted && currentIndex < STATUS_FLOW.length - 1;
  const canCancel = !isCancelled && !isCompleted;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <button onClick={() => router.push('/sequencing/orders')} className="text-sm text-blue-600 hover:text-blue-800">
        &larr; All orders
      </button>

      <div className="mt-4 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{order.provider.name}</h1>
          <p className="mt-1 text-gray-500">{order.testType.replace(/_/g, ' ')}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${
          isCancelled ? 'bg-red-100 text-red-700' : isCompleted ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-700'
        }`}>
          {STATUS_LABELS[order.status] ?? order.status}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-8">
        <OrderProgressBar currentStatus={order.status} />
      </div>

      {/* Status timeline */}
      <div className="mt-8">
        <h2 className="font-semibold text-gray-900">Status Timeline</h2>
        <div className="mt-4 space-y-0">
          {STATUS_FLOW.map((status, i) => {
            const isComplete = i < currentIndex;
            const isCurrent = i === currentIndex && !isCancelled;
            const isFuture = i > currentIndex || isCancelled;

            return (
              <div key={status} className="relative pl-8 pb-5">
                {i < STATUS_FLOW.length - 1 && (
                  <div className={`absolute left-[11px] top-6 bottom-0 w-0.5 ${isComplete ? 'bg-green-300' : 'bg-gray-200'}`} />
                )}
                <div className={`absolute left-0 top-1 h-6 w-6 rounded-full flex items-center justify-center ${
                  isComplete ? 'bg-green-500' : isCurrent ? 'bg-blue-500' : 'bg-gray-200'
                }`}>
                  {isComplete ? (
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    <div className={`h-2 w-2 rounded-full ${isCurrent ? 'bg-white' : 'bg-gray-400'}`} />
                  )}
                </div>
                <p className={`text-sm ${isCurrent ? 'font-semibold text-blue-700' : isComplete ? 'text-gray-700' : 'text-gray-400'}`}>
                  {STATUS_LABELS[status]}
                </p>
                {isCurrent && (
                  <p className="mt-0.5 text-xs text-gray-500">Current status</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Insurance coverage info */}
      {order.insuranceCoverage && (
        <div className="mt-8 rounded-lg border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900">Insurance Coverage</h2>
          <div className="mt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Insurer</span>
              <span className="text-gray-900">{order.insuranceCoverage.insurer}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <span className="text-gray-900">{order.insuranceCoverage.status.replace(/_/g, ' ')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Prior auth required</span>
              <span className="text-gray-900">{order.insuranceCoverage.priorAuthRequired ? 'Yes' : 'No'}</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">{order.insuranceCoverage.reasoning}</p>
          </div>
        </div>
      )}

      {/* While You Wait */}
      {waitingContent && (order.status === 'sample_received' || order.status === 'processing') && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900">While You Wait</h2>
          <p className="mt-1 text-sm text-gray-500">Learn about what your results might show</p>

          <div className="mt-4 space-y-4">
            <div className="rounded-lg bg-indigo-50 p-5">
              <h3 className="font-semibold text-indigo-900">What mutations mean</h3>
              <p className="mt-2 text-sm text-indigo-800 leading-relaxed">{waitingContent.whatMutationsMean}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Common mutations in {waitingContent.cancerType}</h3>
              <div className="mt-2 space-y-2">
                {waitingContent.commonMutations.map((mut, i) => (
                  <div key={i} className="rounded-lg border border-gray-200 p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{mut.name}</span>
                      <span className="text-xs text-gray-500">{mut.frequency}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{mut.significance}</p>
                    {mut.drugs.length > 0 && (
                      <p className="mt-1 text-xs text-indigo-600">Targeted therapies: {mut.drugs.join(', ')}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg bg-teal-50 p-5">
              <h3 className="font-semibold text-teal-900">Clinical trials</h3>
              <p className="mt-2 text-sm text-teal-800 leading-relaxed">{waitingContent.clinicalTrialContext}</p>
            </div>

            <div className="rounded-lg bg-gray-50 p-5">
              <h3 className="font-semibold text-gray-900">Timeline expectations</h3>
              <p className="mt-2 text-sm text-gray-700 leading-relaxed">{waitingContent.timelineExpectations}</p>
            </div>
          </div>
        </div>
      )}

      {/* Upload CTA when results are ready */}
      {order.status === 'results_ready' && (
        <div className="mt-8 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-6">
          <h3 className="font-semibold text-green-900">Your results are ready!</h3>
          <p className="mt-1 text-sm text-green-800">
            Upload your genomic report to identify actionable mutations and improve your trial matches.
          </p>
          <button
            onClick={() => router.push('/sequencing/upload')}
            className="mt-3 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
          >
            Upload your results
          </button>
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-8 flex gap-3">
        {canAdvance && (
          <button
            onClick={advanceStatus}
            disabled={updating}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {updating ? 'Updating...' : `Mark as: ${STATUS_LABELS[STATUS_FLOW[currentIndex + 1]] ?? 'Next'}`}
          </button>
        )}
        {canCancel && (
          <button
            onClick={cancelOrder}
            disabled={updating}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            Cancel order
          </button>
        )}
      </div>

      <p className="mt-6 text-xs text-gray-400">
        Created {new Date(order.createdAt).toLocaleDateString()} &middot; Last updated {new Date(order.updatedAt).toLocaleDateString()}
      </p>
    </div>
  );
}
