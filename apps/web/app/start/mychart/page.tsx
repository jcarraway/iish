'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import HealthSystemSearch from '@/components/HealthSystemSearch';
import type { HealthSystemResult, FhirResourceSummary } from '@oncovax/shared';

type Step = 'search' | 'confirm_connect' | 'connecting' | 'extracting' | 'done' | 'error';

export default function MyChartPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-2xl px-6 py-16"><p className="text-gray-500">Loading...</p></div>}>
      <MyChartPageInner />
    </Suspense>
  );
}

function MyChartPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [step, setStep] = useState<Step>('search');
  const [selectedSystem, setSelectedSystem] = useState<HealthSystemResult | null>(null);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [completeness, setCompleteness] = useState(0);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [resourceSummary, setResourceSummary] = useState<FhirResourceSummary[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle callback redirect from OAuth
  useEffect(() => {
    const connected = searchParams.get('connected');
    const connId = searchParams.get('connectionId');
    const error = searchParams.get('error');

    if (error) {
      setErrorMessage(
        error === 'denied' ? 'You declined to connect your MyChart account.'
        : error === 'invalid_state' ? 'The connection timed out. Please try again.'
        : error === 'token_exchange_failed' ? 'Failed to connect to MyChart. Please try again.'
        : 'An error occurred. Please try again.'
      );
      setStep('error');
      return;
    }

    if (connected === 'true' && connId) {
      setConnectionId(connId);
      setStep('extracting');
      extractRecords(connId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSystemSelect = (system: HealthSystemResult) => {
    setSelectedSystem(system);
    setStep('confirm_connect');
  };

  const handleConnect = async () => {
    if (!selectedSystem) return;
    setStep('connecting');

    try {
      const res = await fetch(`/api/fhir/authorize?healthSystemId=${selectedSystem.id}`);
      if (!res.ok) throw new Error('Failed to initiate connection');

      const data = await res.json();
      window.location.href = data.authorizeUrl;
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to connect');
      setStep('error');
    }
  };

  const extractRecords = async (connId: string) => {
    try {
      const res = await fetch('/api/fhir/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId: connId }),
      });

      if (!res.ok) throw new Error('Failed to extract records');

      const data = await res.json();
      setCompleteness(data.completeness);
      setMissingFields(data.missingFields);
      setResourceSummary(data.resourceSummary);

      // Store missing fields for the confirm page
      if (data.missingFields?.length > 0) {
        sessionStorage.setItem('oncovax_fhir_missing', JSON.stringify(data.missingFields));
      }

      setStep('done');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to extract records');
      setStep('error');
    }
  };

  // --- Step: Search ---
  if (step === 'search') {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-bold">Connect MyChart</h1>
        <p className="mt-2 text-sm text-gray-500">
          Search for your hospital or health system to securely connect your medical records.
        </p>

        <div className="mt-8">
          <HealthSystemSearch onSelect={handleSystemSelect} />
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t see your health system?{' '}
          <Link href="/start/upload" className="text-blue-600 hover:text-blue-800">
            Upload your documents instead
          </Link>
        </p>
      </div>
    );
  }

  // --- Step: Confirm connect ---
  if (step === 'confirm_connect' && selectedSystem) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-bold">Connect to {selectedSystem.name}</h1>
        <p className="mt-2 text-sm text-gray-500">
          You&apos;ll be redirected to MyChart to authorize OncoVax to read your records.
        </p>

        <div className="mt-8 rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900">What we&apos;ll access:</h2>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Cancer diagnosis and staging
            </li>
            <li className="flex items-start gap-2">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Biomarker test results (ER, PR, HER2, etc.)
            </li>
            <li className="flex items-start gap-2">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Recent lab values
            </li>
            <li className="flex items-start gap-2">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Treatment medications and procedures
            </li>
          </ul>

          <h2 className="mt-6 text-sm font-semibold text-gray-900">What we never access:</h2>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Mental health records
            </li>
            <li className="flex items-start gap-2">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Substance use or reproductive health
            </li>
            <li className="flex items-start gap-2">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Billing or insurance details
            </li>
          </ul>

          <p className="mt-6 text-xs text-gray-400">
            We never modify your records. You can revoke access at any time from your dashboard.
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => { setSelectedSystem(null); setStep('search'); }}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            Back
          </button>
          <button
            onClick={handleConnect}
            className="flex-1 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Connect to MyChart
          </button>
        </div>
      </div>
    );
  }

  // --- Step: Connecting (redirect in progress) ---
  if (step === 'connecting') {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-bold">Connecting to MyChart</h1>
        <div className="mt-8 flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm text-gray-600">Redirecting to MyChart login...</p>
        </div>
      </div>
    );
  }

  // --- Step: Extracting records ---
  if (step === 'extracting') {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-bold">Pulling your records</h1>
        <p className="mt-2 text-sm text-gray-500">Connected! Now importing your medical records...</p>
        <div className="mt-8 space-y-3">
          {['Fetching diagnosis information', 'Reading biomarker results', 'Checking treatment history', 'Reviewing lab values'].map((label, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <p className="text-sm text-gray-600">{label}...</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- Step: Done ---
  if (step === 'done') {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold">Records imported</h1>
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Profile completeness</span>
            <span className="text-sm font-bold text-gray-900">{Math.round(completeness * 100)}%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-gray-100">
            <div
              className="h-2 rounded-full bg-green-500 transition-all"
              style={{ width: `${Math.round(completeness * 100)}%` }}
            />
          </div>
        </div>

        {resourceSummary.length > 0 && (
          <div className="mt-4 rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-900">What we found:</h2>
            <ul className="mt-3 space-y-2">
              {resourceSummary.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {r.description} ({r.count} record{r.count !== 1 ? 's' : ''})
                </li>
              ))}
            </ul>
          </div>
        )}

        {missingFields.length > 0 && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="text-sm font-semibold text-amber-800">
              We couldn&apos;t find {missingFields.length} field{missingFields.length !== 1 ? 's' : ''} in your records:
            </h2>
            <p className="mt-1 text-xs text-amber-700">
              {missingFields.join(', ')}
            </p>
            <p className="mt-2 text-xs text-amber-600">
              You&apos;ll be able to fill these in on the next screen.
            </p>
          </div>
        )}

        <div className="mt-8">
          <button
            onClick={() => router.push('/start/confirm?path=mychart')}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Continue to confirm your details
          </button>
        </div>
      </div>
    );
  }

  // --- Step: Error ---
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-bold">Connection failed</h1>
      <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={() => { setErrorMessage(''); setStep('search'); }}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
        >
          Try again
        </button>
        <Link
          href="/start/upload"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Upload documents instead
        </Link>
      </div>
    </div>
  );
}
