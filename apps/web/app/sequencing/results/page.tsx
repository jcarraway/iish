'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SequencingResultsPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <button onClick={() => router.push('/sequencing')} className="mb-6 text-sm text-gray-500 hover:text-gray-700">
        &larr; Back to sequencing
      </button>

      <h1 className="text-3xl font-bold text-gray-900">Understanding Genomic Testing</h1>
      <p className="mt-2 text-sm text-gray-500">
        Learn whether genomic sequencing could benefit your treatment plan.
      </p>

      <div className="mt-8 space-y-6">
        <div className="rounded-lg bg-indigo-50 p-6">
          <h2 className="font-semibold text-indigo-900">What is genomic sequencing?</h2>
          <p className="mt-2 text-sm text-indigo-800 leading-relaxed">
            Genomic sequencing analyzes your tumor&apos;s DNA to identify specific mutations that drive cancer growth.
            These mutations can sometimes be targeted by specific drugs, potentially leading to more effective treatment
            with fewer side effects than traditional chemotherapy.
          </p>
        </div>

        <div className="rounded-lg bg-green-50 p-6">
          <h2 className="font-semibold text-green-900">Who should consider it?</h2>
          <ul className="mt-2 space-y-2 text-sm text-green-800">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-600" />
              Patients with advanced (stage III-IV) solid tumors
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-600" />
              When standard treatment options have been exhausted
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-600" />
              Cancer types with known actionable mutations (lung, breast, colorectal, melanoma)
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-600" />
              To identify clinical trial eligibility
            </li>
          </ul>
        </div>

        <div className="rounded-lg bg-amber-50 p-6">
          <h2 className="font-semibold text-amber-900">What to discuss with your oncologist</h2>
          <ul className="mt-2 space-y-2 text-sm text-amber-800">
            <li>&bull; Whether your cancer type has known actionable targets</li>
            <li>&bull; Whether tissue-based or liquid biopsy testing is more appropriate</li>
            <li>&bull; How results might change your treatment plan</li>
            <li>&bull; Insurance coverage and out-of-pocket costs</li>
          </ul>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/sequencing/providers"
          className="flex-1 rounded-lg bg-blue-600 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700"
        >
          Browse testing providers
        </Link>
        <Link
          href="/sequencing/insurance"
          className="flex-1 rounded-lg border border-gray-300 px-6 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Check insurance coverage
        </Link>
      </div>
    </div>
  );
}
