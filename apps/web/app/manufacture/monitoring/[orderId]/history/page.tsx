'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AdverseEventSummary from '@/components/AdverseEventSummary';

interface Report {
  id: string;
  reportType: string;
  daysPostAdministration: number;
  hasAdverseEvents: boolean;
  adverseEvents: { event: string; severity: string; resolved?: boolean }[] | null;
  temperature: number | null;
  bloodPressure: string | null;
  heartRate: number | null;
  qualityOfLifeScore: number | null;
  tumorResponse: string | null;
  narrative: string | null;
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

export default function MonitoringHistoryPage() {
  const params = useParams();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

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
          <p className="text-sm text-gray-600">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/manufacture/monitoring" className="text-sm text-blue-600 hover:underline">&larr; Monitoring dashboard</Link>

      <h1 className="mt-4 text-3xl font-bold text-gray-900">Report History</h1>
      <p className="mt-2 text-gray-600">{reports.length} report{reports.length !== 1 ? 's' : ''} submitted</p>

      {/* AE Summary */}
      <div className="mt-8">
        <AdverseEventSummary reports={reports} />
      </div>

      {/* QOL trend */}
      {reports.filter((r) => r.qualityOfLifeScore != null).length > 1 && (
        <div className="mt-6 rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900">Quality of Life Trend</h2>
          <div className="mt-3 flex items-end gap-2 h-20">
            {reports
              .filter((r) => r.qualityOfLifeScore != null)
              .map((r) => (
                <div key={r.id} className="flex flex-col items-center flex-1">
                  <div
                    className="w-full rounded-t bg-blue-500"
                    style={{ height: `${(r.qualityOfLifeScore! / 10) * 100}%` }}
                  />
                  <p className="mt-1 text-[10px] text-gray-400">{REPORT_TYPE_LABELS[r.reportType] ?? r.reportType}</p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Individual reports */}
      <div className="mt-6 space-y-4">
        {reports.map((report) => (
          <div key={report.id} className="rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {REPORT_TYPE_LABELS[report.reportType] ?? report.reportType} Check-In
                </h3>
                <p className="text-xs text-gray-500">
                  Day {report.daysPostAdministration} &middot; {new Date(report.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                report.status === 'reviewed' ? 'bg-green-100 text-green-800' :
                report.status === 'flagged' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-700'
              }`}>
                {report.status}
              </span>
            </div>

            {/* Vitals */}
            {(report.temperature || report.bloodPressure || report.heartRate) && (
              <div className="mt-3 flex gap-4 text-sm">
                {report.temperature && <span className="text-gray-600">Temp: {report.temperature}&deg;F</span>}
                {report.bloodPressure && <span className="text-gray-600">BP: {report.bloodPressure}</span>}
                {report.heartRate && <span className="text-gray-600">HR: {report.heartRate} bpm</span>}
              </div>
            )}

            {/* QOL */}
            {report.qualityOfLifeScore != null && (
              <p className="mt-2 text-sm text-gray-600">
                Quality of life: <span className="font-medium">{report.qualityOfLifeScore}/10</span>
              </p>
            )}

            {/* AEs */}
            {report.hasAdverseEvents && report.adverseEvents && (
              <div className="mt-3 flex flex-wrap gap-1.5">
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
            )}

            {/* Tumor response */}
            {report.tumorResponse && (
              <p className="mt-2 text-sm text-gray-600">
                Tumor response: <span className="font-medium">{report.tumorResponse.replace(/_/g, ' ')}</span>
              </p>
            )}

            {/* Narrative */}
            {report.narrative && (
              <p className="mt-3 text-sm text-gray-600 italic">&ldquo;{report.narrative}&rdquo;</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
