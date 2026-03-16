'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface JobSummary {
  id: string;
  status: string;
  currentStep: string | null;
  stepsCompleted: string[];
  createdAt: string;
  completedAt: string | null;
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

export default function PipelineHomePage() {
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
          <div className="h-8 w-64 rounded bg-gray-200" />
          <div className="h-4 w-96 rounded bg-gray-200" />
          <div className="h-32 rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Neoantigen Pipeline</h1>
        <p className="mt-2 text-gray-600">
          Analyze tumor and normal sequencing data to predict neoantigens and design a personalized
          mRNA vaccine blueprint.
        </p>
      </div>

      {jobs.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600 mx-auto">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <h2 className="mt-4 text-lg font-semibold text-gray-900">No pipeline jobs yet</h2>
          <p className="mt-2 text-sm text-gray-500">
            Upload your tumor and normal sequencing files to get started.
          </p>
          <Link
            href="/pipeline/upload"
            className="mt-6 inline-block rounded-lg bg-purple-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-purple-700"
          >
            Upload Sequencing Data
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Your Pipeline Jobs</h2>
            <Link
              href="/pipeline/upload"
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
            >
              New Analysis
            </Link>
          </div>

          {jobs.map((job) => {
            const badge = STATUS_BADGES[job.status] ?? STATUS_BADGES.queued;
            return (
              <Link
                key={job.id}
                href={`/pipeline/jobs/${job.id}`}
                className="block rounded-xl border border-gray-200 p-5 hover:border-purple-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}>
                      {badge.label}
                    </span>
                    {job.currentStep && (
                      <span className="ml-2 text-sm text-gray-500">
                        Step: {job.currentStep.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-6 text-sm text-gray-600">
                  <span>{job.stepsCompleted.length}/7 steps</span>
                  {job.variantCount !== null && <span>{job.variantCount.toLocaleString()} variants</span>}
                  {job.neoantigenCount !== null && <span>{job.neoantigenCount} neoantigens</span>}
                </div>
              </Link>
            );
          })}

          <Link
            href="/pipeline/jobs"
            className="block text-center text-sm text-purple-600 hover:text-purple-700"
          >
            View all jobs
          </Link>
        </div>
      )}
    </div>
  );
}
