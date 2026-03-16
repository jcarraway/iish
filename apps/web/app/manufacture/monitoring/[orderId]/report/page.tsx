'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import MonitoringReportForm, { type ReportFormData } from '@/components/MonitoringReportForm';
import type { MonitoringReportType } from '@oncovax/shared';

export default function MonitoringReportPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-2xl px-6 py-16"><p className="text-sm text-gray-600">Loading...</p></div>}>
      <MonitoringReportContent />
    </Suspense>
  );
}

function MonitoringReportContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [reportType, setReportType] = useState<MonitoringReportType | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [escalation, setEscalation] = useState<{ requiresEscalation: boolean; reason: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const typeParam = searchParams.get('type') as MonitoringReportType | null;
    if (typeParam) {
      setReportType(typeParam);
      setLoading(false);
      return;
    }

    // Auto-detect next due report
    fetch(`/api/manufacturing/monitoring/${params.orderId}/schedule`)
      .then((r) => r.json())
      .then((data) => {
        const schedule = data.schedule ?? [];
        const nextDue = schedule.find(
          (s: { status: string }) => s.status === 'overdue' || s.status === 'due_today',
        ) ?? schedule.find((s: { status: string }) => s.status === 'upcoming');
        if (nextDue) setReportType(nextDue.reportType);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.orderId, searchParams]);

  async function handleSubmit(data: ReportFormData) {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/manufacturing/monitoring/${params.orderId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const result = await res.json();
        setEscalation(result.escalation);
        setSubmitted(true);
      }
    } catch {
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="rounded-xl border-2 border-green-200 bg-green-50 p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="mt-4 text-xl font-bold text-green-900">Report Submitted</h2>
          <p className="mt-2 text-sm text-green-800">Thank you for your check-in. Your care team has been notified.</p>
        </div>

        {escalation?.requiresEscalation && (
          <div className="mt-6 rounded-xl border-2 border-red-200 bg-red-50 p-5">
            <h3 className="font-semibold text-red-900">Important Notice</h3>
            <p className="mt-2 text-sm text-red-800">{escalation.reason}</p>
            <p className="mt-2 text-sm text-red-700">
              Please contact your physician or seek medical attention if you are experiencing severe symptoms.
            </p>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => router.push(`/manufacture/monitoring/${params.orderId}/history`)}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            View history
          </button>
          <button
            onClick={() => router.push('/manufacture/monitoring')}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Back to monitoring
          </button>
        </div>
      </div>
    );
  }

  if (!reportType) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <p className="text-gray-600">No pending reports for this order.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900">Submit Check-In</h1>
      <p className="mt-2 text-gray-600">Report how you&apos;re feeling after your vaccine administration</p>

      <div className="mt-8">
        <MonitoringReportForm
          orderId={params.orderId as string}
          reportType={reportType}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      </div>
    </div>
  );
}
