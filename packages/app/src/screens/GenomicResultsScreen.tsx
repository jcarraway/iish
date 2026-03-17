import { useState, useCallback, useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import {
  useGetGenomicResultsQuery,
  useInterpretGenomicsMutation,
  useRematchMutation,
  useGetMatchDeltaLazyQuery,
} from '../generated/graphql';

type LoadingStep = 'loading' | 'interpreting' | 'done';

const INTERP_STEPS: { key: LoadingStep; label: string }[] = [
  { key: 'loading', label: 'Loading your results...' },
  { key: 'interpreting', label: 'Creating your personalized interpretation...' },
];

export function GenomicResultsScreen() {
  const { data: resultsData, loading: resultsLoading } = useGetGenomicResultsQuery();
  const [interpretGenomics] = useInterpretGenomicsMutation();
  const [rematchMutation, { loading: rematching }] = useRematchMutation();
  const [fetchMatchDelta, { data: deltaData }] = useGetMatchDeltaLazyQuery();

  const [loadingStep, setLoadingStep] = useState<LoadingStep>('loading');
  const [interpretation, setInterpretation] = useState<any>(null);
  const [matchDelta, setMatchDelta] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  const results = resultsData?.genomicResults ?? [];
  const latestResult = results[0];

  useEffect(() => {
    if (resultsLoading) return;
    if (results.length === 0 || !latestResult) {
      setLoadingStep('done');
      return;
    }
    // TODO: check patientConfirmed once exposed in schema
    // For now, try interpretation
    setLoadingStep('interpreting');
    interpretGenomics()
      .then((res) => {
        if (res.data?.interpretGenomics) {
          setInterpretation(res.data.interpretGenomics);
        }
        setLoadingStep('done');
      })
      .catch((err) => {
        setError(err.message);
        setLoadingStep('done');
      });
  }, [resultsLoading, results.length]);

  useEffect(() => {
    if (deltaData?.matchDelta) setMatchDelta(deltaData.matchDelta);
  }, [deltaData]);

  const handleRematch = async () => {
    try {
      const res = await rematchMutation();
      if (res.data?.rematch) setMatchDelta(res.data.rematch);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const toggleQuestion = (idx: number) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const mutations = interpretation?.mutations as Array<{
    gene: string; alteration: string; significance: string; explanation: string;
    availableTherapies: string[]; relevantTrials: string[]; prognosisImpact?: string;
  }> ?? [];
  const biomarkerProfile = interpretation?.biomarkerProfile as Array<{
    name: string; value: string; explanation: string; immunotherapyRelevance: string;
  }> ?? [];
  const questionsForOncologist = interpretation?.questionsForOncologist as Array<{
    question: string; whyItMatters: string;
  }> ?? [];

  if (resultsLoading || loadingStep !== 'done') {
    return (
      <View sx={{ mx: 'auto', maxWidth: 768, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 28, fontWeight: '700', color: 'gray900' }}>Your Genomic Results</Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: 'gray500' }}>
          {loadingStep === 'interpreting'
            ? 'Creating your personalized interpretation. This takes about 20-30 seconds.'
            : 'Loading your results...'}
        </Text>
        <View sx={{ mt: '$10', gap: '$4' }}>
          {INTERP_STEPS.map((step) => {
            const isActive = step.key === loadingStep;
            const isPast = INTERP_STEPS.findIndex((s) => s.key === loadingStep) > INTERP_STEPS.findIndex((s) => s.key === step.key);
            return (
              <View key={step.key} sx={{ flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
                {isPast ? (
                  <View sx={{ width: 24, height: 24, borderRadius: 12, bg: '#DCFCE7', alignItems: 'center', justifyContent: 'center' }}>
                    <Text sx={{ color: '#16A34A', fontSize: 14, fontWeight: '700' }}>✓</Text>
                  </View>
                ) : isActive ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <View sx={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#E5E7EB' }} />
                )}
                <Text sx={{
                  fontSize: 14,
                  fontWeight: isActive ? '500' : '400',
                  color: isActive ? 'gray900' : isPast ? 'gray500' : '#9CA3AF',
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

  if (error && !interpretation) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 640, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 28, fontWeight: '700', color: 'gray900' }}>Genomic Results</Text>
        <Text sx={{ mt: '$4', fontSize: 14, color: '#DC2626' }}>{error}</Text>
        <Link href="/dashboard">
          <View sx={{ mt: '$6', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, px: '$4', py: '$2', alignSelf: 'flex-start' }}>
            <Text sx={{ fontSize: 14 }}>Back to dashboard</Text>
          </View>
        </Link>
      </View>
    );
  }

  if (results.length === 0) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 640, px: '$6', py: '$16', width: '100%' }}>
        <Link href="/sequencing">
          <Text sx={{ fontSize: 13, color: 'gray500', mb: '$6' }}>{'<'} Back to sequencing</Text>
        </Link>
        <Text sx={{ fontSize: 28, fontWeight: '700', color: 'gray900' }}>No Genomic Results Yet</Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: 'gray500' }}>Upload your genomic test report to get started.</Text>
        <Link href="/sequencing/upload">
          <View sx={{ mt: '$6', bg: '#2563EB', borderRadius: 8, px: '$6', py: '$3', alignSelf: 'flex-start' }}>
            <Text sx={{ color: 'white', fontSize: 14, fontWeight: '600' }}>Upload your results</Text>
          </View>
        </Link>
      </View>
    );
  }

  return (
    <ScrollView>
      <View sx={{ mx: 'auto', maxWidth: 768, px: '$6', py: '$16', width: '100%' }}>
        <Link href="/sequencing">
          <Text sx={{ fontSize: 13, color: 'gray500', mb: '$6' }}>{'<'} Back to sequencing</Text>
        </Link>

        <View sx={{ mb: '$8' }}>
          <Text sx={{ fontSize: 28, fontWeight: '700', color: 'gray900' }}>Your Genomic Results</Text>
          <Text sx={{ mt: '$1', fontSize: 14, color: 'gray500' }}>
            {latestResult.provider} {latestResult.testName}
            {latestResult.reportDate && ` | ${new Date(latestResult.reportDate).toLocaleDateString()}`}
          </Text>
        </View>

        {error && (
          <View sx={{ mb: '$6', borderRadius: 8, bg: '#FEF2F2', p: '$3' }}>
            <Text sx={{ fontSize: 14, color: '#B91C1C' }}>{error}</Text>
          </View>
        )}

        {interpretation && (
          <>
            {/* Summary */}
            <View sx={{ mb: '$8' }}>
              <Text sx={{ fontSize: 20, fontWeight: '600', color: 'gray900' }}>What your results mean</Text>
              <View sx={{ mt: '$3', borderRadius: 8, bg: '#EFF6FF', p: '$5' }}>
                <Text sx={{ fontSize: 14, color: '#1E3A8A', lineHeight: 22 }}>{interpretation.summary}</Text>
              </View>
            </View>

            {/* Mutations explained */}
            {mutations.length > 0 && (
              <View sx={{ mb: '$8' }}>
                <Text sx={{ fontSize: 20, fontWeight: '600', color: 'gray900' }}>Your mutations explained</Text>
                <View sx={{ mt: '$3', gap: '$4' }}>
                  {mutations.map((mut, i) => (
                    <View key={i} sx={{ borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', overflow: 'hidden' }}>
                      <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$3', bg: '#F9FAFB', px: '$4', py: '$3', flexWrap: 'wrap' }}>
                        <View sx={{ bg: '#111827', borderRadius: 4, px: 8, py: 2 }}>
                          <Text sx={{ fontSize: 12, fontWeight: '700', color: 'white' }}>{mut.gene}</Text>
                        </View>
                        <Text sx={{ fontSize: 14, fontWeight: '500', color: 'gray700' }}>{mut.alteration}</Text>
                        <View sx={{
                          bg: mut.significance === 'actionable' ? '#DCFCE7' : mut.significance === 'informational' ? '#DBEAFE' : '#FEF9C3',
                          borderRadius: 12, px: 8, py: 2,
                        }}>
                          <Text sx={{
                            fontSize: 12, fontWeight: '500',
                            color: mut.significance === 'actionable' ? '#166534' : mut.significance === 'informational' ? '#1E40AF' : '#854D0E',
                          }}>{mut.significance}</Text>
                        </View>
                      </View>
                      <View sx={{ p: '$4', gap: '$3' }}>
                        <Text sx={{ fontSize: 14, color: 'gray700', lineHeight: 22 }}>{mut.explanation}</Text>

                        {mut.availableTherapies.length > 0 && (
                          <View>
                            <Text sx={{ fontSize: 11, fontWeight: '600', textTransform: 'uppercase', color: 'gray500' }}>Available therapies</Text>
                            <View sx={{ mt: '$1', flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                              {mut.availableTherapies.map((t, j) => (
                                <View key={j} sx={{ bg: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0', borderRadius: 12, px: 10, py: 2 }}>
                                  <Text sx={{ fontSize: 12, color: '#15803D' }}>{t}</Text>
                                </View>
                              ))}
                            </View>
                          </View>
                        )}

                        {mut.relevantTrials.length > 0 && (
                          <View>
                            <Text sx={{ fontSize: 11, fontWeight: '600', textTransform: 'uppercase', color: 'gray500' }}>Relevant trial types</Text>
                            <View sx={{ mt: '$1', flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                              {mut.relevantTrials.map((t, j) => (
                                <View key={j} sx={{ bg: '#EEF2FF', borderWidth: 1, borderColor: '#C7D2FE', borderRadius: 12, px: 10, py: 2 }}>
                                  <Text sx={{ fontSize: 12, color: '#4338CA' }}>{t}</Text>
                                </View>
                              ))}
                            </View>
                          </View>
                        )}

                        {mut.prognosisImpact && (
                          <View sx={{ borderRadius: 6, bg: '#F9FAFB', p: '$3' }}>
                            <Text sx={{ fontSize: 11, fontWeight: '600', textTransform: 'uppercase', color: 'gray500' }}>What this means for your outlook</Text>
                            <Text sx={{ mt: '$1', fontSize: 14, color: 'gray700' }}>{mut.prognosisImpact}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Biomarker profile */}
            {biomarkerProfile.length > 0 && (
              <View sx={{ mb: '$8' }}>
                <Text sx={{ fontSize: 20, fontWeight: '600', color: 'gray900' }}>Your biomarker profile</Text>
                <View sx={{ mt: '$3', gap: '$3' }}>
                  {biomarkerProfile.map((bm, i) => (
                    <View key={i} sx={{ borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', p: '$4' }}>
                      <View sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text sx={{ fontWeight: '600', color: 'gray900' }}>{bm.name}</Text>
                        <Text sx={{ fontSize: 14, fontWeight: '500', color: 'gray600' }}>{bm.value}</Text>
                      </View>
                      <Text sx={{ mt: '$2', fontSize: 14, color: 'gray700' }}>{bm.explanation}</Text>
                      <View sx={{ mt: '$2', borderRadius: 6, bg: '#EEF2FF', p: 10 }}>
                        <Text sx={{ fontSize: 12, color: '#3730A3' }}>
                          <Text sx={{ fontWeight: '600' }}>Immunotherapy relevance: </Text>
                          {bm.immunotherapyRelevance}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Questions for oncologist */}
            {questionsForOncologist.length > 0 && (
              <View sx={{ mb: '$8' }}>
                <Text sx={{ fontSize: 20, fontWeight: '600', color: 'gray900' }}>What to discuss with your oncologist</Text>
                <View sx={{ mt: '$3', gap: '$2' }}>
                  {questionsForOncologist.map((q, i) => (
                    <View key={i} sx={{ borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' }}>
                      <Pressable onPress={() => toggleQuestion(i)}>
                        <View sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', p: '$4' }}>
                          <Text sx={{ fontWeight: '500', color: 'gray900', flex: 1 }}>"{q.question}"</Text>
                          <Text sx={{ color: '#9CA3AF', ml: '$2' }}>{expandedQuestions.has(i) ? '▲' : '▼'}</Text>
                        </View>
                      </Pressable>
                      {expandedQuestions.has(i) && (
                        <View sx={{ borderTopWidth: 1, borderColor: '#F3F4F6', bg: '#F9FAFB', px: '$4', py: '$3' }}>
                          <Text sx={{ fontSize: 14, color: 'gray600' }}>
                            <Text sx={{ fontWeight: '500' }}>Why this matters: </Text>
                            {q.whyItMatters}
                          </Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        )}

        {/* Match delta / rematch CTA */}
        <View sx={{ mb: '$8' }}>
          <Text sx={{ fontSize: 20, fontWeight: '600', color: 'gray900' }}>Updated trial matches</Text>

          {!matchDelta && !rematching && (
            <View sx={{ mt: '$3', borderRadius: 8, bg: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0', p: '$6' }}>
              <Text sx={{ fontWeight: '600', color: '#14532D' }}>Update your trial matches</Text>
              <Text sx={{ mt: '$1', fontSize: 14, color: '#166534' }}>
                Now that we have your genomic data, we can find trials that specifically target your mutations and biomarkers.
              </Text>
              <Pressable onPress={handleRematch}>
                <View sx={{ mt: '$3', bg: '#16A34A', borderRadius: 8, px: '$4', py: '$2', alignSelf: 'flex-start' }}>
                  <Text sx={{ color: 'white', fontSize: 14, fontWeight: '500' }}>Update my trial matches</Text>
                </View>
              </Pressable>
            </View>
          )}

          {rematching && (
            <View sx={{ mt: '$3', flexDirection: 'row', alignItems: 'center', gap: '$3', borderRadius: 8, bg: '#F9FAFB', p: '$6' }}>
              <ActivityIndicator size="small" />
              <Text sx={{ fontSize: 14, color: 'gray600' }}>Matching your genomic profile against clinical trials...</Text>
            </View>
          )}

          {matchDelta && (
            <View sx={{ mt: '$3', gap: '$3' }}>
              {matchDelta.newMatches.length > 0 && (
                <View sx={{ borderRadius: 8, bg: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0', p: '$4' }}>
                  <Text sx={{ fontWeight: '600', color: '#14532D' }}>
                    {matchDelta.newMatches.length} new trial{matchDelta.newMatches.length > 1 ? 's' : ''} found
                  </Text>
                  <View sx={{ mt: '$2', gap: '$2' }}>
                    {matchDelta.newMatches.slice(0, 5).map((m: any, i: number) => (
                      <View key={i} sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text sx={{ fontSize: 14, color: '#166534', flex: 1, mr: '$2' }} numberOfLines={1}>{m.title}</Text>
                        <View sx={{ bg: '#BBF7D0', borderRadius: 4, px: 8, py: 2 }}>
                          <Text sx={{ fontSize: 12, color: '#166534' }}>{Math.round(m.newScore ?? 0)}%</Text>
                        </View>
                      </View>
                    ))}
                    {matchDelta.newMatches.length > 5 && (
                      <Text sx={{ fontSize: 12, color: '#16A34A' }}>+ {matchDelta.newMatches.length - 5} more</Text>
                    )}
                  </View>
                </View>
              )}

              {matchDelta.improvedMatches.length > 0 && (
                <View sx={{ borderRadius: 8, bg: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE', p: '$4' }}>
                  <Text sx={{ fontWeight: '600', color: '#1E3A8A' }}>
                    {matchDelta.improvedMatches.length} trial{matchDelta.improvedMatches.length > 1 ? 's' : ''} with higher confidence
                  </Text>
                  <View sx={{ mt: '$2', gap: '$2' }}>
                    {matchDelta.improvedMatches.slice(0, 5).map((m: any, i: number) => (
                      <View key={i} sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text sx={{ fontSize: 14, color: '#1E40AF', flex: 1, mr: '$2' }} numberOfLines={1}>{m.title}</Text>
                        <Text sx={{ fontSize: 12, color: '#2563EB' }}>
                          {Math.round(m.oldScore ?? 0)}% → {Math.round(m.newScore ?? 0)}%
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {matchDelta.removedMatches.length > 0 && (
                <View sx={{ borderRadius: 8, bg: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', p: '$4' }}>
                  <Text sx={{ fontWeight: '600', color: 'gray700' }}>
                    {matchDelta.removedMatches.length} trial{matchDelta.removedMatches.length > 1 ? 's' : ''} ruled out
                  </Text>
                  <Text sx={{ mt: '$1', fontSize: 12, color: 'gray500' }}>
                    Your genomic data helped identify trials that aren't a match.
                  </Text>
                </View>
              )}

              <View sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 8, bg: '#F3F4F6', px: '$4', py: '$3' }}>
                <Text sx={{ fontSize: 14, color: 'gray600' }}>
                  Total matches: {matchDelta.totalBefore} → {matchDelta.totalAfter}
                </Text>
                <Link href="/matches">
                  <Text sx={{ fontSize: 14, fontWeight: '500', color: '#2563EB' }}>View all matches →</Text>
                </Link>
              </View>
            </View>
          )}
        </View>

        {/* Bottom CTA */}
        <View sx={{ flexDirection: 'row', gap: '$3', flexWrap: 'wrap' }}>
          <Link href="/matches">
            <View sx={{ flex: 1, minWidth: 200, bg: '#2563EB', borderRadius: 8, px: '$6', py: '$3', alignItems: 'center' }}>
              <Text sx={{ color: 'white', fontSize: 14, fontWeight: '600' }}>View trial matches</Text>
            </View>
          </Link>
          <Link href="/translate">
            <View sx={{ flex: 1, minWidth: 200, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, px: '$6', py: '$3', alignItems: 'center' }}>
              <Text sx={{ fontSize: 14, fontWeight: '600', color: 'gray700' }}>Treatment guide</Text>
            </View>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
