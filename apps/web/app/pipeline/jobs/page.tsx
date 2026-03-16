'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface JobSummary {
  id: string;
  status: string;
  currentStep: string | null;
  stepsCompleted: string[];
  inputFormat: string;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  neoantigenCount: number | null;
  variantCount: number | null;
}

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  queued: { label: 'Queued', className: 'bg-yellow-100 text-yellow-800' },
  running: { label: 'Running', className: 'bg-blue-100 text-blue-800' },
  complete: { label: 'Complete', className: 'bg-green-100 text-green-800' },
  failed: { label: 'Failed', className: 'bg-red-100 text-red-800' },
  cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-800' },
};

export default function PipelineJobsPage() {
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pipeline/jobs')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setJobs(data?.jobs ?? []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-gray-200" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pipeline Jobs</h1>
        <Link
          href="/pipeline/upload"
          className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
        >
          New Analysis
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
          <h2 className="text-lg font-semibold text-gray-900">No pipeline jobs</h2>
          <p className="mt-2 text-sm text-gray-500">Upload sequencing data to start your first analysis.</p>
          <Link
            href="/pipeline/upload"
            className="mt-4 inline-block rounded-lg bg-purple-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-purple-700"
          >
            Upload Data
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const badge = STATUS_BADGES[job.status] ?? STATUS_BADGES.queued;
            const duration = job.startedAt && job.completedAt
              ? `${Math.round((new Date(job.completedAt).getTime() - new Date(job.startedAt).getTime()) / 60000)}min`
              : job.startedAt
                ? 'In progress'
                : null;

            return (
              <Link
                key={job.id}
                href={`/pipeline/jobs/${job.id}`}
                className="block rounded-xl border border-gray-200 p-5 hover:border-purple-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}>
                      {badge.label}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      Job {job.id.slice(0, 8)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-6 text-sm text-gray-600">
                  <span>{job.stepsCompleted.length}/7 steps</span>
                  <span className="uppercase text-xs">{job.inputFormat}</span>
                  {job.variantCount !== null && <span>{job.variantCount.toLocaleString()} variants</span>}
                  {job.neoantigenCount !== null && <span>{job.neoantigenCount} neoantigens</span>}
                  {duration && <span>{duration}</span>}
                </div>

                {job.currentStep && (
                  <div className="mt-2">
                    <div className="h-1.5 w-full rounded-full bg-gray-200">
                      <div
                        className="h-1.5 rounded-full bg-purple-500 transition-all"
                        style={{ width: `${(job.stepsCompleted.length / 7) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
