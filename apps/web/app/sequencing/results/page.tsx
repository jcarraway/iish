'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { GenomicInterpretation, MatchDelta } from '@oncovax/shared';

interface GenomicResultSummary {
  id: string;
  provider: string;
  testName: string;
  reportDate: string | null;
  patientConfirmed: boolean;
  interpretationAt: string | null;
  rematchedAt: string | null;
}

type LoadingStep = 'loading' | 'interpreting' | 'done';

const INTERP_STEPS: { key: LoadingStep; label: string }[] = [
  { key: 'loading', label: 'Loading your results...' },
  { key: 'interpreting', label: 'Creating your personalized interpretation...' },
];

export default function SequencingResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<GenomicResultSummary[]>([]);
  const [interpretation, setInterpretation] = useState<GenomicInterpretation | null>(null);
  const [matchDelta, setMatchDelta] = useState<MatchDelta | null>(null);
  const [loadingStep, setLoadingStep] = useState<LoadingStep>('loading');
  const [loading, setLoading] = useState(true);
  const [rematching, setRematching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  const latestResult = results[0];

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Load genomic results
      const resultsRes = await fetch('/api/genomics/results');
      if (!resultsRes.ok) throw new Error('Failed to load results');
      const { results: genomicResults } = await resultsRes.json();
      setResults(genomicResults);

      if (genomicResults.length === 0) {
        setLoadingStep('done');
        setLoading(false);
        return;
      }

      const latest = genomicResults[0];

      if (!latest.patientConfirmed) {
        setLoadingStep('done');
        setLoading(false);
        return;
      }

      // Load or generate interpretation
      setLoadingStep('interpreting');
      const interpRes = await fetch('/api/genomics/interpretation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ genomicResultId: latest.id }),
      });
      if (interpRes.ok) {
        const { interpretation: interp } = await interpRes.json();
        setInterpretation(interp);
      }

      // Load match delta if already rematched
      if (latest.rematchedAt) {
        const detailRes = await fetch(`/api/genomics/results/${latest.id}`);
        if (detailRes.ok) {
          const { result: detail } = await detailRes.json();
          if (detail.matchDelta) setMatchDelta(detail.matchDelta);
        }
      }

      setLoadingStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleRematch = async () => {
    if (!latestResult) return;
    setRematching(true);
    try {
      const res = await fetch('/api/genomics/rematch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ genomicResultId: latestResult.id }),
      });
      if (!res.ok) throw new Error('Failed to update matches');
      const { delta } = await res.json();
      setMatchDelta(delta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update matches');
    } finally {
      setRematching(false);
    }
  };

  const toggleQuestion = (idx: number) => {
    setExpandedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900">Your Genomic Results</h1>
        <p className="mt-2 text-sm text-gray-500">
          {loadingStep === 'interpreting'
            ? 'Creating your personalized interpretation. This takes about 20-30 seconds.'
            : 'Loading your results...'}
        </p>
        <div className="mt-10 space-y-4">
          {INTERP_STEPS.map((step) => {
            const isActive = step.key === loadingStep;
            const isPast = INTERP_STEPS.findIndex(s => s.key === loadingStep) > INTERP_STEPS.findIndex(s => s.key === step.key);
            return (
              <div key={step.key} className="flex items-center gap-3">
                {isPast ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                ) : isActive ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                ) : (
                  <div className="h-6 w-6 rounded-full border-2 border-gray-200" />
                )}
                <span className={`text-sm ${isActive ? 'font-medium text-gray-900' : isPast ? 'text-gray-500' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (error && !interpretation) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900">Genomic Results</h1>
        <p className="mt-4 text-sm text-red-600">{error}</p>
        <div className="mt-6 flex gap-3">
          <button onClick={loadData} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
            Try again
          </button>
          <button onClick={() => router.push('/dashboard')} className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  // No results at all
  if (results.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <button onClick={() => router.push('/sequencing')} className="mb-6 text-sm text-gray-500 hover:text-gray-700">
          &larr; Back to sequencing
        </button>
        <h1 className="text-3xl font-bold text-gray-900">No Genomic Results Yet</h1>
        <p className="mt-2 text-sm text-gray-500">Upload your genomic test report to get started.</p>
        <Link
          href="/sequencing/upload"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Upload your results
        </Link>
      </div>
    );
  }

  // Has result but not confirmed
  if (!latestResult.patientConfirmed) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900">Confirm Your Results</h1>
        <p className="mt-2 text-sm text-gray-500">Your genomic report has been extracted but not yet confirmed.</p>
        <Link
          href={`/sequencing/confirm?resultId=${latestResult.id}`}
          className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Review and confirm results
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <button onClick={() => router.push('/sequencing')} className="mb-6 text-sm text-gray-500 hover:text-gray-700">
        &larr; Back to sequencing
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Genomic Results</h1>
        <p className="mt-1 text-sm text-gray-500">
          {latestResult.provider} {latestResult.testName}
          {latestResult.reportDate && ` | ${new Date(latestResult.reportDate).toLocaleDateString()}`}
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {interpretation && (
        <>
          {/* Section 1: Summary */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900">What your results mean</h2>
            <div className="mt-3 rounded-lg bg-blue-50 p-5">
              <p className="text-sm text-blue-900 leading-relaxed">{interpretation.summary}</p>
            </div>
          </section>

          {/* Section 2: Mutations explained */}
          {interpretation.mutations.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900">Your mutations explained</h2>
              <div className="mt-3 space-y-4">
                {interpretation.mutations.map((mut, i) => (
                  <div key={i} className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="flex items-center gap-3 bg-gray-50 px-4 py-3">
                      <span className="rounded bg-gray-900 px-2 py-0.5 text-xs font-bold text-white">
                        {mut.gene}
                      </span>
                      <span className="text-sm font-medium text-gray-700">{mut.alteration}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        mut.significance === 'actionable' ? 'bg-green-100 text-green-800' :
                        mut.significance === 'informational' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {mut.significance}
                      </span>
                    </div>
                    <div className="space-y-3 p-4">
                      <p className="text-sm text-gray-700 leading-relaxed">{mut.explanation}</p>

                      {mut.availableTherapies.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold uppercase text-gray-500">Available therapies</h4>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {mut.availableTherapies.map((t, j) => (
                              <span key={j} className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs text-green-700 border border-green-200">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {mut.relevantTrials.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold uppercase text-gray-500">Relevant trial types</h4>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {mut.relevantTrials.map((t, j) => (
                              <span key={j} className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs text-indigo-700 border border-indigo-200">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {mut.prognosisImpact && (
                        <div className="rounded bg-gray-50 p-3">
                          <h4 className="text-xs font-semibold uppercase text-gray-500">What this means for your outlook</h4>
                          <p className="mt-1 text-sm text-gray-700">{mut.prognosisImpact}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section 3: Biomarker profile */}
          {interpretation.biomarkerProfile.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900">Your biomarker profile</h2>
              <div className="mt-3 space-y-3">
                {interpretation.biomarkerProfile.map((bm, i) => (
                  <div key={i} className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">{bm.name}</h3>
                      <span className="text-sm font-medium text-gray-600">{bm.value}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-700">{bm.explanation}</p>
                    <div className="mt-2 rounded bg-indigo-50 p-2.5">
                      <p className="text-xs text-indigo-800">
                        <span className="font-semibold">Immunotherapy relevance:</span> {bm.immunotherapyRelevance}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section 4: Questions for oncologist */}
          {interpretation.questionsForOncologist.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900">What to discuss with your oncologist</h2>
              <div className="mt-3 space-y-2">
                {interpretation.questionsForOncologist.map((q, i) => (
                  <div key={i} className="rounded-lg border border-gray-200">
                    <button
                      onClick={() => toggleQuestion(i)}
                      className="flex w-full items-center justify-between p-4 text-left"
                    >
                      <span className="font-medium text-gray-900">&ldquo;{q.question}&rdquo;</span>
                      <svg
                        className={`h-5 w-5 flex-shrink-0 text-gray-400 transition-transform ${expandedQuestions.has(i) ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                    {expandedQuestions.has(i) && (
                      <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Why this matters:</span> {q.whyItMatters}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Section 5: Match delta / rematch CTA */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900">Updated trial matches</h2>

        {!matchDelta && !rematching && (
          <div className="mt-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-6">
            <h3 className="font-semibold text-green-900">Update your trial matches</h3>
            <p className="mt-1 text-sm text-green-800">
              Now that we have your genomic data, we can find trials that specifically target your mutations and biomarkers.
            </p>
            <button
              onClick={handleRematch}
              className="mt-3 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Update my trial matches
            </button>
          </div>
        )}

        {rematching && (
          <div className="mt-3 flex items-center gap-3 rounded-lg bg-gray-50 p-6">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <p className="text-sm text-gray-600">Matching your genomic profile against clinical trials...</p>
          </div>
        )}

        {matchDelta && (
          <div className="mt-3 space-y-3">
            {matchDelta.newMatches.length > 0 && (
              <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                <h3 className="font-semibold text-green-900">
                  {matchDelta.newMatches.length} new trial{matchDelta.newMatches.length > 1 ? 's' : ''} found
                </h3>
                <div className="mt-2 space-y-2">
                  {matchDelta.newMatches.slice(0, 5).map((m, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-green-800 truncate mr-2">{m.title}</span>
                      <span className="flex-shrink-0 rounded bg-green-200 px-2 py-0.5 text-xs text-green-800">
                        {Math.round(m.matchScore)}%
                      </span>
                    </div>
                  ))}
                  {matchDelta.newMatches.length > 5 && (
                    <p className="text-xs text-green-600">+ {matchDelta.newMatches.length - 5} more</p>
                  )}
                </div>
              </div>
            )}

            {matchDelta.improvedMatches.length > 0 && (
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                <h3 className="font-semibold text-blue-900">
                  {matchDelta.improvedMatches.length} trial{matchDelta.improvedMatches.length > 1 ? 's' : ''} with higher confidence
                </h3>
                <div className="mt-2 space-y-2">
                  {matchDelta.improvedMatches.slice(0, 5).map((m, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-blue-800 truncate mr-2">{m.title}</span>
                      <span className="flex-shrink-0 text-xs text-blue-600">
                        {Math.round(m.oldScore)}% → {Math.round(m.newScore)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {matchDelta.removedMatches.length > 0 && (
              <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-700">
                  {matchDelta.removedMatches.length} trial{matchDelta.removedMatches.length > 1 ? 's' : ''} ruled out
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Your genomic data helped identify trials that aren&apos;t a match.
                </p>
              </div>
            )}

            <div className="flex items-center justify-between rounded-lg bg-gray-100 px-4 py-3">
              <span className="text-sm text-gray-600">
                Total matches: {matchDelta.totalBefore} → {matchDelta.totalAfter}
              </span>
              <Link
                href="/matches"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View all matches →
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Bottom CTA */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/matches"
          className="flex-1 rounded-lg bg-blue-600 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700"
        >
          View trial matches
        </Link>
        <Link
          href="/translate"
          className="flex-1 rounded-lg border border-gray-300 px-6 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Treatment guide
        </Link>
      </div>
    </div>
  );
}
