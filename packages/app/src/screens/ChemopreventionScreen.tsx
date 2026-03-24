import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import {
  useGetChemopreventionEligibilityQuery,
  useGetChemopreventionGuideQuery,
  useGenerateChemopreventionGuideMutation,
} from '../generated/graphql';

// ============================================================================
// Constants
// ============================================================================

const TYPE_COLORS: Record<string, { bg: string; fg: string }> = {
  SERM: { bg: '#DBEAFE', fg: '#1E40AF' },
  'Aromatase Inhibitor': { bg: '#E0E7FF', fg: '#3730A3' },
  AI: { bg: '#E0E7FF', fg: '#3730A3' },
  Other: { bg: '#F3F4F6', fg: '#6B7280' },
};

// ============================================================================
// Component
// ============================================================================

export function ChemopreventionScreen() {
  const { data: eligibilityData, loading: eligibilityLoading } = useGetChemopreventionEligibilityQuery({ errorPolicy: 'ignore' });
  const { data: guideData, loading: guideLoading, refetch: refetchGuide } = useGetChemopreventionGuideQuery({ errorPolicy: 'ignore' });
  const [generateGuide, { loading: generating }] = useGenerateChemopreventionGuideMutation({
    onCompleted: () => refetchGuide(),
  });

  const [expandedMed, setExpandedMed] = useState<string | null>(null);

  const eligibility = eligibilityData?.chemopreventionEligibility;
  const guide = guideData?.chemopreventionGuide;
  const loading = eligibilityLoading;

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Chemoprevention Navigator
        </Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading eligibility...</Text>
        </View>
      </View>
    );
  }

  if (!eligibility) {
    return (
      <ScrollView sx={{ flex: 1 }}>
        <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
          <Link href="/prevent/risk">
            <View sx={{
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '$border',
              px: '$4',
              py: '$3',
              alignSelf: 'flex-start',
              mb: '$4',
            }}>
              <Text sx={{ fontSize: 13, fontWeight: '500', color: '$foreground' }}>
                {'\u2190'} Back to Risk Assessment
              </Text>
            </View>
          </Link>

          <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
            Chemoprevention Navigator
          </Text>

          <View sx={{
            mt: '$8',
            borderWidth: 2,
            borderStyle: 'dashed',
            borderColor: '$border',
            borderRadius: 16,
            p: '$8',
            alignItems: 'center',
          }}>
            <Text sx={{ fontWeight: '600', color: '$foreground', textAlign: 'center' }}>
              Risk assessment required
            </Text>
            <Text sx={{
              mt: '$2', fontSize: 14, color: '$mutedForeground',
              textAlign: 'center', maxWidth: 400,
            }}>
              Complete a risk assessment to determine your chemoprevention eligibility. Eligibility
              is typically based on your 5-year breast cancer risk calculated from the Gail model.
            </Text>
            <Link href="/prevent/risk">
              <View sx={{
                mt: '$5',
                backgroundColor: 'blue600',
                borderRadius: 8,
                px: '$6',
                py: '$3',
              }}>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                  Go to Risk Assessment
                </Text>
              </View>
            </Link>
          </View>
        </View>
      </ScrollView>
    );
  }

  const isEligible = eligibility.eligible;
  const fiveYearRisk = eligibility.fiveYearRisk;
  const threshold = eligibility.riskThreshold;
  const medications = (eligibility.medications ?? []) as any[];
  const riskBenefitSummary = (eligibility as any).riskBenefitSummary;

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Link href="/prevent/risk">
          <View sx={{
            borderRadius: 10,
            borderWidth: 1,
            borderColor: '$border',
            px: '$4',
            py: '$3',
            alignSelf: 'flex-start',
            mb: '$4',
          }}>
            <Text sx={{ fontSize: 13, fontWeight: '500', color: '$foreground' }}>
              {'\u2190'} Back to Risk Assessment
            </Text>
          </View>
        </Link>

        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Chemoprevention Navigator
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          Medications that can reduce your breast cancer risk
        </Text>

        {/* ============================================================= */}
        {/* Eligibility Banner */}
        {/* ============================================================= */}
        <View sx={{
          mt: '$6',
          borderRadius: 12,
          borderWidth: 2,
          borderColor: isEligible ? '#BBF7D0' : '#FDE68A',
          backgroundColor: isEligible ? '#F0FDF4' : '#FFFBEB',
          p: '$5',
        }}>
          <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
            <View sx={{
              width: 40, height: 40, borderRadius: 20,
              backgroundColor: isEligible ? '#DCFCE7' : '#FEF3C7',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text sx={{ fontSize: 20 }}>
                {isEligible ? '\u2713' : '\u26A0'}
              </Text>
            </View>
            <View sx={{ flex: 1 }}>
              <Text sx={{
                fontSize: 16,
                fontWeight: 'bold',
                color: isEligible ? '#166534' : '#92400E',
              }}>
                {isEligible
                  ? 'You may be eligible for chemoprevention'
                  : 'You may not meet the standard threshold'}
              </Text>
            </View>
          </View>

          {/* Risk numbers */}
          <View sx={{
            mt: '$4',
            flexDirection: 'row',
            gap: '$4',
            flexWrap: 'wrap',
          }}>
            {fiveYearRisk != null && (
              <View sx={{
                backgroundColor: isEligible ? '#DCFCE7' : '#FEF3C7',
                borderRadius: 10,
                p: '$3',
                minWidth: 120,
                alignItems: 'center',
              }}>
                <Text sx={{ fontSize: 24, fontWeight: 'bold', color: isEligible ? '#166534' : '#92400E' }}>
                  {fiveYearRisk}%
                </Text>
                <Text sx={{ fontSize: 11, color: isEligible ? '#166534' : '#92400E', mt: 2 }}>
                  Your 5-year risk
                </Text>
              </View>
            )}
            {threshold != null && (
              <View sx={{
                backgroundColor: '#F1F5F9',
                borderRadius: 10,
                p: '$3',
                minWidth: 120,
                alignItems: 'center',
              }}>
                <Text sx={{ fontSize: 24, fontWeight: 'bold', color: '#475569' }}>
                  {threshold}%
                </Text>
                <Text sx={{ fontSize: 11, color: '#64748B', mt: 2 }}>
                  Eligibility threshold
                </Text>
              </View>
            )}
          </View>

          {/* Not eligible explanation */}
          {!isEligible && (
            <View sx={{ mt: '$4' }}>
              <Text sx={{ fontSize: 13, color: '#78350F', lineHeight: 20 }}>
                The standard threshold for chemoprevention eligibility is a 5-year breast cancer risk
                of {threshold ?? 1.67}% or higher (Gail model). Your current estimated risk falls
                below this threshold. However, risk models have limitations and your doctor may still
                recommend chemoprevention based on other factors such as family history, genetic
                mutations, or biopsy results showing atypical cells.
              </Text>
              <Text sx={{ mt: '$2', fontSize: 13, fontWeight: '600', color: '#92400E' }}>
                Discuss with your provider if you have concerns about your risk.
              </Text>
            </View>
          )}
        </View>

        {/* ============================================================= */}
        {/* Medication Comparison Cards */}
        {/* ============================================================= */}
        <View sx={{ mt: '$8' }}>
          <SectionHeader title="Medication Options" />
          <Text sx={{ mt: '$2', fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
            Four medications have been shown to reduce breast cancer risk in clinical trials
          </Text>

          <View sx={{ mt: '$4', gap: '$4' }}>
            {medications.map((med: any) => {
              const typeColors = TYPE_COLORS[med.type] ?? TYPE_COLORS.Other;
              const isExpanded = expandedMed === med.name;

              return (
                <View key={med.name} sx={{
                  borderWidth: 1,
                  borderColor: '$border',
                  borderRadius: 12,
                  overflow: 'hidden',
                }}>
                  {/* Medication header */}
                  <Pressable onPress={() => setExpandedMed(isExpanded ? null : med.name)}>
                    <View sx={{
                      backgroundColor: '#F8FAFC',
                      p: '$4',
                      borderBottomWidth: 1,
                      borderBottomColor: '$border',
                    }}>
                      <View sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View sx={{ flex: 1 }}>
                          <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2', flexWrap: 'wrap' }}>
                            <Text sx={{ fontSize: 16, fontWeight: 'bold', color: '$foreground' }}>
                              {med.name}
                            </Text>
                            <View sx={{
                              backgroundColor: typeColors.bg,
                              borderRadius: 8,
                              px: '$2',
                              py: 2,
                            }}>
                              <Text sx={{ fontSize: 10, fontWeight: '600', color: typeColors.fg }}>
                                {med.type}
                              </Text>
                            </View>
                          </View>
                          {med.eligiblePopulation && (
                            <Text sx={{ fontSize: 12, color: '$mutedForeground', mt: 2 }}>
                              {med.eligiblePopulation}
                            </Text>
                          )}
                        </View>
                        <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2' }}>
                          {/* Risk reduction green pill */}
                          {med.riskReduction && (
                            <View sx={{
                              backgroundColor: '#DCFCE7',
                              borderRadius: 12,
                              px: '$3',
                              py: 4,
                            }}>
                              <Text sx={{ fontSize: 12, fontWeight: 'bold', color: '#166534' }}>
                                {med.riskReduction}
                              </Text>
                            </View>
                          )}
                          <Text sx={{ fontSize: 16, color: '$mutedForeground' }}>
                            {isExpanded ? '\u2212' : '+'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </Pressable>

                  {/* Expanded details */}
                  {isExpanded && (
                    <View sx={{ p: '$5', gap: '$4' }}>
                      {/* Duration */}
                      {med.duration && (
                        <View sx={{ flexDirection: 'row', alignItems: 'flex-start', gap: '$3' }}>
                          <Text sx={{ fontSize: 14, mt: 1 }}>{'\u23F0'}</Text>
                          <View sx={{ flex: 1 }}>
                            <Text sx={{ fontSize: 12, fontWeight: '600', color: '$mutedForeground' }}>
                              Duration
                            </Text>
                            <Text sx={{ fontSize: 14, color: '$foreground', mt: 2 }}>
                              {med.duration}
                            </Text>
                          </View>
                        </View>
                      )}

                      {/* Side effects */}
                      {med.sideEffects && med.sideEffects.length > 0 && (
                        <View>
                          <Text sx={{ fontSize: 12, fontWeight: '600', color: '#92400E', mb: '$2' }}>
                            Potential Side Effects
                          </Text>
                          <View sx={{
                            backgroundColor: '#FFFBEB',
                            borderWidth: 1,
                            borderColor: '#FDE68A',
                            borderRadius: 10,
                            p: '$3',
                            gap: '$1',
                          }}>
                            {med.sideEffects.map((effect: string, i: number) => (
                              <View key={i} sx={{ flexDirection: 'row', gap: '$2', alignItems: 'flex-start' }}>
                                <Text sx={{ fontSize: 13, color: '#92400E' }}>{'\u2022'}</Text>
                                <Text sx={{ fontSize: 13, color: '#78350F', lineHeight: 20, flex: 1 }}>
                                  {effect}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}

                      {/* Contraindications */}
                      {med.contraindications && med.contraindications.length > 0 && (
                        <View>
                          <Text sx={{ fontSize: 12, fontWeight: '600', color: '#991B1B', mb: '$2' }}>
                            Contraindications
                          </Text>
                          <View sx={{
                            backgroundColor: '#FEF2F2',
                            borderWidth: 1,
                            borderColor: '#FECACA',
                            borderRadius: 10,
                            p: '$3',
                            gap: '$1',
                          }}>
                            {med.contraindications.map((ci: string, i: number) => (
                              <View key={i} sx={{ flexDirection: 'row', gap: '$2', alignItems: 'flex-start' }}>
                                <Text sx={{ fontSize: 13, color: '#991B1B' }}>{'\u2022'}</Text>
                                <Text sx={{ fontSize: 13, color: '#7F1D1D', lineHeight: 20, flex: 1 }}>
                                  {ci}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}

                      {/* Key trials */}
                      {med.keyTrials && med.keyTrials.length > 0 && (
                        <View>
                          <Text sx={{ fontSize: 12, fontWeight: '600', color: '$mutedForeground', mb: '$2' }}>
                            Key Clinical Trials
                          </Text>
                          <View sx={{ gap: '$1' }}>
                            {med.keyTrials.map((trial: string, i: number) => (
                              <Text key={i} sx={{
                                fontSize: 13,
                                color: '$foreground',
                                lineHeight: 20,
                                fontStyle: 'italic',
                              }}>
                                {'\u2022'} {trial}
                              </Text>
                            ))}
                          </View>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            })}

            {medications.length === 0 && (
              <View sx={{
                borderWidth: 2,
                borderStyle: 'dashed',
                borderColor: '$border',
                borderRadius: 12,
                p: '$5',
                alignItems: 'center',
              }}>
                <Text sx={{ fontSize: 14, color: '$mutedForeground', textAlign: 'center' }}>
                  No medication data available.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ============================================================= */}
        {/* Risk-Benefit Summary */}
        {/* ============================================================= */}
        {riskBenefitSummary && (
          <View sx={{ mt: '$8' }}>
            <SectionHeader title="Risk-Benefit Summary" />

            <View sx={{
              mt: '$4',
              borderWidth: 1,
              borderColor: '$border',
              borderRadius: 12,
              p: '$5',
            }}>
              <Text sx={{ fontSize: 14, color: '$foreground', lineHeight: 22 }}>
                {riskBenefitSummary}
              </Text>
            </View>
          </View>
        )}

        {/* ============================================================= */}
        {/* Discussion Guide */}
        {/* ============================================================= */}
        <View sx={{ mt: '$8' }}>
          <SectionHeader title="Discussion Guide" />

          {guideLoading ? (
            <View sx={{ mt: '$4', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <ActivityIndicator size="small" />
              <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading guide...</Text>
            </View>
          ) : guide ? (
            <View sx={{ mt: '$4', gap: '$5' }}>
              {/* Overview */}
              {guide.overview && (
                <View sx={{
                  borderLeftWidth: 4,
                  borderLeftColor: '#6366F1',
                  backgroundColor: '#EEF2FF',
                  borderRadius: 0,
                  borderTopRightRadius: 12,
                  borderBottomRightRadius: 12,
                  p: '$5',
                }}>
                  <Text sx={{ fontSize: 12, fontWeight: '600', color: '#4338CA', mb: '$2' }}>
                    OVERVIEW
                  </Text>
                  <Text sx={{ fontSize: 14, color: '#312E81', lineHeight: 22 }}>
                    {guide.overview}
                  </Text>
                </View>
              )}

              {/* Per-medication detailed info */}
              {guide.medications && (guide.medications as any[]).length > 0 && (
                <View sx={{ gap: '$3' }}>
                  <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
                    Medication-Specific Details
                  </Text>
                  {(guide.medications as any[]).map((detail: any, i: number) => (
                    <View key={detail.name ?? i} sx={{
                      borderWidth: 1,
                      borderColor: '#C7D2FE',
                      backgroundColor: '#F5F3FF',
                      borderRadius: 10,
                      p: '$4',
                    }}>
                      <Text sx={{ fontSize: 14, fontWeight: 'bold', color: '#3730A3' }}>
                        {detail.name}
                      </Text>
                      {detail.personalizedNote && (
                        <Text sx={{ mt: '$2', fontSize: 13, color: '#4338CA', lineHeight: 20 }}>
                          {detail.personalizedNote}
                        </Text>
                      )}
                      {detail.considerations && (
                        <Text sx={{ mt: '$2', fontSize: 13, color: '#5B21B6', lineHeight: 20 }}>
                          {detail.considerations}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              )}

              {/* Questions for doctor */}
              {guide.questionsForDoctor && (guide.questionsForDoctor as string[]).length > 0 && (
                <View>
                  <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground', mb: '$3' }}>
                    Questions for Your Doctor
                  </Text>
                  <View sx={{ gap: '$2' }}>
                    {(guide.questionsForDoctor as string[]).map((question: string, i: number) => (
                      <View key={i} sx={{
                        borderWidth: 1,
                        borderColor: '$border',
                        borderRadius: 10,
                        p: '$4',
                        flexDirection: 'row',
                        gap: '$3',
                      }}>
                        <View sx={{
                          width: 28, height: 28, borderRadius: 14,
                          backgroundColor: '#DBEAFE',
                          alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <Text sx={{ fontSize: 13, fontWeight: 'bold', color: '#1E40AF' }}>
                            {i + 1}
                          </Text>
                        </View>
                        <Text sx={{ fontSize: 14, color: '$foreground', lineHeight: 22, flex: 1 }}>
                          {question}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Guide generated date */}
              {guide.generatedAt && (
                <Text sx={{ fontSize: 11, color: '$mutedForeground' }}>
                  Guide generated {new Date(guide.generatedAt).toLocaleDateString()}
                </Text>
              )}
            </View>
          ) : (
            <View sx={{ mt: '$4' }}>
              <View sx={{
                backgroundColor: '#F0F9FF',
                borderWidth: 1,
                borderColor: '#BAE6FD',
                borderRadius: 12,
                p: '$5',
              }}>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: '#0C4A6E' }}>
                  Get a personalized discussion guide
                </Text>
                <Text sx={{ mt: '$2', fontSize: 13, color: '#075985', lineHeight: 20 }}>
                  We will analyze your risk profile, medications, and medical history to generate
                  personalized talking points, medication comparisons, and questions tailored
                  for your doctor conversation.
                </Text>
              </View>

              {generating ? (
                <View sx={{
                  mt: '$4',
                  borderWidth: 1,
                  borderColor: '$border',
                  borderRadius: 12,
                  p: '$6',
                  alignItems: 'center',
                }}>
                  <ActivityIndicator size="large" />
                  <Text sx={{ mt: '$4', fontSize: 14, fontWeight: '600', color: '$foreground' }}>
                    Generating your discussion guide...
                  </Text>
                  <Text sx={{ mt: '$2', fontSize: 13, color: '$mutedForeground', textAlign: 'center' }}>
                    Analyzing your risk factors, eligible medications, and medical context
                  </Text>
                </View>
              ) : (
                <Pressable onPress={() => generateGuide()}>
                  <View sx={{
                    mt: '$4',
                    backgroundColor: 'blue600',
                    borderRadius: 8,
                    py: '$3',
                    alignItems: 'center',
                  }}>
                    <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                      Generate Discussion Guide
                    </Text>
                  </View>
                </Pressable>
              )}
            </View>
          )}
        </View>

        {/* ============================================================= */}
        {/* Disclaimer */}
        {/* ============================================================= */}
        <View sx={{
          mt: '$8',
          backgroundColor: '#FFFBEB',
          borderWidth: 1,
          borderColor: '#FDE68A',
          borderRadius: 12,
          p: '$5',
        }}>
          <Text sx={{ fontSize: 13, fontWeight: '600', color: '#92400E' }}>
            Important disclaimer
          </Text>
          <Text sx={{ mt: '$2', fontSize: 12, color: '#78350F', lineHeight: 18 }}>
            This chemoprevention information is AI-generated and based on published clinical guidelines
            and trial data. It is for educational purposes only and does not constitute medical advice.
            Chemoprevention medications have real risks and benefits that must be carefully evaluated
            with your healthcare provider. Only your doctor can determine whether chemoprevention is
            appropriate for your individual situation.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function SectionHeader({ title }: { title: string }) {
  return (
    <View sx={{ borderBottomWidth: 1, borderBottomColor: '$border', pb: '$3' }}>
      <Text sx={{ fontSize: 20, fontWeight: 'bold', color: '$foreground' }}>{title}</Text>
    </View>
  );
}
