'use client';

import Link from 'next/link';
import type { SequencingProviderDetails } from '@oncovax/shared';

interface SequencingProviderCardProps {
  providerId: string;
  name: string;
  type: string;
  details: SequencingProviderDetails;
  compareMode?: boolean;
  isSelected?: boolean;
  onToggleCompare?: (providerId: string) => void;
}

const TYPE_BADGE: Record<string, { label: string; className: string }> = {
  commercial: { label: 'Commercial', className: 'bg-blue-100 text-blue-700' },
  academic: { label: 'Academic', className: 'bg-purple-100 text-purple-700' },
  emerging: { label: 'Emerging', className: 'bg-teal-100 text-teal-700' },
};

export default function SequencingProviderCard({
  providerId,
  name,
  type,
  details,
  compareMode,
  isSelected,
  onToggleCompare,
}: SequencingProviderCardProps) {
  const badge = TYPE_BADGE[type] ?? TYPE_BADGE.commercial;

  return (
    <div className={`rounded-lg border p-4 transition-colors ${isSelected ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/sequencing/providers/${providerId}`} className="font-semibold text-gray-900 hover:text-blue-600">
              {name}
            </Link>
            <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${badge.className}`}>
              {badge.label}
            </span>
            {details.fdaApproved && (
              <span className="inline-block rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700">
                FDA Approved
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-gray-500">
            {details.testNames.join(', ')}
          </p>
        </div>
        {compareMode && (
          <label className="flex items-center gap-1.5 cursor-pointer flex-shrink-0">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleCompare?.(providerId)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600"
            />
            <span className="text-xs text-gray-500">Compare</span>
          </label>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <div>
          <span className="text-gray-500">Genes:</span>{' '}
          <span className="font-medium text-gray-900">{details.geneCount}</span>
        </div>
        <div>
          <span className="text-gray-500">Turnaround:</span>{' '}
          <span className="font-medium text-gray-900">{details.turnaroundDays.min}-{details.turnaroundDays.max} days</span>
        </div>
        <div>
          <span className="text-gray-500">Sample:</span>{' '}
          <span className="font-medium text-gray-900">{details.sampleTypes[0]}</span>
        </div>
        <div>
          <span className="text-gray-500">Cost:</span>{' '}
          <span className="font-medium text-gray-900">
            {details.costRange.min === 0 && details.costRange.max === 0
              ? 'Included'
              : `$${details.costRange.min.toLocaleString()}-$${details.costRange.max.toLocaleString()}`}
          </span>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <Link
          href={`/sequencing/providers/${providerId}`}
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
        >
          View details
        </Link>
        <Link
          href="/sequencing/insurance"
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          Check coverage
        </Link>
      </div>
    </div>
  );
}
