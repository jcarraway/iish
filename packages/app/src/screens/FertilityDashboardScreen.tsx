import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import {
  useGetFertilityAssessmentQuery,
  useAssessFertilityRiskMutation,
  useUpdateFertilityOutcomeMutation,
  GetFertilityAssessmentDocument,
} from '../generated/graphql';
import { Picker } from '../components/Picker';

// ============================================================================
// Constants
// ============================================================================

const RISK_COLORS: Record<string, { bg: string; fg: string; border: string }> = {
  high: { bg: '#FEE2E2', fg: '#991B1B', border: '#FCA5A5' },
  moderate: { bg: '#FEF3C7', fg: '#92400E', border: '#FDE68A' },
  low: { bg: '#DCFCE7', fg: '#166534', border: '#BBF7D0' },
  minimal: { bg: '#DCFCE7', fg: '#166534', border: '#BBF7D0' },
};

const WINDOW_CARDS: Record<string, { bg: string; fg: string; border: string }> = {
  closed: { bg: '#FEE2E2', fg: '#991B1B', border: '#FCA5A5' },
  closing: { bg: '#FEF3C7', fg: '#92400E', border: '#FDE68A' },
  open: { bg: '#DCFCE7', fg: '#166534', border: '#BBF7D0' },
};

const OUTCOME_METHOD_OPTIONS = [
  { label: 'Select method', value: '' },
  { label: 'Egg freezing (oocyte cryopreservation)', value: 'egg_freezing' },
  { label: 'Embryo freezing', value: 'embryo_freezing' },
  { label: 'Ovarian tissue freezing', value: 'ovarian_tissue' },
  { label: 'Sperm banking', value: 'sperm_banking' },
  { label: 'GnRH agonist only', value: 'gnrh_agonist' },
  { label: 'Other', value: 'other' },
];

// ============================================================================
// Component
// ============================================================================

export function FertilityDashboardScreen() {
  const { data, loading, refetch } = useGetFertilityAssessmentQuery({ errorPolicy: 'ignore' });
  const [assessRisk, { loading: assessing }] = useAssessFertilityRiskMutation({
    refetchQueries: [{ query: GetFertilityAssessmentDocument }],
  });
  const [updateOutcome, { loading: updatingOutcome }] = useUpdateFertilityOutcomeMutation({
    onCompleted: () => refetch(),
  });

  const assessment = data?.fertilityAssessment;

  // Outcome tracking form state
  const [showOutcomeForm, setShowOutcomeForm] = useState(false);
  const [outcomePursued, setOutcomePursued] = useState<boolean | null>(null);
  const [outcomeMethod, setOutcomeMethod] = useState('');
  const [outcomeCompleted, setOutcomeCompleted] = useState<boolean | null>(null);

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Fertility Preservation
        </Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading your fertility assessment...</Text>
        </View>
      </View>
    );
  }

  // No assessment yet
  if (!assessment) {
    return (
      <ScrollView sx={{ flex: 1 }}>
        <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
          <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
            Fertility Preservation
          </Text>
          <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
            Understand your fertility risks and preservation options before treatment begins
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
            <Text sx={{ fontSize: 36 }}>{'🌸'}</Text>
            <Text sx={{ mt: '$3', fontWeight: '600', color: '$foreground', textAlign: 'center' }}>
              Assess your fertility risk
            </Text>
            <Text sx={{
              mt: '$2', fontSize: 14, color: '$mutedForeground',
              textAlign: 'center', maxWidth: 400,
            }}>
              Based on your diagnosis and planned treatment, we will assess the risk to your fertility
              and identify your preservation window.
            </Text>
            <Pressable
              onPress={() => assessRisk()}
              disabled={assessing}
            >
              <View sx={{
                mt: '$5',
                backgroundColor: assessing ? '#9CA3AF' : 'blue600',
                borderRadius: 8,
                px: '$6',
                py: '$3',
              }}>
                {assessing ? (
                  <View sx={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <ActivityIndicator color="white" size="small" />
                    <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                      Analyzing...
                    </Text>
                  </View>
                ) : (
                  <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                    Assess my fertility risk
                  </Text>
                )}
              </View>
            </Pressable>
          </View>

          {/* Educational note */}
          <View sx={{
            mt: '$6',
            backgroundColor: '#F0F9FF',
            borderWidth: 1,
            borderColor: '#BAE6FD',
            borderRadius: 12,
            p: '$5',
          }}>
            <Text sx={{ fontSize: 14, fontWeight: '600', color: '#0C4A6E' }}>
              Why timing matters
            </Text>
            <Text sx={{ mt: '$2', fontSize: 13, color: '#075985', lineHeight: 20 }}>
              Fertility preservation must happen before treatment begins. Some options require as
              little as 2 weeks, but the window is limited. Getting your assessment early gives you
              the most options.
            </Text>
          </View>

          {/* Disclaimer */}
          <View sx={{
            mt: '$6',
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
              This assessment is AI-generated and must be reviewed with your oncologist and a
              reproductive endocrinologist. It is not a substitute for professional medical advice.
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  // Determine window status card colors
  const windowColors = assessment.windowStatus === 'closed' ? WINDOW_CARDS.closed
    : assessment.windowStatus === 'closing' ? WINDOW_CARDS.closing
    : WINDOW_CARDS.open;

  const riskColors = RISK_COLORS[assessment.gonadotoxicityRisk] ?? RISK_COLORS.moderate;

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Fertility Preservation
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          Your fertility risk assessment and preservation options
        </Text>

        {/* ============================================================= */}
        {/* Risk Alert Card */}
        {/* ============================================================= */}
        <View sx={{
          mt: '$6',
          borderRadius: 12,
          borderWidth: 2,
          borderColor: windowColors.border,
          backgroundColor: windowColors.bg,
          p: '$5',
        }}>
          {assessment.windowStatus === 'closed' && (
            <>
              <Text sx={{ fontSize: 16, fontWeight: 'bold', color: windowColors.fg }}>
                Your preservation window has closed
              </Text>
              <Text sx={{ mt: '$2', fontSize: 13, color: windowColors.fg, lineHeight: 20 }}>
                Talk to your oncologist about GnRH agonist protection during treatment and
                future fertility options after treatment completion.
              </Text>
            </>
          )}
          {assessment.windowStatus === 'closing' && (
            <>
              <Text sx={{ fontSize: 16, fontWeight: 'bold', color: windowColors.fg }}>
                Time-sensitive: approximately {assessment.preservationWindowDays} days before treatment starts
              </Text>
              <Text sx={{ mt: '$2', fontSize: 13, color: windowColors.fg, lineHeight: 20 }}>
                Your preservation window is narrowing. Contact a fertility specialist as soon as
                possible to discuss your options.
              </Text>
            </>
          )}
          {assessment.windowStatus !== 'closed' && assessment.windowStatus !== 'closing' && (
            <>
              <Text sx={{ fontSize: 16, fontWeight: 'bold', color: windowColors.fg }}>
                {assessment.gonadotoxicityRisk === 'low' || assessment.gonadotoxicityRisk === 'minimal'
                  ? 'Your treatment carries a lower fertility risk'
                  : 'Preservation window is open'}
              </Text>
              <Text sx={{ mt: '$2', fontSize: 13, color: windowColors.fg, lineHeight: 20 }}>
                {assessment.preservationWindowDays != null
                  ? `You have approximately ${assessment.preservationWindowDays} days before treatment starts. Review your options and connect with a specialist.`
                  : 'Review your options and connect with a fertility specialist to discuss next steps.'}
              </Text>
            </>
          )}
        </View>

        {/* ============================================================= */}
        {/* Window Countdown */}
        {/* ============================================================= */}
        {assessment.preservationWindowDays != null && assessment.windowStatus !== 'closed' && (
          <View sx={{
            mt: '$4',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '$border',
            p: '$5',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '$4',
          }}>
            <View sx={{
              width: 56, height: 56, borderRadius: 28,
              backgroundColor: assessment.windowStatus === 'closing' ? '#FEF3C7' : '#DBEAFE',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text sx={{
                fontSize: 22, fontWeight: 'bold',
                color: assessment.windowStatus === 'closing' ? '#92400E' : '#1E40AF',
              }}>
                {assessment.preservationWindowDays}
              </Text>
            </View>
            <View sx={{ flex: 1 }}>
              <Text sx={{ fontSize: 15, fontWeight: '600', color: '$foreground' }}>
                Days before treatment starts
              </Text>
              <Text sx={{ fontSize: 13, color: '$mutedForeground', mt: '$1' }}>
                This is your window for fertility preservation procedures
              </Text>
            </View>
          </View>
        )}

        {/* ============================================================= */}
        {/* Assessment Summary */}
        {/* ============================================================= */}
        <View sx={{ mt: '$6' }}>
          <SectionHeader title="Your Assessment" />

          <View sx={{
            mt: '$4',
            borderWidth: 1,
            borderColor: '$border',
            borderRadius: 12,
            p: '$5',
          }}>
            <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
              <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
                Gonadotoxicity Risk:
              </Text>
              <View sx={{
                backgroundColor: riskColors.bg,
                borderRadius: 12,
                px: '$3',
                py: 4,
              }}>
                <Text sx={{
                  fontSize: 12,
                  fontWeight: 'bold',
                  color: riskColors.fg,
                  textTransform: 'uppercase',
                }}>
                  {assessment.gonadotoxicityRisk}
                </Text>
              </View>
            </View>

            <View sx={{ mt: '$4' }}>
              <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
                Recommendation
              </Text>
              <Text sx={{ mt: '$2', fontSize: 14, color: '$foreground', lineHeight: 22 }}>
                {assessment.recommendation}
              </Text>
            </View>

            {assessment.recommendationRationale && (
              <View sx={{
                mt: '$4',
                backgroundColor: '#F8FAFC',
                borderRadius: 8,
                p: '$4',
              }}>
                <Text sx={{ fontSize: 12, fontWeight: '600', color: '$mutedForeground' }}>
                  Rationale
                </Text>
                <Text sx={{ mt: '$1', fontSize: 13, color: '$foreground', lineHeight: 20 }}>
                  {assessment.recommendationRationale}
                </Text>
              </View>
            )}

            <Text sx={{ mt: '$3', fontSize: 11, color: '$mutedForeground' }}>
              Assessment created {new Date(assessment.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* ============================================================= */}
        {/* Quick Actions */}
        {/* ============================================================= */}
        <View sx={{ mt: '$6' }}>
          <SectionHeader title="Next Steps" />

          <View sx={{ mt: '$4', gap: '$3' }}>
            <Link href="/fertility/options">
              <View sx={{
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '$border',
                p: '$5',
              }}>
                <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
                  <View sx={{
                    width: 40, height: 40, borderRadius: 10,
                    backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text sx={{ fontSize: 18 }}>{'🧊'}</Text>
                  </View>
                  <View sx={{ flex: 1 }}>
                    <Text sx={{ fontSize: 15, fontWeight: '600', color: '$foreground' }}>
                      View Preservation Options
                    </Text>
                    <Text sx={{ fontSize: 12, color: '$mutedForeground', mt: 2 }}>
                      Compare methods, timing, costs, and success rates
                    </Text>
                  </View>
                  <Text sx={{ fontSize: 16, color: '$mutedForeground' }}>{'\u2192'}</Text>
                </View>
              </View>
            </Link>

            <Link href="/fertility/providers">
              <View sx={{
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '$border',
                p: '$5',
              }}>
                <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
                  <View sx={{
                    width: 40, height: 40, borderRadius: 10,
                    backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text sx={{ fontSize: 18 }}>{'👩\u200D\u2695\uFE0F'}</Text>
                  </View>
                  <View sx={{ flex: 1 }}>
                    <Text sx={{ fontSize: 15, fontWeight: '600', color: '$foreground' }}>
                      Find Oncofertility Providers
                    </Text>
                    <Text sx={{ fontSize: 12, color: '$mutedForeground', mt: 2 }}>
                      Specialists experienced with cancer patients
                    </Text>
                  </View>
                  <Text sx={{ fontSize: 16, color: '$mutedForeground' }}>{'\u2192'}</Text>
                </View>
              </View>
            </Link>

            <Link href="/fertility/guide">
              <View sx={{
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '$border',
                p: '$5',
              }}>
                <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
                  <View sx={{
                    width: 40, height: 40, borderRadius: 10,
                    backgroundColor: '#FCE7F3', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text sx={{ fontSize: 18 }}>{'💬'}</Text>
                  </View>
                  <View sx={{ flex: 1 }}>
                    <Text sx={{ fontSize: 15, fontWeight: '600', color: '$foreground' }}>
                      Discussion Guide
                    </Text>
                    <Text sx={{ fontSize: 12, color: '$mutedForeground', mt: 2 }}>
                      Personalized questions for your oncologist conversation
                    </Text>
                  </View>
                  <Text sx={{ fontSize: 16, color: '$mutedForeground' }}>{'\u2192'}</Text>
                </View>
              </View>
            </Link>
          </View>
        </View>

        {/* ============================================================= */}
        {/* Outcome Tracking */}
        {/* ============================================================= */}
        {assessment.preservationPursued != null ? (
          <View sx={{ mt: '$6' }}>
            <SectionHeader title="Preservation Outcome" />

            <View sx={{
              mt: '$4',
              borderWidth: 1,
              borderColor: '$border',
              borderRadius: 12,
              p: '$5',
            }}>
              <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
                <View sx={{
                  width: 10, height: 10, borderRadius: 5,
                  backgroundColor: assessment.preservationPursued ? '#22C55E' : '#9CA3AF',
                }} />
                <Text sx={{ fontSize: 15, fontWeight: '600', color: '$foreground' }}>
                  {assessment.preservationPursued
                    ? 'Preservation pursued'
                    : 'Preservation not pursued'}
                </Text>
              </View>
              {assessment.preservationMethod && (
                <Text sx={{ mt: '$2', fontSize: 13, color: '$mutedForeground' }}>
                  Method: {assessment.preservationMethod.replace(/_/g, ' ')}
                </Text>
              )}
              {assessment.preservationCompleted != null && (
                <View sx={{ mt: '$2', flexDirection: 'row', alignItems: 'center', gap: '$2' }}>
                  <View sx={{
                    width: 8, height: 8, borderRadius: 4,
                    backgroundColor: assessment.preservationCompleted ? '#22C55E' : '#F59E0B',
                  }} />
                  <Text sx={{ fontSize: 13, color: '$mutedForeground' }}>
                    {assessment.preservationCompleted ? 'Completed' : 'In progress'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          <View sx={{ mt: '$6' }}>
            <SectionHeader title="Track Your Outcome" />

            {!showOutcomeForm ? (
              <Pressable onPress={() => setShowOutcomeForm(true)}>
                <View sx={{
                  mt: '$4',
                  borderWidth: 2,
                  borderStyle: 'dashed',
                  borderColor: '$border',
                  borderRadius: 12,
                  p: '$5',
                  alignItems: 'center',
                }}>
                  <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground', textAlign: 'center' }}>
                    Record your preservation decision
                  </Text>
                  <Text sx={{ mt: '$2', fontSize: 13, color: '$mutedForeground', textAlign: 'center', maxWidth: 360 }}>
                    Whether you pursued preservation or not, tracking your outcome helps us provide
                    better guidance throughout your journey.
                  </Text>
                </View>
              </Pressable>
            ) : (
              <View sx={{
                mt: '$4',
                borderWidth: 1,
                borderColor: '$border',
                borderRadius: 12,
                p: '$5',
              }}>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground', mb: '$4' }}>
                  Record your decision
                </Text>

                <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground', mb: '$2' }}>
                  Did you pursue fertility preservation?
                </Text>
                <View sx={{ flexDirection: 'row', gap: '$2', mb: '$4' }}>
                  <Pressable onPress={() => setOutcomePursued(true)}>
                    <View sx={{
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: outcomePursued === true ? 'blue600' : '$border',
                      backgroundColor: outcomePursued === true ? '#DBEAFE' : 'transparent',
                      px: '$4',
                      py: '$2',
                    }}>
                      <Text sx={{
                        fontSize: 13,
                        color: outcomePursued === true ? '#1E40AF' : '$mutedForeground',
                      }}>
                        Yes
                      </Text>
                    </View>
                  </Pressable>
                  <Pressable onPress={() => { setOutcomePursued(false); setOutcomeMethod(''); }}>
                    <View sx={{
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: outcomePursued === false ? 'blue600' : '$border',
                      backgroundColor: outcomePursued === false ? '#DBEAFE' : 'transparent',
                      px: '$4',
                      py: '$2',
                    }}>
                      <Text sx={{
                        fontSize: 13,
                        color: outcomePursued === false ? '#1E40AF' : '$mutedForeground',
                      }}>
                        No
                      </Text>
                    </View>
                  </Pressable>
                </View>

                {outcomePursued && (
                  <>
                    <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground', mb: '$2' }}>
                      Which method?
                    </Text>
                    <View sx={{ mb: '$4' }}>
                      <Picker
                        value={outcomeMethod}
                        onValueChange={setOutcomeMethod}
                        options={OUTCOME_METHOD_OPTIONS}
                      />
                    </View>

                    <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground', mb: '$2' }}>
                      Has the procedure been completed?
                    </Text>
                    <View sx={{ flexDirection: 'row', gap: '$2', mb: '$4' }}>
                      <Pressable onPress={() => setOutcomeCompleted(true)}>
                        <View sx={{
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: outcomeCompleted === true ? 'blue600' : '$border',
                          backgroundColor: outcomeCompleted === true ? '#DBEAFE' : 'transparent',
                          px: '$4',
                          py: '$2',
                        }}>
                          <Text sx={{
                            fontSize: 13,
                            color: outcomeCompleted === true ? '#1E40AF' : '$mutedForeground',
                          }}>
                            Yes
                          </Text>
                        </View>
                      </Pressable>
                      <Pressable onPress={() => setOutcomeCompleted(false)}>
                        <View sx={{
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: outcomeCompleted === false ? 'blue600' : '$border',
                          backgroundColor: outcomeCompleted === false ? '#DBEAFE' : 'transparent',
                          px: '$4',
                          py: '$2',
                        }}>
                          <Text sx={{
                            fontSize: 13,
                            color: outcomeCompleted === false ? '#1E40AF' : '$mutedForeground',
                          }}>
                            Not yet
                          </Text>
                        </View>
                      </Pressable>
                    </View>
                  </>
                )}

                <View sx={{ flexDirection: 'row', gap: '$2' }}>
                  <Pressable
                    onPress={() => {
                      if (outcomePursued == null) return;
                      updateOutcome({
                        variables: {
                          input: {
                            assessmentId: assessment.id,
                            preservationPursued: outcomePursued,
                            ...(outcomePursued && outcomeMethod ? { preservationMethod: outcomeMethod } : {}),
                            ...(outcomePursued && outcomeCompleted != null ? { preservationCompleted: outcomeCompleted } : {}),
                          },
                        },
                      });
                    }}
                    disabled={outcomePursued == null || updatingOutcome}
                  >
                    <View sx={{
                      backgroundColor: outcomePursued == null ? '#9CA3AF' : 'blue600',
                      borderRadius: 8,
                      px: '$4',
                      py: '$3',
                    }}>
                      <Text sx={{ fontSize: 13, fontWeight: '600', color: 'white' }}>
                        {updatingOutcome ? 'Saving...' : 'Save'}
                      </Text>
                    </View>
                  </Pressable>
                  <Pressable onPress={() => {
                    setShowOutcomeForm(false);
                    setOutcomePursued(null);
                    setOutcomeMethod('');
                    setOutcomeCompleted(null);
                  }}>
                    <View sx={{
                      borderWidth: 1,
                      borderColor: '$border',
                      borderRadius: 8,
                      px: '$4',
                      py: '$3',
                    }}>
                      <Text sx={{ fontSize: 13, color: '$mutedForeground' }}>Cancel</Text>
                    </View>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Disclaimer */}
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
            This fertility assessment is AI-generated and must be reviewed with your oncologist and a
            reproductive endocrinologist. Treatment plans and fertility risks can change. Always consult
            your medical team before making fertility preservation decisions.
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
