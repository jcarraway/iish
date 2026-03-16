'use client';

import { useRouter } from 'next/navigation';

export default function SequencingUploadPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <button onClick={() => router.push('/sequencing')} className="mb-6 text-sm text-gray-500 hover:text-gray-700">
        &larr; Back to sequencing
      </button>

      <h1 className="text-3xl font-bold text-gray-900">Upload Sequencing Results</h1>
      <p className="mt-2 text-sm text-gray-500">
        Upload your genomic test results to identify actionable mutations and matching therapies.
      </p>

      <div className="mt-8 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>
        <p className="mt-4 text-gray-600">Sequencing results upload is coming soon</p>
        <p className="mt-2 text-sm text-gray-400">
          This feature will allow you to upload reports from Foundation Medicine, Tempus, Guardant, and other providers.
        </p>
      </div>
    </div>
  );
}
