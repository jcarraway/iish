'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { FhirResourceSummary } from '@oncovax/shared';

interface FhirConnectionData {
  id: string;
  healthSystemName: string | null;
  syncStatus: string;
  lastSyncedAt: string | null;
  consentAt: string | null;
  scopesGranted: string[];
  resourcesPulled: FhirResourceSummary[] | null;
}

export default function RecordsPage() {
  const [connections, setConnections] = useState<FhirConnectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [resyncing, setResyncing] = useState<string | null>(null);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      const res = await fetch('/api/fhir/connections');
      if (res.ok) {
        const data = await res.json();
        setConnections(data.connections);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (connectionId: string) => {
    if (!confirm('This will disconnect your MyChart account and remove all imported data. Are you sure?')) return;

    setRevoking(connectionId);
    try {
      const res = await fetch('/api/fhir/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId }),
      });
      if (res.ok) {
        setConnections(prev => prev.map(c =>
          c.id === connectionId ? { ...c, syncStatus: 'revoked' } : c
        ));
      }
    } catch {
      // Ignore
    } finally {
      setRevoking(null);
    }
  };

  const handleResync = async (connectionId: string) => {
    setResyncing(connectionId);
    try {
      const res = await fetch('/api/fhir/resync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId }),
      });
      if (res.ok) {
        const data = await res.json();
        setConnections(prev => prev.map(c =>
          c.id === connectionId ? {
            ...c,
            syncStatus: 'synced',
            lastSyncedAt: data.extractedAt,
            resourcesPulled: data.resourceSummary,
          } : c
        ));
      }
    } catch {
      // Ignore
    } finally {
      setResyncing(null);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold">Connected Records</h1>
        <div className="mt-8 flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold">Connected Records</h1>
      <p className="mt-2 text-sm text-gray-500">
        View and manage your connected medical record sources.
      </p>

      {connections.length === 0 ? (
        <div className="mt-8 rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-sm text-gray-500">No connected records yet.</p>
          <Link
            href="/start/mychart"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Connect MyChart
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {connections.map((conn) => (
            <div key={conn.id} className="rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">
                      {conn.healthSystemName ?? 'Unknown Health System'}
                    </h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        conn.syncStatus === 'synced' ? 'bg-green-100 text-green-700'
                        : conn.syncStatus === 'revoked' ? 'bg-red-100 text-red-700'
                        : conn.syncStatus === 'token_expired' ? 'bg-amber-100 text-amber-700'
                        : 'bg-gray-100 text-gray-500'
                      }`}>
                        {conn.syncStatus === 'synced' ? 'Connected'
                        : conn.syncStatus === 'revoked' ? 'Revoked'
                        : conn.syncStatus === 'token_expired' ? 'Session expired'
                        : conn.syncStatus}
                      </span>
                      {conn.lastSyncedAt && (
                        <span className="text-[10px] text-gray-400">
                          Last synced {new Date(conn.lastSyncedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {conn.syncStatus !== 'revoked' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResync(conn.id)}
                      disabled={resyncing === conn.id}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      {resyncing === conn.id ? 'Syncing...' : 'Re-sync'}
                    </button>
                    <button
                      onClick={() => handleRevoke(conn.id)}
                      disabled={revoking === conn.id}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {revoking === conn.id ? 'Revoking...' : 'Revoke access'}
                    </button>
                  </div>
                )}
              </div>

              {/* Resources pulled */}
              {conn.resourcesPulled && conn.resourcesPulled.length > 0 && conn.syncStatus !== 'revoked' && (
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Data accessed</h3>
                  <ul className="mt-2 space-y-1.5">
                    {conn.resourcesPulled.map((r, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="h-3.5 w-3.5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        {r.description}
                        {r.dateRange?.latest && (
                          <span className="text-xs text-gray-400">
                            (as of {new Date(r.dateRange.latest).toLocaleDateString()})
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* What we don't access */}
      <div className="mt-8 rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-900">What we never access</h2>
        <ul className="mt-3 space-y-2 text-sm text-gray-600">
          {[
            'Mental health records',
            'Substance use history',
            'Reproductive health data',
            'Billing and insurance information',
            'Clinical notes (provider-to-provider)',
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-2">
              <svg className="h-4 w-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Connect another system */}
      <div className="mt-6 text-center">
        <Link href="/start/mychart" className="text-sm text-blue-600 hover:text-blue-800">
          Connect another health system
        </Link>
      </div>
    </div>
  );
}
