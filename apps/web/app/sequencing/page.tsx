'use client';

import Link from 'next/link';

export default function SequencingHubPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      {/* Hero */}
      <div className="rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Genomic Sequencing</h1>
        <p className="mt-2 text-gray-600">
          Genomic sequencing analyzes your tumor&apos;s DNA to find mutations that can guide targeted treatment.
          This can help your oncologist choose the most effective therapy for your specific cancer.
        </p>
      </div>

      {/* Pathway cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Already have results */}
        <Link
          href="/sequencing/upload"
          className="rounded-xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-sm transition-all"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <h2 className="mt-3 font-semibold text-gray-900">I have results</h2>
          <p className="mt-1 text-sm text-gray-500">Upload your existing genomic test results for analysis</p>
          <p className="mt-2 text-xs text-blue-600">Upload results &rarr;</p>
        </Link>

        {/* Want sequencing */}
        <Link
          href="/sequencing/providers"
          className="rounded-xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-sm transition-all"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
            </svg>
          </div>
          <h2 className="mt-3 font-semibold text-gray-900">I want sequencing</h2>
          <p className="mt-1 text-sm text-gray-500">Browse testing providers and check insurance coverage</p>
          <p className="mt-2 text-xs text-blue-600">Find providers &rarr;</p>
        </Link>

        {/* Not sure */}
        <Link
          href="/sequencing/results"
          className="rounded-xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-sm transition-all"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="mt-3 font-semibold text-gray-900">I&apos;m not sure</h2>
          <p className="mt-1 text-sm text-gray-500">Learn whether genomic testing is right for your situation</p>
          <p className="mt-2 text-xs text-blue-600">Learn more &rarr;</p>
        </Link>
      </div>

      {/* Quick stats */}
      <div className="mt-10 grid grid-cols-3 gap-4 rounded-lg border border-gray-200 p-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-indigo-600">10+</p>
          <p className="text-xs text-gray-500">Testing providers</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-indigo-600">300-648</p>
          <p className="text-xs text-gray-500">Genes analyzed</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-indigo-600">7-21</p>
          <p className="text-xs text-gray-500">Day turnaround</p>
        </div>
      </div>
    </div>
  );
}
