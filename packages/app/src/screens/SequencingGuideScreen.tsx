import { useState, useCallback } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { useRouter } from 'solito/router';
import { copyToClipboard } from '../utils';
import {
  useGetSequencingRecommendationLazyQuery,
  useGetSequencingExplanationLazyQuery,
  useGetTestRecommendationLazyQuery,
  useGetConversationGuideLazyQuery,
  useCreateSequencingOrderMutation,
} from '../generated/graphql';
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

const LEVEL_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  strongly_recommended: { bg: '#DCFCE7', text: '#166534', label: 'Strongly Recommended' },
  recommended: { bg: '#DBEAFE', text: '#1E40AF', label: 'Recommended' },
  optional: { bg: '#FEF3C7', text: '#92400E', label: 'Optional' },
  not_typically_indicated: { bg: '#F3F4F6', text: '#374151', label: 'Not Typically Indicated' },
};

export function SequencingGuideScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [completedSteps, setCompletedSteps] = useState<Set<Step>>(new Set());

  const [recommendation, setRecommendation] = useState<SequencingRecommendation | null>(null);
  const [explanation, setExplanation] = useState<SequencingExplanation | null>(null);
  const [testRec, setTestRec] = useState<TestRecommendation | null>(null);
  const [conversationGuide, setConversationGuide] = useState<ConversationGuide | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingSub, setLoadingSub] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [tissueAvailable, setTissueAvailable] = useState(true);
  const [preferComprehensive, setPreferComprehensive] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedConcern, setExpandedConcern] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);

  const [fetchRecommendation] = useGetSequencingRecommendationLazyQuery();
  const [fetchExplanation] = useGetSequencingExplanationLazyQuery();
  const [fetchTestRec] = useGetTestRecommendationLazyQuery();
  const [fetchConversationGuide] = useGetConversationGuideLazyQuery();
  const [createOrder] = useCreateSequencingOrderMutation();

  const loadStep = useCallback(async (step: Step) => {
    setError(null);
    setLoading(true);

    try {
      switch (step) {
        case 1: {
          if (recommendation) { setLoading(false); return; }
          setLoadingSub('Analyzing your profile...');
          const timer = setTimeout(() => setLoadingSub('Checking guidelines...'), 4000);
          const { data, error: err } = await fetchRecommendation();
          clearTimeout(timer);
          if (err) throw new Error(err.message);
          setRecommendation(data?.sequencingRecommendation as SequencingRecommendation);
          break;
        }
        case 2: {
          if (explanation) { setLoading(false); return; }
          setLoadingSub('Personalizing explanation...');
          const { data, error: err } = await fetchExplanation();
          if (err) throw new Error(err.message);
          setExplanation(data?.sequencingExplanation as SequencingExplanation);
          break;
        }
        case 3: {
          setLoadingSub('Analyzing providers...');
          const timer = setTimeout(() => setLoadingSub('Comparing tests...'), 3000);
          const { data, error: err } = await fetchTestRec({
            variables: { tissueAvailable, preferComprehensive },
          });
          clearTimeout(timer);
          if (err) throw new Error(err.message);
          setTestRec(data?.testRecommendation as TestRecommendation);
          break;
        }
        case 4: {
          if (conversationGuide) { setLoading(false); return; }
          setLoadingSub('Generating talking points...');
          const timer = setTimeout(() => setLoadingSub('Creating email template...'), 5000);
          const { data, error: err } = await fetchConversationGuide();
          clearTimeout(timer);
          if (err) throw new Error(err.message);
          setConversationGuide(data?.conversationGuide as ConversationGuide);
          break;
        }
        case 5:
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
      setLoadingSub('');
    }
  }, [recommendation, explanation, conversationGuide, tissueAvailable, preferComprehensive, fetchRecommendation, fetchExplanation, fetchTestRec, fetchConversationGuide]);

  const goToStep = useCallback((step: Step) => {
    setCurrentStep(step);
    loadStep(step);
  }, [loadStep]);

  const handleContinue = useCallback(() => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    if (currentStep < 5) goToStep((currentStep + 1) as Step);
  }, [currentStep, goToStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) goToStep((currentStep - 1) as Step);
  }, [currentStep, goToStep]);

  const [initialized, setInitialized] = useState(false);
  if (!initialized) {
    setInitialized(true);
    loadStep(1);
  }

  const handleRefetchStep3 = useCallback(() => {
    setTestRec(null);
    setConversationGuide(null);
    loadStep(3);
  }, [loadStep]);

  const handleCopyEmail = useCallback(async () => {
    if (!conversationGuide) return;
    await copyToClipboard(conversationGuide.emailTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [conversationGuide]);

  const handleStartTracking = useCallback(async () => {
    if (!testRec) return;
    setCreating(true);
    try {
      const { data } = await createOrder({
        variables: { providerId: testRec.primary.providerId, testType: testRec.primary.testType },
      });
      if (data?.createSequencingOrder?.id) {
        router.push(`/sequencing/orders/${data.createSequencingOrder.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
      setCreating(false);
    }
  }, [testRec, createOrder, router]);

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 768, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>Your Sequencing Guide</Text>
        <Text sx={{ mt: '$1', fontSize: 14, color: '$mutedForeground' }}>Personalized guidance in ~10 minutes</Text>

        {/* Step indicator */}
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: '$1' }}>
          {STEPS.map((step, i) => {
            const isCompleted = completedSteps.has(step.num);
            const isCurrent = step.num === currentStep;
            const isClickable = isCompleted || step.num <= currentStep;
            return (
              <View key={step.num} sx={{ flexDirection: 'row', alignItems: 'center' }}>
                <Pressable onPress={() => isClickable ? goToStep(step.num) : undefined} disabled={!isClickable}>
                  <View sx={{
                    width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
                    backgroundColor: isCompleted ? '#22C55E' : isCurrent ? 'blue600' : '#E5E7EB',
                  }}>
                    <Text sx={{ fontSize: 12, fontWeight: 'bold', color: isCompleted || isCurrent ? 'white' : '#6B7280' }}>
                      {isCompleted ? '\u2713' : String(step.num)}
                    </Text>
                  </View>
                </Pressable>
                {i < STEPS.length - 1 && (
                  <View sx={{ mx: '$1', height: 2, width: 24, backgroundColor: isCompleted ? '#4ADE80' : '#E5E7EB' }} />
                )}
              </View>
            );
          })}
        </View>
        <Text sx={{ mt: '$2', fontSize: 14, fontWeight: '500', color: '#374151' }}>{STEPS[currentStep - 1].title}</Text>

        {/* Loading */}
        {loading && (
          <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
            <ActivityIndicator size="small" />
            <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>{loadingSub || 'Loading...'}</Text>
          </View>
        )}

        {/* Error */}
        {error && !loading && (
          <View sx={{ mt: '$8' }}>
            <Text sx={{ fontSize: 14, color: 'red600' }}>{error}</Text>
            <Pressable onPress={() => loadStep(currentStep)}>
              <View sx={{ mt: '$3', backgroundColor: 'blue600', borderRadius: 8, px: '$4', py: '$2', alignSelf: 'flex-start' }}>
                <Text sx={{ fontSize: 14, color: 'white' }}>Try again</Text>
              </View>
            </Pressable>
          </View>
        )}

        {/* Step content */}
        {!loading && !error && (
          <View sx={{ mt: '$8' }}>
            {/* STEP 1 */}
            {currentStep === 1 && recommendation && (() => {
              const levelStyle = LEVEL_COLORS[recommendation.level] ?? LEVEL_COLORS.optional;
              return (
                <View sx={{ gap: '$6' }}>
                  <View sx={{ borderRadius: 20, px: '$3', py: '$1', backgroundColor: levelStyle.bg, alignSelf: 'flex-start' }}>
                    <Text sx={{ fontSize: 14, fontWeight: '600', color: levelStyle.text }}>{levelStyle.label}</Text>
                  </View>
                  <Text sx={{ fontSize: 20, fontWeight: '600', color: '$foreground' }}>{recommendation.headline}</Text>
                  <Text sx={{ color: '#374151', lineHeight: 24 }}>{recommendation.personalizedReasoning}</Text>
                  <View sx={{ borderRadius: 8, backgroundColor: '#EFF6FF', p: '$4' }}>
                    <Text sx={{ fontSize: 14, fontWeight: '600', color: '#1E3A5F' }}>What sequencing could reveal</Text>
                    <View sx={{ mt: '$2', gap: 6 }}>
                      {recommendation.whatItCouldReveal.map((item, i) => (
                        <Text key={i} sx={{ fontSize: 14, color: '#1E40AF' }}>{'\u2022'} {item}</Text>
                      ))}
                    </View>
                  </View>
                  <View sx={{ flexDirection: 'row', gap: '$4' }}>
                    <View sx={{ flex: 1, borderRadius: 8, backgroundColor: '#DCFCE7', p: '$4' }}>
                      <Text sx={{ fontSize: 14, fontWeight: '600', color: '#14532D' }}>How it helps right now</Text>
                      <Text sx={{ mt: '$1', fontSize: 14, color: '#166534' }}>{recommendation.howItHelpsRightNow}</Text>
                    </View>
                    <View sx={{ flex: 1, borderRadius: 8, backgroundColor: '#F3E8FF', p: '$4' }}>
                      <Text sx={{ fontSize: 14, fontWeight: '600', color: '#581C87' }}>How it helps later</Text>
                      <Text sx={{ mt: '$1', fontSize: 14, color: '#6B21A8' }}>{recommendation.howItHelpsLater}</Text>
                    </View>
                  </View>
                  <View sx={{ borderRadius: 8, borderWidth: 1, borderColor: '$border', p: '$4' }}>
                    <Text sx={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>Guideline reference</Text>
                    <Text sx={{ mt: '$1', fontSize: 14, color: '$mutedForeground' }}>{recommendation.guidelineRecommendation}</Text>
                  </View>
                </View>
              );
            })()}

            {/* STEP 2 */}
            {currentStep === 2 && explanation && (
              <View sx={{ gap: '$6' }}>
                {[
                  { bg: '#E0E7FF', title: 'What is genomic sequencing?', text: explanation.whatIsIt, titleColor: '#312E81', textColor: '#3730A3' },
                  { bg: '#EFF6FF', title: 'How does it work?', text: explanation.howItWorks, titleColor: '#1E3A5F', textColor: '#1E40AF' },
                  { bg: '#DCFCE7', title: 'What does it find?', text: explanation.whatItFinds, titleColor: '#14532D', textColor: '#166534' },
                  { bg: '#F3E8FF', title: 'Why this matters for you', text: explanation.personalRelevance, titleColor: '#581C87', textColor: '#6B21A8' },
                ].map((section, i) => (
                  <View key={i} sx={{ borderRadius: 8, backgroundColor: section.bg, p: '$5' }}>
                    <Text sx={{ fontWeight: '600', color: section.titleColor }}>{section.title}</Text>
                    <Text sx={{ mt: '$2', fontSize: 14, color: section.textColor, lineHeight: 22 }}>{section.text}</Text>
                  </View>
                ))}

                <View>
                  <Text sx={{ fontWeight: '600', color: '$foreground' }}>Common concerns</Text>
                  <View sx={{ mt: '$3', gap: '$2' }}>
                    {explanation.commonConcerns.map((item, i) => (
                      <Pressable key={i} onPress={() => setExpandedConcern(expandedConcern === i ? null : i)}>
                        <View sx={{ borderRadius: 8, borderWidth: 1, borderColor: '$border', p: '$4' }}>
                          <View sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text sx={{ fontWeight: '500', color: '$foreground', flex: 1 }}>{item.concern}</Text>
                            <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>{expandedConcern === i ? '\u25B2' : '\u25BC'}</Text>
                          </View>
                          {expandedConcern === i && (
                            <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground', lineHeight: 22 }}>{item.answer}</Text>
                          )}
                        </View>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* STEP 3 */}
            {currentStep === 3 && testRec && (
              <View sx={{ gap: '$6' }}>
                <View sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: '$3' }}>
                  <Pressable onPress={() => { setTissueAvailable(!tissueAvailable); setTimeout(handleRefetchStep3, 0); }}>
                    <View sx={{
                      borderRadius: 8, px: '$3', py: 6,
                      backgroundColor: !tissueAvailable ? '#FEF3C7' : 'transparent',
                      borderWidth: tissueAvailable ? 1 : 0,
                      borderColor: '$border',
                    }}>
                      <Text sx={{ fontSize: 14, fontWeight: '500', color: !tissueAvailable ? '#92400E' : '#4B5563' }}>
                        {tissueAvailable ? "I don't have tissue available" : 'Tissue is unavailable (liquid biopsy)'}
                      </Text>
                    </View>
                  </Pressable>
                  <Pressable onPress={() => { setPreferComprehensive(!preferComprehensive); setTimeout(handleRefetchStep3, 0); }}>
                    <View sx={{
                      borderRadius: 8, px: '$3', py: 6,
                      backgroundColor: preferComprehensive ? '#E0E7FF' : 'transparent',
                      borderWidth: preferComprehensive ? 0 : 1,
                      borderColor: '$border',
                    }}>
                      <Text sx={{ fontSize: 14, fontWeight: '500', color: preferComprehensive ? '#3730A3' : '#4B5563' }}>
                        {preferComprehensive ? 'Most comprehensive panel' : 'I want the most comprehensive panel'}
                      </Text>
                    </View>
                  </Pressable>
                </View>

                {/* Primary */}
                <View sx={{ borderRadius: 12, borderWidth: 2, borderColor: '#93C5FD', backgroundColor: '#EFF6FF', p: '$5' }}>
                  <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2' }}>
                    <View sx={{ borderRadius: 4, backgroundColor: 'blue600', px: '$2', py: 2 }}>
                      <Text sx={{ fontSize: 12, fontWeight: 'bold', color: 'white' }}>Recommended</Text>
                    </View>
                    {testRec.primary.fdaApproved && (
                      <View sx={{ borderRadius: 4, backgroundColor: '#DCFCE7', px: '$2', py: 2 }}>
                        <Text sx={{ fontSize: 12, fontWeight: '600', color: '#15803D' }}>FDA Approved</Text>
                      </View>
                    )}
                  </View>
                  <Text sx={{ mt: '$2', fontSize: 18, fontWeight: 'bold', color: '$foreground' }}>{testRec.primary.providerName}</Text>
                  <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>{testRec.primary.testName}</Text>
                  <View sx={{ mt: '$3', flexDirection: 'row', gap: '$3' }}>
                    {[
                      { val: testRec.primary.geneCount, label: 'Genes' },
                      { val: testRec.primary.turnaroundDays, label: 'Days' },
                      { val: testRec.primary.sampleType, label: 'Sample' },
                    ].map((stat, i) => (
                      <View key={i} sx={{ flex: 1, alignItems: 'center' }}>
                        <Text sx={{ fontSize: 20, fontWeight: 'bold', color: '#1D4ED8' }}>{stat.val}</Text>
                        <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>{stat.label}</Text>
                      </View>
                    ))}
                  </View>
                  <Text sx={{ mt: '$3', fontSize: 14, color: '#374151', lineHeight: 22 }}>{testRec.primary.whyThisTest}</Text>
                </View>

                <Text sx={{ fontSize: 14, color: '$mutedForeground', lineHeight: 22 }}>{testRec.reasoning}</Text>

                {testRec.alternatives.length > 0 && (
                  <View>
                    <Text sx={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>Alternatives</Text>
                    <View sx={{ mt: '$2', gap: '$2' }}>
                      {testRec.alternatives.map((alt, i) => (
                        <View key={i} sx={{ borderRadius: 8, borderWidth: 1, borderColor: '$border', p: '$4' }}>
                          <View sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text sx={{ fontWeight: '500', color: '$foreground' }}>{alt.providerName}</Text>
                            <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>{alt.geneCount} genes</Text>
                          </View>
                          <Text sx={{ mt: '$1', fontSize: 14, color: '$mutedForeground' }}>{alt.testName}</Text>
                          <Text sx={{ mt: '$1', fontSize: 14, color: '#B45309' }}>{alt.tradeoff}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* STEP 4 */}
            {currentStep === 4 && conversationGuide && (
              <View sx={{ gap: '$6' }}>
                <View>
                  <Text sx={{ fontWeight: '600', color: '$foreground' }}>Talking points for your appointment</Text>
                  <View sx={{ mt: '$3', gap: '$3' }}>
                    {conversationGuide.talkingPoints.map((tp, i) => (
                      <View key={i} sx={{ borderRadius: 8, backgroundColor: '#EFF6FF', p: '$4' }}>
                        <Text sx={{ fontWeight: '500', color: '#1E3A5F' }}>{tp.point}</Text>
                        <Text sx={{ mt: '$1', fontSize: 14, color: '#1D4ED8' }}>{tp.detail}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View>
                  <Text sx={{ fontWeight: '600', color: '$foreground' }}>Questions to ask your oncologist</Text>
                  <View sx={{ mt: '$3', gap: '$2' }}>
                    {conversationGuide.questionsToAsk.map((q, i) => (
                      <View key={i} sx={{ borderRadius: 8, borderWidth: 1, borderColor: '$border', p: '$4' }}>
                        <Text sx={{ fontWeight: '500', color: '$foreground' }}>"{q.question}"</Text>
                        <Text sx={{ mt: '$1', fontSize: 14, color: '$mutedForeground' }}>Why: {q.whyItMatters}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View>
                  <View sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text sx={{ fontWeight: '600', color: '$foreground' }}>Email / MyChart message template</Text>
                    <Pressable onPress={handleCopyEmail}>
                      <View sx={{ borderRadius: 8, borderWidth: 1, borderColor: '$border', px: '$3', py: '$1' }}>
                        <Text sx={{ fontSize: 14, color: '$foreground' }}>{copied ? 'Copied!' : 'Copy'}</Text>
                      </View>
                    </Pressable>
                  </View>
                  <View sx={{ mt: '$3', borderRadius: 8, borderWidth: 2, borderColor: '#D1D5DB', backgroundColor: '#F9FAFB', p: '$4' }}>
                    <Text sx={{ fontSize: 14, color: '#374151', lineHeight: 22 }}>{conversationGuide.emailTemplate}</Text>
                  </View>
                </View>

                <View sx={{ borderRadius: 8, backgroundColor: '#DCFCE7', p: '$5' }}>
                  <Text sx={{ fontWeight: '600', color: '#14532D' }}>How to get the test ordered</Text>
                  <Text sx={{ mt: '$2', fontSize: 14, color: '#166534', lineHeight: 22 }}>{conversationGuide.orderingInstructions}</Text>
                </View>
              </View>
            )}

            {/* STEP 5 */}
            {currentStep === 5 && testRec && (
              <View sx={{ gap: '$6' }}>
                <View sx={{ borderRadius: 12, backgroundColor: '#EEF2FF', borderWidth: 1, borderColor: '#C7D2FE', p: '$6' }}>
                  <Text sx={{ fontSize: 18, fontWeight: '600', color: '#312E81' }}>Your recommended test</Text>
                  <Text sx={{ mt: '$1', color: '#4338CA' }}>
                    {testRec.primary.providerName} — {testRec.primary.testName}
                  </Text>
                  <View sx={{ mt: '$3', flexDirection: 'row', gap: '$4' }}>
                    <Text sx={{ fontSize: 14, color: '#4F46E5' }}>{testRec.primary.geneCount} genes</Text>
                    <Text sx={{ fontSize: 14, color: '#4F46E5' }}>~{testRec.primary.turnaroundDays} days</Text>
                    <Text sx={{ fontSize: 14, color: '#4F46E5' }}>{testRec.primary.sampleType}</Text>
                  </View>
                </View>

                <View sx={{ borderRadius: 8, borderWidth: 1, borderColor: '$border', p: '$5' }}>
                  <Text sx={{ fontWeight: '600', color: '$foreground' }}>Next steps</Text>
                  <View sx={{ mt: '$3', gap: '$3' }}>
                    {[
                      'Send the email template to your oncologist or bring the talking points to your next appointment',
                      'Your oncologist orders the test and your sample is collected',
                      `Results typically arrive in ${testRec.primary.turnaroundDays} days`,
                      'Upload your results to OncoVax for personalized analysis and trial matching',
                    ].map((text, i) => (
                      <View key={i} sx={{ flexDirection: 'row', gap: '$3' }}>
                        <View sx={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Text sx={{ fontSize: 12, fontWeight: 'bold', color: '#1D4ED8' }}>{i + 1}</Text>
                        </View>
                        <Text sx={{ fontSize: 14, color: '#374151', flex: 1 }}>{text}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <Pressable onPress={handleStartTracking} disabled={creating}>
                  <View sx={{
                    backgroundColor: creating ? '#D1D5DB' : 'blue600',
                    borderRadius: 8, px: '$6', py: '$3', alignItems: 'center',
                  }}>
                    <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                      {creating ? 'Creating order...' : 'Start Tracking My Order'}
                    </Text>
                  </View>
                </Pressable>
              </View>
            )}
          </View>
        )}

        {/* Navigation */}
        {!loading && !error && (
          <View sx={{ mt: '$10', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Pressable onPress={handleBack} disabled={currentStep === 1}>
              <View sx={{
                borderRadius: 8, borderWidth: 1, borderColor: '$border', px: '$4', py: '$2',
                opacity: currentStep === 1 ? 0.3 : 1,
              }}>
                <Text sx={{ fontSize: 14, color: '#374151' }}>Back</Text>
              </View>
            </Pressable>
            {currentStep < 5 && (
              <Pressable onPress={handleContinue}>
                <View sx={{ backgroundColor: 'blue600', borderRadius: 8, px: '$6', py: '$2' }}>
                  <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>Continue</Text>
                </View>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
