'use client';

import { useState } from 'react';
import type { MonitoringReportType, AdverseEventSeverity, TumorResponse } from '@oncovax/shared';
import { ADVERSE_EVENT_OPTIONS } from '@/lib/monitoring';

interface MonitoringReportFormProps {
  orderId: string;
  reportType: MonitoringReportType;
  onSubmit: (data: ReportFormData) => void;
  submitting?: boolean;
}

export interface ReportFormData {
  reportType: MonitoringReportType;
  hasAdverseEvents: boolean;
  adverseEvents: { event: string; severity: AdverseEventSeverity; onset: string; duration: string | null; resolved: boolean; treatment: string | null }[];
  temperature: number | null;
  bloodPressure: string | null;
  heartRate: number | null;
  narrative: string;
  qualityOfLifeScore: number | null;
  tumorResponse: TumorResponse | null;
  imagingResults: string | null;
}

const SEVERITY_OPTIONS: { value: AdverseEventSeverity; label: string; color: string }[] = [
  { value: 'mild', label: 'Mild', color: 'text-yellow-700' },
  { value: 'moderate', label: 'Moderate', color: 'text-orange-700' },
  { value: 'severe', label: 'Severe', color: 'text-red-700' },
  { value: 'life_threatening', label: 'Life threatening', color: 'text-red-900' },
];

const REPORT_TYPE_LABELS: Record<MonitoringReportType, string> = {
  immediate: 'Immediate (30 min)',
  '24hr': '24 Hours',
  '48hr': '48 Hours',
  '7day': '1 Week',
  '14day': '2 Weeks',
  '28day': '4 Weeks',
  '3month': '3 Months',
  '6month': '6 Months',
};

const LATER_TYPES: MonitoringReportType[] = ['28day', '3month', '6month'];

export default function MonitoringReportForm({ orderId, reportType, onSubmit, submitting }: MonitoringReportFormProps) {
  const [selectedAEs, setSelectedAEs] = useState<Set<string>>(new Set());
  const [aeSeverities, setAeSeverities] = useState<Record<string, AdverseEventSeverity>>({});
  const [temperature, setTemperature] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [narrative, setNarrative] = useState('');
  const [qolScore, setQolScore] = useState(5);
  const [tumorResponse, setTumorResponse] = useState<TumorResponse | ''>('');
  const [imagingResults, setImagingResults] = useState('');

  const showTumorResponse = LATER_TYPES.includes(reportType);

  function toggleAE(event: string) {
    const next = new Set(selectedAEs);
    if (next.has(event)) {
      next.delete(event);
    } else {
      next.add(event);
      if (!aeSeverities[event]) {
        setAeSeverities((prev) => ({ ...prev, [event]: 'mild' }));
      }
    }
    setSelectedAEs(next);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const adverseEvents = Array.from(selectedAEs).map((event) => ({
      event,
      severity: aeSeverities[event] ?? 'mild',
      onset: 'post-administration',
      duration: null,
      resolved: false,
      treatment: null,
    }));

    onSubmit({
      reportType,
      hasAdverseEvents: adverseEvents.length > 0,
      adverseEvents,
      temperature: temperature ? parseFloat(temperature) : null,
      bloodPressure: bloodPressure || null,
      heartRate: heartRate ? parseInt(heartRate, 10) : null,
      narrative,
      qualityOfLifeScore: qolScore,
      tumorResponse: tumorResponse || null,
      imagingResults: imagingResults || null,
    });
  }

  const aeByCategory = {
    injection_site: ADVERSE_EVENT_OPTIONS.filter((ae) => ae.category === 'injection_site'),
    systemic: ADVERSE_EVENT_OPTIONS.filter((ae) => ae.category === 'systemic'),
    serious: ADVERSE_EVENT_OPTIONS.filter((ae) => ae.category === 'serious'),
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="font-semibold text-blue-900">{REPORT_TYPE_LABELS[reportType]} Check-In</h3>
        <p className="mt-1 text-sm text-blue-800">
          Please report any symptoms or changes since your vaccine administration.
        </p>
      </div>

      {/* Adverse Events */}
      <div>
        <h4 className="font-medium text-gray-900">Symptoms &amp; Side Effects</h4>
        <p className="mt-1 text-xs text-gray-500">Check all that apply</p>

        {(['injection_site', 'systemic', 'serious'] as const).map((category) => (
          <div key={category} className="mt-3">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
              {category === 'injection_site' ? 'Injection Site' : category === 'systemic' ? 'Systemic' : 'Serious (seek medical attention)'}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {aeByCategory[category].map((ae) => (
                <button
                  key={ae.event}
                  type="button"
                  onClick={() => toggleAE(ae.event)}
                  className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                    selectedAEs.has(ae.event)
                      ? category === 'serious'
                        ? 'bg-red-100 text-red-800 border-red-300'
                        : 'bg-blue-100 text-blue-800 border-blue-300'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {ae.event}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Severity selectors for selected AEs */}
        {selectedAEs.size > 0 && (
          <div className="mt-4 space-y-2 rounded-lg border border-gray-200 p-3">
            <p className="text-xs font-medium text-gray-700">Severity for selected symptoms:</p>
            {Array.from(selectedAEs).map((event) => (
              <div key={event} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{event}</span>
                <select
                  value={aeSeverities[event] ?? 'mild'}
                  onChange={(e) =>
                    setAeSeverities((prev) => ({ ...prev, [event]: e.target.value as AdverseEventSeverity }))
                  }
                  className="rounded border border-gray-200 px-2 py-1 text-xs"
                >
                  {SEVERITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Vitals */}
      <div>
        <h4 className="font-medium text-gray-900">Vitals (optional)</h4>
        <div className="mt-2 grid gap-3 sm:grid-cols-3">
          <div>
            <label className="block text-xs text-gray-500">Temperature (\u00B0F)</label>
            <input
              type="number"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              placeholder="98.6"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500">Blood Pressure</label>
            <input
              type="text"
              value={bloodPressure}
              onChange={(e) => setBloodPressure(e.target.value)}
              placeholder="120/80"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500">Heart Rate (bpm)</label>
            <input
              type="number"
              value={heartRate}
              onChange={(e) => setHeartRate(e.target.value)}
              placeholder="72"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* How are you feeling */}
      <div>
        <h4 className="font-medium text-gray-900">How are you feeling overall?</h4>
        <div className="mt-2">
          <input
            type="range"
            min={1}
            max={10}
            value={qolScore}
            onChange={(e) => setQolScore(parseInt(e.target.value, 10))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>1 — Very poor</span>
            <span className="font-medium text-gray-700">{qolScore}/10</span>
            <span>10 — Excellent</span>
          </div>
        </div>
      </div>

      {/* Tumor response (later timepoints only) */}
      {showTumorResponse && (
        <div>
          <h4 className="font-medium text-gray-900">Tumor Response (if imaging performed)</h4>
          <select
            value={tumorResponse}
            onChange={(e) => setTumorResponse(e.target.value as TumorResponse)}
            className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          >
            <option value="">Not evaluated / No imaging</option>
            <option value="complete_response">Complete Response</option>
            <option value="partial_response">Partial Response</option>
            <option value="stable_disease">Stable Disease</option>
            <option value="progressive_disease">Progressive Disease</option>
          </select>
          <textarea
            value={imagingResults}
            onChange={(e) => setImagingResults(e.target.value)}
            placeholder="Describe imaging findings (optional)"
            rows={2}
            className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </div>
      )}

      {/* Narrative */}
      <div>
        <h4 className="font-medium text-gray-900">Anything else to share?</h4>
        <textarea
          value={narrative}
          onChange={(e) => setNarrative(e.target.value)}
          placeholder="How are you feeling? Any concerns? (60 seconds is all we need)"
          rows={3}
          className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : 'Submit Report'}
      </button>
    </form>
  );
}
