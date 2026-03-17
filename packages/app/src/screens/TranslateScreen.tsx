import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'solito/router';
import { Link } from 'solito/link';
import { TranslationSection } from '../components';
import { copyToClipboard } from '../utils';
import { useGetMatchesQuery, useTranslateTreatmentMutation } from '../generated/graphql';
import type { TreatmentTranslation } from '@oncovax/shared';

type LoadingStep = 'checking' | 'analyzing' | 'reviewing' | 'creating' | 'done';

const LOADING_STEPS: { key: LoadingStep; label: string }[] = [
  { key: 'analyzing', label: 'Analyzing your profile...' },
  { key: 'reviewing', label: 'Reviewing treatment guidelines...' },
  { key: 'creating', label: 'Creating your guide...' },
];

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

export function TranslateScreen() {
  const router = useRouter();
  const [translation, setTranslation] = useState<TreatmentTranslation | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState<LoadingStep>('checking');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: matchesData } = useGetMatchesQuery({ errorPolicy: 'ignore' });
  const [translateMutation] = useTranslateTreatmentMutation();

  const generate = useCallback(async () => {
    const topMatchId = matchesData?.matches?.[0]?.id;
    if (!topMatchId) {
      setError('No trial matches found. Complete your profile first to get matched.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setLoadingStep('analyzing');

    const stepTimer1 = setTimeout(() => setLoadingStep('reviewing'), 8000);
    const stepTimer2 = setTimeout(() => setLoadingStep('creating'), 18000);

    try {
      const { data } = await translateMutation({ variables: { matchId: topMatchId } });
      if (data?.translateTreatment) {
        setTranslation(data.translateTreatment as unknown as TreatmentTranslation);
        setLoadingStep('done');
      } else {
        throw new Error('No translation returned');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setLoading(false);
    }
  }, [matchesData, translateMutation]);

  useEffect(() => {
    if (matchesData) {
      generate();
    }
  }, [matchesData]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCopy = async () => {
    if (!translation) return;
    const text = formatTranslationAsText(translation);
    await copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    if (Platform.OS === 'web') {
      window.print();
    }
  };

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 672, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>Your Treatment Guide</Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          We're creating a personalized guide based on your profile. This takes about 20-30 seconds.
        </Text>
        <View sx={{ mt: '$10', gap: '$4' }}>
          {LOADING_STEPS.map((step) => {
            const isActive = step.key === loadingStep;
            const isPast = LOADING_STEPS.findIndex(s => s.key === loadingStep) > LOADING_STEPS.findIndex(s => s.key === step.key);
            return (
              <View key={step.key} sx={{ flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
                {isPast ? (
                  <View sx={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center' }}>
                    <Text sx={{ fontSize: 14, color: '#16A34A' }}>{'\u2713'}</Text>
                  </View>
                ) : isActive ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <View sx={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '$border' }} />
                )}
                <Text sx={{
                  fontSize: 14,
                  fontWeight: isActive ? '500' : '400',
                  color: isActive ? '$foreground' : isPast ? '$mutedForeground' : '#D1D5DB',
                }}>
                  {step.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 672, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>Treatment Guide</Text>
        <Text sx={{ mt: '$4', fontSize: 14, color: 'red600' }}>{error}</Text>
        <View sx={{ mt: '$6', flexDirection: 'row', gap: '$3' }}>
          <Pressable onPress={generate}>
            <View sx={{ backgroundColor: 'blue600', borderRadius: 8, px: '$4', py: '$2' }}>
              <Text sx={{ fontSize: 14, color: 'white' }}>Try again</Text>
            </View>
          </Pressable>
          <Pressable onPress={() => router.push('/dashboard')}>
            <View sx={{ borderRadius: 8, borderWidth: 1, borderColor: '$border', px: '$4', py: '$2' }}>
              <Text sx={{ fontSize: 14, color: '$foreground' }}>Back to dashboard</Text>
            </View>
          </Pressable>
        </View>
      </View>
    );
  }

  if (!translation) return null;

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 768, px: '$6', py: '$16', width: '100%' }}>
        {/* Header */}
        <View sx={{ mb: '$8', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View sx={{ flex: 1 }}>
            <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>Your Treatment Guide</Text>
            <Text sx={{ mt: '$1', fontSize: 14, color: '$mutedForeground' }}>Personalized for your diagnosis and treatment plan</Text>
          </View>
          <View sx={{ flexDirection: 'row', gap: '$2' }}>
            <Pressable onPress={handleCopy}>
              <View sx={{ borderRadius: 8, borderWidth: 1, borderColor: '$border', px: '$3', py: '$1' }}>
                <Text sx={{ fontSize: 14, color: '$foreground' }}>{copied ? 'Copied!' : 'Copy'}</Text>
              </View>
            </Pressable>
            {Platform.OS === 'web' && (
              <Pressable onPress={handlePrint}>
                <View sx={{ borderRadius: 8, borderWidth: 1, borderColor: '$border', px: '$3', py: '$1' }}>
                  <Text sx={{ fontSize: 14, color: '$foreground' }}>Print</Text>
                </View>
              </Pressable>
            )}
          </View>
        </View>

        {/* Diagnosis */}
        <TranslationSection title="What You Have" subtitle="Understanding your diagnosis">
          <View sx={{ gap: '$4' }}>
            <Text sx={{ color: '#374151', lineHeight: 24 }}>{translation.diagnosis.summary}</Text>
            <View sx={{ borderRadius: 8, backgroundColor: '#EFF6FF', p: '$4' }}>
              <Text sx={{ fontSize: 14, fontWeight: '600', color: '#1E3A5F' }}>Your stage: what it means</Text>
              <Text sx={{ mt: '$1', fontSize: 14, color: '#1E40AF', lineHeight: 22 }}>{translation.diagnosis.stageExplainer}</Text>
            </View>
            {translation.diagnosis.subtypeExplainer && (
              <View sx={{ borderRadius: 8, backgroundColor: '#F3E8FF', p: '$4' }}>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: '#581C87' }}>Your cancer subtype</Text>
                <Text sx={{ mt: '$1', fontSize: 14, color: '#6B21A8', lineHeight: 22 }}>{translation.diagnosis.subtypeExplainer}</Text>
              </View>
            )}
            <Text sx={{ color: '#4B5563', lineHeight: 24, fontStyle: 'italic' }}>{translation.diagnosis.whatThisMeans}</Text>
          </View>
        </TranslationSection>

        {/* Treatment Plan */}
        <TranslationSection title="Your Treatment Plan" subtitle="Why these treatments were chosen for you">
          <View sx={{ gap: '$6' }}>
            <Text sx={{ color: '#374151', lineHeight: 24 }}>{translation.treatmentPlan.overview}</Text>
            {translation.treatmentPlan.drugs.map((drug: any, i: number) => (
              <View key={i} sx={{ borderRadius: 8, borderWidth: 1, borderColor: '$border', overflow: 'hidden' }}>
                <View sx={{ backgroundColor: '#F9FAFB', px: '$4', py: '$3' }}>
                  <Text sx={{ fontWeight: '600', color: '$foreground' }}>{drug.name}</Text>
                  {drug.genericName && <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>{drug.genericName}</Text>}
                </View>
                <View sx={{ gap: '$3', p: '$4' }}>
                  <View>
                    <Text sx={{ fontSize: 12, fontWeight: '600', textTransform: 'uppercase', color: '$mutedForeground' }}>How it works</Text>
                    <Text sx={{ mt: '$1', fontSize: 14, color: '#374151' }}>{drug.mechanism}</Text>
                  </View>
                  <View>
                    <Text sx={{ fontSize: 12, fontWeight: '600', textTransform: 'uppercase', color: '$mutedForeground' }}>Why this drug</Text>
                    <Text sx={{ mt: '$1', fontSize: 14, color: '#374151' }}>{drug.whyThisDrug}</Text>
                  </View>
                  {drug.commonSideEffects?.length > 0 && (
                    <View>
                      <Text sx={{ fontSize: 12, fontWeight: '600', textTransform: 'uppercase', color: '$mutedForeground' }}>Common side effects</Text>
                      <View sx={{ mt: '$2', gap: '$2' }}>
                        {drug.commonSideEffects.map((se: any, j: number) => (
                          <View key={j} sx={{ borderRadius: 4, backgroundColor: '#FEF3C7', p: '$2' }}>
                            <Text sx={{ fontSize: 14, fontWeight: '500', color: '#78350F' }}>{se.effect}</Text>
                            <Text sx={{ fontSize: 12, color: '#92400E' }}>Timing: {se.timing}</Text>
                            <Text sx={{ fontSize: 12, color: '#92400E' }}>Management: {se.management}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                  {drug.tips?.length > 0 && (
                    <View>
                      <Text sx={{ fontSize: 12, fontWeight: '600', textTransform: 'uppercase', color: '$mutedForeground' }}>Tips</Text>
                      <View sx={{ mt: '$1', gap: '$1' }}>
                        {drug.tips.map((tip: string, j: number) => (
                          <Text key={j} sx={{ fontSize: 14, color: '#374151' }}>{'\u2022'} {tip}</Text>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              </View>
            ))}
            <View sx={{ borderRadius: 8, backgroundColor: '#DCFCE7', p: '$4' }}>
              <Text sx={{ fontSize: 14, fontWeight: '600', color: '#14532D' }}>Guideline alignment</Text>
              <Text sx={{ mt: '$1', fontSize: 14, color: '#166534', lineHeight: 22 }}>{translation.treatmentPlan.guidelineAlignment}</Text>
            </View>
          </View>
        </TranslationSection>

        {/* Timeline */}
        <TranslationSection title="What to Expect" subtitle="Your treatment timeline">
          <View sx={{ gap: '$4' }}>
            <Text sx={{ color: '#374151', lineHeight: 24 }}>{translation.timeline.overview}</Text>
            <View sx={{ gap: 0 }}>
              {translation.timeline.phases.map((phase: any, i: number) => (
                <View key={i} sx={{ pl: '$8', pb: '$6', position: 'relative' }}>
                  <View sx={{
                    position: 'absolute',
                    left: 0,
                    top: 4,
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: '#DBEAFE',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Text sx={{ fontSize: 12, fontWeight: 'bold', color: '#1D4ED8' }}>{i + 1}</Text>
                  </View>
                  <Text sx={{ fontWeight: '600', color: '$foreground' }}>{phase.phase}</Text>
                  <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>{phase.duration}</Text>
                  <Text sx={{ mt: '$1', fontSize: 14, color: '#374151' }}>{phase.description}</Text>
                  <View sx={{ mt: '$2', gap: '$1' }}>
                    {phase.whatToExpect.map((item: string, j: number) => (
                      <Text key={j} sx={{ fontSize: 14, color: '#4B5563' }}>{'\u2022'} {item}</Text>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </View>
        </TranslationSection>

        {/* Questions */}
        <TranslationSection title="Questions for Your Doctor" subtitle="Personalized questions based on your profile">
          <View sx={{ gap: '$3' }}>
            {translation.questionsForDoctor.map((q: any, i: number) => (
              <View key={i} sx={{ borderRadius: 8, borderWidth: 1, borderColor: '$border', p: '$4' }}>
                <Text sx={{ fontWeight: '500', color: '$foreground' }}>"{q.question}"</Text>
                <Text sx={{ mt: '$1', fontSize: 14, color: '$mutedForeground' }}>Why this matters: {q.whyItMatters}</Text>
              </View>
            ))}
          </View>
        </TranslationSection>

        {/* Additional Considerations */}
        <TranslationSection title="What Else to Know" subtitle="Additional information that may be relevant">
          <View sx={{ gap: '$4' }}>
            {translation.additionalConsiderations?.geneticTesting && (
              <View sx={{ borderRadius: 8, backgroundColor: '#E0E7FF', p: '$4' }}>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: '#312E81' }}>Genetic testing</Text>
                <Text sx={{ mt: '$1', fontSize: 14, color: '#3730A3' }}>{translation.additionalConsiderations.geneticTesting}</Text>
              </View>
            )}
            {translation.additionalConsiderations?.fertilityPreservation && (
              <View sx={{ borderRadius: 8, backgroundColor: '#FCE7F3', p: '$4' }}>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: '#831843' }}>Fertility preservation</Text>
                <Text sx={{ mt: '$1', fontSize: 14, color: '#9D174D' }}>{translation.additionalConsiderations.fertilityPreservation}</Text>
              </View>
            )}
            {translation.additionalConsiderations?.clinicalTrials && (
              <View sx={{ borderRadius: 8, backgroundColor: '#CCFBF1', p: '$4' }}>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: '#134E4A' }}>Clinical trials</Text>
                <Text sx={{ mt: '$1', fontSize: 14, color: '#115E59' }}>{translation.additionalConsiderations.clinicalTrials}</Text>
              </View>
            )}
            {translation.additionalConsiderations?.mentalHealth && (
              <View sx={{ borderRadius: 8, backgroundColor: '#FFEDD5', p: '$4' }}>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: '#7C2D12' }}>Mental health support</Text>
                <Text sx={{ mt: '$1', fontSize: 14, color: '#9A3412' }}>{translation.additionalConsiderations.mentalHealth}</Text>
              </View>
            )}
            {translation.secondOpinionTriggers?.length > 0 && (
              <View sx={{ borderRadius: 8, borderWidth: 2, borderColor: '#FCD34D', backgroundColor: '#FEF3C7', p: '$4' }}>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: '#78350F' }}>Worth discussing with your doctor</Text>
                <View sx={{ mt: '$2', gap: '$2' }}>
                  {translation.secondOpinionTriggers.map((trigger: any, i: number) => (
                    <View key={i} sx={{ flexDirection: 'row', gap: '$2' }}>
                      <View sx={{
                        mt: 2,
                        borderRadius: 4,
                        px: '$1',
                        py: 2,
                        backgroundColor: trigger.level === 'worth_discussing' ? '#FDE68A' : '#E5E7EB',
                      }}>
                        <Text sx={{ fontSize: 10, fontWeight: '500', color: trigger.level === 'worth_discussing' ? '#92400E' : '#4B5563' }}>
                          {trigger.level === 'worth_discussing' ? 'Ask about' : 'FYI'}
                        </Text>
                      </View>
                      <Text sx={{ fontSize: 14, color: '#92400E', flex: 1 }}>{trigger.reason}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </TranslationSection>

        {/* Sequencing CTA */}
        <View sx={{ mt: '$10', borderRadius: 12, backgroundColor: '#EEF2FF', borderWidth: 1, borderColor: '#C7D2FE', p: '$6' }}>
          <Text sx={{ fontWeight: '600', color: '#312E81' }}>Consider genomic sequencing</Text>
          <Text sx={{ mt: '$1', fontSize: 14, color: '#3730A3' }}>
            Genomic testing can identify specific mutations in your tumor that may open the door to targeted therapies or clinical trials.
          </Text>
          <Pressable onPress={() => router.push('/sequencing')}>
            <View sx={{ mt: '$3', backgroundColor: '#4F46E5', borderRadius: 8, px: '$4', py: '$2', alignSelf: 'flex-start' }}>
              <Text sx={{ fontSize: 14, fontWeight: '500', color: 'white' }}>Explore sequencing options</Text>
            </View>
          </Pressable>
        </View>

        {/* CTAs */}
        <View sx={{ mt: '$6', gap: '$3' }}>
          <Link href="/matches">
            <View sx={{ backgroundColor: 'blue600', borderRadius: 8, px: '$6', py: '$3', alignItems: 'center' }}>
              <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>View your trial matches</Text>
            </View>
          </Link>
          <Link href="/financial">
            <View sx={{ borderRadius: 8, borderWidth: 1, borderColor: '$border', px: '$6', py: '$3', alignItems: 'center' }}>
              <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>Find financial assistance</Text>
            </View>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
