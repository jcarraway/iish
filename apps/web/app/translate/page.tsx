'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import TranslationSection from '@/components/TranslationSection';
import type { TreatmentTranslation } from '@oncovax/shared';

type LoadingStep = 'checking' | 'analyzing' | 'reviewing' | 'creating' | 'done';

const LOADING_STEPS: { key: LoadingStep; label: string }[] = [
  { key: 'analyzing', label: 'Analyzing your profile...' },
  { key: 'reviewing', label: 'Reviewing treatment guidelines...' },
  { key: 'creating', label: 'Creating your guide...' },
];

export default function TranslatePage() {
  const router = useRouter();
  const [translation, setTranslation] = useState<TreatmentTranslation | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState<LoadingStep>('checking');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Check cache first
    try {
      const cacheRes = await fetch('/api/translator');
      if (cacheRes.ok) {
        const cacheData = await cacheRes.json();
        if (cacheData.translation) {
          setTranslation(cacheData.translation);
          setLoadingStep('done');
          setLoading(false);
          return;
        }
      }
    } catch {
      // Fall through to generate
    }

    // Simulate step progression while waiting
    setLoadingStep('analyzing');
    const stepTimer1 = setTimeout(() => setLoadingStep('reviewing'), 8000);
    const stepTimer2 = setTimeout(() => setLoadingStep('creating'), 18000);

    try {
      const res = await fetch('/api/translator', { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate translation');
      }
      const data = await res.json();
      setTranslation(data.translation);
      setLoadingStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    generate();
  }, [generate]);

  const handleCopy = async () => {
    if (!translation) return;
    const text = formatTranslationAsText(translation);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-bold">Your Treatment Guide</h1>
        <p className="mt-2 text-sm text-gray-500">
          We&apos;re creating a personalized guide based on your profile. This takes about 20-30 seconds.
        </p>
        <div className="mt-10 space-y-4">
          {LOADING_STEPS.map((step) => {
            const isActive = step.key === loadingStep;
            const isPast = LOADING_STEPS.findIndex(s => s.key === loadingStep) > LOADING_STEPS.findIndex(s => s.key === step.key);
            return (
              <div key={step.key} className="flex items-center gap-3">
                {isPast ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                ) : isActive ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                ) : (
                  <div className="h-6 w-6 rounded-full border-2 border-gray-200" />
                )}
                <span className={`text-sm ${isActive ? 'font-medium text-gray-900' : isPast ? 'text-gray-500' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-bold">Treatment Guide</h1>
        <p className="mt-4 text-sm text-red-600">{error}</p>
        <div className="mt-6 flex gap-3">
          <button onClick={generate} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
            Try again
          </button>
          <button onClick={() => router.push('/dashboard')} className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!translation) return null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 print:py-4">
      <div className="mb-8 flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-bold">Your Treatment Guide</h1>
          <p className="mt-1 text-sm text-gray-500">Personalized for your diagnosis and treatment plan</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleCopy} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50">
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button onClick={handlePrint} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50">
            Print
          </button>
        </div>
      </div>

      {/* Diagnosis */}
      <TranslationSection title="What You Have" subtitle="Understanding your diagnosis">
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">{translation.diagnosis.summary}</p>
          <div className="rounded-lg bg-blue-50 p-4">
            <h3 className="text-sm font-semibold text-blue-900">Your stage: what it means</h3>
            <p className="mt-1 text-sm text-blue-800 leading-relaxed">{translation.diagnosis.stageExplainer}</p>
          </div>
          {translation.diagnosis.subtypeExplainer && (
            <div className="rounded-lg bg-purple-50 p-4">
              <h3 className="text-sm font-semibold text-purple-900">Your cancer subtype</h3>
              <p className="mt-1 text-sm text-purple-800 leading-relaxed">{translation.diagnosis.subtypeExplainer}</p>
            </div>
          )}
          <p className="text-gray-600 leading-relaxed italic">{translation.diagnosis.whatThisMeans}</p>
        </div>
      </TranslationSection>

      {/* Treatment Plan */}
      <TranslationSection title="Your Treatment Plan" subtitle="Why these treatments were chosen for you">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">{translation.treatmentPlan.overview}</p>

          {translation.treatmentPlan.drugs.map((drug, i) => (
            <div key={i} className="rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 py-3">
                <h3 className="font-semibold text-gray-900">{drug.name}</h3>
                {drug.genericName && <p className="text-xs text-gray-500">{drug.genericName}</p>}
              </div>
              <div className="space-y-3 p-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase text-gray-500">How it works</h4>
                  <p className="mt-1 text-sm text-gray-700">{drug.mechanism}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase text-gray-500">Why this drug</h4>
                  <p className="mt-1 text-sm text-gray-700">{drug.whyThisDrug}</p>
                </div>
                {drug.commonSideEffects.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-gray-500">Common side effects</h4>
                    <div className="mt-2 space-y-2">
                      {drug.commonSideEffects.map((se, j) => (
                        <div key={j} className="rounded bg-amber-50 p-2.5">
                          <p className="text-sm font-medium text-amber-900">{se.effect}</p>
                          <p className="text-xs text-amber-700">Timing: {se.timing}</p>
                          <p className="text-xs text-amber-700">Management: {se.management}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {drug.tips.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-gray-500">Tips</h4>
                    <ul className="mt-1 list-disc pl-4 text-sm text-gray-700 space-y-1">
                      {drug.tips.map((tip, j) => <li key={j}>{tip}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}

          <div className="rounded-lg bg-green-50 p-4">
            <h3 className="text-sm font-semibold text-green-900">Guideline alignment</h3>
            <p className="mt-1 text-sm text-green-800 leading-relaxed">{translation.treatmentPlan.guidelineAlignment}</p>
          </div>
        </div>
      </TranslationSection>

      {/* Timeline */}
      <TranslationSection title="What to Expect" subtitle="Your treatment timeline">
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">{translation.timeline.overview}</p>
          <div className="relative space-y-0">
            {translation.timeline.phases.map((phase, i) => (
              <div key={i} className="relative pl-8 pb-6">
                {i < translation.timeline.phases.length - 1 && (
                  <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-gray-200" />
                )}
                <div className="absolute left-0 top-1 h-6 w-6 rounded-full bg-blue-100 text-center text-xs font-bold leading-6 text-blue-700">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-gray-900">{phase.phase}</h3>
                <p className="text-xs text-gray-500">{phase.duration}</p>
                <p className="mt-1 text-sm text-gray-700">{phase.description}</p>
                <ul className="mt-2 list-disc pl-4 text-sm text-gray-600 space-y-1">
                  {phase.whatToExpect.map((item, j) => <li key={j}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </TranslationSection>

      {/* Questions */}
      <TranslationSection title="Questions for Your Doctor" subtitle="Personalized questions based on your profile">
        <div className="space-y-3">
          {translation.questionsForDoctor.map((q, i) => (
            <div key={i} className="rounded-lg border border-gray-200 p-4">
              <p className="font-medium text-gray-900">&ldquo;{q.question}&rdquo;</p>
              <p className="mt-1 text-sm text-gray-500">Why this matters: {q.whyItMatters}</p>
            </div>
          ))}
        </div>
      </TranslationSection>

      {/* Additional considerations */}
      <TranslationSection title="What Else to Know" subtitle="Additional information that may be relevant">
        <div className="space-y-4">
          {translation.additionalConsiderations.geneticTesting && (
            <div className="rounded-lg bg-indigo-50 p-4">
              <h3 className="text-sm font-semibold text-indigo-900">Genetic testing</h3>
              <p className="mt-1 text-sm text-indigo-800">{translation.additionalConsiderations.geneticTesting}</p>
            </div>
          )}
          {translation.additionalConsiderations.fertilityPreservation && (
            <div className="rounded-lg bg-pink-50 p-4">
              <h3 className="text-sm font-semibold text-pink-900">Fertility preservation</h3>
              <p className="mt-1 text-sm text-pink-800">{translation.additionalConsiderations.fertilityPreservation}</p>
            </div>
          )}
          {translation.additionalConsiderations.clinicalTrials && (
            <div className="rounded-lg bg-teal-50 p-4">
              <h3 className="text-sm font-semibold text-teal-900">Clinical trials</h3>
              <p className="mt-1 text-sm text-teal-800">{translation.additionalConsiderations.clinicalTrials}</p>
            </div>
          )}
          {translation.additionalConsiderations.mentalHealth && (
            <div className="rounded-lg bg-orange-50 p-4">
              <h3 className="text-sm font-semibold text-orange-900">Mental health support</h3>
              <p className="mt-1 text-sm text-orange-800">{translation.additionalConsiderations.mentalHealth}</p>
            </div>
          )}

          {translation.secondOpinionTriggers.length > 0 && (
            <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4">
              <h3 className="text-sm font-semibold text-amber-900">Worth discussing with your doctor</h3>
              <div className="mt-2 space-y-2">
                {translation.secondOpinionTriggers.map((trigger, i) => (
                  <div key={i} className="flex gap-2">
                    <span className={`mt-0.5 flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${
                      trigger.level === 'worth_discussing' ? 'bg-amber-200 text-amber-800' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {trigger.level === 'worth_discussing' ? 'Ask about' : 'FYI'}
                    </span>
                    <p className="text-sm text-amber-800">{trigger.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </TranslationSection>

      {/* CTA */}
      <div className="mt-10 flex flex-col gap-3 sm:flex-row print:hidden">
        <button
          onClick={() => router.push('/matches')}
          className="flex-1 rounded-lg bg-blue-600 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700"
        >
          View your trial matches
        </button>
        <button
          onClick={() => router.push('/financial')}
          className="flex-1 rounded-lg border border-gray-300 px-6 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Find financial assistance
        </button>
      </div>
    </div>
  );
}

function formatTranslationAsText(t: TreatmentTranslation): string {
  let text = '=== YOUR TREATMENT GUIDE ===\n\n';

  text += '--- WHAT YOU HAVE ---\n';
  text += t.diagnosis.summary + '\n\n';
  text += 'Stage: ' + t.diagnosis.stageExplainer + '\n\n';
  if (t.diagnosis.subtypeExplainer) text += 'Subtype: ' + t.diagnosis.subtypeExplainer + '\n\n';
  text += t.diagnosis.whatThisMeans + '\n\n';

  text += '--- YOUR TREATMENT PLAN ---\n';
  text += t.treatmentPlan.overview + '\n\n';
  for (const drug of t.treatmentPlan.drugs) {
    text += `${drug.name}${drug.genericName ? ` (${drug.genericName})` : ''}\n`;
    text += `  How it works: ${drug.mechanism}\n`;
    text += `  Why this drug: ${drug.whyThisDrug}\n`;
    for (const se of drug.commonSideEffects) {
      text += `  Side effect: ${se.effect} (${se.timing}) — ${se.management}\n`;
    }
    text += '\n';
  }

  text += '--- TIMELINE ---\n';
  text += t.timeline.overview + '\n\n';
  for (const phase of t.timeline.phases) {
    text += `${phase.phase} (${phase.duration}): ${phase.description}\n`;
  }
  text += '\n';

  text += '--- QUESTIONS FOR YOUR DOCTOR ---\n';
  for (const q of t.questionsForDoctor) {
    text += `Q: ${q.question}\n   Why: ${q.whyItMatters}\n\n`;
  }

  return text;
}
