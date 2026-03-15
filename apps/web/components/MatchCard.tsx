'use client';

import Link from 'next/link';
import type { MatchBreakdownItem } from '@oncovax/shared';

interface MatchCardProps {
  matchId: string;
  trialId: string;
  nctId: string;
  title: string;
  phase: string | null;
  sponsor: string | null;
  interventionName: string | null;
  matchScore: number;
  matchBreakdown: { items?: MatchBreakdownItem[] } | null;
  potentialBlockers: string[];
  status: string;
  onStatusChange?: (matchId: string, status: string) => void;
}

function scoreColor(score: number): string {
  if (score >= 70) return 'text-green-700 bg-green-50 border-green-200';
  if (score >= 40) return 'text-yellow-700 bg-yellow-50 border-yellow-200';
  return 'text-red-700 bg-red-50 border-red-200';
}

function statusBadge(status: string): { label: string; className: string } {
  switch (status) {
    case 'saved':
      return { label: 'Saved', className: 'bg-blue-100 text-blue-700' };
    case 'contacted':
      return { label: 'Contacted', className: 'bg-purple-100 text-purple-700' };
    case 'applied':
      return { label: 'Applied', className: 'bg-green-100 text-green-700' };
    case 'dismissed':
      return { label: 'Dismissed', className: 'bg-gray-100 text-gray-500' };
    default:
      return { label: 'New', className: 'bg-gray-100 text-gray-700' };
  }
}

function BreakdownPills({ items }: { items: MatchBreakdownItem[] }) {
  const categoryLabels: Record<string, string> = {
    cancerType: 'Cancer Type',
    stage: 'Stage',
    biomarkers: 'Biomarkers',
    priorTreatments: 'Treatments',
    ecog: 'ECOG',
    age: 'Age',
  };

  return (
    <div className="flex flex-wrap gap-1.5 mt-3">
      {items.map((item) => {
        const bg =
          item.status === 'match'
            ? 'bg-green-100 text-green-800'
            : item.status === 'mismatch'
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-600';
        return (
          <span
            key={item.category}
            className={`text-xs px-2 py-0.5 rounded-full ${bg}`}
          >
            {categoryLabels[item.category] ?? item.category}
          </span>
        );
      })}
    </div>
  );
}

export default function MatchCard({
  matchId,
  trialId,
  nctId,
  title,
  phase,
  sponsor,
  interventionName,
  matchScore,
  matchBreakdown,
  potentialBlockers,
  status,
  onStatusChange,
}: MatchCardProps) {
  const badge = statusBadge(status);
  const items = matchBreakdown?.items ?? [];

  return (
    <div className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full ${badge.className}`}>
              {badge.label}
            </span>
            {phase && (
              <span className="text-xs text-gray-500">{phase}</span>
            )}
          </div>

          <Link href={`/matches/${matchId}`} className="group">
            <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-2">
              {title}
            </h3>
          </Link>

          <p className="text-sm text-gray-500 mt-1">
            {nctId}
            {sponsor && ` · ${sponsor}`}
          </p>

          {interventionName && (
            <p className="text-sm text-gray-700 mt-1">{interventionName}</p>
          )}

          {items.length > 0 && <BreakdownPills items={items} />}

          {potentialBlockers.length > 0 && (
            <div className="mt-3 text-xs text-red-600">
              <span className="font-medium">Potential concern:</span>{' '}
              {potentialBlockers[0]}
              {potentialBlockers.length > 1 && (
                <span className="text-gray-500"> (+{potentialBlockers.length - 1} more)</span>
              )}
            </div>
          )}
        </div>

        <div className={`flex-shrink-0 w-16 h-16 rounded-xl border flex flex-col items-center justify-center ${scoreColor(matchScore)}`}>
          <span className="text-xl font-bold leading-none">{Math.round(matchScore)}</span>
          <span className="text-[10px] opacity-60">/ 100</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
        <Link
          href={`/matches/${matchId}`}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View details
        </Link>
        <span className="text-gray-300">·</span>
        <Link
          href={`/matches/${matchId}/contact`}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Oncologist brief
        </Link>
        {status !== 'saved' && status !== 'dismissed' && onStatusChange && (
          <>
            <span className="text-gray-300">·</span>
            <button
              onClick={() => onStatusChange(matchId, 'saved')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Save
            </button>
            <button
              onClick={() => onStatusChange(matchId, 'dismissed')}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Dismiss
            </button>
          </>
        )}
      </div>
    </div>
  );
}
