'use client';

import { useState } from 'react';

interface ReportCardProps {
  type: 'patient' | 'clinician' | 'manufacturer';
  title: string;
  description: string;
  icon: React.ReactNode;
  jobId: string;
  onPreview?: (data: Record<string, unknown>) => void;
}

type Status = 'idle' | 'generating' | 'ready' | 'downloading' | 'error';

export default function ReportCard({ type, title, description, icon, jobId, onPreview }: ReportCardProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [reportData, setReportData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setStatus('generating');
    setError(null);
    try {
      const res = await fetch(`/api/pipeline/jobs/${jobId}/reports?type=${type}`);
      if (!res.ok) throw new Error('Failed to generate report');
      const data = await res.json();
      setReportData(data.report);
      setStatus('ready');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('error');
    }
  };

  const handleDownloadPdf = async () => {
    setStatus('downloading');
    setError(null);
    try {
      const res = await fetch(`/api/pipeline/jobs/${jobId}/reports/pdf?type=${type}`);
      if (!res.ok) throw new Error('Failed to generate PDF');
      const data = await res.json();
      window.open(data.url, '_blank');
      setStatus('ready');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('error');
    }
  };

  const statusBadge = () => {
    switch (status) {
      case 'generating':
      case 'downloading':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            {status === 'generating' ? 'Generating...' : 'Preparing PDF...'}
          </span>
        );
      case 'ready':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
            Ready
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
            Error
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 p-6 flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            {statusBadge()}
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-4 flex-1">{description}</p>

      {error && (
        <p className="text-sm text-red-600 mb-3">{error}</p>
      )}

      <div className="flex gap-2">
        {status === 'idle' || status === 'error' ? (
          <button
            onClick={handleGenerate}
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
          >
            Generate Report
          </button>
        ) : status === 'generating' || status === 'downloading' ? (
          <button
            disabled
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-400 cursor-not-allowed"
          >
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Processing...
            </span>
          </button>
        ) : (
          <div className="flex gap-2">
            {onPreview != null && reportData != null && (
              <button
                onClick={() => onPreview(reportData)}
                className="rounded-lg border border-purple-300 px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 transition-colors"
              >
                Preview
              </button>
            )}
            <button
              onClick={handleDownloadPdf}
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
