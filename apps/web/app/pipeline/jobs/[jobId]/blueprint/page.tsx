'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import BlueprintVisualization from '@/components/BlueprintVisualization';

interface PipelineJob {
  id: string;
  status: string;
  vaccineBlueprint: Record<string, unknown> | null;
  hlaGenotype: Record<string, string[]> | null;
  neoantigenCount: number | null;
}

export default function BlueprintPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const router = useRouter();
  const [job, setJob] = useState<PipelineJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function fetchJob() {
      try {
        const res = await fetch(`/api/pipeline/jobs/${jobId}`);
        if (!res.ok) {
          if (res.status === 401) router.push('/');
          return;
        }
        const data = await res.json();
        setJob(data.job);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchJob();
  }, [jobId, router]);

  const handleDownloadBlueprint = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/pipeline/jobs/${jobId}/reports/pdf?type=manufacturer`);
      if (res.ok) {
        const data = await res.json();
        window.open(data.url, '_blank');
      }
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-gray-200" />
          <div className="h-40 rounded bg-gray-200" />
          <div className="h-64 rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  if (!job || job.status !== 'complete') {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Blueprint Not Available</h1>
        <p className="mt-2 text-gray-500">The pipeline job must be complete to view the vaccine blueprint.</p>
        <Link href={`/pipeline/jobs/${jobId}`} className="mt-4 inline-block text-purple-600 hover:text-purple-700">
          Back to Job
        </Link>
      </div>
    );
  }

  if (!job.vaccineBlueprint) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">No Blueprint Data</h1>
        <p className="mt-2 text-gray-500">No vaccine blueprint was generated for this job.</p>
        <Link href={`/pipeline/jobs/${jobId}`} className="mt-4 inline-block text-purple-600 hover:text-purple-700">
          Back to Job
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-6">
        <Link href={`/pipeline/jobs/${jobId}`} className="text-sm text-gray-500 hover:text-gray-700 mb-1 inline-block">
          &larr; Back to Job
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Vaccine Blueprint</h1>
          <button
            onClick={handleDownloadBlueprint}
            disabled={downloading}
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {downloading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating PDF...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Download Manufacturer Blueprint
              </>
            )}
          </button>
        </div>
      </div>

      <BlueprintVisualization
        blueprint={job.vaccineBlueprint as Record<string, unknown> & { epitopes?: { gene: string; peptide: string; hlaAllele: string; linker?: string }[]; hlaGenotype?: Record<string, string[]>; lnpFormulation?: { ionizableLipid?: string; particleSizeNm?: string } }}
        hlaGenotype={job.hlaGenotype}
      />
    </div>
  );
}
