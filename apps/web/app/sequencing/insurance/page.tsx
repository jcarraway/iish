'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { InsuranceCoverageResult, LetterOfMedicalNecessity } from '@oncovax/shared';

const TEST_OPTIONS = [
  { value: 'comprehensive_genomic_profiling', label: 'Comprehensive Genomic Profiling (CGP)' },
  { value: 'liquid_biopsy', label: 'Liquid Biopsy' },
  { value: 'targeted_panel', label: 'Targeted Panel' },
  { value: 'rna_sequencing', label: 'RNA Sequencing' },
  { value: 'whole_exome_sequencing', label: 'Whole Exome Sequencing' },
];

const INSURER_OPTIONS = [
  { value: '', label: 'Use my profile insurance' },
  { value: 'Medicare', label: 'Medicare' },
  { value: 'UnitedHealthcare', label: 'UnitedHealthcare' },
  { value: 'Aetna', label: 'Aetna' },
  { value: 'Cigna', label: 'Cigna' },
  { value: 'BCBS', label: 'Blue Cross Blue Shield' },
  { value: 'Humana', label: 'Humana' },
  { value: 'Medicaid', label: 'Medicaid' },
];

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  covered: { bg: 'bg-green-50 border-green-200', text: 'text-green-800', label: 'Covered' },
  likely_covered: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800', label: 'Likely Covered' },
  prior_auth_required: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', label: 'Prior Auth Required' },
  not_covered: { bg: 'bg-red-50 border-red-200', text: 'text-red-800', label: 'Not Covered' },
  unknown: { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-800', label: 'Unknown' },
};

export default function InsurancePage() {
  const router = useRouter();
  const [testType, setTestType] = useState('comprehensive_genomic_profiling');
  const [insurer, setInsurer] = useState('');
  const [coverage, setCoverage] = useState<InsuranceCoverageResult | null>(null);
  const [lomn, setLomn] = useState<LetterOfMedicalNecessity | null>(null);
  const [loading, setLoading] = useState(false);
  const [lomnLoading, setLomnLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkCoverage = async () => {
    setLoading(true);
    setError(null);
    setCoverage(null);
    setLomn(null);

    try {
      const res = await fetch('/api/sequencing/coverage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testType, insurer: insurer || undefined }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to check coverage');
      }

      const data = await res.json();
      setCoverage(data.coverage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const generateLomn = async () => {
    if (!coverage) return;
    setLomnLoading(true);

    try {
      const res = await fetch('/api/sequencing/lomn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testType,
          providerName: 'Treating Oncologist',
          insurer: insurer || undefined,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate letter');
      const data = await res.json();
      setLomn(data.lomn);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate letter');
    } finally {
      setLomnLoading(false);
    }
  };

  const statusStyle = coverage ? STATUS_STYLES[coverage.status] ?? STATUS_STYLES.unknown : null;

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <button onClick={() => router.push('/sequencing')} className="mb-6 text-sm text-gray-500 hover:text-gray-700">
        &larr; Back to sequencing
      </button>

      <h1 className="text-3xl font-bold text-gray-900">Insurance Coverage Checker</h1>
      <p className="mt-2 text-sm text-gray-500">
        Check whether your insurance covers genomic sequencing for your cancer type.
      </p>

      {/* Form */}
      <div className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Test type</label>
          <select
            value={testType}
            onChange={e => setTestType(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            {TEST_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Insurance provider</label>
          <select
            value={insurer}
            onChange={e => setInsurer(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            {INSURER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <button
          onClick={checkCoverage}
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Check Coverage'}
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Results */}
      {coverage && statusStyle && (
        <div className="mt-8 space-y-4">
          {/* Status card */}
          <div className={`rounded-lg border p-6 ${statusStyle.bg}`}>
            <div className="flex items-center gap-2">
              <span className={`rounded px-2 py-1 text-xs font-semibold ${statusStyle.text} bg-white/50`}>
                {statusStyle.label}
              </span>
              <span className="text-sm text-gray-600">{coverage.insurer}</span>
            </div>
            <p className={`mt-3 leading-relaxed ${statusStyle.text}`}>{coverage.reasoning}</p>
          </div>

          {/* Details */}
          {coverage.conditions.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Requirements</h3>
              <ul className="mt-2 space-y-1">
                {coverage.conditions.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {coverage.cptCodes.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700">CPT Codes</h3>
              <div className="mt-1 flex gap-2">
                {coverage.cptCodes.map(code => (
                  <span key={code} className="rounded bg-gray-100 px-2 py-1 text-xs font-mono text-gray-700">
                    {code}
                  </span>
                ))}
              </div>
            </div>
          )}

          {coverage.missingInfo.length > 0 && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
              <h3 className="text-sm font-semibold text-amber-900">Missing information</h3>
              <p className="mt-1 text-sm text-amber-800">
                Add the following to your profile for a more accurate coverage check: {coverage.missingInfo.join(', ')}
              </p>
            </div>
          )}

          {coverage.sourceUrl && (
            <p className="text-xs text-gray-500">
              Policy reference:{' '}
              <a href={coverage.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                View policy
              </a>
            </p>
          )}

          {/* LOMN generation */}
          {(coverage.priorAuthRequired || coverage.status === 'not_covered') && (
            <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
              <h3 className="text-sm font-semibold text-indigo-900">Letter of Medical Necessity</h3>
              <p className="mt-1 text-sm text-indigo-800">
                {coverage.priorAuthRequired
                  ? 'Prior authorization is required. Generate a letter of medical necessity to support the request.'
                  : 'This test may not be covered, but a letter of medical necessity can support an appeal.'}
              </p>
              {!lomn && (
                <button
                  onClick={generateLomn}
                  disabled={lomnLoading}
                  className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {lomnLoading ? 'Generating...' : 'Generate LOMN'}
                </button>
              )}
            </div>
          )}

          {/* LOMN content */}
          {lomn && (
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Letter of Medical Necessity</h3>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(lomn.content);
                  }}
                  className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
                >
                  Copy
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                {lomn.content}
              </pre>
              <div className="mt-3 flex gap-2 text-xs text-gray-500">
                <span>CPT: {lomn.cptCodes.join(', ')}</span>
                <span>&middot;</span>
                <span>ICD-10: {lomn.icdCodes.join(', ')}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
