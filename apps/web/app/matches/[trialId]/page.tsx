'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import EligibilityBreakdown from '@/components/EligibilityBreakdown';
import type { MatchBreakdownItem, LLMAssessment } from '@oncovax/shared';

interface TrialSite {
  facility: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
}

interface TrialDetail {
  id: string;
  nctId: string;
  title: string;
  sponsor: string | null;
  phase: string | null;
  status: string;
  briefSummary: string | null;
  interventionName: string | null;
  interventionType: string | null;
  interventionDesc: string | null;
  rawEligibilityText: string | null;
  sites: TrialSite[];
}

interface MatchDetail {
  id: string;
  matchScore: number;
  matchBreakdown: { items?: MatchBreakdownItem[]; llmAssessment?: LLMAssessment } | null;
  potentialBlockers: string[];
  status: string;
  trial: TrialDetail;
}

export default function TrialDetailPage() {
  const { trialId } = useParams<{ trialId: string }>();
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/matches/${trialId}`);
        if (!res.ok) throw new Error('Failed to load trial details');
        const data = await res.json();
        setMatch(data.match);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [trialId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-100 rounded w-24" />
          <div className="h-8 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-100 rounded w-48" />
          <div className="h-64 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <p className="text-red-600">{error ?? 'Match not found'}</p>
        <Link href="/matches" className="text-blue-600 hover:underline mt-4 inline-block">
          Back to matches
        </Link>
      </div>
    );
  }

  const { trial } = match;
  const breakdownItems = match.matchBreakdown?.items ?? [];
  const llmAssessment = match.matchBreakdown?.llmAssessment;

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      {/* Back link */}
      <Link
        href="/matches"
        className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-block"
      >
        &larr; Back to matches
      </Link>

      {/* Title section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-sm text-gray-500">{trial.nctId}</span>
          {trial.phase && (
            <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
              {trial.phase}
            </span>
          )}
          <span className="text-xs px-2 py-0.5 bg-blue-50 rounded-full text-blue-600">
            {trial.status.replace(/_/g, ' ')}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{trial.title}</h1>
        {trial.sponsor && (
          <p className="text-gray-500 mt-1">Sponsored by {trial.sponsor}</p>
        )}
      </div>

      {/* Eligibility Breakdown */}
      <section className="mb-8 bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Eligibility Breakdown</h2>
        <EligibilityBreakdown
          items={breakdownItems}
          llmAssessment={llmAssessment}
          potentialBlockers={match.potentialBlockers ?? []}
          matchScore={match.matchScore}
        />
      </section>

      {/* Intervention */}
      {(trial.interventionName || trial.interventionDesc) && (
        <section className="mb-8 bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Intervention</h2>
          {trial.interventionName && (
            <p className="text-gray-900 font-medium">
              {trial.interventionName}
              {trial.interventionType && (
                <span className="text-gray-500 font-normal"> ({trial.interventionType})</span>
              )}
            </p>
          )}
          {trial.interventionDesc && (
            <p className="text-sm text-gray-600 mt-2 whitespace-pre-line">
              {trial.interventionDesc}
            </p>
          )}
        </section>
      )}

      {/* Summary */}
      {trial.briefSummary && (
        <section className="mb-8 bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Trial Summary</h2>
          <p className="text-sm text-gray-600 whitespace-pre-line">{trial.briefSummary}</p>
        </section>
      )}

      {/* Raw Eligibility Criteria */}
      {trial.rawEligibilityText && (
        <section className="mb-8 bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Full Eligibility Criteria</h2>
          <div className="text-sm text-gray-600 whitespace-pre-line max-h-96 overflow-y-auto">
            {trial.rawEligibilityText}
          </div>
        </section>
      )}

      {/* Sites */}
      {trial.sites.length > 0 && (
        <section className="mb-8 bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Trial Sites ({trial.sites.length})
          </h2>
          <div className="divide-y divide-gray-100">
            {trial.sites.map((site, i) => (
              <div key={i} className="py-3">
                {site.facility && (
                  <p className="text-sm font-medium text-gray-900">{site.facility}</p>
                )}
                <p className="text-sm text-gray-500">
                  {[site.city, site.state, site.country].filter(Boolean).join(', ')}
                </p>
                {(site.contactName || site.contactEmail || site.contactPhone) && (
                  <div className="text-xs text-gray-400 mt-1">
                    {site.contactName}
                    {site.contactEmail && ` · ${site.contactEmail}`}
                    {site.contactPhone && ` · ${site.contactPhone}`}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-8">
        <Link
          href={`/matches/${trialId}/contact`}
          className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium"
        >
          Generate oncologist brief
        </Link>
        <a
          href={`https://clinicaltrials.gov/study/${trial.nctId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
        >
          View on ClinicalTrials.gov
        </a>
      </div>
    </div>
  );
}
