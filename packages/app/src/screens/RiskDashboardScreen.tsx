import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import {
  useGetLatestRiskQuery,
  useGetRiskAssessmentsQuery,
  useGetPreventProfileQuery,
} from '../generated/graphql';

// ============================================================================
// Constants
// ============================================================================

const RISK_CATEGORIES: Record<string, { bg: string; fg: string; border: string; label: string; description: string }> = {
  average: {
    bg: '#DCFCE7', fg: '#166534', border: '#BBF7D0',
    label: 'Average',
    description: 'Your estimated risk is similar to the general population.',
  },
  slightly_elevated: {
    bg: '#FEF9C3', fg: '#854D0E', border: '#FDE047',
    label: 'Slightly Elevated',
    description: 'Your risk is modestly above average. Standard screening recommended.',
  },
  moderate: {
    bg: '#FFF7ED', fg: '#9A3412', border: '#FDBA74',
    label: 'Moderate',
    description: 'Enhanced screening may be beneficial. Discuss with your provider.',
  },
  high: {
    bg: '#FEE2E2', fg: '#991B1B', border: '#FCA5A5',
    label: 'High',
    description: 'Enhanced screening and risk-reduction strategies recommended.',
  },
  very_high: {
    bg: '#FEE2E2', fg: '#991B1B', border: '#FCA5A5',
    label: 'Very High',
    description: 'Comprehensive risk management plan strongly recommended.',
  },
};

// ============================================================================
// Component
// ============================================================================

export function RiskDashboardScreen() {
  const { data: riskData, loading: rl } = useGetLatestRiskQuery({ errorPolicy: 'ignore' });
  const { data: historyData, loading: hl } = useGetRiskAssessmentsQuery({ errorPolicy: 'ignore' });
  const { data: profileData, loading: pl } = useGetPreventProfileQuery({ errorPolicy: 'ignore' });

  const loading = rl || hl || pl;

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>Risk Dashboard</Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading risk assessment...</Text>
        </View>
      </View>
    );
  }

  const risk = riskData?.latestRisk;
  const profile = profileData?.preventProfile;
  const history = historyData?.riskAssessments ?? [];

  if (!risk || !profile) {
    return (
      <ScrollView sx={{ flex: 1 }}>
        <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
          <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>Risk Dashboard</Text>
          <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
            Complete onboarding to see your risk assessment.
          </Text>
          <Link href="/prevent/onboarding">
            <View
              sx={{
                mt: '$6',
                backgroundColor: 'blue600',
                borderRadius: 8,
                px: '$6',
                py: '$3',
                alignSelf: 'flex-start',
              }}
            >
              <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>Start Onboarding</Text>
            </View>
          </Link>
        </View>
      </ScrollView>
    );
  }

  const catInfo = RISK_CATEGORIES[risk.riskCategory] ?? RISK_CATEGORIES.average;
  const trajectory = risk.riskTrajectory ?? [];
  const modifiable = risk.modifiableFactors ?? [];

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Link href="/prevent">
          <Text sx={{ fontSize: 14, color: 'blue600', mb: '$4' }}>
            {'\u2190'} Back to Prevention
          </Text>
        </Link>

        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Your Risk Assessment
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          Based on the Gail model (NCI Breast Cancer Risk Assessment Tool)
        </Text>

        {/* Risk Category Badge */}
        <View
          sx={{
            mt: '$6',
            backgroundColor: catInfo.bg,
            borderWidth: 2,
            borderColor: catInfo.border,
            borderRadius: 12,
            p: '$5',
          }}
        >
          <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
            <View
              sx={{
                backgroundColor: 'white',
                borderRadius: 12,
                px: '$3',
                py: 4,
              }}
            >
              <Text
                sx={{
                  fontSize: 13,
                  fontWeight: 'bold',
                  color: catInfo.fg,
                  textTransform: 'uppercase',
                }}
              >
                {catInfo.label}
              </Text>
            </View>
            <Text sx={{ fontSize: 14, color: catInfo.fg }}>{risk.modelVersion}</Text>
          </View>
          <Text sx={{ mt: '$3', fontSize: 14, color: catInfo.fg, lineHeight: 22 }}>
            {catInfo.description}
          </Text>
        </View>

        {/* Risk Estimates */}
        <View sx={{ mt: '$6', flexDirection: 'row', gap: '$3' }}>
          <RiskCard
            label="Lifetime"
            value={risk.lifetimeRiskEstimate}
            ciLow={risk.lifetimeRiskCiLow}
            ciHigh={risk.lifetimeRiskCiHigh}
            subtitle="to age 90"
          />
          <RiskCard label="5-Year" value={risk.fiveYearRiskEstimate} subtitle="from now" />
          <RiskCard label="10-Year" value={risk.tenYearRiskEstimate} subtitle="from now" />
        </View>

        {/* Risk Trajectory */}
        {trajectory.length > 0 && (
          <View sx={{ mt: '$8' }}>
            <SectionHeader title="Risk Trajectory" />
            <View sx={{ mt: '$4', gap: '$2' }}>
              {trajectory.map((point: any) => (
                <View
                  key={point.age}
                  sx={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '$3',
                    py: '$2',
                  }}
                >
                  <Text sx={{ fontSize: 13, color: '$mutedForeground', width: 50 }}>
                    Age {point.age}
                  </Text>
                  <View sx={{ flex: 1 }}>
                    {/* Your risk bar */}
                    <View
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#DBEAFE',
                        overflow: 'hidden',
                      }}
                    >
                      <View
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: '#3B82F6',
                          width: `${Math.min(100, (point.risk / 50) * 100)}%`,
                        }}
                      />
                    </View>
                    {/* Population average indicator */}
                    {point.populationAverage != null && (
                      <View
                        sx={{
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: '#E5E7EB',
                          mt: 2,
                          overflow: 'hidden',
                        }}
                      >
                        <View
                          sx={{
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: '#9CA3AF',
                            width: `${Math.min(100, (point.populationAverage / 50) * 100)}%`,
                          }}
                        />
                      </View>
                    )}
                  </View>
                  <Text sx={{ fontSize: 12, fontWeight: '600', color: '#3B82F6', width: 45, textAlign: 'right' }}>
                    {point.risk.toFixed(1)}%
                  </Text>
                </View>
              ))}
              <View sx={{ flexDirection: 'row', gap: '$4', mt: '$2' }}>
                <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$1' }}>
                  <View sx={{ width: 12, height: 8, borderRadius: 4, backgroundColor: '#3B82F6' }} />
                  <Text sx={{ fontSize: 11, color: '$mutedForeground' }}>Your risk</Text>
                </View>
                <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$1' }}>
                  <View sx={{ width: 12, height: 4, borderRadius: 2, backgroundColor: '#9CA3AF' }} />
                  <Text sx={{ fontSize: 11, color: '$mutedForeground' }}>Population average</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Modifiable Factors */}
        {modifiable.length > 0 && (
          <View sx={{ mt: '$8' }}>
            <SectionHeader title="What You Can Change" />
            <Text sx={{ mt: '$2', fontSize: 13, color: '$mutedForeground' }}>
              These factors are within your control and can meaningfully reduce your risk.
            </Text>
            <View sx={{ mt: '$4', gap: '$3' }}>
              {modifiable.map((factor: any, i: number) => (
                <View
                  key={i}
                  sx={{
                    borderWidth: 1,
                    borderColor: '$border',
                    borderRadius: 12,
                    p: '$4',
                  }}
                >
                  <View sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text sx={{ fontSize: 15, fontWeight: '600', color: '$foreground' }}>
                      {factor.factor}
                    </Text>
                    {factor.potentialReduction != null && (
                      <View
                        sx={{
                          backgroundColor: '#DCFCE7',
                          borderRadius: 12,
                          px: '$2',
                          py: 2,
                        }}
                      >
                        <Text sx={{ fontSize: 11, fontWeight: 'bold', color: '#166534' }}>
                          -{factor.potentialReduction}% risk
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text sx={{ mt: '$1', fontSize: 12, color: '$mutedForeground' }}>
                    Current: {factor.currentValue}
                  </Text>
                  <Text sx={{ mt: '$2', fontSize: 13, color: '$foreground', lineHeight: 20 }}>
                    {factor.impact}
                  </Text>
                  <View
                    sx={{
                      mt: '$3',
                      backgroundColor: '#F0FDF4',
                      borderRadius: 8,
                      p: '$3',
                    }}
                  >
                    <Text sx={{ fontSize: 12, fontWeight: '600', color: '#166534' }}>
                      Recommendation
                    </Text>
                    <Text sx={{ mt: '$1', fontSize: 12, color: '#14532D', lineHeight: 18 }}>
                      {factor.recommendation}
                    </Text>
                  </View>
                  <View
                    sx={{
                      mt: '$2',
                      backgroundColor: '#F8FAFC',
                      borderRadius: 6,
                      px: '$2',
                      py: 2,
                      alignSelf: 'flex-start',
                    }}
                  >
                    <Text sx={{ fontSize: 10, color: '$mutedForeground', textTransform: 'uppercase' }}>
                      Evidence: {factor.evidenceStrength}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View sx={{ mt: '$8' }}>
          <SectionHeader title="Next Steps" />
          <View sx={{ mt: '$4', gap: '$3' }}>
            <ActionCard href="/prevent/risk/factors" title="Risk Factor Details" description="Deep dive into each risk factor and what you can do" />
            <ActionCard href="/prevent/risk/screening" title="Screening Planner" description="Personalized screening schedule based on your risk category" />
            <ActionCard href="/prevent/risk/chemoprevention" title="Chemoprevention Navigator" description="Explore risk-reduction medications you may be eligible for" />
            <ActionCard href="/prevent/risk/lifestyle" title="Prevention Lifestyle" description="Evidence-based lifestyle changes for risk reduction" />
          </View>
        </View>

        {/* Assessment History */}
        {history.length > 1 && (
          <View sx={{ mt: '$8' }}>
            <SectionHeader title="Assessment History" />
            <View sx={{ mt: '$4', gap: '$2' }}>
              {history.map((h: any) => (
                <View
                  key={h.id}
                  sx={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: '$2',
                    borderBottomWidth: 1,
                    borderBottomColor: '$border',
                  }}
                >
                  <Text sx={{ fontSize: 13, color: '$mutedForeground' }}>
                    {new Date(h.assessmentDate).toLocaleDateString()}
                  </Text>
                  <Text sx={{ fontSize: 13, color: '$foreground' }}>
                    {h.lifetimeRiskEstimate.toFixed(1)}% lifetime
                  </Text>
                  <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>
                    {h.riskCategory.replace(/_/g, ' ')}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Disclaimer */}
        <View
          sx={{
            mt: '$8',
            backgroundColor: '#FFFBEB',
            borderWidth: 1,
            borderColor: '#FDE68A',
            borderRadius: 12,
            p: '$5',
          }}
        >
          <Text sx={{ fontSize: 13, fontWeight: '600', color: '#92400E' }}>
            Important disclaimer
          </Text>
          <Text sx={{ mt: '$2', fontSize: 12, color: '#78350F', lineHeight: 18 }}>
            This risk estimate is based on the Gail model and population-level statistics. Individual
            risk may differ. This tool does not account for all risk factors (e.g., BRCA mutations,
            polygenic risk scores). Always discuss your risk with a healthcare provider who can
            consider your complete medical history.
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

function RiskCard({
  label,
  value,
  ciLow,
  ciHigh,
  subtitle,
}: {
  label: string;
  value: number | null | undefined;
  ciLow?: number | null;
  ciHigh?: number | null;
  subtitle: string;
}) {
  return (
    <View
      sx={{
        flex: 1,
        borderWidth: 1,
        borderColor: '$border',
        borderRadius: 12,
        p: '$4',
        alignItems: 'center',
      }}
    >
      <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>{label}</Text>
      <Text sx={{ mt: '$2', fontSize: 24, fontWeight: 'bold', color: '$foreground' }}>
        {value != null ? `${value.toFixed(1)}%` : '—'}
      </Text>
      {ciLow != null && ciHigh != null && (
        <Text sx={{ fontSize: 10, color: '$mutedForeground' }}>
          CI: {ciLow.toFixed(1)}-{ciHigh.toFixed(1)}%
        </Text>
      )}
      <Text sx={{ mt: '$1', fontSize: 11, color: '$mutedForeground' }}>{subtitle}</Text>
    </View>
  );
}

function ActionCard({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link href={href}>
      <View
        sx={{
          borderWidth: 1,
          borderColor: '$border',
          borderRadius: 12,
          p: '$4',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View sx={{ flex: 1 }}>
          <Text sx={{ fontSize: 15, fontWeight: '600', color: '$foreground' }}>{title}</Text>
          <Text sx={{ mt: '$1', fontSize: 13, color: '$mutedForeground' }}>{description}</Text>
        </View>
        <Text sx={{ fontSize: 14, color: '$mutedForeground', ml: '$2' }}>{'\u25B8'}</Text>
      </View>
    </Link>
  );
}
