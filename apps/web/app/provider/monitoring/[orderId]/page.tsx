'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Report {
  id: string;
  reportType: string;
  daysPostAdministration: number;
  hasAdverseEvents: boolean;
  adverseEvents: { event: string; severity: string }[] | null;
  temperature: number | null;
  bloodPressure: string | null;
  heartRate: number | null;
  qualityOfLifeScore: number | null;
  narrative: string | null;
  physicianNotes: string | null;
  status: string;
  createdAt: string;
}

const REPORT_TYPE_LABELS: Record<string, string> = {
  immediate: 'Immediate',
  '24hr': '24 Hours',
  '48hr': '48 Hours',
  '7day': '1 Week',
  '14day': '2 Weeks',
  '28day': '4 Weeks',
  '3month': '3 Months',
  '6month': '6 Months',
};

export default function ProviderMonitoringPage() {
  const params = useParams();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [physicianNotes, setPhysicianNotes] = useState('');

  useEffect(() => {
    fetch(`/api/manufacturing/monitoring/${params.orderId}/history`)
      .then((r) => r.json())
      .then((data) => setReports(data.reports ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.orderId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/provider/orders" className="text-sm text-blue-600 hover:underline">&larr; Provider orders</Link>

      <h1 className="mt-4 text-3xl font-bold text-gray-900">Patient Monitoring</h1>
      <p className="mt-2 text-gray-600">
        Order #{(params.orderId as string).slice(0, 8)} &middot; {reports.length} report{reports.length !== 1 ? 's' : ''}
      </p>

      {/* AE flag summary */}
      {reports.some((r) => r.hasAdverseEvents && r.adverseEvents?.some((ae) => ae.severity === 'severe' || ae.severity === 'life_threatening')) && (
        <div className="mt-6 rounded-xl border-2 border-red-200 bg-red-50 p-4">
          <p className="font-semibold text-red-900">Severe adverse events reported</p>
          <p className="mt-1 text-sm text-red-800">
            This patient has reported one or more severe or life-threatening adverse events.
            Review reports below and add physician notes.
          </p>
        </div>
      )}

      {/* Reports */}
      <div className="mt-8 space-y-4">
        {reports.map((report) => {
          const hasSevere = report.adverseEvents?.some(
            (ae) => ae.severity === 'severe' || ae.severity === 'life_threatening',
          );

          return (
            <div key={report.id} className={`rounded-xl border p-5 ${hasSevere ? 'border-red-200 bg-red-50/50' : 'border-gray-200'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {REPORT_TYPE_LABELS[report.reportType] ?? report.reportType} — Day {report.daysPostAdministration}
                  </h3>
                  <p className="text-xs text-gray-500">{new Date(report.createdAt).toLocaleString()}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  report.status === 'reviewed' ? 'bg-green-100 text-green-800' :
                  report.status === 'flagged' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {report.status}
                </span>
              </div>

              {/* Vitals */}
              <div className="mt-3 grid gap-2 sm:grid-cols-4 text-sm">
                <div><span className="text-gray-500">Temp:</span> {report.temperature ? `${report.temperature}\u00B0F` : '—'}</div>
                <div><span className="text-gray-500">BP:</span> {report.bloodPressure ?? '—'}</div>
                <div><span className="text-gray-500">HR:</span> {report.heartRate ? `${report.heartRate} bpm` : '—'}</div>
                <div><span className="text-gray-500">QOL:</span> {report.qualityOfLifeScore != null ? `${report.qualityOfLifeScore}/10` : '—'}</div>
              </div>

              {/* AEs */}
              {report.hasAdverseEvents && report.adverseEvents && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-500">Adverse Events:</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {report.adverseEvents.map((ae, idx) => (
                      <span key={idx} className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        ae.severity === 'severe' || ae.severity === 'life_threatening' ? 'bg-red-100 text-red-800' :
                        ae.severity === 'moderate' ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {ae.event} ({ae.severity})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Patient narrative */}
              {report.narrative && (
                <div className="mt-3 rounded-lg bg-gray-50 p-3">
                  <p className="text-xs font-medium text-gray-500">Patient notes:</p>
                  <p className="mt-1 text-sm text-gray-700 italic">&ldquo;{report.narrative}&rdquo;</p>
                </div>
              )}

              {/* Physician notes section */}
              {report.physicianNotes ? (
                <div className="mt-3 rounded-lg bg-blue-50 p-3">
                  <p className="text-xs font-medium text-blue-700">Physician notes:</p>
                  <p className="mt-1 text-sm text-blue-900">{report.physicianNotes}</p>
                </div>
              ) : (
                <div className="mt-3">
                  {reviewingId === report.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={physicianNotes}
                        onChange={(e) => setPhysicianNotes(e.target.value)}
                        placeholder="Add physician notes..."
                        className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
                      />
                      <button
                        onClick={() => { setReviewingId(null); setPhysicianNotes(''); }}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReviewingId(report.id)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Add physician notes
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
