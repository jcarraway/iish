'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FormData {
  cancerType: string;
  cancerStage: string;
  priorTreatmentsFailed: number;
  hasPhysician: boolean;
  physicianName: string;
  physicianEmail: string;
  physicianInstitution: string;
  isLifeThreatening: boolean;
  hasExhaustedOptions: boolean;
  stateOfResidence: string;
  pipelineJobId: string;
}

export default function AssessmentPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<FormData>({
    cancerType: '',
    cancerStage: '',
    priorTreatmentsFailed: 0,
    hasPhysician: false,
    physicianName: '',
    physicianEmail: '',
    physicianInstitution: '',
    isLifeThreatening: false,
    hasExhaustedOptions: false,
    stateOfResidence: '',
    pipelineJobId: '',
  });

  // Pre-fill from patient profile
  useEffect(() => {
    async function prefill() {
      try {
        const res = await fetch('/api/patients');
        if (!res.ok) return;
        const data = await res.json();
        const profile = data.patient?.profile;
        if (profile) {
          setForm(prev => ({
            ...prev,
            cancerType: profile.cancerType ?? prev.cancerType,
            cancerStage: profile.stage ?? prev.cancerStage,
            priorTreatmentsFailed: profile.priorTreatments?.length ?? prev.priorTreatmentsFailed,
            stateOfResidence: profile.zipCode ? '' : prev.stateOfResidence, // Cannot infer state from zip alone
          }));
        }
        // Check for pipeline jobs
        const jobRes = await fetch('/api/pipeline/jobs');
        if (jobRes.ok) {
          const jobData = await jobRes.json();
          const completed = jobData.jobs?.find((j: { status: string }) => j.status === 'completed');
          if (completed) {
            setForm(prev => ({ ...prev, pipelineJobId: completed.id }));
          }
        }
      } catch {
        // Ignore prefill failures
      }
    }
    prefill();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/regulatory/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.status === 401) {
        router.push('/auth');
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Assessment failed');
      }

      const data = await res.json();
      // Store in session storage for the recommendation page
      sessionStorage.setItem('pathwayAssessment', JSON.stringify(data.assessment));
      router.push('/manufacture/regulatory/recommendation');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  function updateForm(key: keyof FormData, value: string | number | boolean) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/manufacture/regulatory" className="text-sm text-gray-500 hover:text-gray-700">
        &larr; Regulatory pathways
      </Link>

      <h1 className="mt-4 text-3xl font-bold text-gray-900">Pathway Assessment</h1>
      <p className="mt-2 text-sm text-gray-600">
        Answer these questions so we can recommend the best regulatory pathway for your situation.
        Fields marked with * are required.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {/* Cancer Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Cancer type *</label>
          <input
            type="text"
            required
            value={form.cancerType}
            onChange={e => updateForm('cancerType', e.target.value)}
            placeholder="e.g., Breast cancer, NSCLC, Melanoma"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        {/* Cancer Stage */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Cancer stage *</label>
          <select
            required
            value={form.cancerStage}
            onChange={e => updateForm('cancerStage', e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Select stage</option>
            <option value="I">Stage I</option>
            <option value="II">Stage II</option>
            <option value="III">Stage III</option>
            <option value="IV">Stage IV</option>
            <option value="recurrent">Recurrent</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>

        {/* Prior Treatments Failed */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Number of prior treatment lines tried *
          </label>
          <input
            type="number"
            required
            min={0}
            max={20}
            value={form.priorTreatmentsFailed}
            onChange={e => updateForm('priorTreatmentsFailed', parseInt(e.target.value) || 0)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        {/* Life Threatening */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="lifeThreatening"
            checked={form.isLifeThreatening}
            onChange={e => updateForm('isLifeThreatening', e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor="lifeThreatening" className="text-sm text-gray-700">
            <strong>My condition is life-threatening or seriously debilitating</strong>
            <br />
            <span className="text-xs text-gray-500">Required for expanded access and right-to-try pathways</span>
          </label>
        </div>

        {/* Exhausted Options */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="exhaustedOptions"
            checked={form.hasExhaustedOptions}
            onChange={e => updateForm('hasExhaustedOptions', e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor="exhaustedOptions" className="text-sm text-gray-700">
            <strong>I have exhausted standard treatment options</strong>
            <br />
            <span className="text-xs text-gray-500">No other comparable or satisfactory approved therapy is available</span>
          </label>
        </div>

        {/* Has Physician */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="hasPhysician"
            checked={form.hasPhysician}
            onChange={e => updateForm('hasPhysician', e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor="hasPhysician" className="text-sm text-gray-700">
            <strong>I have a physician willing to oversee this treatment</strong>
          </label>
        </div>

        {/* Physician Details (conditional) */}
        {form.hasPhysician && (
          <div className="ml-7 space-y-3 rounded-lg border border-gray-200 p-4">
            <div>
              <label className="block text-xs font-medium text-gray-500">Physician name</label>
              <input
                type="text"
                value={form.physicianName}
                onChange={e => updateForm('physicianName', e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">Physician email</label>
              <input
                type="email"
                value={form.physicianEmail}
                onChange={e => updateForm('physicianEmail', e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">Institution</label>
              <input
                type="text"
                value={form.physicianInstitution}
                onChange={e => updateForm('physicianInstitution', e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}

        {/* State of Residence */}
        <div>
          <label className="block text-sm font-medium text-gray-700">State of residence *</label>
          <input
            type="text"
            required
            value={form.stateOfResidence}
            onChange={e => updateForm('stateOfResidence', e.target.value)}
            placeholder="e.g., CA, NY, TX"
            maxLength={2}
            className="mt-1 w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase"
          />
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Analyzing your situation...' : 'Get pathway recommendation'}
        </button>
      </form>
    </div>
  );
}
