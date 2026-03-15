'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import FinancialProgramCard from '@/components/FinancialProgramCard';
import type { FinancialMatchResult } from '@oncovax/shared';

const CATEGORY_LABELS: Record<string, string> = {
  copay_treatment: 'Treatment Copay Help',
  copay_diagnostics: 'Diagnostic Test Coverage',
  free_medication: 'Free Medication Programs',
  transportation: 'Transportation Assistance',
  lodging: 'Lodging & Housing',
  living_expenses: 'Living Expenses',
  food: 'Food & Nutrition',
  childcare: 'Childcare',
  general_financial: 'General Financial Assistance',
  fertility_preservation: 'Fertility Preservation',
  mental_health: 'Mental Health Support',
};

export default function FinancialPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<FinancialMatchResult[]>([]);
  const [grouped, setGrouped] = useState<Record<string, FinancialMatchResult[]>>({});
  const [totalEstimated, setTotalEstimated] = useState(0);
  const [eligibleCount, setEligibleCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMatches = useCallback(async () => {
    try {
      const res = await fetch('/api/financial');
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to load financial matches');
      }
      const data = await res.json();
      setMatches(data.matches);
      setGrouped(data.grouped);
      setTotalEstimated(data.totalEstimated);
      setEligibleCount(data.eligibleCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const handleSubscribe = async (programId: string) => {
    try {
      const res = await fetch('/api/financial/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programId }),
      });
      if (res.ok) {
        alert('You will be notified when this fund reopens.');
      }
    } catch {
      // Silently fail
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold">Financial Assistance</h1>
        <p className="mt-2 text-sm text-gray-500">Finding programs you may qualify for...</p>
        <div className="mt-8 flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm text-gray-600">Matching your profile to assistance programs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold">Financial Assistance</h1>
        <p className="mt-4 text-sm text-red-600">{error}</p>
        <button
          onClick={() => { setLoading(true); setError(null); loadMatches(); }}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Try again
        </button>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold">Financial Assistance</h1>
        <div className="mt-8 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
          <p className="text-gray-600">Complete your profile to see financial assistance matches.</p>
          <button
            onClick={() => router.push('/start/confirm?path=manual')}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Complete your profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      {/* Hero banner */}
      <div className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Financial Assistance</h1>
        {totalEstimated > 0 && (
          <p className="mt-2 text-lg text-green-800">
            You may qualify for up to <span className="font-bold">${totalEstimated.toLocaleString()}</span> in financial assistance
          </p>
        )}
        <p className="mt-1 text-sm text-gray-600">
          {eligibleCount} program{eligibleCount !== 1 ? 's' : ''} you appear eligible for &middot; {matches.length} total matches
        </p>
      </div>

      {/* Grouped results */}
      <div className="space-y-10">
        {Object.entries(grouped)
          .sort(([, a], [, b]) => b.length - a.length)
          .map(([category, programs]) => (
            <section key={category}>
              <h2 className="mb-4 text-lg font-bold text-gray-900">
                {CATEGORY_LABELS[category] ?? category}
                <span className="ml-2 text-sm font-normal text-gray-500">({programs.length})</span>
              </h2>
              <div className="space-y-3">
                {programs.map((program) => (
                  <FinancialProgramCard
                    key={program.programId}
                    programId={program.programId}
                    name={program.programName}
                    organization={program.organization}
                    type={program.type}
                    matchStatus={program.matchStatus}
                    estimatedBenefit={program.estimatedBenefit}
                    matchReasoning={program.matchReasoning}
                    programStatus={program.status}
                    applicationUrl={program.applicationUrl}
                    website={program.website}
                    onSubscribe={handleSubscribe}
                  />
                ))}
              </div>
            </section>
          ))}
      </div>

      {/* CTAs */}
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => router.push('/translate')}
          className="flex-1 rounded-lg border border-gray-300 px-6 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          View treatment guide
        </button>
        <button
          onClick={() => router.push('/matches')}
          className="flex-1 rounded-lg border border-gray-300 px-6 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          View trial matches
        </button>
      </div>
    </div>
  );
}
