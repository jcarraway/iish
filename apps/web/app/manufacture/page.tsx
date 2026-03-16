'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ManufactureLandingPage() {
  const [hasTrialMatches, setHasTrialMatches] = useState(false);
  const [hasPipelineJob, setHasPipelineJob] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [matchRes, pipelineRes] = await Promise.all([
          fetch('/api/matches').then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/api/pipeline/jobs').then(r => r.ok ? r.json() : null).catch(() => null),
        ]);
        setHasTrialMatches((matchRes?.matches?.length ?? 0) > 0);
        setHasPipelineJob((pipelineRes?.jobs?.length ?? 0) > 0);
      } catch {
        // Ignore — not critical
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900">From Blueprint to Vaccine</h1>
      <p className="mt-2 text-gray-600">
        Connect your personalized vaccine blueprint with manufacturing partners and navigate
        the regulatory pathway to treatment.
      </p>

      {/* Clinical Trial First Recommendation */}
      {!loading && hasTrialMatches && (
        <div className="mt-6 rounded-xl border-2 border-green-200 bg-green-50 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-green-900">Clinical Trials Available</h3>
              <p className="mt-1 text-sm text-green-800">
                You have active clinical trial matches. Clinical trials are typically the best
                first option — they provide treatment at no cost, with the highest safety
                monitoring, and contribute to advancing cancer research.
              </p>
              <Link
                href="/matches"
                className="mt-3 inline-block rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                View your trial matches
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main pathways */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {/* Manufacturing Partners */}
        <div className="rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-sm transition-all">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0h.008v.008h-.008V7.5z" />
            </svg>
          </div>
          <h2 className="mt-4 text-lg font-semibold text-gray-900">Manufacturing Partners</h2>
          <p className="mt-2 text-sm text-gray-600">
            Browse our directory of contract manufacturing organizations (CDMOs) capable of
            producing personalized mRNA cancer vaccines.
          </p>
          <Link
            href="/manufacture/partners"
            className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            Browse partners &rarr;
          </Link>
        </div>

        {/* Regulatory Pathway */}
        <div className="rounded-xl border border-gray-200 p-6 hover:border-purple-300 hover:shadow-sm transition-all">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <h2 className="mt-4 text-lg font-semibold text-gray-900">Regulatory Pathway</h2>
          <p className="mt-2 text-sm text-gray-600">
            Understand your options for legally accessing your personalized vaccine —
            from expanded access to Right to Try.
          </p>
          <Link
            href="/manufacture/regulatory"
            className="mt-4 inline-block text-sm font-medium text-purple-600 hover:text-purple-800"
          >
            Explore pathways &rarr;
          </Link>
        </div>
      </div>

      {/* Pipeline status */}
      {!loading && !hasPipelineJob && (
        <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">
            <strong>No vaccine blueprint yet.</strong> Manufacturing and regulatory pathways
            require a completed vaccine blueprint from the neoantigen pipeline. You can still
            browse manufacturing partners and learn about regulatory pathways.
          </p>
          <Link
            href="/pipeline"
            className="mt-2 inline-block text-sm font-medium text-amber-700 hover:text-amber-900"
          >
            Start neoantigen pipeline &rarr;
          </Link>
        </div>
      )}

      {/* Cost transparency */}
      <div className="mt-8 rounded-lg border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900">Cost Expectations</h3>
        <p className="mt-2 text-sm text-gray-600">
          Personalized mRNA vaccine manufacturing typically costs between <strong>$50,000 — $300,000+</strong> depending
          on the manufacturer, regulatory pathway, and specific requirements. Clinical trials may cover these costs entirely.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3 text-center">
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500">Clinical Trial</p>
            <p className="text-sm font-semibold text-green-700">$0 — $25K</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500">Expanded Access</p>
            <p className="text-sm font-semibold text-blue-700">$50K — $200K</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500">Physician IND</p>
            <p className="text-sm font-semibold text-amber-700">$100K — $400K</p>
          </div>
        </div>
      </div>
    </div>
  );
}
