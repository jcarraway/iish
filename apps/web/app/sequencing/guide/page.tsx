'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type {
  SequencingRecommendation,
  SequencingExplanation,
  TestRecommendation,
  ConversationGuide,
} from '@oncovax/shared';

type Step = 1 | 2 | 3 | 4 | 5;

const STEPS = [
  { num: 1 as Step, title: 'Should I Get Sequenced?' },
  { num: 2 as Step, title: 'What Is Genomic Sequencing?' },
  { num: 3 as Step, title: 'Which Test Is Right?' },
  { num: 4 as Step, title: 'Talking to Your Oncologist' },
  { num: 5 as Step, title: 'What Happens Next' },
];

const LEVEL_COLORS: Record<SequencingRecommendation['level'], { bg: string; text: string; label: string }> = {
  strongly_recommended: { bg: 'bg-green-100', text: 'text-green-800', label: 'Strongly Recommended' },
  recommended: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Recommended' },
  optional: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Optional' },
  not_typically_indicated: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Not Typically Indicated' },
};

type LoadingSub = string;

export default function SequencingGuidePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [completedSteps, setCompletedSteps] = useState<Set<Step>>(new Set());

  // Per-step data
  const [recommendation, setRecommendation] = useState<SequencingRecommendation | null>(null);
  const [explanation, setExplanation] = useState<SequencingExplanation | null>(null);
  const [testRec, setTestRec] = useState<TestRecommendation | null>(null);
  const [conversationGuide, setConversationGuide] = useState<ConversationGuide | null>(null);

  // Loading state
  const [loading, setLoading] = useState(false);
  const [loadingSub, setLoadingSub] = useState<LoadingSub>('');
  const [error, setError] = useState<string | null>(null);

  // Step 3 toggles
  const [tissueAvailable, setTissueAvailable] = useState(true);
  const [preferComprehensive, setPreferComprehensive] = useState(false);

  // Step 4 copy state
  const [copied, setCopied] = useState(false);

  // Step 2 accordion state
  const [expandedConcern, setExpandedConcern] = useState<number | null>(null);

  // Step 5 order creation
  const [creating, setCreating] = useState(false);

  const loadStep = useCallback(async (step: Step) => {
    setError(null);
    setLoading(true);

    try {
      switch (step) {
        case 1: {
          if (recommendation) { setLoading(false); return; }
          setLoadingSub('Analyzing your profile...');
          const timer = setTimeout(() => setLoadingSub('Checking guidelines...'), 4000);
          const res = await fetch('/api/sequencing/guide/recommendation', { method: 'POST' });
          clearTimeout(timer);
          if (!res.ok) throw new Error((await res.json()).error || 'Failed to generate recommendation');
          const data = await res.json();
          setRecommendation(data.recommendation);
          break;
        }
        case 2: {
          if (explanation) { setLoading(false); return; }
          setLoadingSub('Personalizing explanation...');
          const res = await fetch('/api/sequencing/guide/explanation', { method: 'POST' });
          if (!res.ok) throw new Error((await res.json()).error || 'Failed to generate explanation');
          const data = await res.json();
          setExplanation(data.explanation);
          break;
        }
        case 3: {
          setLoadingSub('Analyzing providers...');
          const timer = setTimeout(() => setLoadingSub('Comparing tests...'), 3000);
          const res = await fetch('/api/sequencing/guide/test-recommendation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tissueAvailable, preferComprehensive }),
          });
          clearTimeout(timer);
          if (!res.ok) throw new Error((await res.json()).error || 'Failed to generate test recommendation');
          const data = await res.json();
          setTestRec(data.recommendation);
          break;
        }
        case 4: {
          if (conversationGuide) { setLoading(false); return; }
          setLoadingSub('Generating talking points...');
          const timer = setTimeout(() => setLoadingSub('Creating email template...'), 5000);
          const res = await fetch('/api/sequencing/guide/conversation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ testRecommendation: testRec }),
          });
          clearTimeout(timer);
          if (!res.ok) throw new Error((await res.json()).error || 'Failed to generate conversation guide');
          const data = await res.json();
          setConversationGuide(data.guide);
          break;
        }
        case 5:
          // No API call — uses data from step 3
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
      setLoadingSub('');
    }
  }, [recommendation, explanation, testRec, conversationGuide, tissueAvailable, preferComprehensive]);

  const goToStep = useCallback((step: Step) => {
    setCurrentStep(step);
    loadStep(step);
  }, [loadStep]);

  const handleContinue = useCallback(() => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    if (currentStep < 5) {
      goToStep((currentStep + 1) as Step);
    }
  }, [currentStep, goToStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      goToStep((currentStep - 1) as Step);
    }
  }, [currentStep, goToStep]);

  // Load step 1 on mount
  const [initialized, setInitialized] = useState(false);
  if (!initialized) {
    setInitialized(true);
    loadStep(1);
  }

  const handleRefetchStep3 = useCallback(() => {
    setTestRec(null);
    setConversationGuide(null); // Invalidate conversation guide since test changed
    loadStep(3);
  }, [loadStep]);

  const handleCopyEmail = useCallback(async () => {
    if (!conversationGuide) return;
    await navigator.clipboard.writeText(conversationGuide.emailTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [conversationGuide]);

  const handleStartTracking = useCallback(async () => {
    if (!testRec) return;
    setCreating(true);
    try {
      const res = await fetch('/api/sequencing/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: testRec.primary.providerId,
          testType: testRec.primary.testType,
        }),
      });
      if (!res.ok) throw new Error('Failed to create order');
      const data = await res.json();
      router.push(`/sequencing/orders/${data.order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
      setCreating(false);
    }
  }, [testRec, router]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold">Your Sequencing Guide</h1>
      <p className="mt-1 text-sm text-gray-500">Personalized guidance in ~10 minutes</p>

      {/* Step indicator */}
      <div className="mt-8 flex items-center gap-1">
        {STEPS.map((step, i) => {
          const isCompleted = completedSteps.has(step.num);
          const isCurrent = step.num === currentStep;
          const isClickable = isCompleted || step.num <= currentStep;

          return (
            <div key={step.num} className="flex items-center">
              <button
                onClick={() => isClickable ? goToStep(step.num) : undefined}
                disabled={!isClickable}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  isCompleted
                    ? 'bg-green-500 text-white cursor-pointer'
                    : isCurrent
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                } ${isClickable && !isCurrent ? 'hover:ring-2 hover:ring-blue-300' : ''}`}
              >
                {isCompleted ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : step.num}
              </button>
              {i < STEPS.length - 1 && (
                <div className={`mx-1 h-0.5 w-6 sm:w-10 ${isCompleted ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-sm font-medium text-gray-700">{STEPS[currentStep - 1].title}</p>

      {/* Loading state */}
      {loading && (
        <div className="mt-8 flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm text-gray-600">{loadingSub || 'Loading...'}</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="mt-8">
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={() => loadStep(currentStep)} className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
            Try again
          </button>
        </div>
      )}

      {/* Step content */}
      {!loading && !error && (
        <div className="mt-8">
          {/* STEP 1: Recommendation */}
          {currentStep === 1 && recommendation && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-sm font-semibold ${LEVEL_COLORS[recommendation.level].bg} ${LEVEL_COLORS[recommendation.level].text}`}>
                  {LEVEL_COLORS[recommendation.level].label}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">{recommendation.headline}</h2>
              <p className="text-gray-700 leading-relaxed">{recommendation.personalizedReasoning}</p>

              <div className="rounded-lg bg-blue-50 p-4">
                <h3 className="text-sm font-semibold text-blue-900">What sequencing could reveal</h3>
                <ul className="mt-2 space-y-1.5">
                  {recommendation.whatItCouldReveal.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm text-blue-800">
                      <span className="mt-1 flex-shrink-0 text-blue-500">&#8226;</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-green-50 p-4">
                  <h3 className="text-sm font-semibold text-green-900">How it helps right now</h3>
                  <p className="mt-1 text-sm text-green-800">{recommendation.howItHelpsRightNow}</p>
                </div>
                <div className="rounded-lg bg-purple-50 p-4">
                  <h3 className="text-sm font-semibold text-purple-900">How it helps later</h3>
                  <p className="mt-1 text-sm text-purple-800">{recommendation.howItHelpsLater}</p>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-700">Guideline reference</h3>
                <p className="mt-1 text-sm text-gray-600">{recommendation.guidelineRecommendation}</p>
              </div>
            </div>
          )}

          {/* STEP 2: Explanation */}
          {currentStep === 2 && explanation && (
            <div className="space-y-6">
              <div className="rounded-lg bg-indigo-50 p-5">
                <h3 className="font-semibold text-indigo-900">What is genomic sequencing?</h3>
                <p className="mt-2 text-sm text-indigo-800 leading-relaxed">{explanation.whatIsIt}</p>
              </div>

              <div className="rounded-lg bg-blue-50 p-5">
                <h3 className="font-semibold text-blue-900">How does it work?</h3>
                <p className="mt-2 text-sm text-blue-800 leading-relaxed">{explanation.howItWorks}</p>
              </div>

              <div className="rounded-lg bg-green-50 p-5">
                <h3 className="font-semibold text-green-900">What does it find?</h3>
                <p className="mt-2 text-sm text-green-800 leading-relaxed">{explanation.whatItFinds}</p>
              </div>

              <div className="rounded-lg bg-purple-50 p-5">
                <h3 className="font-semibold text-purple-900">Why this matters for you</h3>
                <p className="mt-2 text-sm text-purple-800 leading-relaxed">{explanation.personalRelevance}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">Common concerns</h3>
                <div className="mt-3 space-y-2">
                  {explanation.commonConcerns.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => setExpandedConcern(expandedConcern === i ? null : i)}
                      className="w-full text-left rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900">{item.concern}</p>
                        <svg
                          className={`h-4 w-4 text-gray-500 transition-transform ${expandedConcern === i ? 'rotate-180' : ''}`}
                          fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </div>
                      {expandedConcern === i && (
                        <p className="mt-2 text-sm text-gray-600 leading-relaxed">{item.answer}</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Test Recommendation */}
          {currentStep === 3 && testRec && (
            <div className="space-y-6">
              {/* Toggles */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    setTissueAvailable(!tissueAvailable);
                    setTimeout(handleRefetchStep3, 0);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    !tissueAvailable ? 'bg-amber-100 text-amber-800' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tissueAvailable ? 'I don\'t have tissue available' : 'Tissue is unavailable (liquid biopsy)'}
                </button>
                <button
                  onClick={() => {
                    setPreferComprehensive(!preferComprehensive);
                    setTimeout(handleRefetchStep3, 0);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    preferComprehensive ? 'bg-indigo-100 text-indigo-800' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {preferComprehensive ? 'Most comprehensive panel' : 'I want the most comprehensive panel'}
                </button>
              </div>

              {/* Primary recommendation */}
              <div className="rounded-xl border-2 border-blue-300 bg-blue-50 p-5">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">Recommended</span>
                  {testRec.primary.fdaApproved && (
                    <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">FDA Approved</span>
                  )}
                </div>
                <h3 className="mt-2 text-lg font-bold text-gray-900">{testRec.primary.providerName}</h3>
                <p className="text-sm text-gray-600">{testRec.primary.testName}</p>
                <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-xl font-bold text-blue-700">{testRec.primary.geneCount}</p>
                    <p className="text-xs text-gray-500">Genes</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-blue-700">{testRec.primary.turnaroundDays}</p>
                    <p className="text-xs text-gray-500">Days</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-blue-700">{testRec.primary.sampleType}</p>
                    <p className="text-xs text-gray-500">Sample</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-gray-700 leading-relaxed">{testRec.primary.whyThisTest}</p>
              </div>

              {/* Reasoning */}
              <p className="text-sm text-gray-600 leading-relaxed">{testRec.reasoning}</p>

              {/* Alternatives */}
              {testRec.alternatives.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">Alternatives</h3>
                  <div className="mt-2 space-y-2">
                    {testRec.alternatives.map((alt, i) => (
                      <div key={i} className="rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">{alt.providerName}</h4>
                          <span className="text-sm text-gray-500">{alt.geneCount} genes</span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">{alt.testName}</p>
                        <p className="mt-1 text-sm text-amber-700">{alt.tradeoff}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Conversation Guide */}
          {currentStep === 4 && conversationGuide && (
            <div className="space-y-6">
              {/* Talking points */}
              <div>
                <h3 className="font-semibold text-gray-900">Talking points for your appointment</h3>
                <div className="mt-3 space-y-3">
                  {conversationGuide.talkingPoints.map((tp, i) => (
                    <div key={i} className="rounded-lg bg-blue-50 p-4">
                      <p className="font-medium text-blue-900">{tp.point}</p>
                      <p className="mt-1 text-sm text-blue-700">{tp.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Questions to ask */}
              <div>
                <h3 className="font-semibold text-gray-900">Questions to ask your oncologist</h3>
                <div className="mt-3 space-y-2">
                  {conversationGuide.questionsToAsk.map((q, i) => (
                    <div key={i} className="rounded-lg border border-gray-200 p-4">
                      <p className="font-medium text-gray-900">&ldquo;{q.question}&rdquo;</p>
                      <p className="mt-1 text-sm text-gray-500">Why: {q.whyItMatters}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Email template */}
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Email / MyChart message template</h3>
                  <button
                    onClick={handleCopyEmail}
                    className="rounded-lg border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="mt-3 rounded-lg border-2 border-gray-300 bg-gray-50 p-4">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                    {conversationGuide.emailTemplate}
                  </pre>
                </div>
              </div>

              {/* Ordering instructions */}
              <div className="rounded-lg bg-green-50 p-5">
                <h3 className="font-semibold text-green-900">How to get the test ordered</h3>
                <p className="mt-2 text-sm text-green-800 leading-relaxed whitespace-pre-line">
                  {conversationGuide.orderingInstructions}
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: What Happens Next */}
          {currentStep === 5 && testRec && (
            <div className="space-y-6">
              <div className="rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 p-6">
                <h3 className="text-lg font-semibold text-indigo-900">Your recommended test</h3>
                <p className="mt-1 text-indigo-700">
                  {testRec.primary.providerName} &mdash; {testRec.primary.testName}
                </p>
                <div className="mt-3 flex gap-4 text-sm text-indigo-600">
                  <span>{testRec.primary.geneCount} genes</span>
                  <span>~{testRec.primary.turnaroundDays} days</span>
                  <span>{testRec.primary.sampleType}</span>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900">Next steps</h3>
                <ol className="mt-3 space-y-3">
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">1</span>
                    <p className="text-sm text-gray-700">Send the email template to your oncologist or bring the talking points to your next appointment</p>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">2</span>
                    <p className="text-sm text-gray-700">Your oncologist orders the test and your sample is collected</p>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">3</span>
                    <p className="text-sm text-gray-700">Results typically arrive in {testRec.primary.turnaroundDays} days</p>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">4</span>
                    <p className="text-sm text-gray-700">Upload your results to OncoVax for personalized analysis and trial matching</p>
                  </li>
                </ol>
              </div>

              <button
                onClick={handleStartTracking}
                disabled={creating}
                className="w-full rounded-lg bg-blue-600 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {creating ? 'Creating order...' : 'Start Tracking My Order'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      {!loading && !error && (
        <div className="mt-10 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-30"
          >
            Back
          </button>
          {currentStep < 5 && (
            <button
              onClick={handleContinue}
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Continue
            </button>
          )}
        </div>
      )}
    </div>
  );
}
