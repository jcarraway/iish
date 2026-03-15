'use client';

import Link from 'next/link';

interface FinancialProgramCardProps {
  programId: string;
  name: string;
  organization: string;
  type: string;
  matchStatus: string;
  estimatedBenefit: string | null;
  matchReasoning: string;
  programStatus: string;
  applicationUrl: string | null;
  website: string;
  onSubscribe?: (programId: string) => void;
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  open: { label: 'Open', className: 'bg-green-100 text-green-700' },
  closed: { label: 'Closed', className: 'bg-red-100 text-red-700' },
  waitlist: { label: 'Waitlist', className: 'bg-amber-100 text-amber-700' },
  unknown: { label: 'Check status', className: 'bg-gray-100 text-gray-600' },
};

const MATCH_BADGE: Record<string, { label: string; className: string }> = {
  eligible: { label: 'Eligible', className: 'bg-green-100 text-green-700' },
  likely_eligible: { label: 'Likely eligible', className: 'bg-blue-100 text-blue-700' },
  check_eligibility: { label: 'Check eligibility', className: 'bg-amber-100 text-amber-700' },
};

const TYPE_LABELS: Record<string, string> = {
  copay_foundation: 'Copay Foundation',
  pharma_pap: 'Drug Manufacturer',
  nonprofit_grant: 'Nonprofit Grant',
  government_program: 'Government Program',
  lodging_program: 'Lodging',
  transportation_program: 'Transportation',
  general_assistance: 'General Assistance',
};

export default function FinancialProgramCard({
  programId,
  name,
  organization,
  type,
  matchStatus,
  estimatedBenefit,
  matchReasoning,
  programStatus,
  applicationUrl,
  website,
  onSubscribe,
}: FinancialProgramCardProps) {
  const statusBadge = STATUS_BADGE[programStatus] ?? STATUS_BADGE.unknown;
  const matchBadge = MATCH_BADGE[matchStatus] ?? MATCH_BADGE.check_eligibility;

  return (
    <div className="rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/financial/${programId}`} className="font-semibold text-gray-900 hover:text-blue-600">
              {name}
            </Link>
            <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${statusBadge.className}`}>
              {statusBadge.label}
            </span>
            <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${matchBadge.className}`}>
              {matchBadge.label}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-gray-500">{organization} &middot; {TYPE_LABELS[type] ?? type}</p>
        </div>
        {estimatedBenefit && (
          <span className="flex-shrink-0 text-sm font-semibold text-green-700">{estimatedBenefit}</span>
        )}
      </div>

      <p className="mt-2 text-sm text-gray-600">{matchReasoning}</p>

      <div className="mt-3 flex gap-2">
        {programStatus === 'open' || programStatus === 'unknown' ? (
          applicationUrl ? (
            <a
              href={applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
            >
              Apply now
            </a>
          ) : (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
            >
              Visit website
            </a>
          )
        ) : (
          <button
            onClick={() => onSubscribe?.(programId)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            Get notified when open
          </button>
        )}
        <Link
          href={`/financial/${programId}`}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          Details
        </Link>
      </div>
    </div>
  );
}
