'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import InlineMagicLink from '@/components/InlineMagicLink';
import type { PatientProfile, ExtractionPipelineResult, FinancialProfile } from '@oncovax/shared';
import { INSURANCE_TYPES, INCOME_RANGES, ASSISTANCE_CATEGORIES } from '@oncovax/shared';

type PageState = 'loading' | 'extracting' | 'editing' | 'auth_required' | 'saving' | 'error';

interface UploadedFile {
  s3Key: string;
  filename: string;
  mimeType: string;
  fileSize: number;
}

function ConfidenceBadge({ confidence, source }: { confidence?: number; source?: string }) {
  if (source === 'fhir') {
    return <span className="ml-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium bg-emerald-100 text-emerald-700">from MyChart</span>;
  }
  if (source === 'manual') {
    return <span className="ml-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-500">Manual</span>;
  }
  if (confidence == null) {
    return <span className="ml-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-500">No data</span>;
  }
  if (confidence >= 0.8) {
    return <span className="ml-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium bg-green-100 text-green-700">High</span>;
  }
  if (confidence >= 0.5) {
    return <span className="ml-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700">Review</span>;
  }
  return <span className="ml-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium bg-red-100 text-red-700">Low</span>;
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-2xl px-6 py-16"><p className="text-gray-500">Loading...</p></div>}>
      <ConfirmPageInner />
    </Suspense>
  );
}

function ConfirmPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const path = searchParams.get('path') ?? 'upload';

  const [state, setState] = useState<PageState>('loading');
  const [profile, setProfile] = useState<PatientProfile>({});
  const [fieldSources, setFieldSources] = useState<Record<string, string>>({});
  const [fieldConfidence, setFieldConfidence] = useState<Record<string, number>>({});
  const [needsReview, setNeedsReview] = useState<string[]>([]);
  const [couldNotExtract, setCouldNotExtract] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [extractionError, setExtractionError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [claudeApiCost, setClaudeApiCost] = useState(0);
  const [financialOpen, setFinancialOpen] = useState(false);
  const [financialProfile, setFinancialProfile] = useState<FinancialProfile>({});

  // Load data on mount
  useEffect(() => {
    if (path === 'manual') {
      const stored = sessionStorage.getItem('oncovax_manual_profile');
      if (!stored) {
        router.push('/start/manual');
        return;
      }
      const parsed = JSON.parse(stored) as PatientProfile;
      setProfile(parsed);
      // All fields are manual
      const sources: Record<string, string> = {};
      for (const key of Object.keys(parsed)) {
        sources[key] = 'manual';
      }
      setFieldSources(sources);
      setState('editing');
    } else if (path === 'mychart') {
      // MyChart path: load existing profile from API (already populated by FHIR extraction)
      fetch('/api/patients/me')
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data?.profile) {
            setProfile(data.profile);
            setFieldSources(data.fieldSources ?? {});
            setFieldConfidence(data.fieldConfidence ?? {});
            // Surface missing fields from FHIR extraction
            const missing = sessionStorage.getItem('oncovax_fhir_missing');
            if (missing) {
              setCouldNotExtract(JSON.parse(missing));
              sessionStorage.removeItem('oncovax_fhir_missing');
            }
            setState('editing');
          } else {
            router.push('/start/mychart');
          }
        })
        .catch(() => router.push('/start/mychart'));
    } else {
      // Upload path: trigger extraction
      const stored = sessionStorage.getItem('oncovax_uploaded_files');
      if (!stored) {
        router.push('/start/upload');
        return;
      }
      const files = JSON.parse(stored) as UploadedFile[];
      setUploadedFiles(files);
      setState('extracting');
      triggerExtraction(files);
    }

    // Check auth status
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => setIsAuthenticated(data.authenticated))
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const triggerExtraction = async (files: UploadedFile[]) => {
    try {
      const res = await fetch('/api/documents/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          s3Keys: files.map((f) => f.s3Key),
          mimeTypes: files.map((f) => f.mimeType),
        }),
      });

      if (!res.ok) throw new Error('Extraction request failed');

      const result: ExtractionPipelineResult & { extractionId: string } = await res.json();

      if (result.status === 'completed' && result.profile) {
        setProfile(result.profile);
        setFieldSources(result.fieldSources ?? {});
        setFieldConfidence(result.fieldConfidence ?? {});
        setClaudeApiCost(result.claudeApiCost ?? 0);
        // Gather needsReview and couldNotExtract from extractions
        const review: string[] = [];
        const missing: string[] = [];
        for (const ext of result.extractions ?? []) {
          review.push(...ext.needsReview);
          missing.push(...ext.couldNotExtract);
        }
        setNeedsReview([...new Set(review)]);
        setCouldNotExtract([...new Set(missing)]);
        setState('editing');
      } else if (result.status === 'failed') {
        setExtractionError(result.error ?? 'Extraction failed');
        setState('error');
      }
    } catch (err) {
      setExtractionError(err instanceof Error ? err.message : 'Extraction failed');
      setState('error');
    }
  };

  const updateProfileField = (field: keyof PatientProfile, value: unknown) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    if (fieldSources[field] !== 'manual') {
      setFieldSources((prev) => ({ ...prev, [field]: 'user_edited' }));
    }
  };

  const handleSave = useCallback(async () => {
    if (!isAuthenticated) {
      setState('auth_required');
      return;
    }

    setState('saving');
    setSaveError('');
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: { ...profile, financialProfile: Object.keys(financialProfile).length > 0 ? financialProfile : undefined },
          fieldSources,
          fieldConfidence,
          intakePath: path,
          zipCode: profile.zipCode,
          documents: uploadedFiles.map((f) => ({
            s3Key: f.s3Key,
            mimeType: f.mimeType,
            fileSize: f.fileSize,
            filename: f.filename,
          })),
          claudeApiCost,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }

      // Clean up sessionStorage
      sessionStorage.removeItem('oncovax_uploaded_files');
      sessionStorage.removeItem('oncovax_manual_profile');

      router.push('/matches');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed');
      setState('editing');
    }
  }, [isAuthenticated, profile, fieldSources, fieldConfidence, path, uploadedFiles, claudeApiCost, financialProfile, router]);

  const handleAuthDetected = useCallback(() => {
    setIsAuthenticated(true);
    setState('editing');
    // Auto-save after auth
    setTimeout(() => handleSave(), 100);
  }, [handleSave]);

  // --- Render states ---

  if (state === 'loading') {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (state === 'extracting') {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-bold">Analyzing your documents</h1>
        <p className="mt-2 text-sm text-gray-500">
          Our AI is reading your documents and extracting clinical details. This usually takes 10-30 seconds.
        </p>
        <div className="mt-8 flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm text-gray-600">Processing {uploadedFiles.length} document{uploadedFiles.length !== 1 ? 's' : ''}...</p>
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-bold">Extraction failed</h1>
        <p className="mt-2 text-sm text-red-600">{extractionError}</p>
        <div className="mt-6 flex gap-3">
          <button onClick={() => router.push('/start/upload')}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
            Try again
          </button>
          <button onClick={() => router.push('/start/manual')}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
            Enter details manually
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-bold">Confirm your details</h1>
      <p className="mt-2 mb-8 text-sm text-gray-500">
        {path === 'upload'
          ? 'Review the information extracted from your documents. Edit any fields that need correction.'
          : path === 'mychart'
          ? 'Review the data pulled from your MyChart records. Fields marked "from MyChart" were imported automatically.'
          : 'Review the information you entered. Make any changes before we match you to trials.'}
      </p>

      {/* Editable form */}
      <div className="space-y-5">
        {/* Cancer type */}
        <div className={couldNotExtract.includes('cancerType') ? 'rounded-lg border-2 border-red-200 bg-red-50 p-3' : needsReview.includes('cancerType') ? 'rounded-lg border-2 border-amber-200 bg-amber-50 p-3' : ''}>
          <label className="mb-1 flex items-center text-sm font-medium text-gray-700">
            Cancer type
            <ConfidenceBadge confidence={fieldConfidence.cancerType} source={fieldSources.cancerType} />
          </label>
          <input
            type="text"
            value={profile.cancerType ?? ''}
            onChange={(e) => updateProfileField('cancerType', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="e.g., Invasive ductal carcinoma"
          />
          {couldNotExtract.includes('cancerType') && (
            <p className="mt-1 text-xs text-red-600">Could not extract — please enter manually or upload another document</p>
          )}
        </div>

        {/* Stage */}
        <div className={couldNotExtract.includes('stage') ? 'rounded-lg border-2 border-red-200 bg-red-50 p-3' : needsReview.includes('stage') ? 'rounded-lg border-2 border-amber-200 bg-amber-50 p-3' : ''}>
          <label className="mb-1 flex items-center text-sm font-medium text-gray-700">
            Stage
            <ConfidenceBadge confidence={fieldConfidence.stage} source={fieldSources.stage} />
          </label>
          <input
            type="text"
            value={profile.stage ?? ''}
            onChange={(e) => updateProfileField('stage', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="e.g., IIA"
          />
        </div>

        {/* Histological grade */}
        <div>
          <label className="mb-1 flex items-center text-sm font-medium text-gray-700">
            Histological grade
            <ConfidenceBadge confidence={fieldConfidence.histologicalGrade} source={fieldSources.histologicalGrade} />
          </label>
          <input
            type="text"
            value={profile.histologicalGrade ?? ''}
            onChange={(e) => updateProfileField('histologicalGrade', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="e.g., Grade 2"
          />
        </div>

        {/* Receptor status */}
        {(profile.receptorStatus || profile.cancerTypeNormalized === 'breast') && (
          <div>
            <label className="mb-2 flex items-center text-sm font-medium text-gray-700">
              Receptor status
              <ConfidenceBadge confidence={fieldConfidence.receptorStatus} source={fieldSources.receptorStatus} />
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-xs text-gray-500">ER</label>
                <input
                  type="text"
                  value={profile.receptorStatus?.er?.status ?? ''}
                  onChange={(e) => updateProfileField('receptorStatus', {
                    ...profile.receptorStatus,
                    er: { ...profile.receptorStatus?.er, status: e.target.value },
                  })}
                  className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                  placeholder="positive/negative"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">PR</label>
                <input
                  type="text"
                  value={profile.receptorStatus?.pr?.status ?? ''}
                  onChange={(e) => updateProfileField('receptorStatus', {
                    ...profile.receptorStatus,
                    pr: { ...profile.receptorStatus?.pr, status: e.target.value },
                  })}
                  className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                  placeholder="positive/negative"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">HER2</label>
                <input
                  type="text"
                  value={profile.receptorStatus?.her2?.status ?? ''}
                  onChange={(e) => updateProfileField('receptorStatus', {
                    ...profile.receptorStatus,
                    her2: { ...profile.receptorStatus?.her2, status: e.target.value },
                  })}
                  className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                  placeholder="positive/negative"
                />
              </div>
            </div>
          </div>
        )}

        {/* Biomarkers */}
        {profile.biomarkers && Object.keys(profile.biomarkers).length > 0 && (
          <div>
            <label className="mb-2 flex items-center text-sm font-medium text-gray-700">
              Biomarkers
              <ConfidenceBadge confidence={fieldConfidence.biomarkers} source={fieldSources.biomarkers} />
            </label>
            <div className="space-y-2">
              {Object.entries(profile.biomarkers).map(([key, value]) => (
                <div key={key} className="flex gap-2">
                  <span className="flex items-center text-sm text-gray-600 min-w-[100px]">{key}</span>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateProfileField('biomarkers', { ...profile.biomarkers, [key]: e.target.value })}
                    className="flex-1 rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prior treatments */}
        {profile.priorTreatments && profile.priorTreatments.length > 0 && (
          <div>
            <label className="mb-2 flex items-center text-sm font-medium text-gray-700">
              Prior treatments
              <ConfidenceBadge confidence={fieldConfidence.priorTreatments} source={fieldSources.priorTreatments} />
            </label>
            <div className="space-y-2">
              {profile.priorTreatments.map((t, i) => (
                <div key={i} className="flex items-center gap-2 rounded border border-gray-200 p-2">
                  <input
                    type="text"
                    value={t.name}
                    onChange={(e) => {
                      const updated = [...(profile.priorTreatments ?? [])];
                      updated[i] = { ...updated[i], name: e.target.value };
                      updateProfileField('priorTreatments', updated);
                    }}
                    className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
                    placeholder="Treatment name"
                  />
                  <span className="text-xs text-gray-400">{t.type}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ECOG */}
        <div>
          <label className="mb-1 flex items-center text-sm font-medium text-gray-700">
            ECOG Status
            <ConfidenceBadge confidence={fieldConfidence.ecogStatus} source={fieldSources.ecogStatus} />
          </label>
          <select
            value={profile.ecogStatus?.toString() ?? ''}
            onChange={(e) => updateProfileField('ecogStatus', e.target.value ? parseInt(e.target.value, 10) : undefined)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Unknown</option>
            <option value="0">0 — Fully active</option>
            <option value="1">1 — Restricted but ambulatory</option>
            <option value="2">2 — Ambulatory, capable of self-care</option>
            <option value="3">3 — Limited self-care</option>
            <option value="4">4 — Completely disabled</option>
          </select>
        </div>

        {/* Age + Zip */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Age</label>
            <input
              type="number"
              min="0"
              max="150"
              value={profile.age?.toString() ?? ''}
              onChange={(e) => updateProfileField('age', e.target.value ? parseInt(e.target.value, 10) : undefined)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Zip code</label>
            <input
              type="text"
              value={profile.zipCode ?? ''}
              onChange={(e) => updateProfileField('zipCode', e.target.value)}
              maxLength={10}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="e.g., 94110"
            />
          </div>
        </div>
        {/* Financial assistance (optional) */}
        <div className="mt-6 rounded-lg border border-gray-200">
          <button
            type="button"
            onClick={() => setFinancialOpen(!financialOpen)}
            className="flex w-full items-center justify-between px-4 py-3 text-left"
          >
            <div>
              <span className="text-sm font-medium text-gray-700">Financial assistance</span>
              <span className="ml-2 text-xs text-gray-400">(optional)</span>
            </div>
            <svg
              className={`h-4 w-4 text-gray-400 transition-transform ${financialOpen ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          {financialOpen && (
            <div className="space-y-4 border-t border-gray-200 px-4 py-4">
              <p className="text-xs text-gray-500">
                Help us find financial assistance programs you may qualify for. All fields are optional and kept private.
              </p>

              {/* Insurance type */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Insurance type</label>
                <div className="flex flex-wrap gap-2">
                  {INSURANCE_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFinancialProfile(p => ({ ...p, insuranceType: p.insuranceType === type ? undefined : type }))}
                      className={`rounded-full border px-3 py-1 text-xs ${
                        financialProfile.insuranceType === type
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Household size */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Household size</label>
                <select
                  value={financialProfile.householdSize?.toString() ?? ''}
                  onChange={(e) => setFinancialProfile(p => ({ ...p, householdSize: e.target.value ? parseInt(e.target.value, 10) : undefined }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Select...</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                    <option key={n} value={n}>{n}{n === 8 ? '+' : ''}</option>
                  ))}
                </select>
              </div>

              {/* Income range */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Household income (annual)</label>
                <div className="flex flex-wrap gap-2">
                  {INCOME_RANGES.map((range) => (
                    <button
                      key={range}
                      type="button"
                      onClick={() => setFinancialProfile(p => ({ ...p, householdIncome: p.householdIncome === range ? undefined : range }))}
                      className={`rounded-full border px-3 py-1 text-xs ${
                        financialProfile.householdIncome === range
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              {/* Financial concerns */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">What costs concern you most?</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: ASSISTANCE_CATEGORIES.COPAY_TREATMENT, label: 'Drug copays' },
                    { key: ASSISTANCE_CATEGORIES.TRANSPORTATION, label: 'Transportation' },
                    { key: ASSISTANCE_CATEGORIES.LIVING_EXPENSES, label: 'Living expenses' },
                    { key: ASSISTANCE_CATEGORIES.CHILDCARE, label: 'Childcare' },
                    { key: ASSISTANCE_CATEGORIES.FOOD, label: 'Food' },
                    { key: ASSISTANCE_CATEGORIES.LODGING, label: 'Lodging' },
                  ].map(({ key, label }) => {
                    const selected = financialProfile.financialConcerns?.includes(key) ?? false;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setFinancialProfile(p => {
                            const current = p.financialConcerns ?? [];
                            return {
                              ...p,
                              financialConcerns: selected
                                ? current.filter(c => c !== key)
                                : [...current, key],
                            };
                          });
                        }}
                        className={`rounded-full border px-3 py-1 text-xs ${
                          selected
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Auth section (only shows when needed) */}
      {state === 'auth_required' && (
        <div className="mt-8">
          <InlineMagicLink onAuthDetected={handleAuthDetected} redirectPath="/start/confirm" />
        </div>
      )}

      {/* Save error */}
      {saveError && (
        <p className="mt-4 text-sm text-red-600">{saveError}</p>
      )}

      {/* Actions */}
      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={() => router.push(`/start/${path}`)}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={state === 'saving'}
          className="flex-1 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-gray-300"
        >
          {state === 'saving' ? 'Saving...' : 'Find my matches'}
        </button>
      </div>

      {/* Upload another document link */}
      {path === 'upload' && (
        <p className="mt-4 text-center">
          <button
            type="button"
            onClick={() => router.push('/start/upload')}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Upload another document for more data
          </button>
        </p>
      )}
    </div>
  );
}
