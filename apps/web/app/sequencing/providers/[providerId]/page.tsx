'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { SequencingProviderDetails } from '@iish/shared';

interface ProviderData {
  id: string;
  name: string;
  type: string;
  testTypes: string[];
  details: SequencingProviderDetails;
}

const TYPE_LABELS: Record<string, string> = {
  commercial: 'Commercial Laboratory',
  academic: 'Academic Medical Center',
  emerging: 'Emerging Provider',
};

export default function ProviderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const providerId = params.providerId as string;

  const [provider, setProvider] = useState<ProviderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/sequencing/providers/${providerId}`);
        if (!res.ok) throw new Error('Failed to load provider');
        const data = await res.json();
        setProvider(data.provider);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [providerId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <p className="text-red-600">{error ?? 'Provider not found'}</p>
        <button onClick={() => router.push('/sequencing/providers')} className="mt-4 text-sm text-blue-600 hover:text-blue-800">
          Back to providers
        </button>
      </div>
    );
  }

  const d = provider.details;

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <button onClick={() => router.push('/sequencing/providers')} className="mb-6 text-sm text-gray-500 hover:text-gray-700">
        &larr; Back to all providers
      </button>

      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900">{provider.name}</h1>
        <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
          {TYPE_LABELS[provider.type] ?? provider.type}
        </span>
        {d.fdaApproved && (
          <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
            FDA Approved
          </span>
        )}
      </div>

      {/* Test details */}
      <div className="mt-6">
        <h2 className="text-sm font-semibold uppercase text-gray-500">Available tests</h2>
        <div className="mt-2 space-y-2">
          {d.testNames.map((name, i) => (
            <div key={i} className="rounded-lg border border-gray-200 p-3">
              <p className="font-medium text-gray-900">{name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Key specs */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-xs font-semibold uppercase text-gray-500">Gene count</p>
          <p className="mt-1 text-xl font-bold text-gray-900">{d.geneCount}</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-xs font-semibold uppercase text-gray-500">Turnaround</p>
          <p className="mt-1 text-xl font-bold text-gray-900">{d.turnaroundDays.min}-{d.turnaroundDays.max} days</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-xs font-semibold uppercase text-gray-500">Sample types</p>
          <p className="mt-1 text-sm font-medium text-gray-900">{d.sampleTypes.join(', ')}</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-xs font-semibold uppercase text-gray-500">Cost range</p>
          <p className="mt-1 text-xl font-bold text-gray-900">
            {d.costRange.min === 0 && d.costRange.max === 0
              ? 'Included with care'
              : `$${d.costRange.min.toLocaleString()}-$${d.costRange.max.toLocaleString()}`}
          </p>
        </div>
      </div>

      {/* Clinical utility */}
      <div className="mt-6">
        <h2 className="text-sm font-semibold uppercase text-gray-500">Clinical utility</h2>
        <p className="mt-2 text-gray-700 leading-relaxed">{d.clinicalUtility}</p>
      </div>

      {d.fdaClearance && (
        <div className="mt-4 rounded-lg bg-green-50 p-4">
          <h3 className="text-sm font-semibold text-green-900">FDA clearance</h3>
          <p className="mt-1 text-sm text-green-800">{d.fdaClearance}</p>
        </div>
      )}

      {d.limitations && (
        <div className="mt-4 rounded-lg bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">Limitations</h3>
          <p className="mt-1 text-sm text-amber-800">{d.limitations}</p>
        </div>
      )}

      {/* Ordering process */}
      <div className="mt-6">
        <h2 className="text-sm font-semibold uppercase text-gray-500">Ordering process</h2>
        <p className="mt-2 text-gray-700 leading-relaxed">{d.orderingProcess}</p>
      </div>

      {/* Insurance info */}
      <div className="mt-6 rounded-lg border border-indigo-200 bg-indigo-50 p-4">
        <h3 className="text-sm font-semibold text-indigo-900">Insurance coverage</h3>
        <p className="mt-1 text-sm text-indigo-800">
          Many insurance plans cover genomic testing for advanced cancer. Check your specific coverage.
        </p>
        <Link
          href="/sequencing/insurance"
          className="mt-2 inline-block rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
        >
          Check my coverage
        </Link>
      </div>

      {/* Contact */}
      <div className="mt-6">
        <h2 className="text-sm font-semibold uppercase text-gray-500">Contact</h2>
        <div className="mt-2 space-y-1 text-sm text-gray-700">
          {d.contactUrl && (
            <p>
              Website:{' '}
              <a href={d.contactUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                {d.contactUrl}
              </a>
            </p>
          )}
          {d.contactPhone && <p>Phone: {d.contactPhone}</p>}
          {d.contactEmail && <p>Email: {d.contactEmail}</p>}
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-8 flex gap-3">
        {d.contactUrl && (
          <a
            href={d.contactUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-lg bg-blue-600 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700"
          >
            Visit provider website
          </a>
        )}
        <Link
          href="/sequencing/insurance"
          className="flex-1 rounded-lg border border-gray-300 px-6 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Check insurance coverage
        </Link>
      </div>
    </div>
  );
}
