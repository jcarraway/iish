'use client';

import { useCallback, useEffect, useState } from 'react';

interface Trial {
  id: string;
  nctId: string;
  title: string;
  phase: string | null;
  status: string;
  interventionName: string | null;
  parsedEligibility: Record<string, unknown> | null;
  rawEligibilityText: string | null;
  lastSyncedAt: string | null;
  _count: { sites: number };
}

type FilterTab = 'all' | 'unparsed' | 'low_confidence';

export default function AdminTrialsPage() {
  const [trials, setTrials] = useState<Trial[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [reparsingId, setReparsingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchTrials = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter !== 'all') params.set('filter', filter);
    const res = await fetch(`/api/admin/trials?${params}`);
    if (res.ok) {
      const data = await res.json();
      setTrials(data.trials);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchTrials();
  }, [fetchTrials]);

  async function handleSync() {
    setSyncing(true);
    try {
      await fetch('/api/admin/trial-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      await fetchTrials();
    } finally {
      setSyncing(false);
    }
  }

  async function handleReparse(trialId: string) {
    setReparsingId(trialId);
    try {
      await fetch(`/api/admin/trials/${trialId}/reparse`, { method: 'POST' });
      await fetchTrials();
    } finally {
      setReparsingId(null);
    }
  }

  function getConfidence(trial: Trial): number | null {
    const pe = trial.parsedEligibility as { confidenceScore?: number } | null;
    return pe?.confidenceScore ?? null;
  }

  function confidenceColor(score: number | null): string {
    if (score === null) return 'text-gray-400';
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  }

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'unparsed', label: 'Unparsed' },
    { key: 'low_confidence', label: 'Low Confidence' },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Trial Management</h2>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {syncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>

      <div className="mb-4 flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              filter === tab.key
                ? 'bg-blue-100 text-blue-700'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : trials.length === 0 ? (
        <p className="text-gray-500">No trials found. Run a sync to import trials from ClinicalTrials.gov.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">NCT ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Phase</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Intervention</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Sites</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Confidence</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {trials.map((trial) => {
                const confidence = getConfidence(trial);
                const isExpanded = expandedId === trial.id;

                return (
                  <tr key={trial.id} className="group">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : trial.id)}
                        className="text-left text-sm font-medium text-gray-900 hover:text-blue-600"
                      >
                        {trial.title.length > 80 ? `${trial.title.slice(0, 80)}...` : trial.title}
                      </button>
                      {isExpanded && trial.parsedEligibility && (
                        <details open className="mt-2">
                          <summary className="cursor-pointer text-xs text-gray-500">Parsed Eligibility</summary>
                          <pre className="mt-1 max-h-96 overflow-auto rounded bg-gray-50 p-2 text-xs">
                            {JSON.stringify(trial.parsedEligibility, null, 2)}
                          </pre>
                        </details>
                      )}
                      {isExpanded && !trial.parsedEligibility && trial.rawEligibilityText && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-xs text-gray-500">Raw Eligibility Text</summary>
                          <pre className="mt-1 max-h-96 overflow-auto whitespace-pre-wrap rounded bg-gray-50 p-2 text-xs">
                            {trial.rawEligibilityText}
                          </pre>
                        </details>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{trial.nctId}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{trial.phase ?? '—'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{trial.status}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {trial.interventionName
                        ? trial.interventionName.length > 40
                          ? `${trial.interventionName.slice(0, 40)}...`
                          : trial.interventionName
                        : '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{trial._count.sites}</td>
                    <td className={`whitespace-nowrap px-4 py-3 text-sm font-medium ${confidenceColor(confidence)}`}>
                      {confidence !== null ? confidence.toFixed(2) : '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <button
                        onClick={() => handleReparse(trial.id)}
                        disabled={reparsingId === trial.id || !trial.rawEligibilityText}
                        className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                      >
                        {reparsingId === trial.id ? 'Parsing...' : 'Re-parse'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
