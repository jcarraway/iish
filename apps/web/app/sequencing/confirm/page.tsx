'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import type { GenomicAlteration, GenomicBiomarkers, GermlineFinding } from '@oncovax/shared';

interface GenomicResultData {
  id: string;
  provider: string;
  testName: string;
  reportDate: string | null;
  alterations: GenomicAlteration[];
  biomarkers: GenomicBiomarkers;
  germlineFindings: GermlineFinding[] | null;
  extractionConfidence: number | null;
  patientConfirmed: boolean;
}

function significanceBadge(sig: string) {
  const lower = sig.toLowerCase();
  if (lower === 'pathogenic') return 'bg-red-100 text-red-800';
  if (lower === 'likely pathogenic') return 'bg-orange-100 text-orange-800';
  if (lower === 'vus') return 'bg-yellow-100 text-yellow-800';
  return 'bg-gray-100 text-gray-600';
}

function confidenceBadge(confidence: number) {
  if (confidence >= 0.9) return { color: 'bg-green-100 text-green-800', label: 'High confidence' };
  if (confidence >= 0.7) return { color: 'bg-yellow-100 text-yellow-800', label: 'Medium confidence' };
  return { color: 'bg-red-100 text-red-800', label: 'Low confidence' };
}

function biomarkerStatus(status: string) {
  const lower = status.toLowerCase();
  if (lower === 'high' || lower === 'msi-h' || lower.includes('positive')) return 'bg-blue-100 text-blue-800';
  if (lower === 'low' || lower === 'mss' || lower.includes('stable')) return 'bg-gray-100 text-gray-600';
  return 'bg-yellow-100 text-yellow-800';
}

function ConfirmPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resultId = searchParams.get('resultId');

  const [result, setResult] = useState<GenomicResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!resultId) {
      setError('No result ID provided');
      setLoading(false);
      return;
    }

    fetch(`/api/genomics/results/${resultId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load results');
        const data = await res.json();
        setResult(data.result);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [resultId]);

  const handleConfirm = async () => {
    if (!resultId) return;
    setConfirming(true);
    setError(null);

    try {
      const res = await fetch('/api/genomics/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ genomicResultId: resultId }),
      });
      if (!res.ok) throw new Error('Failed to confirm results');
      router.push('/sequencing/results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 rounded bg-gray-200" />
          <div className="h-4 w-48 rounded bg-gray-200" />
          <div className="mt-8 space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-lg bg-gray-100" />)}
          </div>
        </div>
      </div>
    );
  }

  if (error && !result) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900">Something went wrong</h1>
        <p className="mt-2 text-sm text-red-600">{error}</p>
        <button onClick={() => router.push('/sequencing/upload')} className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
          Try uploading again
        </button>
      </div>
    );
  }

  if (!result) return null;

  const overallConf = result.extractionConfidence ?? 0;
  const confBadge = confidenceBadge(overallConf);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <button onClick={() => router.push('/sequencing/upload')} className="mb-6 text-sm text-gray-500 hover:text-gray-700">
        &larr; Upload a different report
      </button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Review your genomic report</h1>
          <p className="mt-2 text-sm text-gray-500">
            We extracted the following from your {result.provider} {result.testName} report.
            Please review and confirm.
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${confBadge.color}`}>
          {confBadge.label}
        </span>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Mutations */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">
          Genomic alterations ({result.alterations.length})
        </h2>
        <div className="mt-3 space-y-3">
          {result.alterations.map((alt, i) => (
            <div key={i} className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <span className="rounded bg-gray-900 px-2 py-0.5 text-xs font-bold text-white">
                  {alt.gene}
                </span>
                <span className="text-sm font-medium text-gray-700">{alt.alteration}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${significanceBadge(alt.clinicalSignificance)}`}>
                  {alt.clinicalSignificance}
                </span>
                {alt.confidence < 0.8 && (
                  <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">
                    Needs review
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Type: {alt.alterationType.replace(/_/g, ' ')}
                {alt.variantAlleleFrequency !== null && ` | VAF: ${(alt.variantAlleleFrequency * 100).toFixed(1)}%`}
              </p>
              {alt.therapyImplications.approvedTherapies.length > 0 && (
                <p className="mt-1 text-xs text-green-700">
                  Approved therapies: {alt.therapyImplications.approvedTherapies.join(', ')}
                </p>
              )}
            </div>
          ))}
          {result.alterations.length === 0 && (
            <p className="text-sm text-gray-500 italic">No genomic alterations detected</p>
          )}
        </div>
      </div>

      {/* Biomarkers */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">Biomarkers</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {result.biomarkers.tmb && (
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">TMB</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${biomarkerStatus(result.biomarkers.tmb.status)}`}>
                  {result.biomarkers.tmb.status}
                </span>
              </div>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {result.biomarkers.tmb.value} {result.biomarkers.tmb.unit}
              </p>
            </div>
          )}
          {result.biomarkers.msi && (
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">MSI</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${biomarkerStatus(result.biomarkers.msi.status)}`}>
                  {result.biomarkers.msi.status}
                </span>
              </div>
              {result.biomarkers.msi.score !== null && (
                <p className="mt-1 text-lg font-semibold text-gray-900">Score: {result.biomarkers.msi.score}</p>
              )}
            </div>
          )}
          {result.biomarkers.pdl1 && (
            <div className="rounded-lg border border-gray-200 p-4">
              <span className="text-sm font-medium text-gray-700">PD-L1</span>
              <div className="mt-1 space-y-1">
                {result.biomarkers.pdl1.tps !== null && (
                  <p className="text-sm text-gray-900">TPS: {result.biomarkers.pdl1.tps}%</p>
                )}
                {result.biomarkers.pdl1.cps !== null && (
                  <p className="text-sm text-gray-900">CPS: {result.biomarkers.pdl1.cps}</p>
                )}
              </div>
            </div>
          )}
          {result.biomarkers.hrd && (
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">HRD</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${biomarkerStatus(result.biomarkers.hrd.status)}`}>
                  {result.biomarkers.hrd.status}
                </span>
              </div>
              {result.biomarkers.hrd.score !== null && (
                <p className="mt-1 text-lg font-semibold text-gray-900">Score: {result.biomarkers.hrd.score}</p>
              )}
            </div>
          )}
        </div>
        {!result.biomarkers.tmb && !result.biomarkers.msi && !result.biomarkers.pdl1 && !result.biomarkers.hrd && (
          <p className="mt-3 text-sm text-gray-500 italic">No biomarkers reported</p>
        )}
      </div>

      {/* Germline findings */}
      {result.germlineFindings && result.germlineFindings.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900">Germline findings</h2>
          <p className="mt-1 text-xs text-gray-500">These are hereditary changes found in your DNA.</p>
          <div className="mt-3 space-y-2">
            {result.germlineFindings.map((gf, i) => (
              <div key={i} className="rounded-lg border border-purple-200 bg-purple-50 p-3">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-purple-800 px-2 py-0.5 text-xs font-bold text-white">{gf.gene}</span>
                  <span className="text-sm text-purple-900">{gf.variant}</span>
                  <span className="text-xs text-purple-600">({gf.significance})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirm button */}
      <div className="mt-10 rounded-lg bg-blue-50 p-6">
        <h3 className="font-semibold text-blue-900">Does this look right?</h3>
        <p className="mt-1 text-sm text-blue-800">
          Confirming will update your profile with this genomic data and improve your trial matching.
        </p>
        <div className="mt-4 flex gap-3">
          <button
            onClick={handleConfirm}
            disabled={confirming}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {confirming ? 'Updating your profile...' : 'Looks right — update my matches'}
          </button>
          <button
            onClick={() => router.push('/sequencing/upload')}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            Upload a different report
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SequencingConfirmPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 rounded bg-gray-200" />
          <div className="h-4 w-48 rounded bg-gray-200" />
        </div>
      </div>
    }>
      <ConfirmPageContent />
    </Suspense>
  );
}
