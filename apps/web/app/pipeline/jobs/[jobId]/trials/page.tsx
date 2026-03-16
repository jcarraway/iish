'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface TrialMatch {
  trialId: string;
  nctId: string;
  title: string;
  phase: string | null;
  trialType: string | null;
  relevanceScore: number;
  relevanceExplanation: string;
  matchedNeoantigens: string[];
}

const PHASE_COLORS: Record<string, string> = {
  'Phase 1': 'bg-blue-100 text-blue-800',
  'Phase 2': 'bg-green-100 text-green-800',
  'Phase 3': 'bg-purple-100 text-purple-800',
  'Phase 1/Phase 2': 'bg-teal-100 text-teal-800',
  'Phase 2/Phase 3': 'bg-indigo-100 text-indigo-800',
};

function ScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-yellow-500' : 'bg-gray-400';
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-2 rounded-full bg-gray-200">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${Math.min(100, score)}%` }} />
      </div>
      <span className="text-xs font-medium text-gray-600">{score}</span>
    </div>
  );
}

export default function TrialsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const router = useRouter();
  const [matches, setMatches] = useState<TrialMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrials() {
      try {
        const res = await fetch(`/api/pipeline/jobs/${jobId}/trials`);
        if (!res.ok) {
          if (res.status === 401) router.push('/');
          else if (res.status === 400) setError('Job is not yet complete');
          else setError('Failed to load trials');
          return;
        }
        const data = await res.json();
        setMatches(data.matches);
      } catch {
        setError('Failed to load trials');
      } finally {
        setLoading(false);
      }
    }
    fetchTrials();
  }, [jobId, router]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-6">
        <Link href={`/pipeline/jobs/${jobId}`} className="text-sm text-gray-500 hover:text-gray-700 mb-1 inline-block">
          &larr; Back to Job
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Clinical Trial Cross-Reference</h1>
        <p className="text-sm text-gray-500">Trials matched to your neoantigen profile</p>
      </div>

      {loading && (
        <div className="text-center py-12">
          <svg className="mx-auto h-8 w-8 animate-spin text-purple-600" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="mt-4 text-gray-500">Analyzing trial relevance with AI...</p>
          <p className="text-xs text-gray-400 mt-1">This may take 10-20 seconds</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {!loading && !error && matches.length === 0 && (
        <div className="rounded-xl border border-gray-200 p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No Relevant Trials Found</h3>
          <p className="mt-2 text-sm text-gray-500">
            No clinical trials in our database currently match your neoantigen profile. Check back as new trials are added regularly.
          </p>
        </div>
      )}

      {!loading && matches.length > 0 && (
        <div className="space-y-4">
          {matches.map((match) => (
            <div key={match.trialId} className="rounded-xl border border-gray-200 p-6 hover:border-purple-200 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <a
                      href={`https://clinicaltrials.gov/study/${match.nctId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-mono text-purple-600 hover:text-purple-700"
                    >
                      {match.nctId}
                    </a>
                    {match.phase && (
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${PHASE_COLORS[match.phase] ?? 'bg-gray-100 text-gray-800'}`}>
                        {match.phase}
                      </span>
                    )}
                    {match.trialType && (
                      <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        {match.trialType}
                      </span>
                    )}
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm">{match.title}</h3>
                </div>
                <ScoreBar score={match.relevanceScore} />
              </div>

              <p className="text-sm text-gray-600 mb-3">{match.relevanceExplanation}</p>

              {match.matchedNeoantigens.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Matched genes:</span>
                  {match.matchedNeoantigens.map((gene) => (
                    <span key={gene} className="inline-block rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
                      {gene}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
