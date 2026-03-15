'use client';

import { useState } from 'react';
import type { PatientProfile } from '@oncovax/shared';

interface Props {
  onComplete: (profile: PatientProfile) => void;
}

const CANCER_TYPES = [
  'Breast', 'Lung (non-small cell)', 'Lung (small cell)', 'Melanoma',
  'Colorectal', 'Pancreatic', 'Ovarian', 'Prostate', 'Bladder',
  'Head and neck', 'Kidney (renal cell)', 'Liver (hepatocellular)',
  'Gastric/Esophageal', 'Endometrial', 'Cervical', 'Other',
];

const STAGES = ['I', 'IA', 'IB', 'II', 'IIA', 'IIB', 'III', 'IIIA', 'IIIB', 'IIIC', 'IV', 'IVA', 'IVB', 'Unknown'];

const TREATMENT_TYPES = [
  'chemotherapy', 'immunotherapy', 'radiation', 'surgery',
  'targeted_therapy', 'hormone_therapy', 'other',
];

const STEPS = ['Cancer basics', 'Biomarkers', 'Treatment history', 'Demographics'];

export default function ManualIntakeWizard({ onComplete }: Props) {
  const [step, setStep] = useState(0);

  // Step 1: Cancer basics
  const [cancerType, setCancerType] = useState('');
  const [cancerTypeOther, setCancerTypeOther] = useState('');
  const [stage, setStage] = useState('');

  // Step 2: Biomarkers
  const [erStatus, setErStatus] = useState('');
  const [prStatus, setPrStatus] = useState('');
  const [her2Status, setHer2Status] = useState('');
  const [biomarkerEntries, setBiomarkerEntries] = useState<{ key: string; value: string }[]>([]);

  // Step 3: Treatments
  const [treatments, setTreatments] = useState<{ name: string; type: string; startDate: string; endDate: string }[]>([]);
  const [ecogStatus, setEcogStatus] = useState<string>('');

  // Step 4: Demographics
  const [age, setAge] = useState('');
  const [zipCode, setZipCode] = useState('');

  const isBreastCancer = cancerType.toLowerCase().includes('breast');

  const addTreatment = () => {
    setTreatments([...treatments, { name: '', type: 'chemotherapy', startDate: '', endDate: '' }]);
  };

  const updateTreatment = (i: number, field: string, value: string) => {
    setTreatments(treatments.map((t, idx) => idx === i ? { ...t, [field]: value } : t));
  };

  const removeTreatment = (i: number) => {
    setTreatments(treatments.filter((_, idx) => idx !== i));
  };

  const addBiomarker = () => {
    setBiomarkerEntries([...biomarkerEntries, { key: '', value: '' }]);
  };

  const updateBiomarker = (i: number, field: 'key' | 'value', value: string) => {
    setBiomarkerEntries(biomarkerEntries.map((b, idx) => idx === i ? { ...b, [field]: value } : b));
  };

  const handleComplete = () => {
    const resolvedCancerType = cancerType === 'Other' ? cancerTypeOther : cancerType;
    const profile: PatientProfile = {
      cancerType: resolvedCancerType,
      cancerTypeNormalized: resolvedCancerType.toLowerCase().replace(/\s+\(.*\)/, ''),
      stage: stage || undefined,
      receptorStatus: isBreastCancer ? {
        ...(erStatus ? { er: { status: erStatus } } : {}),
        ...(prStatus ? { pr: { status: prStatus } } : {}),
        ...(her2Status ? { her2: { status: her2Status } } : {}),
      } : undefined,
      biomarkers: biomarkerEntries.length > 0
        ? Object.fromEntries(biomarkerEntries.filter((b) => b.key && b.value).map((b) => [b.key, b.value]))
        : undefined,
      priorTreatments: treatments.length > 0
        ? treatments.filter((t) => t.name).map((t) => ({
            name: t.name,
            type: t.type,
            ...(t.startDate ? { startDate: t.startDate } : {}),
            ...(t.endDate ? { endDate: t.endDate } : {}),
          }))
        : undefined,
      ecogStatus: ecogStatus ? parseInt(ecogStatus, 10) : undefined,
      age: age ? parseInt(age, 10) : undefined,
      zipCode: zipCode || undefined,
    };
    onComplete(profile);
  };

  const canAdvance = () => {
    if (step === 0) return cancerType !== '' && (cancerType !== 'Other' || cancerTypeOther !== '');
    return true; // Steps 1-3 are all optional
  };

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex gap-1">
        {STEPS.map((label, i) => (
          <div key={label} className="flex-1">
            <div className={`h-1.5 rounded-full ${i <= step ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <p className={`mt-1 text-xs ${i === step ? 'font-medium text-blue-600' : 'text-gray-400'}`}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Step 0: Cancer basics */}
      {step === 0 && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Cancer type</label>
            <select
              value={cancerType}
              onChange={(e) => setCancerType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select cancer type...</option>
              {CANCER_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {cancerType === 'Other' && (
              <input
                type="text"
                value={cancerTypeOther}
                onChange={(e) => setCancerTypeOther(e.target.value)}
                placeholder="Enter cancer type..."
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Stage</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select stage...</option>
              {STAGES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Step 1: Biomarkers */}
      {step === 1 && (
        <div className="space-y-4">
          {isBreastCancer && (
            <>
              <p className="text-sm text-gray-600">Receptor status for breast cancer:</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">ER</label>
                  <select value={erStatus} onChange={(e) => setErStatus(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm">
                    <option value="">Unknown</option>
                    <option value="positive">Positive</option>
                    <option value="negative">Negative</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">PR</label>
                  <select value={prStatus} onChange={(e) => setPrStatus(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm">
                    <option value="">Unknown</option>
                    <option value="positive">Positive</option>
                    <option value="negative">Negative</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">HER2</label>
                  <select value={her2Status} onChange={(e) => setHer2Status(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm">
                    <option value="">Unknown</option>
                    <option value="positive">Positive</option>
                    <option value="negative">Negative</option>
                    <option value="equivocal">Equivocal</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <p className="mb-2 text-sm text-gray-600">
              Other biomarkers {isBreastCancer ? '' : '(e.g., PD-L1, KRAS, EGFR, MSI)'}:
            </p>
            {biomarkerEntries.map((b, i) => (
              <div key={i} className="mb-2 flex gap-2">
                <input
                  type="text"
                  placeholder="Biomarker name"
                  value={b.key}
                  onChange={(e) => updateBiomarker(i, 'key', e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
                />
                <input
                  type="text"
                  placeholder="Value/Status"
                  value={b.value}
                  onChange={(e) => updateBiomarker(i, 'value', e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
                />
                <button type="button" onClick={() => setBiomarkerEntries(biomarkerEntries.filter((_, idx) => idx !== i))}
                  className="text-sm text-red-500 hover:text-red-700">Remove</button>
              </div>
            ))}
            <button type="button" onClick={addBiomarker}
              className="text-sm text-blue-600 hover:text-blue-800">
              + Add biomarker
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Treatment history */}
      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">List any prior treatments:</p>
          {treatments.map((t, i) => (
            <div key={i} className="rounded-lg border border-gray-200 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Treatment {i + 1}</span>
                <button type="button" onClick={() => removeTreatment(i)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
              </div>
              <input
                type="text"
                placeholder="Treatment name (e.g., Pembrolizumab)"
                value={t.name}
                onChange={(e) => updateTreatment(i, 'name', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
              />
              <select
                value={t.type}
                onChange={(e) => updateTreatment(i, 'type', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
              >
                {TREATMENT_TYPES.map((tt) => (
                  <option key={tt} value={tt}>{tt.replace('_', ' ')}</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input type="date" placeholder="Start date" value={t.startDate}
                  onChange={(e) => updateTreatment(i, 'startDate', e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm" />
                <input type="date" placeholder="End date" value={t.endDate}
                  onChange={(e) => updateTreatment(i, 'endDate', e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm" />
              </div>
            </div>
          ))}
          <button type="button" onClick={addTreatment}
            className="text-sm text-blue-600 hover:text-blue-800">
            + Add treatment
          </button>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">ECOG Performance Status</label>
            <select value={ecogStatus} onChange={(e) => setEcogStatus(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="">Unknown</option>
              <option value="0">0 — Fully active</option>
              <option value="1">1 — Restricted but ambulatory</option>
              <option value="2">2 — Ambulatory, capable of self-care</option>
              <option value="3">3 — Limited self-care, confined 50%+ of waking hours</option>
              <option value="4">4 — Completely disabled</option>
              <option value="5">5 — Dead</option>
            </select>
          </div>
        </div>
      )}

      {/* Step 3: Demographics */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Age</label>
            <input
              type="number"
              min="0"
              max="150"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Your age"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Zip code</label>
            <input
              type="text"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="e.g., 94110"
              maxLength={10}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-gray-400">Used to find nearby trial sites</p>
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            disabled={!canAdvance()}
            onClick={() => setStep(step + 1)}
            className="flex-1 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleComplete}
            className="flex-1 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Continue to review
          </button>
        )}
      </div>
    </div>
  );
}
