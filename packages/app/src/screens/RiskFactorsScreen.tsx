import { View, Text, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import {
  useGetLatestRiskQuery,
  useGetPreventGenomicProfileQuery,
} from '../generated/graphql';

// ============================================================================
// Constants
// ============================================================================

const EVIDENCE_COLORS: Record<string, { bg: string; fg: string }> = {
  strong: { bg: '#DCFCE7', fg: '#166534' },
  moderate: { bg: '#DBEAFE', fg: '#1E40AF' },
  emerging: { bg: '#FEF3C7', fg: '#92400E' },
  precautionary: { bg: '#F3F4F6', fg: '#6B7280' },
};

const MODIFIABLE_FACTORS = [
  { key: 'weight', label: 'Weight / BMI' },
  { key: 'alcohol', label: 'Alcohol Consumption' },
  { key: 'exercise', label: 'Physical Activity' },
  { key: 'smoking', label: 'Smoking' },
  { key: 'hrt', label: 'Hormone Replacement Therapy' },
];

// ============================================================================
// Component
// ============================================================================

export function RiskFactorsScreen() {
  const { data, loading } = useGetLatestRiskQuery({ errorPolicy: 'ignore' });
  const { data: genomicData } = useGetPreventGenomicProfileQuery({ errorPolicy: 'ignore' });

  const risk = data?.latestRisk;
  const genomicProfile = genomicData?.preventGenomicProfile as any;

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Risk Factor Details
        </Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading your risk factors...</Text>
        </View>
      </View>
    );
  }

  if (!risk) {
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
            Risk Factor Details
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
              No risk assessment found
            </Text>
            <Text sx={{
              mt: '$2', fontSize: 14, color: '$mutedForeground',
              textAlign: 'center', maxWidth: 400,
            }}>
              Complete a risk assessment first to see your detailed risk factor breakdown.
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

  const modifiableFactors = (risk.modifiableFactors ?? []) as any[];
  const gailInputs = risk.gailInputs as any;

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
          Risk Factor Details
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          Understand which factors contribute to your risk and what you can change
        </Text>

        {/* ============================================================= */}
        {/* Modifiable Factors */}
        {/* ============================================================= */}
        <View sx={{ mt: '$8' }}>
          <SectionHeader title="Modifiable Factors" />
          <Text sx={{ mt: '$2', fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
            These are factors you may be able to change to reduce your risk
          </Text>

          <View sx={{ mt: '$4', gap: '$4' }}>
            {modifiableFactors.map((factor: any) => {
              const evidenceColors = EVIDENCE_COLORS[factor.evidenceStrength] ?? EVIDENCE_COLORS.moderate;
              const knownFactor = MODIFIABLE_FACTORS.find((f) => f.key === factor.name);
              const displayName = knownFactor?.label ?? factor.name;

              return (
                <View key={factor.name} sx={{
                  borderWidth: 1,
                  borderColor: '$border',
                  borderRadius: 12,
                  overflow: 'hidden',
                }}>
                  {/* Factor header */}
                  <View sx={{
                    p: '$4',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottomWidth: 1,
                    borderBottomColor: '$border',
                    backgroundColor: '#F8FAFC',
                  }}>
                    <Text sx={{ fontSize: 16, fontWeight: 'bold', color: '$foreground' }}>
                      {displayName}
                    </Text>
                    <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2' }}>
                      {/* Evidence strength badge */}
                      <View sx={{
                        backgroundColor: evidenceColors.bg,
                        borderRadius: 12,
                        px: '$2',
                        py: 3,
                      }}>
                        <Text sx={{ fontSize: 11, fontWeight: '600', color: evidenceColors.fg }}>
                          {factor.evidenceStrength}
                        </Text>
                      </View>
                      {/* Potential reduction pill */}
                      {factor.potentialReduction && (
                        <View sx={{
                          backgroundColor: '#DCFCE7',
                          borderRadius: 12,
                          px: '$2',
                          py: 3,
                        }}>
                          <Text sx={{ fontSize: 11, fontWeight: '600', color: '#166534' }}>
                            {factor.potentialReduction}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Factor body */}
                  <View sx={{ p: '$4', gap: '$3' }}>
                    {/* Current value */}
                    {factor.currentValue && (
                      <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2' }}>
                        <Text sx={{ fontSize: 12, fontWeight: '600', color: '$mutedForeground' }}>
                          Current:
                        </Text>
                        <Text sx={{ fontSize: 14, color: '$foreground' }}>
                          {factor.currentValue}
                        </Text>
                      </View>
                    )}

                    {/* Impact text */}
                    {factor.impact && (
                      <View>
                        <Text sx={{ fontSize: 12, fontWeight: '600', color: '$mutedForeground', mb: '$1' }}>
                          Impact
                        </Text>
                        <Text sx={{ fontSize: 13, color: '$foreground', lineHeight: 20 }}>
                          {factor.impact}
                        </Text>
                      </View>
                    )}

                    {/* Impact bar visualization */}
                    {factor.impactScore != null && (
                      <View>
                        <View sx={{
                          height: 8,
                          backgroundColor: '#F1F5F9',
                          borderRadius: 4,
                          overflow: 'hidden',
                        }}>
                          <View sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: factor.impactScore > 0.6 ? '#EF4444'
                              : factor.impactScore > 0.3 ? '#F59E0B'
                              : '#22C55E',
                            width: `${Math.min(Math.round(factor.impactScore * 100), 100)}%` as any,
                          }} />
                        </View>
                        <View sx={{ flexDirection: 'row', justifyContent: 'space-between', mt: '$1' }}>
                          <Text sx={{ fontSize: 10, color: '$mutedForeground' }}>Low impact</Text>
                          <Text sx={{ fontSize: 10, color: '$mutedForeground' }}>High impact</Text>
                        </View>
                      </View>
                    )}

                    {/* Recommendation */}
                    {factor.recommendation && (
                      <View sx={{
                        backgroundColor: '#F0FDF4',
                        borderWidth: 1,
                        borderColor: '#BBF7D0',
                        borderRadius: 10,
                        p: '$3',
                      }}>
                        <Text sx={{ fontSize: 12, fontWeight: '600', color: '#166534' }}>
                          Recommendation
                        </Text>
                        <Text sx={{ mt: '$1', fontSize: 13, color: '#14532D', lineHeight: 20 }}>
                          {factor.recommendation}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}

            {modifiableFactors.length === 0 && (
              <View sx={{
                borderWidth: 2,
                borderStyle: 'dashed',
                borderColor: '$border',
                borderRadius: 12,
                p: '$5',
                alignItems: 'center',
              }}>
                <Text sx={{ fontSize: 14, color: '$mutedForeground', textAlign: 'center' }}>
                  No modifiable risk factor data available yet.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ============================================================= */}
        {/* Non-Modifiable Factors */}
        {/* ============================================================= */}
        <View sx={{ mt: '$8' }}>
          <SectionHeader title="Non-Modifiable Factors" />
          <Text sx={{ mt: '$2', fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
            These factors contribute to your risk but cannot be changed. Understanding them helps calibrate your overall risk picture.
          </Text>

          {gailInputs ? (
            <View sx={{ mt: '$4', gap: '$3' }}>
              {/* Age */}
              {gailInputs.age != null && (
                <NonModifiableRow
                  label="Age"
                  value={`${gailInputs.age} years`}
                  note="Risk increases with age. Most breast cancers are diagnosed after age 50."
                />
              )}

              {/* Family history */}
              {gailInputs.firstDegreeRelatives != null && (
                <NonModifiableRow
                  label="First-degree relatives with breast cancer"
                  value={
                    gailInputs.firstDegreeRelatives === 0
                      ? 'None'
                      : `${gailInputs.firstDegreeRelatives}`
                  }
                  note={
                    gailInputs.firstDegreeRelatives > 0
                      ? 'Having first-degree relatives (mother, sister, daughter) with breast cancer increases your risk. The more relatives affected, the higher the risk.'
                      : 'No first-degree family history is a favorable factor.'
                  }
                />
              )}

              {/* Age at menarche */}
              {gailInputs.ageAtMenarche != null && (
                <NonModifiableRow
                  label="Age at first period (menarche)"
                  value={`${gailInputs.ageAtMenarche} years`}
                  note="Earlier menarche means longer lifetime exposure to estrogen, which is associated with modestly increased breast cancer risk."
                />
              )}

              {/* Age at first live birth */}
              {gailInputs.ageAtFirstBirth != null && (
                <NonModifiableRow
                  label="Age at first live birth"
                  value={
                    gailInputs.ageAtFirstBirth === 0
                      ? 'No live births'
                      : `${gailInputs.ageAtFirstBirth} years`
                  }
                  note="Women who have their first child after age 30, or who have never given birth, have a slightly higher risk."
                />
              )}

              {/* Number of biopsies */}
              {gailInputs.numberOfBiopsies != null && (
                <NonModifiableRow
                  label="Previous breast biopsies"
                  value={`${gailInputs.numberOfBiopsies}`}
                  note="Prior biopsies, especially those showing atypical hyperplasia, are associated with increased risk."
                />
              )}

              {/* Race / ethnicity */}
              {gailInputs.race && (
                <NonModifiableRow
                  label="Race / Ethnicity"
                  value={gailInputs.race}
                  note="The Gail model adjusts risk calculations based on race and ethnicity, as baseline incidence rates differ between populations."
                />
              )}
            </View>
          ) : (
            <View sx={{
              mt: '$4',
              borderWidth: 2,
              borderStyle: 'dashed',
              borderColor: '$border',
              borderRadius: 12,
              p: '$5',
              alignItems: 'center',
            }}>
              <Text sx={{ fontSize: 14, color: '$mutedForeground', textAlign: 'center' }}>
                Gail model inputs not available. Complete the risk assessment questionnaire to see
                your non-modifiable risk factors.
              </Text>
            </View>
          )}
        </View>

        {/* ============================================================= */}
        {/* Genomic Risk Factors */}
        {/* ============================================================= */}
        {genomicProfile && (genomicProfile.prsPercentile != null || (genomicProfile.pathogenicVariants as any[])?.length > 0) && (
          <View sx={{ mt: '$8' }}>
            <SectionHeader title="Genomic Risk Factors" />
            <Text sx={{ mt: '$2', fontSize: 13, color: '$mutedForeground' }}>
              These factors are derived from your uploaded genomic data and are not modifiable,
              but they inform your overall risk assessment and screening recommendations.
            </Text>

            <View sx={{ mt: '$4', gap: '$3' }}>
              {/* PRS */}
              {genomicProfile.prsPercentile != null && (
                <View sx={{
                  borderWidth: 2, borderColor: '#DDD6FE', borderRadius: 12, p: '$4',
                  backgroundColor: '#F5F3FF',
                }}>
                  <View sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text sx={{ fontSize: 15, fontWeight: '600', color: '#5B21B6' }}>
                      Polygenic Risk Score
                    </Text>
                    {genomicProfile.prsConfidence && (
                      <View sx={{
                        px: '$2', py: 2, borderRadius: 6,
                        backgroundColor: genomicProfile.prsConfidence === 'high' ? '#DCFCE7'
                          : genomicProfile.prsConfidence === 'moderate' ? '#FEF3C7' : '#FEE2E2',
                      }}>
                        <Text sx={{
                          fontSize: 10, fontWeight: '600',
                          color: genomicProfile.prsConfidence === 'high' ? '#166534'
                            : genomicProfile.prsConfidence === 'moderate' ? '#92400E' : '#991B1B',
                        }}>
                          {genomicProfile.prsConfidence.toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text sx={{ mt: '$2', fontSize: 22, fontWeight: 'bold', color: '#6D28D9' }}>
                    {genomicProfile.prsPercentile}th percentile
                  </Text>
                  {genomicProfile.prsRiskMultiplier != null && (
                    <Text sx={{ mt: '$1', fontSize: 13, color: '#7C3AED' }}>
                      Risk multiplier: {genomicProfile.prsRiskMultiplier}x baseline
                    </Text>
                  )}
                  <Text sx={{ mt: '$2', fontSize: 12, color: '#7C3AED', lineHeight: 18 }}>
                    PRS assesses the cumulative effect of many common genetic variants. A higher
                    percentile indicates a greater polygenic contribution to breast cancer risk.
                  </Text>
                </View>
              )}

              {/* Pathogenic Variants */}
              {((genomicProfile.pathogenicVariants as any[]) ?? []).map((v: any, i: number) => (
                <View key={i} sx={{
                  borderWidth: 1, borderColor: v.riskLevel === 'high' ? '#FCA5A5' : '#FDE68A',
                  borderRadius: 12, p: '$4',
                  backgroundColor: v.riskLevel === 'high' ? '#FEF2F2' : '#FFFBEB',
                }}>
                  <View sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text sx={{ fontSize: 15, fontWeight: '600', color: '$foreground' }}>
                      {v.gene} — {v.variant}
                    </Text>
                    <View sx={{
                      px: '$2', py: 2, borderRadius: 6,
                      backgroundColor: v.riskLevel === 'high' ? '#FEE2E2' : '#FEF3C7',
                    }}>
                      <Text sx={{
                        fontSize: 10, fontWeight: '600',
                        color: v.riskLevel === 'high' ? '#991B1B' : '#92400E',
                      }}>
                        {v.riskLevel === 'high' ? 'HIGH PENETRANCE' : 'MODERATE PENETRANCE'}
                      </Text>
                    </View>
                  </View>
                  <Text sx={{ mt: '$2', fontSize: 13, color: '$foreground', lineHeight: 20 }}>
                    {v.significance}
                  </Text>
                </View>
              ))}

              {/* VUS (informational) */}
              {((genomicProfile.vusVariants as any[]) ?? []).length > 0 && (
                <View sx={{
                  borderWidth: 1, borderColor: '$border', borderRadius: 12, p: '$4',
                }}>
                  <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
                    Variants of Uncertain Significance ({(genomicProfile.vusVariants as any[]).length})
                  </Text>
                  <Text sx={{ mt: '$1', fontSize: 12, color: '$mutedForeground', lineHeight: 18 }}>
                    These variants are not included in your risk calculation. Their clinical significance
                    is uncertain and may be reclassified as more research becomes available.
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

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
            Risk factor analysis is based on population-level data and statistical models. Individual
            risk may differ. Modifiable factor recommendations are general guidance and should be
            discussed with your healthcare provider before making changes. This tool does not replace
            professional medical advice, diagnosis, or treatment.
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

function NonModifiableRow({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <View sx={{
      borderWidth: 1,
      borderColor: '$border',
      borderRadius: 12,
      p: '$4',
    }}>
      <View sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground', flex: 1 }}>
          {label}
        </Text>
        <View sx={{
          backgroundColor: '#F1F5F9',
          borderRadius: 8,
          px: '$3',
          py: 4,
          ml: '$2',
        }}>
          <Text sx={{ fontSize: 13, fontWeight: '600', color: '#475569' }}>
            {value}
          </Text>
        </View>
      </View>
      <Text sx={{ mt: '$2', fontSize: 12, color: '$mutedForeground', lineHeight: 18 }}>
        {note}
      </Text>
    </View>
  );
}
