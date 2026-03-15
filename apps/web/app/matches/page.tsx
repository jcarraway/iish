'use client';

import { useEffect, useState, useCallback } from 'react';
import MatchCard from '@/components/MatchCard';
import type { MatchBreakdownItem } from '@oncovax/shared';

interface MatchTrial {
  id: string;
  nctId: string;
  title: string;
  sponsor: string | null;
  phase: string | null;
  status: string;
  briefSummary: string | null;
  interventionName: string | null;
  interventionType: string | null;
}

interface MatchItem {
  id: string;
  trialId: string;
  matchScore: number;
  matchBreakdown: { items?: MatchBreakdownItem[] } | null;
  potentialBlockers: string[];
  status: string;
  trial: MatchTrial;
}

type FilterTab = 'all' | 'saved' | 'dismissed';

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>('all');

  const loadMatches = useCallback(async () => {
    try {
      const res = await fetch('/api/matches');
      if (!res.ok) throw new Error('Failed to load matches');
      const data = await res.json();
      setMatches(data.matches);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const handleStatusChange = async (matchId: string, status: string) => {
    try {
      const res = await fetch(`/api/matches/${matchId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update');
      setMatches((prev) =>
        prev.map((m) => (m.id === matchId ? { ...m, status } : m)),
      );
    } catch {
      // Silently fail — user can retry
    }
  };

  const handleRegenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/matches/generate', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to generate matches');
      await loadMatches();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate matches');
    } finally {
      setGenerating(false);
    }
  };

  const filtered = matches.filter((m) => {
    if (filter === 'all') return m.status !== 'dismissed';
    if (filter === 'saved') return m.status === 'saved';
    if (filter === 'dismissed') return m.status === 'dismissed';
    return true;
  });

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="h-4 bg-gray-100 rounded w-96" />
          <div className="h-40 bg-gray-100 rounded-xl" />
          <div className="h-40 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Trial Matches</h1>
          <p className="mt-2 text-gray-500">
            {matches.length > 0
              ? `${matches.length} clinical trials ranked by compatibility with your profile.`
              : 'No matches found yet.'}
          </p>
        </div>
        <button
          onClick={handleRegenerate}
          disabled={generating}
          className="text-sm px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
        >
          {generating ? 'Generating...' : 'Refresh matches'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {matches.length > 0 && (
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1">
          {(['all', 'saved', 'dismissed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-1 text-sm py-2 rounded-md transition-colors ${
                filter === tab
                  ? 'bg-white text-gray-900 shadow-sm font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'all' ? 'All Matches' : tab === 'saved' ? 'Saved' : 'Dismissed'}
            </button>
          ))}
        </div>
      )}

      {matches.length === 0 && !error && (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <p className="text-gray-500 mb-4">
            No matches have been generated yet. This might mean your profile is still being processed,
            or no trials are currently in our database.
          </p>
          <button
            onClick={handleRegenerate}
            disabled={generating}
            className="text-sm px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Generate matches now'}
          </button>
        </div>
      )}

      <div className="space-y-4">
        {filtered.map((match) => (
          <MatchCard
            key={match.id}
            matchId={match.id}
            trialId={match.trialId}
            nctId={match.trial.nctId}
            title={match.trial.title}
            phase={match.trial.phase}
            sponsor={match.trial.sponsor}
            interventionName={match.trial.interventionName}
            matchScore={match.matchScore}
            matchBreakdown={match.matchBreakdown}
            potentialBlockers={match.potentialBlockers}
            status={match.status}
            onStatusChange={handleStatusChange}
          />
        ))}

        {filtered.length === 0 && matches.length > 0 && (
          <p className="text-center py-8 text-gray-400">
            No matches in this category.
          </p>
        )}
      </div>
    </div>
  );
}
