'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PipelineProgressBar from '@/components/PipelineProgressBar';

interface Neoantigen {
  gene: string;
  mutation: string;
  mutantPeptide: string;
  hlaAllele: string;
  compositeScore: number;
  rank: number;
  confidence: string;
  bindingAffinityNm: number;
  immunogenicityScore: number;
}

interface PipelineJob {
  id: string;
  status: string;
  currentStep: string | null;
  stepsCompleted: string[];
  stepErrors: Record<string, string> | null;
  inputFormat: string;
  referenceGenome: string;
  retryCount: number;
  maxRetries: number;
  variantCount: number | null;
  tmb: number | null;
  neoantigenCount: number | null;
  totalComputeSeconds: number | null;
  estimatedCostUsd: number | null;
  startedAt: string | null;
  completedAt: string | null;
  estimatedCompletion: string | null;
  createdAt: string;
  neoantigens: Neoantigen[];
}

const STEP_LABELS: Record<string, string> = {
  alignment: 'Alignment',
  variant_calling: 'Variant Calling',
  hla_typing: 'HLA Typing',
  neoantigen_prediction: 'Neoantigen Prediction',
  structure_prediction: 'Structure Prediction',
  ranking: 'Ranking',
  mrna_design: 'mRNA Design',
};

const CONFIDENCE_COLORS: Record<string, string> = {
  high: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-red-100 text-red-800',
};

export default function PipelineJobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const router = useRouter();
  const [job, setJob] = useState<PipelineJob | null>(null);
  const [downloads, setDownloads] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchJob = useCallback(async () => {
    try {
      const res = await fetch(`/api/pipeline/jobs/${jobId}`);
      if (!res.ok) return;
      const data = await res.json();
      setJob(data.job);

      if (data.job.status === 'complete' && !downloads) {
        const dlRes = await fetch(`/api/pipeline/jobs/${jobId}/results`);
        if (dlRes.ok) {
          const dlData = await dlRes.json();
          setDownloads(dlData.downloads);
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [jobId, downloads]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  // Poll while running
  useEffect(() => {
    if (!job || (job.status !== 'queued' && job.status !== 'running')) return;
    const interval = setInterval(fetchJob, 10_000);
    return () => clearInterval(interval);
  }, [job, fetchJob]);

  const handleCancel = async () => {
    if (!confirm('Cancel this pipeline job?')) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/pipeline/jobs/${jobId}`, { method: 'DELETE' });
      if (res.ok) fetchJob();
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-gray-200" />
          <div className="h-20 rounded bg-gray-200" />
          <div className="h-64 rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Job Not Found</h1>
        <button onClick={() => router.push('/pipeline/jobs')} className="mt-4 text-purple-600 hover:text-purple-700">
          Back to Jobs
        </button>
      </div>
    );
  }

  const isActive = job.status === 'queued' || job.status === 'running';
  const elapsed = job.startedAt
    ? Math.round(((job.completedAt ? new Date(job.completedAt).getTime() : Date.now()) - new Date(job.startedAt).getTime()) / 1000)
    : 0;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button onClick={() => router.push('/pipeline/jobs')} className="text-sm text-gray-500 hover:text-gray-700 mb-1">
            &larr; All Jobs
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Job {job.id.slice(0, 8)}</h1>
        </div>
        {isActive && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {cancelling ? 'Cancelling...' : 'Cancel Job'}
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="rounded-xl border border-gray-200 p-6 mb-6">
        <PipelineProgressBar
          currentStep={job.currentStep}
          stepsCompleted={job.stepsCompleted}
          status={job.status}
        />

        {/* Timing info */}
        <div className="mt-4 flex items-center gap-6 text-sm text-gray-500">
          {isActive && (
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              Running for {Math.floor(elapsed / 60)}m {elapsed % 60}s
            </span>
          )}
          {job.estimatedCompletion && isActive && (
            <span>Est. completion: {new Date(job.estimatedCompletion).toLocaleTimeString()}</span>
          )}
          {job.completedAt && (
            <span>Completed in {Math.floor((job.totalComputeSeconds ?? elapsed) / 60)}m {(job.totalComputeSeconds ?? elapsed) % 60}s</span>
          )}
          {job.estimatedCostUsd !== null && (
            <span>Cost: ${job.estimatedCostUsd.toFixed(2)}</span>
          )}
        </div>
      </div>

      {/* Error display */}
      {job.stepErrors && Object.keys(job.stepErrors).length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 mb-6">
          <h3 className="font-medium text-red-800">Errors</h3>
          {Object.entries(job.stepErrors).map(([step, error]) => (
            <div key={step} className="mt-2 text-sm">
              <span className="font-medium text-red-700">{STEP_LABELS[step] ?? step}:</span>{' '}
              <span className="text-red-600">{error}</span>
            </div>
          ))}
          {job.retryCount > 0 && (
            <p className="mt-2 text-xs text-red-500">
              Retries: {job.retryCount}/{job.maxRetries}
            </p>
          )}
        </div>
      )}

      {/* Stats */}
      {(job.variantCount !== null || job.tmb !== null || job.neoantigenCount !== null) && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {job.variantCount !== null && (
            <div className="rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">{job.variantCount.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Variants Found</p>
            </div>
          )}
          {job.tmb !== null && (
            <div className="rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">{job.tmb.toFixed(1)}</p>
              <p className="text-xs text-gray-500">TMB (mut/Mb)</p>
            </div>
          )}
          {job.neoantigenCount !== null && (
            <div className="rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">{job.neoantigenCount}</p>
              <p className="text-xs text-gray-500">Neoantigens</p>
            </div>
          )}
        </div>
      )}

      {/* Top neoantigens */}
      {job.neoantigens.length > 0 && (
        <div className="rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Top Neoantigen Candidates</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b">
                  <th className="pb-2 pr-3">#</th>
                  <th className="pb-2 pr-3">Gene</th>
                  <th className="pb-2 pr-3">Mutation</th>
                  <th className="pb-2 pr-3">Peptide</th>
                  <th className="pb-2 pr-3">HLA</th>
                  <th className="pb-2 pr-3">Score</th>
                  <th className="pb-2">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {job.neoantigens.map((neo) => (
                  <tr key={neo.rank} className="border-b border-gray-100">
                    <td className="py-2 pr-3 text-gray-400">{neo.rank}</td>
                    <td className="py-2 pr-3 font-medium">{neo.gene}</td>
                    <td className="py-2 pr-3 text-gray-600">{neo.mutation}</td>
                    <td className="py-2 pr-3 font-mono text-xs">{neo.mutantPeptide}</td>
                    <td className="py-2 pr-3 text-gray-600">{neo.hlaAllele}</td>
                    <td className="py-2 pr-3 font-medium">{neo.compositeScore.toFixed(2)}</td>
                    <td className="py-2">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${CONFIDENCE_COLORS[neo.confidence] ?? 'bg-gray-100 text-gray-800'}`}>
                        {neo.confidence}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Download results */}
      {downloads && Object.keys(downloads).length > 0 && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-6">
          <h3 className="font-semibold text-green-900 mb-4">Download Results</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {downloads.fullReportPdf && (
              <a href={downloads.fullReportPdf} className="flex items-center gap-2 rounded-lg border border-green-300 bg-white p-3 hover:bg-green-50 transition-colors">
                <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                <span className="text-sm font-medium text-green-800">Full Report (PDF)</span>
              </a>
            )}
            {downloads.vaccineBlueprint && (
              <a href={downloads.vaccineBlueprint} className="flex items-center gap-2 rounded-lg border border-green-300 bg-white p-3 hover:bg-green-50 transition-colors">
                <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                <span className="text-sm font-medium text-green-800">Vaccine Blueprint</span>
              </a>
            )}
            {downloads.neoantigenReport && (
              <a href={downloads.neoantigenReport} className="flex items-center gap-2 rounded-lg border border-green-300 bg-white p-3 hover:bg-green-50 transition-colors">
                <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                <span className="text-sm font-medium text-green-800">Neoantigen Report</span>
              </a>
            )}
            {downloads.patientSummary && (
              <a href={downloads.patientSummary} className="flex items-center gap-2 rounded-lg border border-green-300 bg-white p-3 hover:bg-green-50 transition-colors">
                <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                <span className="text-sm font-medium text-green-800">Patient Summary</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Job metadata */}
      <div className="mt-6 rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Job Details</h3>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <dt className="text-gray-400">Job ID</dt>
          <dd className="font-mono text-xs text-gray-600">{job.id}</dd>
          <dt className="text-gray-400">Format</dt>
          <dd className="text-gray-600 uppercase">{job.inputFormat}</dd>
          <dt className="text-gray-400">Reference</dt>
          <dd className="text-gray-600">{job.referenceGenome}</dd>
          <dt className="text-gray-400">Created</dt>
          <dd className="text-gray-600">{new Date(job.createdAt).toLocaleString()}</dd>
        </dl>
      </div>
    </div>
  );
}
