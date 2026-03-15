'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface DashboardData {
  matchCount: number;
  topMatchScore: number | null;
  financialEligibleCount: number;
  financialTotalEstimated: number;
  hasProfile: boolean;
  fhirConnectionCount: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        // Load matches and financial data in parallel
        const [matchRes, financialRes, fhirRes] = await Promise.all([
          fetch('/api/matches').then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/api/financial').then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/api/fhir/connections').then(r => r.ok ? r.json() : null).catch(() => null),
        ]);

        const activeConnections = (fhirRes?.connections ?? []).filter(
          (c: { syncStatus: string }) => c.syncStatus !== 'revoked'
        );

        setData({
          matchCount: matchRes?.matches?.length ?? 0,
          topMatchScore: matchRes?.matches?.[0]?.matchScore ?? null,
          financialEligibleCount: financialRes?.eligibleCount ?? 0,
          financialTotalEstimated: financialRes?.totalEstimated ?? 0,
          hasProfile: matchRes !== null,
          fhirConnectionCount: activeConnections.length,
        });
      } catch {
        setData({ matchCount: 0, topMatchScore: null, financialEligibleCount: 0, financialTotalEstimated: 0, hasProfile: false, fhirConnectionCount: 0 });
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="mt-8 flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data?.hasProfile) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-500">Get started by creating your patient profile.</p>
        <div className="mt-8">
          <button
            onClick={() => router.push('/start')}
            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Get started
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-2 text-sm text-gray-500">Your cancer navigation hub</p>

      {/* Quick-access cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Trial Matches */}
        <Link
          href="/matches"
          className="rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
              </svg>
            </div>
            <h2 className="font-semibold text-gray-900">Trial Matches</h2>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">{data.matchCount}</p>
          <p className="text-xs text-gray-500">
            {data.matchCount > 0 && data.topMatchScore
              ? `Top score: ${Math.round(data.topMatchScore * 100)}%`
              : 'No matches yet'}
          </p>
        </Link>

        {/* Treatment Guide */}
        <Link
          href="/translate"
          className="rounded-xl border border-gray-200 p-5 hover:border-purple-300 hover:shadow-sm transition-all"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h2 className="font-semibold text-gray-900">Treatment Guide</h2>
          </div>
          <p className="mt-3 text-sm text-gray-600">Understand your diagnosis and treatment plan in plain language</p>
          <p className="mt-1 text-xs text-blue-600">View guide &rarr;</p>
        </Link>

        {/* Financial Assistance */}
        <Link
          href="/financial"
          className="rounded-xl border border-gray-200 p-5 hover:border-green-300 hover:shadow-sm transition-all"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="font-semibold text-gray-900">Financial Help</h2>
          </div>
          {data.financialEligibleCount > 0 ? (
            <>
              <p className="mt-3 text-2xl font-bold text-gray-900">{data.financialEligibleCount}</p>
              <p className="text-xs text-gray-500">
                eligible program{data.financialEligibleCount !== 1 ? 's' : ''}
                {data.financialTotalEstimated > 0 && ` · up to $${data.financialTotalEstimated.toLocaleString()}`}
              </p>
            </>
          ) : (
            <>
              <p className="mt-3 text-sm text-gray-600">Find financial assistance programs you qualify for</p>
              <p className="mt-1 text-xs text-blue-600">Find assistance &rarr;</p>
            </>
          )}
        </Link>

        {/* Connected Records */}
        <Link
          href={data.fhirConnectionCount > 0 ? '/dashboard/records' : '/start/mychart'}
          className="rounded-xl border border-gray-200 p-5 hover:border-cyan-300 hover:shadow-sm transition-all"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-100 text-cyan-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.886-3.497l4.5-4.5a4.5 4.5 0 016.364 6.364l-1.757 1.757" />
              </svg>
            </div>
            <h2 className="font-semibold text-gray-900">Records</h2>
          </div>
          {data.fhirConnectionCount > 0 ? (
            <>
              <p className="mt-3 text-2xl font-bold text-gray-900">{data.fhirConnectionCount}</p>
              <p className="text-xs text-gray-500">
                connected system{data.fhirConnectionCount !== 1 ? 's' : ''}
              </p>
            </>
          ) : (
            <>
              <p className="mt-3 text-sm text-gray-600">Connect MyChart to import records automatically</p>
              <p className="mt-1 text-xs text-blue-600">Connect &rarr;</p>
            </>
          )}
        </Link>
      </div>
    </div>
  );
}
