import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import {
  useGetScreeningScheduleQuery,
  useGenerateScreeningScheduleMutation,
} from '../generated/graphql';

// ============================================================================
// Constants
// ============================================================================

const RISK_CATEGORY_COLORS: Record<string, { bg: string; fg: string }> = {
  high: { bg: '#FEE2E2', fg: '#991B1B' },
  intermediate: { bg: '#FEF3C7', fg: '#92400E' },
  average: { bg: '#DCFCE7', fg: '#166534' },
  low: { bg: '#DCFCE7', fg: '#166534' },
};

// ============================================================================
// Component
// ============================================================================

export function ScreeningPlannerScreen() {
  const { data, loading, refetch } = useGetScreeningScheduleQuery({ errorPolicy: 'ignore' });
  const [generateSchedule, { loading: generating }] = useGenerateScreeningScheduleMutation({
    onCompleted: () => refetch(),
  });

  const schedule = data?.screeningSchedule;

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Personalized Screening Plan
        </Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading your screening plan...</Text>
        </View>
      </View>
    );
  }

  // No schedule yet — show generate button
  if (!schedule) {
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
            Personalized Screening Plan
          </Text>
          <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
            Generate a screening schedule tailored to your risk profile and guidelines
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
            <Text sx={{ mt: '$3', fontWeight: '600', color: '$foreground', textAlign: 'center' }}>
              Create your personalized screening schedule
            </Text>
            <Text sx={{
              mt: '$2', fontSize: 14, color: '$mutedForeground',
              textAlign: 'center', maxWidth: 400,
            }}>
              Based on your risk factors, age, and family history, we will generate a screening plan
              aligned with NCCN and other evidence-based guidelines.
            </Text>
            {generating ? (
              <View sx={{ mt: '$5', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <ActivityIndicator size="small" />
                <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>
                  Generating your plan...
                </Text>
              </View>
            ) : (
              <Pressable onPress={() => generateSchedule()}>
                <View sx={{
                  mt: '$5',
                  backgroundColor: 'blue600',
                  borderRadius: 8,
                  px: '$6',
                  py: '$3',
                }}>
                  <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                    Generate Schedule
                  </Text>
                </View>
              </Pressable>
            )}
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
              Why personalized screening matters
            </Text>
            <Text sx={{ mt: '$2', fontSize: 13, color: '#075985', lineHeight: 20 }}>
              Standard screening guidelines are designed for average-risk individuals. If you have
              elevated risk factors, you may benefit from earlier screening, more frequent screening,
              or additional modalities like breast MRI. A personalized plan ensures nothing is missed.
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
              This screening plan is AI-generated based on published guidelines and your risk profile.
              It must be reviewed with your healthcare provider. Your doctor may adjust recommendations
              based on clinical judgment and additional factors.
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  // Schedule exists — show the full plan
  const scheduleJson = schedule.schedule as any ?? {};
  const modalities = (scheduleJson.modalities ?? []) as any[];
  const nextScreening = scheduleJson.nextScreening as any;
  const riskCategory = schedule.riskCategory ?? 'average';
  const riskColors = RISK_CATEGORY_COLORS[riskCategory] ?? RISK_CATEGORY_COLORS.average;
  const guidelineSource = schedule.guidelineSource ?? 'NCCN';
  const denseBreastGuidance = scheduleJson.denseBreastGuidance;
  const insuranceCoverage = scheduleJson.insuranceCoverage as any;

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
          Personalized Screening Plan
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          Your recommended screening schedule based on your individual risk profile
        </Text>

        {/* ============================================================= */}
        {/* Header badges */}
        {/* ============================================================= */}
        <View sx={{ mt: '$4', flexDirection: 'row', gap: '$2', flexWrap: 'wrap' }}>
          {/* Guideline source badge */}
          <View sx={{
            backgroundColor: '#DBEAFE',
            borderRadius: 12,
            px: '$3',
            py: 4,
          }}>
            <Text sx={{ fontSize: 11, fontWeight: '600', color: '#1E40AF' }}>
              {guidelineSource} Guidelines
            </Text>
          </View>

          {/* Risk category badge */}
          <View sx={{
            backgroundColor: riskColors.bg,
            borderRadius: 12,
            px: '$3',
            py: 4,
          }}>
            <Text sx={{
              fontSize: 11,
              fontWeight: '600',
              color: riskColors.fg,
              textTransform: 'uppercase',
            }}>
              {riskCategory} risk
            </Text>
          </View>
        </View>

        {/* ============================================================= */}
        {/* Next Screening Card */}
        {/* ============================================================= */}
        {nextScreening && (
          <View sx={{
            mt: '$6',
            backgroundColor: '#EFF6FF',
            borderWidth: 2,
            borderColor: '#93C5FD',
            borderRadius: 12,
            p: '$5',
          }}>
            <Text sx={{ fontSize: 12, fontWeight: '600', color: '#1E40AF', textTransform: 'uppercase' }}>
              Next Screening
            </Text>
            <View sx={{ mt: '$2', flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
              <View sx={{
                width: 48, height: 48, borderRadius: 12,
                backgroundColor: '#DBEAFE',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text sx={{ fontSize: 20 }}>{'\uD83D\uDCC5'}</Text>
              </View>
              <View sx={{ flex: 1 }}>
                <Text sx={{ fontSize: 16, fontWeight: 'bold', color: '#1E3A8A' }}>
                  {nextScreening.type}
                </Text>
                <Text sx={{ fontSize: 14, color: '#1E40AF', mt: 2 }}>
                  {nextScreening.date
                    ? new Date(nextScreening.date).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : nextScreening.timeframe ?? 'Schedule with your provider'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* ============================================================= */}
        {/* Screening Modalities */}
        {/* ============================================================= */}
        <View sx={{ mt: '$6' }}>
          <SectionHeader title="Your Screening Schedule" />

          <View sx={{ mt: '$4', gap: '$4' }}>
            {modalities.map((modality: any, index: number) => (
              <View key={modality.name ?? index} sx={{
                borderWidth: 1,
                borderColor: '$border',
                borderRadius: 12,
                overflow: 'hidden',
              }}>
                {/* Modality header */}
                <View sx={{
                  backgroundColor: '#F8FAFC',
                  p: '$4',
                  borderBottomWidth: 1,
                  borderBottomColor: '$border',
                }}>
                  <Text sx={{ fontSize: 16, fontWeight: 'bold', color: '$foreground' }}>
                    {modality.name}
                  </Text>
                </View>

                {/* Modality details */}
                <View sx={{ p: '$4', gap: '$3' }}>
                  {/* Frequency */}
                  <View sx={{ flexDirection: 'row', alignItems: 'flex-start', gap: '$3' }}>
                    <View sx={{
                      width: 32, height: 32, borderRadius: 8,
                      backgroundColor: '#DBEAFE',
                      alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Text sx={{ fontSize: 14 }}>{'\u23F0'}</Text>
                    </View>
                    <View sx={{ flex: 1 }}>
                      <Text sx={{ fontSize: 12, fontWeight: '600', color: '$mutedForeground' }}>
                        Frequency
                      </Text>
                      <Text sx={{ fontSize: 14, color: '$foreground', mt: 2 }}>
                        {modality.frequency}
                      </Text>
                    </View>
                  </View>

                  {/* Start age */}
                  {modality.startAge != null && (
                    <View sx={{ flexDirection: 'row', alignItems: 'flex-start', gap: '$3' }}>
                      <View sx={{
                        width: 32, height: 32, borderRadius: 8,
                        backgroundColor: '#E0E7FF',
                        alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Text sx={{ fontSize: 14 }}>{'\uD83C\uDFAF'}</Text>
                      </View>
                      <View sx={{ flex: 1 }}>
                        <Text sx={{ fontSize: 12, fontWeight: '600', color: '$mutedForeground' }}>
                          Starting Age
                        </Text>
                        <Text sx={{ fontSize: 14, color: '$foreground', mt: 2 }}>
                          Age {modality.startAge}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Rationale */}
                  {modality.rationale && (
                    <View sx={{
                      backgroundColor: '#F0FDF4',
                      borderWidth: 1,
                      borderColor: '#BBF7D0',
                      borderRadius: 10,
                      p: '$3',
                    }}>
                      <Text sx={{ fontSize: 12, fontWeight: '600', color: '#166534' }}>
                        Why this is recommended
                      </Text>
                      <Text sx={{ mt: '$1', fontSize: 13, color: '#14532D', lineHeight: 20 }}>
                        {modality.rationale}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}

            {modalities.length === 0 && (
              <View sx={{
                borderWidth: 2,
                borderStyle: 'dashed',
                borderColor: '$border',
                borderRadius: 12,
                p: '$5',
                alignItems: 'center',
              }}>
                <Text sx={{ fontSize: 14, color: '$mutedForeground', textAlign: 'center' }}>
                  No modality recommendations available.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ============================================================= */}
        {/* Dense Breast Guidance */}
        {/* ============================================================= */}
        {denseBreastGuidance && (
          <View sx={{
            mt: '$6',
            backgroundColor: '#EEF2FF',
            borderWidth: 1,
            borderColor: '#C7D2FE',
            borderRadius: 12,
            p: '$5',
          }}>
            <Text sx={{ fontSize: 14, fontWeight: '600', color: '#3730A3' }}>
              Dense Breast Tissue Guidance
            </Text>
            <Text sx={{ mt: '$2', fontSize: 13, color: '#4338CA', lineHeight: 20 }}>
              {denseBreastGuidance}
            </Text>
          </View>
        )}

        {/* ============================================================= */}
        {/* Insurance Coverage Info */}
        {/* ============================================================= */}
        {insuranceCoverage && (
          <View sx={{ mt: '$6' }}>
            <SectionHeader title="Insurance Coverage" />

            <View sx={{
              mt: '$4',
              borderWidth: 1,
              borderColor: '$border',
              borderRadius: 12,
              p: '$5',
              gap: '$3',
            }}>
              {insuranceCoverage.mammography && (
                <CoverageRow
                  label="Mammography"
                  detail={insuranceCoverage.mammography}
                />
              )}
              {insuranceCoverage.breastMri && (
                <CoverageRow
                  label="Breast MRI"
                  detail={insuranceCoverage.breastMri}
                />
              )}
              {insuranceCoverage.geneticTesting && (
                <CoverageRow
                  label="Genetic Testing"
                  detail={insuranceCoverage.geneticTesting}
                />
              )}
              {insuranceCoverage.ultrasound && (
                <CoverageRow
                  label="Ultrasound"
                  detail={insuranceCoverage.ultrasound}
                />
              )}
              {insuranceCoverage.notes && (
                <Text sx={{ fontSize: 12, color: '$mutedForeground', lineHeight: 18, fontStyle: 'italic' }}>
                  {insuranceCoverage.notes}
                </Text>
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
            This screening plan is AI-generated based on published clinical guidelines ({guidelineSource})
            and your individual risk profile. It must be reviewed and approved by your healthcare
            provider. Screening recommendations may change based on new evidence, your clinical
            history, or your physician's judgment. This tool does not replace professional medical
            advice.
          </Text>
        </View>

        {/* ============================================================= */}
        {/* Footer actions */}
        {/* ============================================================= */}
        <View sx={{ mt: '$4', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          {schedule.lastUpdatedAt && (
            <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>
              Generated {new Date(schedule.lastUpdatedAt).toLocaleDateString()}
            </Text>
          )}
          {generating ? (
            <View sx={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ActivityIndicator size="small" />
              <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>Regenerating...</Text>
            </View>
          ) : (
            <Pressable onPress={() => generateSchedule()}>
              <Text sx={{ fontSize: 12, fontWeight: '600', color: 'blue600' }}>
                Regenerate plan
              </Text>
            </Pressable>
          )}
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

function CoverageRow({ label, detail }: { label: string; detail: string }) {
  return (
    <View sx={{ flexDirection: 'row', alignItems: 'flex-start', gap: '$3' }}>
      <View sx={{
        width: 8, height: 8, borderRadius: 4,
        backgroundColor: '#22C55E', mt: 6,
      }} />
      <View sx={{ flex: 1 }}>
        <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground' }}>
          {label}
        </Text>
        <Text sx={{ fontSize: 13, color: '$mutedForeground', lineHeight: 20, mt: 2 }}>
          {detail}
        </Text>
      </View>
    </View>
  );
}
