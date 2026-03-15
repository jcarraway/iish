'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ContactPage() {
  const { trialId } = useParams<{ trialId: string }>();
  const [brief, setBrief] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const briefRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/matches/${trialId}/brief`);
        if (!res.ok) throw new Error('Failed to generate brief');
        const data = await res.json();
        setBrief(data.brief);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate brief');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [trialId]);

  const handleCopy = async () => {
    if (!brief) return;
    try {
      await navigator.clipboard.writeText(brief);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select the text
      if (briefRef.current) {
        const range = document.createRange();
        range.selectNodeContents(briefRef.current);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <Link
          href={`/matches/${trialId}`}
          className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-block"
        >
          &larr; Back to trial
        </Link>
        <div className="text-center py-16">
          <div className="inline-block w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-500">Generating oncologist brief...</p>
          <p className="text-xs text-gray-400 mt-1">This may take 10-15 seconds</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <Link
          href={`/matches/${trialId}`}
          className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-block"
        >
          &larr; Back to trial
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      {/* Back link - hidden in print */}
      <div className="print:hidden">
        <Link
          href={`/matches/${trialId}`}
          className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-block"
        >
          &larr; Back to trial
        </Link>
      </div>

      <div className="mb-6 print:hidden">
        <h1 className="text-2xl font-bold text-gray-900">Oncologist Brief</h1>
        <p className="text-gray-500 mt-1">
          Share this summary with your oncologist to discuss this trial.
        </p>
      </div>

      {/* Action buttons - hidden in print */}
      <div className="flex gap-3 mb-6 print:hidden">
        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium"
        >
          {copied ? 'Copied!' : 'Copy to clipboard'}
        </button>
        <button
          onClick={handlePrint}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
        >
          Print
        </button>
      </div>

      {/* Brief content */}
      <div className="bg-white border border-gray-200 rounded-xl p-8 print:border-0 print:p-0">
        <pre
          ref={briefRef}
          className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed"
        >
          {brief}
        </pre>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg print:bg-transparent print:border-0 print:mt-8">
        <p className="text-xs text-yellow-800">
          <strong>Disclaimer:</strong> This brief is AI-generated based on publicly available trial
          data and the patient&apos;s self-reported clinical profile. It is not a clinical recommendation
          and should not replace professional medical judgment. Always verify eligibility directly
          with the trial site.
        </p>
      </div>
    </div>
  );
}
