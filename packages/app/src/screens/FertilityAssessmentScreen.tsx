import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import {
  useGetFertilityAssessmentQuery,
  useAssessFertilityRiskMutation,
  GetFertilityAssessmentDocument,
} from '../generated/graphql';

// ============================================================================
// Constants
// ============================================================================

const RISK_COLORS: Record<string, { bg: string; fg: string }> = {
  high: { bg: '#FEE2E2', fg: '#991B1B' },
  moderate: { bg: '#FEF3C7', fg: '#92400E' },
  low: { bg: '#DCFCE7', fg: '#166534' },
  minimal: { bg: '#DCFCE7', fg: '#166534' },
};

const WINDOW_LABELS: Record<string, { label: string; bg: string; fg: string }> = {
  open: { label: 'Open', bg: '#DCFCE7', fg: '#166534' },
  closing: { label: 'Closing', bg: '#FEF3C7', fg: '#92400E' },
  closed: { label: 'Closed', bg: '#FEE2E2', fg: '#991B1B' },
};

// ============================================================================
// Component
// ============================================================================

export function FertilityAssessmentScreen() {
  const { data, loading } = useGetFertilityAssessmentQuery({ errorPolicy: 'ignore' });
  const [assessRisk, { loading: assessing }] = useAssessFertilityRiskMutation({
    refetchQueries: [{ query: GetFertilityAssessmentDocument }],
  });

  const assessment = data?.fertilityAssessment;

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Fertility Risk Assessment
        </Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading assessment...</Text>
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
            Fertility Risk Assessment
          </Text>
          <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
            Understand the impact of your planned treatment on fertility
          </Text>

          <View sx={{
            mt: '$6',
            backgroundColor: '#F0F9FF',
            borderWidth: 1,
            borderColor: '#BAE6FD',
            borderRadius: 12,
            p: '$5',
          }}>
            <Text sx={{ fontSize: 15, fontWeight: '600', color: '#0C4A6E' }}>
              What this assessment covers
            </Text>
            <View sx={{ mt: '$3', gap: '$2' }}>
              {[
                'Your specific chemotherapy agents and their gonadotoxicity risk levels',
                'Amenorrhea rates for each agent in your regimen',
                'Your preservation window based on treatment start date',
                'Personalized recommendation based on cancer type, age, and treatment plan',
                'Special considerations for hormone-receptor positive cancers',
              ].map((item, i) => (
                <View key={i} sx={{ flexDirection: 'row', gap: '$2', alignItems: 'flex-start' }}>
                  <View sx={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#0284C7', mt: 7 }} />
                  <Text sx={{ fontSize: 13, color: '#075985', lineHeight: 20, flex: 1 }}>
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <Pressable
            onPress={() => assessRisk()}
            disabled={assessing}
          >
            <View sx={{
              mt: '$5',
              backgroundColor: assessing ? '#9CA3AF' : 'blue600',
              borderRadius: 8,
              py: '$3',
              alignItems: 'center',
            }}>
              {assessing ? (
                <View sx={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <ActivityIndicator color="white" size="small" />
                  <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                    Analyzing your treatment plan...
                  </Text>
                </View>
              ) : (
                <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                  Run Assessment
                </Text>
              )}
            </View>
          </Pressable>

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
              This AI-generated assessment analyzes known gonadotoxicity data for your treatment
              regimen. It must be reviewed with your oncologist and a reproductive endocrinologist
              before making any fertility preservation decisions.
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  // Assessment exists — show results
  const riskColors = RISK_COLORS[assessment.gonadotoxicityRisk] ?? RISK_COLORS.moderate;
  const windowInfo = WINDOW_LABELS[assessment.windowStatus] ?? WINDOW_LABELS.open;

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Fertility Risk Assessment
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          Assessed on {new Date(assessment.createdAt).toLocaleDateString()}
        </Text>

        {/* ============================================================= */}
        {/* Risk Level Badge */}
        {/* ============================================================= */}
        <View sx={{
          mt: '$6',
          borderRadius: 12,
          borderWidth: 2,
          borderColor: riskColors.bg,
          backgroundColor: riskColors.bg,
          p: '$5',
        }}>
          <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
            <View sx={{
              backgroundColor: riskColors.fg,
              borderRadius: 20,
              px: '$4',
              py: '$2',
            }}>
              <Text sx={{ fontSize: 14, fontWeight: 'bold', color: 'white', textTransform: 'uppercase' }}>
                {assessment.gonadotoxicityRisk} risk
              </Text>
            </View>
          </View>
          <Text sx={{ mt: '$3', fontSize: 14, color: riskColors.fg, lineHeight: 22 }}>
            Your planned treatment carries a {assessment.gonadotoxicityRisk} risk of impacting
            your fertility based on the agents in your regimen.
          </Text>
        </View>

        {/* ============================================================= */}
        {/* Risk Factors */}
        {/* ============================================================= */}
        <View sx={{ mt: '$6' }}>
          <SectionHeader title="Treatment Agents & Risk" />

          <View sx={{ mt: '$4', gap: '$3' }}>
            {assessment.riskFactors.map((factor, i) => {
              const factorColors = RISK_COLORS[factor.risk] ?? RISK_COLORS.moderate;
              return (
                <View key={i} sx={{
                  borderWidth: 1,
                  borderColor: '$border',
                  borderRadius: 12,
                  p: '$4',
                }}>
                  <View sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text sx={{ fontSize: 15, fontWeight: '600', color: '$foreground', flex: 1 }}>
                      {factor.agent}
                    </Text>
                    <View sx={{
                      backgroundColor: factorColors.bg,
                      borderRadius: 12,
                      px: '$2',
                      py: 3,
                    }}>
                      <Text sx={{ fontSize: 11, fontWeight: '600', color: factorColors.fg, textTransform: 'uppercase' }}>
                        {factor.risk}
                      </Text>
                    </View>
                  </View>
                  {factor.amenorrheaRate && (
                    <Text sx={{ mt: '$2', fontSize: 13, color: '$mutedForeground' }}>
                      Amenorrhea rate: {factor.amenorrheaRate}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* ============================================================= */}
        {/* Recommendation */}
        {/* ============================================================= */}
        <View sx={{ mt: '$6' }}>
          <SectionHeader title="Recommendation" />

          <View sx={{
            mt: '$4',
            borderWidth: 1,
            borderColor: '#C7D2FE',
            backgroundColor: '#EEF2FF',
            borderRadius: 12,
            p: '$5',
          }}>
            <Text sx={{ fontSize: 14, color: '#3730A3', lineHeight: 22 }}>
              {assessment.recommendation}
            </Text>
          </View>

          {assessment.recommendationRationale && (
            <View sx={{
              mt: '$3',
              backgroundColor: '#F8FAFC',
              borderWidth: 1,
              borderColor: '$border',
              borderRadius: 12,
              p: '$4',
            }}>
              <Text sx={{ fontSize: 12, fontWeight: '600', color: '$mutedForeground' }}>
                Rationale
              </Text>
              <Text sx={{ mt: '$2', fontSize: 13, color: '$foreground', lineHeight: 20 }}>
                {assessment.recommendationRationale}
              </Text>
            </View>
          )}
        </View>

        {/* ============================================================= */}
        {/* Special Considerations (ER+ letrozole note) */}
        {/* ============================================================= */}
        {assessment.recommendationRationale &&
          (assessment.recommendationRationale.toLowerCase().includes('er+') ||
           assessment.recommendationRationale.toLowerCase().includes('estrogen receptor') ||
           assessment.recommendationRationale.toLowerCase().includes('letrozole') ||
           assessment.recommendationRationale.toLowerCase().includes('hormone receptor')) && (
          <View sx={{ mt: '$4' }}>
            <View sx={{
              borderWidth: 1,
              borderColor: '#FBCFE8',
              backgroundColor: '#FDF2F8',
              borderRadius: 12,
              p: '$5',
            }}>
              <Text sx={{ fontSize: 14, fontWeight: '600', color: '#9D174D' }}>
                ER+ Special Consideration
              </Text>
              <Text sx={{ mt: '$2', fontSize: 13, color: '#831843', lineHeight: 20 }}>
                For hormone receptor-positive cancers, letrozole-based stimulation protocols are
                available. These protocols keep estrogen levels low during egg retrieval and have
                been shown to be safe in ER+ breast cancer patients. Ask your reproductive
                endocrinologist about letrozole co-stimulation.
              </Text>
            </View>
          </View>
        )}

        {/* ============================================================= */}
        {/* Window Status */}
        {/* ============================================================= */}
        <View sx={{ mt: '$6' }}>
          <SectionHeader title="Preservation Window" />

          <View sx={{
            mt: '$4',
            borderWidth: 1,
            borderColor: '$border',
            borderRadius: 12,
            p: '$5',
          }}>
            <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
              <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
                Window Status:
              </Text>
              <View sx={{
                backgroundColor: windowInfo.bg,
                borderRadius: 12,
                px: '$3',
                py: 4,
              }}>
                <Text sx={{
                  fontSize: 12,
                  fontWeight: 'bold',
                  color: windowInfo.fg,
                  textTransform: 'uppercase',
                }}>
                  {windowInfo.label}
                </Text>
              </View>
            </View>
            {assessment.preservationWindowDays != null && (
              <Text sx={{ mt: '$3', fontSize: 14, color: '$foreground', lineHeight: 22 }}>
                {assessment.windowStatus === 'closed'
                  ? 'Your treatment has started or is imminent. Talk to your oncologist about GnRH agonist protection.'
                  : `Approximately ${assessment.preservationWindowDays} days remain before your treatment begins.`}
              </Text>
            )}
          </View>
        </View>

        {/* Navigation */}
        <View sx={{ mt: '$6', flexDirection: 'row', flexWrap: 'wrap', gap: '$3' }}>
          <Link href="/fertility">
            <View sx={{
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '$border',
              px: '$4',
              py: '$3',
            }}>
              <Text sx={{ fontSize: 13, fontWeight: '500', color: '$foreground' }}>
                {'\u2190'} Dashboard
              </Text>
            </View>
          </Link>
          <Link href="/fertility/options">
            <View sx={{
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '$border',
              px: '$4',
              py: '$3',
            }}>
              <Text sx={{ fontSize: 13, fontWeight: '500', color: '$foreground' }}>
                View Options {'\u2192'}
              </Text>
            </View>
          </Link>
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
            This assessment is AI-generated based on published gonadotoxicity data and your
            treatment plan. Individual results may vary. Always discuss fertility preservation
            with your oncologist and a reproductive endocrinologist.
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
